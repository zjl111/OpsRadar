from __future__ import annotations

import asyncio
import re
import time
from dataclasses import dataclass

import asyncssh
import psycopg
import redis

from backend.app.core.config import settings
from backend.app.services.crypto import get_resource_credential
from backend.app.services.masking import mask_sensitive


@dataclass(frozen=True)
class ExecutionContext:
    resource: dict
    item: dict


@dataclass(frozen=True)
class ExecutionResult:
    status: str
    output: str
    error_message: str
    execution_time_ms: int


class JudgementEngine:
    def judge(self, stdout: str, stderr: str, exit_status: int, expected: str) -> tuple[str, str]:
        clean_stdout = mask_sensitive(stdout)
        clean_stderr = mask_sensitive(stderr)
        if exit_status != 0:
            return "fail", clean_stderr or f"Command exited with status {exit_status}."
        rule = (expected or "").strip()
        if not rule:
            return "success", ""
        if rule.lower() in {"review", "manual", "info", "informational"}:
            return "success", ""
        if rule == "empty":
            return ("success", "") if not clean_stdout.strip() else ("fail", "Expected empty output.")
        if rule.startswith("regex:"):
            pattern = rule.removeprefix("regex:").strip()
            return ("success", "") if re.search(pattern, clean_stdout, re.MULTILINE) else ("fail", f"Regex not matched: {pattern}")
        threshold = re.fullmatch(r"([a-zA-Z_][\w-]*)?\s*([<>]=?)\s*(\d+(?:\.\d+)?)", rule)
        if threshold:
            op = threshold.group(2)
            expected_value = float(threshold.group(3))
            percent_values = [float(value) for value in re.findall(r"(\d+(?:\.\d+)?)%", clean_stdout)]
            numbers = percent_values or [float(value) for value in re.findall(r"-?\d+(?:\.\d+)?", clean_stdout)]
            if not numbers:
                return "fail", f"No numeric value found for threshold rule {rule}."
            value = max(numbers) if percent_values else numbers[0]
            passed = {
                "<": value < expected_value,
                "<=": value <= expected_value,
                ">": value > expected_value,
                ">=": value >= expected_value,
            }[op]
            return ("success", "") if passed else ("fail", f"Threshold failed: {value} {op} {expected_value}.")
        if ">" in rule or "<" in rule:
            return "success", ""
        return ("success", "") if rule in clean_stdout else ("fail", f"Expected output to contain: {rule}")


class ShellExecutor:
    def __init__(self) -> None:
        self.judgement = JudgementEngine()

    async def execute(self, context: ExecutionContext) -> ExecutionResult:
        resource = context.resource
        item = context.item
        started = time.perf_counter()
        if resource.get("type") not in {"host", "linux", "server", "container", "compose", "systemd"} or item.get("command_type") != "shell":
            return ExecutionResult(
                status="exception",
                output="",
                error_message="Unsupported executor in this release. Only SSH shell inspection is enabled for host, container and compose resources.",
                execution_time_ms=0,
            )
        command = render_resource_command(str(item.get("command") or "").strip(), resource)
        if not command:
            return ExecutionResult("exception", "", "Inspection command is empty.", 0)
        try:
            credential = get_resource_credential(resource.get("extra_params"))
            if not credential:
                return ExecutionResult("exception", "", "Resource credential is not configured.", 0)
            connect_kwargs = self._connection_kwargs(resource, credential)
            async with asyncssh.connect(**connect_kwargs) as conn:
                result = await asyncio.wait_for(
                    conn.run(command, check=False),
                    timeout=settings.ssh_command_timeout,
                )
            status, judgement_error = self.judgement.judge(
                result.stdout,
                result.stderr,
                result.exit_status,
                str(item.get("expected") or ""),
            )
            output = mask_sensitive(result.stdout)
            error = judgement_error or mask_sensitive(result.stderr)
            return ExecutionResult(status, output, error, int((time.perf_counter() - started) * 1000))
        except asyncio.TimeoutError:
            return ExecutionResult("exception", "", f"Command timed out after {settings.ssh_command_timeout} seconds.", int((time.perf_counter() - started) * 1000))
        except (asyncssh.PermissionDenied, asyncssh.KeyImportError) as exc:
            return ExecutionResult("exception", "", f"SSH authentication failed: {exc}", int((time.perf_counter() - started) * 1000))
        except (OSError, asyncssh.Error, ValueError) as exc:
            return ExecutionResult("exception", "", f"SSH execution failed: {exc}", int((time.perf_counter() - started) * 1000))

    def _connection_kwargs(self, resource: dict, credential: str) -> dict:
        kwargs = {
            "host": resource["ip"],
            "port": int(resource.get("port") or 22),
            "username": resource.get("username") or None,
            "known_hosts": None,
            "connect_timeout": settings.ssh_connect_timeout,
        }
        if resource.get("credential_type") == "key":
            kwargs["client_keys"] = [asyncssh.import_private_key(credential)]
        else:
            kwargs["password"] = credential
        return kwargs


class PostgresExecutor:
    def __init__(self) -> None:
        self.judgement = JudgementEngine()

    async def execute(self, context: ExecutionContext) -> ExecutionResult:
        resource = context.resource
        item = context.item
        started = time.perf_counter()
        if resource.get("type") not in {"pgsql", "postgresql"} or item.get("command_type") != "sql":
            return unsupported_result(started, "PostgreSQL executor supports only sql items on pgsql resources.")
        sql = str(item.get("command") or "").strip()
        if not sql:
            return ExecutionResult("exception", "", "SQL command is empty.", 0)
        try:
            credential = get_resource_credential(resource.get("extra_params")) or ""
            output = await asyncio.to_thread(self._run_sql, resource, credential, sql)
            status, error = self.judgement.judge(output, "", 0, str(item.get("expected") or ""))
            return ExecutionResult(status, mask_sensitive(output), error, int((time.perf_counter() - started) * 1000))
        except psycopg.OperationalError as exc:
            return ExecutionResult("exception", "", f"PostgreSQL connection or authentication failed: {exc}", int((time.perf_counter() - started) * 1000))
        except psycopg.Error as exc:
            return ExecutionResult("exception", "", f"PostgreSQL SQL execution failed: {exc}", int((time.perf_counter() - started) * 1000))
        except Exception as exc:
            return ExecutionResult("exception", "", f"PostgreSQL inspection failed: {exc}", int((time.perf_counter() - started) * 1000))

    def _run_sql(self, resource: dict, credential: str, sql: str) -> str:
        extra = dict(resource.get("extra_params") or {})
        dbname = extra.get("db_name") or extra.get("database") or "postgres"
        with psycopg.connect(
            host=resource["ip"],
            port=int(resource.get("port") or 5432),
            user=resource.get("username") or None,
            password=credential or None,
            dbname=dbname,
            connect_timeout=settings.ssh_connect_timeout,
        ) as conn:
            conn.execute(f"SET statement_timeout = {int(settings.ssh_command_timeout * 1000)}")
            rows: list[str] = []
            for statement in [part.strip() for part in sql.split(";") if part.strip()]:
                with conn.cursor() as cur:
                    cur.execute(statement)
                    if cur.description:
                        names = [column.name for column in cur.description]
                        rows.append("\t".join(names))
                        rows.extend("\t".join("" if value is None else str(value) for value in record) for record in cur.fetchall())
                    else:
                        rows.append(f"affected_rows={cur.rowcount}")
            return "\n".join(rows)


class MySQLExecutor:
    def __init__(self) -> None:
        self.judgement = JudgementEngine()

    async def execute(self, context: ExecutionContext) -> ExecutionResult:
        resource = context.resource
        item = context.item
        started = time.perf_counter()
        if resource.get("type") != "mysql" or item.get("command_type") != "sql":
            return unsupported_result(started, "MySQL executor supports only sql items on mysql resources.")
        sql = str(item.get("command") or "").strip()
        if not sql:
            return ExecutionResult("exception", "", "SQL command is empty.", 0)
        try:
            output = await asyncio.wait_for(
                asyncio.to_thread(self._run_sql, resource, get_resource_credential(resource.get("extra_params")) or "", sql),
                timeout=settings.ssh_command_timeout,
            )
            status, error = self.judgement.judge(output, "", 0, str(item.get("expected") or ""))
            return ExecutionResult(status, mask_sensitive(output), error, int((time.perf_counter() - started) * 1000))
        except asyncio.TimeoutError:
            return ExecutionResult("exception", "", f"MySQL command timed out after {settings.ssh_command_timeout} seconds.", int((time.perf_counter() - started) * 1000))
        except ImportError as exc:
            return ExecutionResult("exception", "", f"MySQL client dependency is unavailable: {exc}", int((time.perf_counter() - started) * 1000))
        except Exception as exc:
            return ExecutionResult("exception", "", f"MySQL inspection failed: {exc}", int((time.perf_counter() - started) * 1000))

    def _run_sql(self, resource: dict, credential: str, sql: str) -> str:
        import pymysql

        extra = dict(resource.get("extra_params") or {})
        database = extra.get("db_name") or extra.get("database")
        conn = pymysql.connect(
            host=resource["ip"],
            port=int(resource.get("port") or 3306),
            user=resource.get("username") or "",
            password=credential or "",
            database=database or None,
            connect_timeout=settings.ssh_connect_timeout,
            read_timeout=settings.ssh_command_timeout,
            write_timeout=settings.ssh_command_timeout,
            charset="utf8mb4",
        )
        try:
            rows: list[str] = []
            with conn.cursor() as cur:
                for statement in [part.strip() for part in sql.split(";") if part.strip()]:
                    cur.execute(statement)
                    if cur.description:
                        rows.append("\t".join(str(column[0]) for column in cur.description))
                        rows.extend("\t".join("" if value is None else str(value) for value in record) for record in cur.fetchall())
                    else:
                        rows.append(f"affected_rows={cur.rowcount}")
            return "\n".join(rows)
        finally:
            conn.close()


class RedisExecutor:
    def __init__(self) -> None:
        self.judgement = JudgementEngine()

    async def execute(self, context: ExecutionContext) -> ExecutionResult:
        resource = context.resource
        item = context.item
        started = time.perf_counter()
        if resource.get("type") != "redis" or item.get("command_type") not in {"shell", "redis"}:
            return unsupported_result(started, "Redis executor supports redis or redis-cli style commands on redis resources.")
        command = str(item.get("command") or "").strip()
        if not command:
            return ExecutionResult("exception", "", "Redis command is empty.", 0)
        try:
            output = await asyncio.wait_for(
                asyncio.to_thread(self._run_command, resource, get_resource_credential(resource.get("extra_params")) or "", command),
                timeout=settings.ssh_command_timeout,
            )
            status, error = self.judgement.judge(output, "", 0, str(item.get("expected") or ""))
            return ExecutionResult(status, mask_sensitive(output), error, int((time.perf_counter() - started) * 1000))
        except asyncio.TimeoutError:
            return ExecutionResult("exception", "", f"Redis command timed out after {settings.ssh_command_timeout} seconds.", int((time.perf_counter() - started) * 1000))
        except redis.AuthenticationError as exc:
            return ExecutionResult("exception", "", f"Redis authentication failed: {exc}", int((time.perf_counter() - started) * 1000))
        except redis.RedisError as exc:
            return ExecutionResult("exception", "", f"Redis inspection failed: {exc}", int((time.perf_counter() - started) * 1000))

    def _run_command(self, resource: dict, credential: str, command: str) -> str:
        extra = dict(resource.get("extra_params") or {})
        client = redis.Redis(
            host=resource["ip"],
            port=int(resource.get("port") or 6379),
            username=resource.get("username") or None,
            password=credential or None,
            db=int(extra.get("db", 0) or 0),
            socket_connect_timeout=settings.ssh_connect_timeout,
            socket_timeout=settings.ssh_command_timeout,
            decode_responses=True,
        )
        outputs = []
        for statement in [part.strip() for part in command.split(";") if part.strip()]:
            normalized = self._normalize(statement)
            parts = normalized.split()
            if not parts:
                continue
            result = client.execute_command(*parts)
            outputs.append(format_command_result(normalized, result))
        return "\n".join(outputs)

    def _normalize(self, statement: str) -> str:
        if not statement.startswith("redis-cli"):
            return statement
        tokens = statement.split()
        cleaned: list[str] = []
        skip_next = False
        for token in tokens[1:]:
            if skip_next:
                skip_next = False
                continue
            if token in {"-h", "-p", "-a", "-u", "--user"}:
                skip_next = True
                continue
            if token in {"--raw", "--no-auth-warning"}:
                continue
            cleaned.append(token)
        return " ".join(cleaned) or "PING"


def format_command_result(command: str, result) -> str:
    if isinstance(result, dict):
        body = "\n".join(f"{key}: {value}" for key, value in result.items())
    elif isinstance(result, (list, tuple, set)):
        body = "\n".join(str(value) for value in result)
    else:
        body = str(result)
    return f"$ {command}\n{body}"


def unsupported_result(started: float, message: str) -> ExecutionResult:
    return ExecutionResult("exception", "", f"Unsupported executor: {message}", int((time.perf_counter() - started) * 1000))


def render_resource_command(command: str, resource: dict) -> str:
    extra = dict(resource.get("extra_params") or {})
    replacements = {
        "ip": resource.get("ip", ""),
        "port": str(resource.get("port", "")),
        "container_name": str(extra.get("container_name", "")),
        "compose_project": str(extra.get("compose_project", "")),
        "compose_service": str(extra.get("compose_service", "")),
        "systemd_unit": str(extra.get("systemd_unit", "")),
    }
    for key, value in replacements.items():
        command = command.replace("{" + key + "}", value)
    return command


class InspectionExecutor:
    def __init__(self) -> None:
        self.shell = ShellExecutor()
        self.postgres = PostgresExecutor()
        self.mysql = MySQLExecutor()
        self.redis = RedisExecutor()

    async def execute(self, context: ExecutionContext) -> ExecutionResult:
        resource_type = str(context.resource.get("type") or "")
        command_type = str(context.item.get("command_type") or "")
        if resource_type in {"host", "linux", "server", "container", "compose", "systemd"} and command_type == "shell":
            return await self.shell.execute(context)
        if resource_type in {"pgsql", "postgresql"} and command_type == "sql":
            return await self.postgres.execute(context)
        if resource_type == "mysql" and command_type == "sql":
            return await self.mysql.execute(context)
        if resource_type == "redis" and command_type in {"shell", "redis"}:
            return await self.redis.execute(context)
        return unsupported_result(time.perf_counter(), f"{resource_type or 'unknown'} / {command_type or 'unknown'} is not enabled in this release.")
