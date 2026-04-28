from __future__ import annotations

import asyncio
import re
import time
from dataclasses import dataclass

import asyncssh

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
        if rule == "empty":
            return ("success", "") if not clean_stdout.strip() else ("fail", "Expected empty output.")
        if rule.startswith("regex:"):
            pattern = rule.removeprefix("regex:").strip()
            return ("success", "") if re.search(pattern, clean_stdout, re.MULTILINE) else ("fail", f"Regex not matched: {pattern}")
        threshold = re.fullmatch(r"([a-zA-Z_][\w-]*)?\s*([<>]=?)\s*(\d+(?:\.\d+)?)", rule)
        if threshold:
            op = threshold.group(2)
            expected_value = float(threshold.group(3))
            numbers = [float(value) for value in re.findall(r"-?\d+(?:\.\d+)?", clean_stdout)]
            if not numbers:
                return "fail", f"No numeric value found for threshold rule {rule}."
            value = numbers[0]
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
        if resource.get("type") != "host" or item.get("command_type") != "shell":
            return ExecutionResult(
                status="exception",
                output="",
                error_message="Unsupported executor in this release. Only host shell inspection is enabled.",
                execution_time_ms=0,
            )
        command = str(item.get("command") or "").strip()
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
