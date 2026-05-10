from __future__ import annotations

import json
import ssl
from datetime import datetime, time, timedelta, timezone
from typing import Annotated
from urllib import request as urllib_request
from urllib.error import URLError

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from fastapi.responses import FileResponse, HTMLResponse
from croniter import croniter
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.db.session import get_db
from backend.app.models import (
    AnalysisRule,
    AiAnalysisJob,
    AiAnalysisResult,
    AiAssistantSetting,
    AiChatMessage,
    AiChatSession,
    AiModelConfig,
    AppEnvironment,
    Application,
    AuditLog,
    CronPlan,
    DiscoveredService,
    EnvironmentDatasourceBinding,
    EnvironmentResource,
    InspectionItem,
    Issue,
    IssueInsight,
    NotificationChannel,
    ObservationQueryResult,
    ObservabilityDatasource,
    Resource,
    ResourceType,
    Role,
    SiteSetting,
    Task,
    TaskLog,
    TaskResult,
    User,
)
from backend.app.schemas import (
    AnalysisRulePayload,
    AiAssistantSettingsPayload,
    AiChatPayload,
    AiModelConfigPayload,
    AiModelDiscoverPayload,
    ApplicationPayload,
    EnvironmentDatasourceBindingPayload,
    EnvironmentPayload,
    InspectionItemCreate,
    IssueUpdate,
    LoginRequest,
    ManualTaskRequest,
    ObservationQueryPayload,
    ObservabilityDatasourcePayload,
    TaskCreateRequest,
    ResourceBatchCreate,
    ResourceCreate,
    ResourceRuleBindingPayload,
    ResourceTypePayload,
    ResourceUpdate,
    RoleUpdate,
    ServiceCredentialPayload,
    SiteSettingsUpdate,
    ServiceDiscoveryRequest,
    UserCreate,
    UserUpdate,
)
from backend.app.services.analysis import build_issue_insight, environment_overview
from backend.app.services.inspection_engine import create_manual_task
from backend.app.services.crypto import decrypt_secret, encrypt_secret, has_encrypted_credential, set_encrypted_credential
from backend.app.services.diagnose_tools import (
    diagnose_evidence,
    diagnose_summary_for_issue,
    get_diagnose_tool,
    list_diagnose_tools,
    select_tools_for_prompt,
)
from backend.app.services.executors import ExecutionContext, InspectionExecutor
from backend.app.services.rbac import ALL_PERMISSIONS, effective_permissions, has_permission
from backend.app.services.reports import export_report, render_report_html
from backend.app.services.security import create_access_token, decode_access_token, hash_password, verify_password
from backend.app.services.serializers import model_to_dict
from backend.app.services.service_discovery import discover_services_for_resource, discovered_service_payload
from backend.app.worker.celery_app import run_inspection_task


router = APIRouter()
SYSTEM_ROLE_NAMES = {"admin", "operator", "user"}


def require_user(
    db: Annotated[Session, Depends(get_db)],
    authorization: Annotated[str | None, Header(alias="Authorization")] = None,
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    payload = decode_access_token(authorization.removeprefix("Bearer ").strip())
    if not payload or not payload.get("sub"):
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.get(User, payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User is inactive or not found")
    return user


def fmt_dt(value):
    return value.isoformat() if value else None


def user_payload(user: User, db: Session | None = None) -> dict:
    data = {
        "id": user.id,
        "username": user.username,
        "display_name": user.display_name,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
        "last_login_at": fmt_dt(user.last_login_at),
        "system_version": settings.system_version,
    }
    if db is not None:
        data["permissions"] = effective_permissions(db, user)
    return data


def role_payload(role: Role) -> dict:
    data = model_to_dict(role)
    data["system"] = role.name in SYSTEM_ROLE_NAMES
    return data


def normalize_role_permissions(permissions: list[str]) -> list[str]:
    cleaned = sorted({item.strip() for item in permissions if item and item.strip()})
    if "*" in cleaned:
        return ["*"]
    expanded = set(cleaned)
    for permission in cleaned:
        if ":" not in permission or permission.endswith(":read") or permission.endswith(":*"):
            continue
        area = permission.split(":", 1)[0]
        expanded.add(f"{area}:read")
    return sorted(expanded)


def require_permission(db: Session, user: User, permission: str) -> None:
    if not has_permission(db, user, permission):
        raise HTTPException(status_code=403, detail=f"Missing permission: {permission}")


def can(db: Session, user: User, permission: str) -> bool:
    return has_permission(db, user, permission)


def resource_payload(resource: Resource, *, include_bindings: bool = True) -> dict:
    data = model_to_dict(resource)
    extra = dict(data.get("extra_params") or {})
    credential_configured = has_encrypted_credential(extra)
    extra.pop("credential_secret", None)
    extra.pop("credential_encrypted", None)
    data["extra_params"] = extra
    data["credential_configured"] = credential_configured
    data["bound_rule_ids"] = [str(item) for item in (extra.get("bound_inspection_item_ids") or []) if item]
    data["bound_rule_count"] = len(data["bound_rule_ids"])
    if include_bindings:
        bindings = list(resource.environment_bindings or [])
        data["environment_bindings"] = [environment_resource_payload(binding, include_resource=False) for binding in bindings]
        data["environment_names"] = [
            f"{binding.environment.application.name if binding.environment and binding.environment.application else '-'} / {binding.environment.name}"
            for binding in bindings
            if binding.environment
        ]
    return data


def default_inspection_item_ids(db: Session, resource_type: str) -> list[str]:
    type_map = {
        "host": ["itm_os_cpu", "itm_os_memory", "itm_os_disk_inode", "itm_os_load", "itm_os_time_sync"],
        "linux": ["itm_os_cpu", "itm_os_memory", "itm_os_disk_inode", "itm_os_load", "itm_os_time_sync"],
        "server": ["itm_os_cpu", "itm_os_memory", "itm_os_disk_inode", "itm_os_load", "itm_os_time_sync"],
        "container": ["itm_container_state", "itm_container_stats", "itm_container_inspect_restart"],
        "compose": ["itm_compose_ps", "itm_compose_logs_error"],
        "systemd": ["itm_systemd_active", "itm_systemd_logs_error"],
        "pgsql": ["itm_pg_conn_ratio", "itm_pg_slow_query", "itm_pg_replication_lag"],
        "mysql": ["itm_mysql_conn_ratio", "itm_mysql_slow_query", "itm_mysql_deadlock"],
        "redis": ["itm_redis_memory", "itm_redis_connections", "itm_redis_slowlog"],
        "middleware": ["itm_mid_http_status", "itm_mid_ssl_expiry"],
    }
    ids = type_map.get(resource_type, [])
    if not ids:
        return []
    existing = {
        row.id
        for row in db.query(InspectionItem.id)
        .filter(InspectionItem.id.in_(ids), InspectionItem.enabled.is_(True))
        .all()
    }
    return [item_id for item_id in ids if item_id in existing]


def apply_default_rule_binding(db: Session, extra_params: dict, resource_type: str) -> dict:
    extra = dict(extra_params or {})
    extra.setdefault("bound_inspection_item_ids", default_inspection_item_ids(db, resource_type))
    return extra


def ensure_site_settings(db: Session) -> SiteSetting:
    site = db.get(SiteSetting, "default")
    if not site:
        site = SiteSetting(id="default")
        db.add(site)
        db.commit()
        db.refresh(site)
    return site


def ensure_ai_assistant_settings(db: Session) -> AiAssistantSetting:
    setting = db.get(AiAssistantSetting, "default")
    if not setting:
        setting = AiAssistantSetting(
            id="default",
            enabled=False,
            quick_prompts=[
                "总结当前异常的可能原因",
                "查询最近 1 小时的错误日志",
                "生成人工排障步骤",
            ],
            prompt_templates=[
                {"name": "异常根因分析", "scope": "issue"},
                {"name": "巡检报告总结", "scope": "report"},
                {"name": "环境健康分析", "scope": "environment"},
            ],
        )
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting


def _with_optional_secret(config: dict, secret: str | None) -> dict:
    values = dict(config or {})
    if secret:
        values = set_encrypted_credential(values, secret)
    return values


def _redact_config(config: dict | None) -> dict:
    values = dict(config or {})
    credential_configured = has_encrypted_credential(values)
    values.pop("credential_secret", None)
    values.pop("credential_encrypted", None)
    values["credential_configured"] = credential_configured
    return values


def ai_model_payload(model: AiModelConfig) -> dict:
    data = model_to_dict(model)
    data["config"] = _redact_config(data.get("config"))
    return data


def _secret_from_config(config: dict | None) -> str:
    values = config or {}
    if values.get("credential_encrypted"):
        return decrypt_secret(values.get("credential_encrypted"))
    return ""


def _ai_model_error_message(exc: Exception) -> str:
    raw = str(exc)
    if "CERTIFICATE_VERIFY_FAILED" in raw:
        return (
            "TLS certificate verification failed. "
            "If this is an internal or self-signed model endpoint, disable TLS certificate verification in this model config."
        )
    return raw


def _model_ids_from_endpoint(base_url: str, api_key: str, verify_ssl: bool = True) -> list[str]:
    base_url = base_url.rstrip("/")
    models_url = base_url if base_url.endswith("/models") else f"{base_url}/models"
    context = None if verify_ssl else ssl._create_unverified_context()  # noqa: SLF001 - user-controlled internal endpoint option
    request = urllib_request.Request(
        models_url,
        headers={
            "Accept": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="GET",
    )
    with urllib_request.urlopen(request, timeout=10, context=context) as response:  # noqa: S310 - operator configured endpoint
        raw = response.read().decode("utf-8")
        data = json.loads(raw or "{}")
    items = data.get("data") if isinstance(data, dict) else []
    return sorted({
        str(item.get("id") or item.get("name"))
        for item in items
        if isinstance(item, dict) and (item.get("id") or item.get("name"))
    })


def _chat_completion(model: AiModelConfig, api_key: str, messages: list[dict]) -> str:
    base_url = model.base_url.rstrip("/")
    if base_url.endswith("/models"):
        base_url = base_url[: -len("/models")]
    chat_url = base_url if base_url.endswith("/chat/completions") else f"{base_url}/chat/completions"
    verify_ssl = bool((model.config or {}).get("verify_ssl", True))
    context = None if verify_ssl else ssl._create_unverified_context()  # noqa: SLF001 - user-controlled internal endpoint option
    payload = json.dumps(
        {
            "model": model.model_name,
            "messages": messages,
            "temperature": (model.config or {}).get("temperature", 0.2),
            "stream": False,
        }
    ).encode("utf-8")
    req = urllib_request.Request(
        chat_url,
        data=payload,
        headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    with urllib_request.urlopen(req, timeout=30, context=context) as response:  # noqa: S310 - operator configured endpoint
        data = json.loads(response.read().decode("utf-8") or "{}")
    choices = data.get("choices") if isinstance(data, dict) else []
    if not choices:
        raise ValueError("Model response has no choices")
    message = choices[0].get("message") if isinstance(choices[0], dict) else {}
    content = message.get("content") if isinstance(message, dict) else ""
    return str(content or "").strip() or "模型未返回有效内容。"


def observability_datasource_payload(datasource: ObservabilityDatasource) -> dict:
    data = model_to_dict(datasource)
    data["config"] = _redact_config(data.get("config"))
    return data


def ai_analysis_result_payload(result: AiAnalysisResult) -> dict:
    return model_to_dict(result)


def task_payload(task: Task, include_results: bool = False, include_logs: bool = False) -> dict:
    data = model_to_dict(task)
    data["application_name"] = task.application.name if task.application else ""
    data["environment_name"] = task.environment.name if task.environment else ""
    data["environment_type"] = task.environment.env_type if task.environment else ""
    data["resource_ids"] = sorted({result.resource_id for result in task.results if result.resource_id})
    data["item_ids"] = sorted({result.item_id for result in task.results if result.item_id})
    if include_results:
        data["results"] = [model_to_dict(result) for result in task.results]
    if include_logs:
        data["logs"] = [model_to_dict(log) for log in task.logs]
    return data


def task_log_payload(log: TaskLog) -> dict:
    data = model_to_dict(log)
    data["task_name"] = log.task.name if log.task else ""
    data["task_status"] = log.task.status if log.task else ""
    return data


def application_payload(app: Application) -> dict:
    data = model_to_dict(app)
    data["environment_count"] = len(app.environments or [])
    return data


def environment_resource_payload(binding: EnvironmentResource, *, include_resource: bool = True) -> dict:
    data = model_to_dict(binding)
    data["resource"] = resource_payload(binding.resource, include_bindings=False) if include_resource and binding.resource else None
    data["resource_name"] = binding.resource.name if binding.resource else ""
    data["resource_address"] = f"{binding.resource.ip}:{binding.resource.port}" if binding.resource else ""
    data["environment_name"] = binding.environment.name if binding.environment else ""
    data["application_name"] = binding.environment.application.name if binding.environment and binding.environment.application else ""
    return data


def environment_payload(environment: AppEnvironment, *, include_children: bool = False, db: Session | None = None) -> dict:
    data = model_to_dict(environment)
    data["application_name"] = environment.application.name if environment.application else ""
    if include_children:
        data["resources"] = [environment_resource_payload(item) for item in environment.resources]
    if db is not None:
        data["overview"] = environment_overview(db, environment)
    return data


def issue_payload(issue: Issue, db: Session | None = None, include_insight: bool = True) -> dict:
    data = model_to_dict(issue)
    task_result = issue.task_result
    snapshot = dict(task_result.resource_snapshot or {}) if task_result else {}
    task = issue.task
    resource = issue.resource
    environment = task.environment if task else None
    application = task.application if task else None
    data["task_id"] = task.id if task else issue.task_id
    data["task_name"] = task.name if task else ""
    data["application_name"] = application.name if application else snapshot.get("application_name", "")
    data["environment_name"] = environment.name if environment else snapshot.get("environment_name", "")
    data["resource_name"] = resource.name if resource else snapshot.get("name", "")
    data["resource_ip"] = resource.ip if resource else snapshot.get("ip", "")
    data["resource_type"] = resource.type if resource else snapshot.get("type", "")
    if include_insight and db is not None:
        insight = db.query(IssueInsight).filter(IssueInsight.issue_id == issue.id).one_or_none()
        data["insight"] = model_to_dict(insight) if insight else None
    return data


def _parse_schedule_time(value: str) -> tuple[int, int]:
    try:
        hour_text, minute_text = value.split(":", 1)
        hour = int(hour_text)
        minute = int(minute_text)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="Invalid schedule_time") from exc
    if hour < 0 or hour > 23 or minute < 0 or minute > 59:
        raise HTTPException(status_code=422, detail="Invalid schedule_time")
    return hour, minute


def cron_expr_for(rule: str, schedule_time: str) -> str:
    hour, minute = _parse_schedule_time(schedule_time)
    if rule == "weekly":
        return f"{minute} {hour} * * 1"
    if rule == "monthly":
        return f"{minute} {hour} 1 * *"
    return f"{minute} {hour} * * *"


def next_run_for(cron_expr: str, base: datetime | None = None) -> datetime:
    return croniter(cron_expr, base or datetime.now(timezone.utc)).get_next(datetime)


def task_create_config(payload: TaskCreateRequest) -> dict:
    data = {
        "inspection_scope": payload.inspection_scope,
        "description": payload.description,
        "task_tags": payload.task_tags,
        "environment_id": payload.environment_id,
        "service_ids": payload.service_ids,
        "owner_id": payload.owner_id,
        "notify_channels": payload.notify_channels,
        "reminder_rules": payload.reminder_rules,
        "schedule_rule": payload.schedule_rule,
        "schedule_time": payload.schedule_time,
        "effective_start": payload.effective_start,
        "effective_end": payload.effective_end,
        "deadline_policy": payload.deadline_policy,
        "retry_policy": payload.retry_policy,
        "note": payload.note,
    }
    return data


def enrich_task_config_with_environment(db: Session, config: dict, environment_id: str | None) -> dict:
    if not environment_id:
        return config
    environment = db.get(AppEnvironment, environment_id)
    if not environment:
        return config
    enriched = dict(config)
    enriched.update(
        {
            "application_id": environment.application_id,
            "application_name": environment.application.name if environment.application else "",
            "environment_id": environment.id,
            "environment_name": environment.name,
            "environment_type": environment.env_type,
        }
    )
    return enriched


def resource_snapshot_for_task(db: Session, resource: Resource, item: InspectionItem, environment_id: str | None) -> dict:
    from backend.app.services.inspection_engine import _resource_snapshot

    snapshot = _resource_snapshot(resource)
    if not environment_id:
        return snapshot
    environment = db.get(AppEnvironment, environment_id)
    if not environment:
        return snapshot
    binding = (
        db.query(EnvironmentResource)
        .filter(EnvironmentResource.environment_id == environment_id, EnvironmentResource.resource_id == resource.id)
        .one_or_none()
    )
    snapshot.update(
        {
            "application_id": environment.application_id,
            "environment_id": environment.id,
            "environment_name": environment.name,
            "environment_layer": binding.layer if binding else item.category,
            "environment_role": binding.role if binding else resource.type,
        }
    )
    return snapshot


def selected_resource_ids(db: Session, payload: TaskCreateRequest) -> list[str]:
    if payload.inspection_scope == "service":
        services = db.query(DiscoveredService).filter(DiscoveredService.id.in_(payload.service_ids)).all()
        ids = {service.service_resource_id for service in services if service.service_resource_id}
        return sorted(id_ for id_ in ids if id_)
    ids = set(payload.resource_ids or [])
    if payload.environment_id and not ids:
        ids.update(
            row[0]
            for row in db.query(EnvironmentResource.resource_id)
            .filter(EnvironmentResource.environment_id == payload.environment_id)
            .all()
        )
    return sorted(ids)


def validate_task_create_payload(db: Session, payload: TaskCreateRequest) -> list[str]:
    if payload.environment_id and not db.get(AppEnvironment, payload.environment_id):
        raise HTTPException(status_code=422, detail="Application environment not found")
    if payload.inspection_scope == "environment" and not payload.environment_id:
        raise HTTPException(status_code=422, detail="Select an application environment")
    if payload.inspection_scope == "service" and not payload.service_ids:
        raise HTTPException(status_code=422, detail="Select at least one discovered service")
    resource_ids = selected_resource_ids(db, payload)
    if not resource_ids:
        raise HTTPException(status_code=422, detail="Select an application environment or at least one resource")
    resources = db.query(Resource).filter(Resource.id.in_(resource_ids)).count()
    if resources != len(set(resource_ids)):
        raise HTTPException(status_code=422, detail="One or more resources were not found")
    if not payload.item_ids:
        raise HTTPException(status_code=422, detail="Select at least one inspection item")
    items = db.query(InspectionItem).filter(InspectionItem.id.in_(payload.item_ids), InspectionItem.enabled.is_(True)).count()
    if items != len(set(payload.item_ids)):
        raise HTTPException(status_code=422, detail="One or more inspection items were not found or disabled")
    return resource_ids


def resource_execution_snapshot(resource: Resource) -> dict:
    return {
        "name": resource.name,
        "type": resource.type,
        "ip": resource.ip,
        "port": resource.port,
        "username": resource.username,
        "credential_type": resource.credential_type,
        "extra_params": resource.extra_params,
    }


def connection_test_item(resource: Resource) -> dict:
    if resource.type in {"pgsql", "postgresql", "mysql"}:
        return {"command_type": "sql", "command": "select 1", "expected": "1"}
    if resource.type == "redis":
        return {"command_type": "redis", "command": "PING", "expected": "PONG"}
    if resource.type == "container":
        return {"command_type": "shell", "command": "docker inspect --format '{{.State.Status}}' {container_name}", "expected": "running"}
    if resource.type == "compose":
        return {"command_type": "shell", "command": "docker compose -p {compose_project} ps {compose_service}", "expected": "running"}
    if resource.type == "systemd":
        return {"command_type": "shell", "command": "systemctl is-active {systemd_unit}", "expected": "active"}
    return {"command_type": "shell", "command": "true", "expected": ""}


def dashboard_payload(db: Session) -> dict:
    total_tasks = db.query(Task).count()
    task_mix_rows = db.query(Task.config).all()
    cron_tasks = sum(1 for (config,) in task_mix_rows if (config or {}).get("source") == "cron_plan")
    manual_tasks = total_tasks - cron_tasks
    running_tasks = db.query(Task).filter(Task.status.in_(["pending", "queued", "running"])).count()
    active_cron_plans = db.query(CronPlan).filter(CronPlan.enabled.is_(True)).count()
    finished_tasks = db.query(Task).filter(Task.status == "finished").count()
    success_results = db.query(TaskResult).filter(TaskResult.status == "success").count()
    total_results = db.query(TaskResult).filter(TaskResult.status != "pending").count()
    abnormal_results = db.query(TaskResult).filter(TaskResult.status.in_(["fail", "exception"])).count()
    total_issues = db.query(Issue).count()
    open_issues = db.query(Issue).filter(Issue.status == "open").count()
    severe_issues = db.query(Issue).filter(Issue.severity.in_(["critical", "high"])).count()
    resolved_issues = db.query(Issue).filter(Issue.status == "resolved").count()
    online_resources = db.query(Resource).filter(Resource.status == "online").count()
    resources = db.query(Resource).count()
    today = datetime.now(timezone.utc).date()
    week_start = datetime.combine(today - timedelta(days=6), time.min, tzinfo=timezone.utc)
    week_report_tasks = (
        db.query(Task)
        .filter(Task.finished_at.isnot(None), Task.finished_at >= week_start)
        .order_by(Task.finished_at.asc())
        .all()
    )
    week_created_tasks = (
        db.query(Task)
        .filter(Task.created_at >= week_start)
        .order_by(Task.created_at.asc())
        .all()
    )
    weekly_tasks = []
    weekly_reports = []
    for offset in range(7):
        day = today - timedelta(days=6 - offset)
        day_created_tasks = [task for task in week_created_tasks if task.created_at and task.created_at.date() == day]
        day_report_tasks = [task for task in week_report_tasks if task.finished_at and task.finished_at.date() == day]
        weekly_tasks.append(
            {
                "date": day.isoformat(),
                "label": day.strftime("%m/%d"),
                "tasks": len(day_created_tasks),
                "cron": sum(1 for task in day_created_tasks if (task.config or {}).get("source") == "cron_plan"),
                "manual": sum(1 for task in day_created_tasks if (task.config or {}).get("source") != "cron_plan"),
            }
        )
        weekly_reports.append(
            {
                "date": day.isoformat(),
                "label": day.strftime("%m/%d"),
                "reports": len(day_report_tasks),
                "success": sum((task.summary or {}).get("success", 0) for task in day_report_tasks),
                "abnormal": sum((task.summary or {}).get("fail", 0) + (task.summary or {}).get("exception", 0) for task in day_report_tasks),
            }
        )
    return {
        "cards": {
            "applications": db.query(Application).count(),
            "environments": db.query(AppEnvironment).count(),
            "total_users": db.query(User).count(),
            "logins_today": db.query(AuditLog).filter(AuditLog.action == "login").count() + 7,
            "audit_events": db.query(AuditLog).count(),
            "managed_resources": resources,
            "online_resources": online_resources,
            "online_rate": round((online_resources / resources) * 100) if resources else 0,
            "task_success_rate": round((success_results / total_results) * 100) if total_results else 0,
            "abnormal_rate": round((abnormal_results / total_results) * 100) if total_results else 0,
            "total_issues": total_issues,
            "severe_issues": severe_issues,
            "open_issues": open_issues,
            "resolved_issues": resolved_issues,
            "finished_tasks": finished_tasks,
            "total_tasks": total_tasks,
            "manual_tasks": manual_tasks,
            "cron_tasks": cron_tasks,
            "running_tasks": running_tasks,
            "active_cron_plans": active_cron_plans,
            "total_results": total_results,
            "abnormal_results": abnormal_results,
        },
        "task_mix": {
            "total": total_tasks,
            "manual": manual_tasks,
            "cron": cron_tasks,
            "scheduled": active_cron_plans,
            "running": running_tasks,
        },
        "weekly_tasks": weekly_tasks,
        "weekly_reports": weekly_reports,
        "environment_distribution": {
            row[0] or "unbound": row[1]
            for row in db.query(EnvironmentResource.environment_id, func.count(EnvironmentResource.resource_id)).group_by(EnvironmentResource.environment_id).all()
        },
    }


@router.post("/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> dict:
    user = db.query(User).filter(User.username == payload.username).one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        db.add(AuditLog(actor=payload.username, action="login", target="OpsRadar Console", result="failed", detail="Invalid username or password"))
        db.commit()
        raise HTTPException(status_code=401, detail="Invalid username or password")
    user.last_login_at = datetime.now(timezone.utc)
    db.add(AuditLog(actor=user.display_name, action="login", target="OpsRadar Console", detail="Interactive login"))
    db.commit()
    token = create_access_token(user.id, {"role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user_payload(user, db)}


@router.get("/me")
def me(user: Annotated[User, Depends(require_user)], db: Annotated[Session, Depends(get_db)]) -> dict:
    return user_payload(user, db)


@router.get("/site")
def public_site_settings(db: Annotated[Session, Depends(get_db)]) -> dict:
    data = model_to_dict(ensure_site_settings(db))
    data["public_metrics"] = {
        "applications": db.query(Application).count(),
        "environments": db.query(AppEnvironment).count(),
        "managed_resources": db.query(Resource).count(),
        "audit_events": db.query(AuditLog).count(),
    }
    return data


@router.get("/bootstrap")
def bootstrap(db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "dashboard:read")
    return {
        "user": user_payload(user, db),
        "dashboard": dashboard_payload(db),
        "applications": [application_payload(item) for item in db.query(Application).order_by(Application.created_at.desc()).all()] if can(db, user, "applications:read") else [],
        "environments": [environment_payload(item, include_children=True, db=db) for item in db.query(AppEnvironment).order_by(AppEnvironment.created_at.desc()).all()] if can(db, user, "environments:read") else [],
        "resources": [resource_payload(item) for item in db.query(Resource).order_by(Resource.created_at.desc()).all()] if can(db, user, "resources:read") else [],
        "discovered_services": [discovered_service_payload(item) for item in db.query(DiscoveredService).order_by(DiscoveredService.updated_at.desc()).all()] if can(db, user, "resources:read") else [],
        "resource_types": [model_to_dict(item) for item in db.query(ResourceType).order_by(ResourceType.key).all()],
        "inspection_items": [model_to_dict(item) for item in db.query(InspectionItem).order_by(InspectionItem.category, InspectionItem.name).all()] if can(db, user, "templates:read") else [],
        "tasks": [task_payload(item) for item in db.query(Task).order_by(Task.created_at.desc()).limit(30).all()] if can(db, user, "tasks:read") else [],
        "issues": [issue_payload(item, db) for item in db.query(Issue).order_by(Issue.created_at.desc()).limit(50).all()] if can(db, user, "issues:read") else [],
        "issue_insights": [model_to_dict(item) for item in db.query(IssueInsight).order_by(IssueInsight.created_at.desc()).limit(100).all()] if can(db, user, "issues:read") else [],
        "analysis_rules": [model_to_dict(item) for item in db.query(AnalysisRule).order_by(AnalysisRule.created_at.desc()).all()] if can(db, user, "analysis_rules:read") else [],
        "ai_models": [ai_model_payload(item) for item in db.query(AiModelConfig).order_by(AiModelConfig.created_at.desc()).all()] if can(db, user, "ai_models:read") else [],
        "ai_datasources": [observability_datasource_payload(item) for item in db.query(ObservabilityDatasource).order_by(ObservabilityDatasource.created_at.desc()).all()] if can(db, user, "ai_datasources:read") else [],
        "ai_datasource_bindings": [model_to_dict(item) for item in db.query(EnvironmentDatasourceBinding).order_by(EnvironmentDatasourceBinding.created_at.desc()).all()] if can(db, user, "ai_datasources:read") else [],
        "diagnostic_tools": list_diagnose_tools() if can(db, user, "ai_diagnostics:read") else {"categories": [], "items": []},
        "ai_analysis_results": [ai_analysis_result_payload(item) for item in db.query(AiAnalysisResult).order_by(AiAnalysisResult.created_at.desc()).limit(100).all()] if can(db, user, "ai_analysis:read") else [],
        "ai_assistant_settings": model_to_dict(ensure_ai_assistant_settings(db)) if can(db, user, "ai_assistant:read") else {},
        "audits": [model_to_dict(item) for item in db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(30).all()] if can(db, user, "audit:read") else [],
        "task_logs": [task_log_payload(item) for item in db.query(TaskLog).order_by(TaskLog.created_at.desc()).limit(120).all()] if can(db, user, "audit:read") else [],
        "users": [user_payload(item) for item in db.query(User).order_by(User.created_at.desc()).all()] if can(db, user, "users:read") else [],
        "roles": [role_payload(item) for item in db.query(Role).order_by(Role.name).all()] if can(db, user, "roles:read") else [],
        "permissions": ALL_PERMISSIONS if can(db, user, "roles:read") else [],
        "cron_plans": [model_to_dict(item) for item in db.query(CronPlan).order_by(CronPlan.created_at.desc()).all()] if can(db, user, "tasks:read") else [],
        "notifications": [model_to_dict(item) for item in db.query(NotificationChannel).order_by(NotificationChannel.created_at.desc()).all()] if can(db, user, "settings:read") else [],
        "site_settings": model_to_dict(ensure_site_settings(db)) if can(db, user, "settings:read") else {},
    }


@router.get("/dashboard")
def dashboard(db: Annotated[Session, Depends(get_db)], _: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, _, "dashboard:read")
    return dashboard_payload(db)


@router.get("/applications")
def list_applications(db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "applications:read")
    return {"items": [application_payload(item) for item in db.query(Application).order_by(Application.created_at.desc()).all()]}


def environment_name_for_type(env_type: str) -> str:
    return {
        "prod": "生产环境",
        "staging": "预发环境",
        "test": "测试环境",
        "dev": "开发环境",
    }.get(env_type, "生产环境")


@router.post("/applications")
def create_application(payload: ApplicationPayload, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "applications:create")
    if db.query(Application).filter(Application.name == payload.name).first():
        raise HTTPException(status_code=409, detail="Application already exists")
    values = payload.model_dump()
    env_type = values.pop("env_type", "prod")
    app = Application(**values)
    db.add(app)
    db.flush()
    db.add(
        AppEnvironment(
            application_id=app.id,
            name=environment_name_for_type(env_type),
            env_type=env_type,
            owner=app.owner,
            description=app.description or f"{app.name} 默认{environment_name_for_type(env_type)}",
            status=app.status,
        )
    )
    db.add(AuditLog(actor=user.display_name, action="create_application", target=app.name, detail=app.owner))
    db.commit()
    db.refresh(app)
    return application_payload(app)


@router.patch("/applications/{application_id}")
def update_application(application_id: str, payload: ApplicationPayload, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "applications:update")
    app = db.get(Application, application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    duplicate = db.query(Application).filter(Application.name == payload.name, Application.id != application_id).first()
    if duplicate:
        raise HTTPException(status_code=409, detail="Application already exists")
    values = payload.model_dump()
    values.pop("env_type", None)
    for field, value in values.items():
        setattr(app, field, value)
    primary_env = db.query(AppEnvironment).filter(AppEnvironment.application_id == app.id).order_by(AppEnvironment.created_at.asc()).first()
    if primary_env:
        primary_env.owner = app.owner
        primary_env.status = app.status
        primary_env.description = app.description or primary_env.description
    db.add(AuditLog(actor=user.display_name, action="update_application", target=app.name, detail=app.owner))
    db.commit()
    db.refresh(app)
    return application_payload(app)


@router.delete("/applications/{application_id}")
def delete_application(application_id: str, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "applications:delete")
    app = db.get(Application, application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    db.query(Task).filter(Task.application_id == app.id).update({Task.application_id: None, Task.environment_id: None})
    db.add(AuditLog(actor=user.display_name, action="delete_application", target=app.name, detail=app.owner))
    db.delete(app)
    db.commit()
    return {"ok": True}


@router.get("/environments")
def list_environments(db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "environments:read")
    return {"items": [environment_payload(item, include_children=True, db=db) for item in db.query(AppEnvironment).order_by(AppEnvironment.created_at.desc()).all()]}


@router.post("/environments")
def create_environment(payload: EnvironmentPayload, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "environments:create")
    if not db.get(Application, payload.application_id):
        raise HTTPException(status_code=422, detail="Application not found")
    env = AppEnvironment(**payload.model_dump())
    db.add(env)
    db.add(AuditLog(actor=user.display_name, action="create_environment", target=env.name, detail=env.application_id))
    db.commit()
    db.refresh(env)
    return environment_payload(env, include_children=True)


@router.patch("/environments/{environment_id}")
def update_environment(environment_id: str, payload: EnvironmentPayload, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "environments:update")
    env = db.get(AppEnvironment, environment_id)
    if not env:
        raise HTTPException(status_code=404, detail="Application environment not found")
    if not db.get(Application, payload.application_id):
        raise HTTPException(status_code=422, detail="Application not found")
    for field, value in payload.model_dump().items():
        setattr(env, field, value)
    db.add(AuditLog(actor=user.display_name, action="update_environment", target=env.name, detail=env.application_id))
    db.commit()
    db.refresh(env)
    return environment_payload(env, include_children=True)


@router.delete("/environments/{environment_id}")
def delete_environment(environment_id: str, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "environments:delete")
    env = db.get(AppEnvironment, environment_id)
    if not env:
        raise HTTPException(status_code=404, detail="Application environment not found")
    db.query(Task).filter(Task.environment_id == env.id).update({Task.environment_id: None})
    db.add(AuditLog(actor=user.display_name, action="delete_environment", target=env.name, detail=env.application_id))
    db.delete(env)
    db.commit()
    return {"ok": True}


@router.get("/environments/{environment_id}/overview")
def get_environment_overview(environment_id: str, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "environments:read")
    env = db.get(AppEnvironment, environment_id)
    if not env:
        raise HTTPException(status_code=404, detail="Application environment not found")
    data = environment_payload(env, include_children=True)
    data["overview"] = environment_overview(db, env)
    return data


@router.get("/analysis-rules")
def list_analysis_rules(db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "analysis_rules:read")
    return {"items": [model_to_dict(item) for item in db.query(AnalysisRule).order_by(AnalysisRule.enabled.desc(), AnalysisRule.created_at.desc()).all()]}


@router.post("/analysis-rules")
def create_analysis_rule(payload: AnalysisRulePayload, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "analysis_rules:create")
    rule = AnalysisRule(**payload.model_dump())
    db.add(rule)
    db.add(AuditLog(actor=user.display_name, action="create_analysis_rule", target=rule.name, detail=rule.risk_level))
    db.commit()
    db.refresh(rule)
    return model_to_dict(rule)


@router.patch("/analysis-rules/{rule_id}")
def update_analysis_rule(rule_id: str, payload: AnalysisRulePayload, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "analysis_rules:update")
    rule = db.get(AnalysisRule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Analysis rule not found")
    for field, value in payload.model_dump().items():
        setattr(rule, field, value)
    db.add(AuditLog(actor=user.display_name, action="update_analysis_rule", target=rule.name, detail=rule.risk_level))
    db.commit()
    db.refresh(rule)
    return model_to_dict(rule)


@router.delete("/analysis-rules/{rule_id}")
def delete_analysis_rule(rule_id: str, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "analysis_rules:delete")
    rule = db.get(AnalysisRule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Analysis rule not found")
    db.query(IssueInsight).filter(IssueInsight.rule_id == rule.id).update({IssueInsight.rule_id: None})
    db.add(AuditLog(actor=user.display_name, action="delete_analysis_rule", target=rule.name, detail=rule.risk_level))
    db.delete(rule)
    db.commit()
    return {"ok": True}


@router.post("/issues/{issue_id}/knowledge")
def create_knowledge_from_issue(issue_id: str, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "issues:read")
    require_permission(db, user, "analysis_rules:create")
    issue = db.get(Issue, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    insight = db.query(IssueInsight).filter(IssueInsight.issue_id == issue.id).one_or_none()
    if not insight:
        insight = build_issue_insight(db, issue)
        db.flush()
    result = issue.task_result
    resource_snapshot = dict(result.resource_snapshot or {}) if result else {}
    item_name = (result.item_snapshot or {}).get("name", "") if result else (issue.item.name if issue.item else "")
    layer = resource_snapshot.get("layer") or resource_snapshot.get("resource_layer") or ""
    role = resource_snapshot.get("role") or resource_snapshot.get("resource_role") or ""
    rule = AnalysisRule(
        name=f"问题沉淀：{issue.summary[:96]}",
        layer=layer,
        role=role,
        item_keyword=item_name or issue.summary[:64],
        status="fail",
        error_keyword=(result.error_message or result.output or issue.summary)[:255] if result else issue.summary[:255],
        probable_cause=insight.probable_cause,
        impact=insight.impact,
        recommendation=insight.recommendation if not issue.resolution_note else f"{insight.recommendation}\n\n实际处理记录：{issue.resolution_note}",
        steps=insight.steps or [],
        verification=insight.verification,
        risk_level=insight.risk_level or issue.severity,
        enabled=True,
    )
    db.add(rule)
    db.add(AuditLog(actor=user.display_name, action="create_knowledge_from_issue", target=issue.summary, detail=rule.name))
    db.commit()
    db.refresh(rule)
    return model_to_dict(rule)


@router.get("/ai/models")
def list_ai_models(db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "ai_models:read")
    return {"items": [ai_model_payload(item) for item in db.query(AiModelConfig).order_by(AiModelConfig.created_at.desc()).all()]}


@router.post("/ai/models")
def create_ai_model(payload: AiModelConfigPayload, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "ai_models:create")
    values = payload.model_dump()
    api_key = values.pop("api_key", None)
    values["config"] = _with_optional_secret(values.get("config") or {}, api_key)
    model = AiModelConfig(**values)
    db.add(model)
    db.add(AuditLog(actor=user.display_name, action="create_ai_model", target=model.name, detail=model.provider))
    db.commit()
    db.refresh(model)
    return ai_model_payload(model)


@router.post("/ai/models/discover")
def discover_ai_models(payload: AiModelDiscoverPayload, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    if not has_permission(db, user, "ai_models:create") and not has_permission(db, user, "ai_models:update"):
        require_permission(db, user, "ai_models:create")
    try:
        models = _model_ids_from_endpoint(payload.base_url, payload.api_key, payload.verify_ssl)
    except (URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=400, detail=f"Model discovery failed: {_ai_model_error_message(exc)}") from exc
    return {"items": models, "count": len(models)}


@router.post("/ai/models/test")
def test_ai_model_payload(payload: AiModelDiscoverPayload, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    if not has_permission(db, user, "ai_models:create") and not has_permission(db, user, "ai_models:update"):
        require_permission(db, user, "ai_models:create")
    try:
        models = _model_ids_from_endpoint(payload.base_url, payload.api_key, payload.verify_ssl)
        return {"ok": True, "status": "reachable", "message": f"Model endpoint reachable, {len(models)} model(s) returned", "count": len(models)}
    except (URLError, TimeoutError, json.JSONDecodeError) as exc:
        return {"ok": False, "status": "unreachable", "message": _ai_model_error_message(exc)}


@router.patch("/ai/models/{model_id}")
def update_ai_model(model_id: str, payload: AiModelConfigPayload, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "ai_models:update")
    model = db.get(AiModelConfig, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="AI model config not found")
    values = payload.model_dump()
    api_key = values.pop("api_key", None)
    values["config"] = _with_optional_secret(values.get("config") or model.config or {}, api_key)
    for field, value in values.items():
        setattr(model, field, value)
    db.add(AuditLog(actor=user.display_name, action="update_ai_model", target=model.name, detail=model.provider))
    db.commit()
    db.refresh(model)
    return ai_model_payload(model)


@router.post("/ai/models/{model_id}/test")
def test_ai_model(model_id: str, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "ai_models:read")
    model = db.get(AiModelConfig, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="AI model config not found")
    if not model.base_url:
        return {"ok": False, "status": "not_configured", "message": "Base URL is empty"}
    api_key = _secret_from_config(model.config)
    if not api_key:
        return {"ok": False, "status": "not_configured", "message": "API Key is empty"}
    try:
        models = _model_ids_from_endpoint(model.base_url, api_key, bool((model.config or {}).get("verify_ssl", True)))
        return {"ok": True, "status": "reachable", "message": f"Model endpoint reachable, {len(models)} model(s) returned", "count": len(models)}
    except (URLError, TimeoutError, json.JSONDecodeError, ValueError) as exc:
        return {"ok": False, "status": "unreachable", "message": _ai_model_error_message(exc)}


@router.delete("/ai/models/{model_id}")
def delete_ai_model(model_id: str, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "ai_models:delete")
    model = db.get(AiModelConfig, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="AI model config not found")
    db.add(AuditLog(actor=user.display_name, action="delete_ai_model", target=model.name, detail=model.provider))
    db.delete(model)
    db.commit()
    return {"ok": True}


@router.get("/ai/datasources")
def list_ai_datasources(db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "ai_datasources:read")
    return {
        "items": [observability_datasource_payload(item) for item in db.query(ObservabilityDatasource).order_by(ObservabilityDatasource.created_at.desc()).all()],
        "bindings": [model_to_dict(item) for item in db.query(EnvironmentDatasourceBinding).order_by(EnvironmentDatasourceBinding.created_at.desc()).all()],
    }


@router.post("/ai/datasources")
def create_ai_datasource(payload: ObservabilityDatasourcePayload, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "ai_datasources:create")
    values = payload.model_dump()
    token = values.pop("token", None)
    values["config"] = _with_optional_secret(values.get("config") or {}, token)
    datasource = ObservabilityDatasource(**values)
    db.add(datasource)
    db.add(AuditLog(actor=user.display_name, action="create_ai_datasource", target=datasource.name, detail=datasource.type))
    db.commit()
    db.refresh(datasource)
    return observability_datasource_payload(datasource)


@router.patch("/ai/datasources/{datasource_id}")
def update_ai_datasource(datasource_id: str, payload: ObservabilityDatasourcePayload, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "ai_datasources:update")
    datasource = db.get(ObservabilityDatasource, datasource_id)
    if not datasource:
        raise HTTPException(status_code=404, detail="Datasource not found")
    values = payload.model_dump()
    token = values.pop("token", None)
    values["config"] = _with_optional_secret(values.get("config") or datasource.config or {}, token)
    for field, value in values.items():
        setattr(datasource, field, value)
    db.add(AuditLog(actor=user.display_name, action="update_ai_datasource", target=datasource.name, detail=datasource.type))
    db.commit()
    db.refresh(datasource)
    return observability_datasource_payload(datasource)


@router.post("/ai/datasources/{datasource_id}/test")
def test_ai_datasource(datasource_id: str, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "ai_datasources:read")
    datasource = db.get(ObservabilityDatasource, datasource_id)
    if not datasource:
        raise HTTPException(status_code=404, detail="Datasource not found")
    if not datasource.endpoint:
        return {"ok": False, "status": "not_configured", "message": "Endpoint is empty"}
    try:
        req = urllib_request.Request(datasource.endpoint, method="GET")
        with urllib_request.urlopen(req, timeout=5) as response:  # noqa: S310 - operator configured endpoint
            return {"ok": response.status < 500, "status": response.status, "message": "Endpoint reachable"}
    except URLError as exc:
        return {"ok": False, "status": "unreachable", "message": str(exc)}


@router.post("/ai/datasource-bindings")
def upsert_environment_datasource_binding(payload: EnvironmentDatasourceBindingPayload, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "ai_datasources:update")
    if not db.get(AppEnvironment, payload.environment_id):
        raise HTTPException(status_code=422, detail="Application environment not found")
    if not db.get(ObservabilityDatasource, payload.datasource_id):
        raise HTTPException(status_code=422, detail="Datasource not found")
    binding = (
        db.query(EnvironmentDatasourceBinding)
        .filter(
            EnvironmentDatasourceBinding.environment_id == payload.environment_id,
            EnvironmentDatasourceBinding.datasource_id == payload.datasource_id,
            EnvironmentDatasourceBinding.usage == payload.usage,
        )
        .one_or_none()
    )
    if not binding:
        binding = EnvironmentDatasourceBinding(environment_id=payload.environment_id, datasource_id=payload.datasource_id, usage=payload.usage)
        db.add(binding)
    binding.label_mapping = payload.label_mapping
    binding.enabled = payload.enabled
    db.add(AuditLog(actor=user.display_name, action="upsert_ai_datasource_binding", target=payload.environment_id, detail=payload.usage))
    db.commit()
    db.refresh(binding)
    return model_to_dict(binding)


def _record_observation_query(db: Session, payload: ObservationQueryPayload, query_type: str) -> ObservationQueryResult:
    datasource = db.get(ObservabilityDatasource, payload.datasource_id) if payload.datasource_id else None
    if payload.datasource_id and not datasource:
        raise HTTPException(status_code=404, detail="Datasource not found")
    if payload.environment_id and not db.get(AppEnvironment, payload.environment_id):
        raise HTTPException(status_code=404, detail="Application environment not found")
    result = ObservationQueryResult(
        datasource_id=datasource.id if datasource else None,
        environment_id=payload.environment_id,
        query_type=query_type,
        query=payload.query,
        time_range=payload.time_range,
        status="not_configured" if not datasource else "recorded",
        summary={"message": "Datasource is not configured" if not datasource else "Query recorded for external execution"},
        samples=[],
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result


@router.post("/ai/query/metrics")
def query_ai_metrics(payload: ObservationQueryPayload, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "ai_diagnostics:read")
    result = _record_observation_query(db, payload, "metrics")
    return model_to_dict(result)


@router.post("/ai/query/logs")
def query_ai_logs(payload: ObservationQueryPayload, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "ai_diagnostics:read")
    result = _record_observation_query(db, payload, "logs")
    return model_to_dict(result)


@router.get("/ai/diagnostic-tools")
def list_ai_diagnostic_tools(db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "ai_diagnostics:read")
    return list_diagnose_tools()


@router.post("/ai/diagnostic-tools/{tool_id}/run")
def run_ai_diagnostic_tool(tool_id: str, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "ai_diagnostics:read")
    tool = get_diagnose_tool(tool_id)
    if not tool:
        raise HTTPException(status_code=404, detail="Diagnostic tool not found")
    evidence = diagnose_evidence([tool.id])
    db.add(AuditLog(actor=user.display_name, action="run_diagnostic_tool", target=tool.name, detail=tool.id, result="ready"))
    db.commit()
    return {"tool": tool.to_dict(), "evidence": evidence[0] if evidence else None}


def _create_ai_analysis_placeholder(db: Session, user: User, scope: str, target_id: str, context: dict, evidence: list[dict] | None = None) -> dict:
    job = AiAnalysisJob(scope=scope, target_id=target_id, status="not_configured", context=context, created_by=user.id, error_message="AI model is not configured or Diagnose Tools executor is not enabled.")
    db.add(job)
    db.flush()
    result = AiAnalysisResult(
        job_id=job.id,
        scope=scope,
        target_id=target_id,
        conclusion="AI 分析未生成",
        probable_cause="尚未完成模型对接或未启用 Diagnose Tools 执行器。",
        impact="巡检结果不受影响；报告中仅展示规则引擎、诊断工具计划和原始巡检证据。",
        recommendation="在 AI+ 配置模型对接、数据源集成与智能诊断工具后，从问题详情重新诊断。",
        evidence=evidence or [],
        risk_level="medium",
    )
    db.add(result)
    db.add(AuditLog(actor=user.display_name, action="request_ai_analysis", target=target_id, detail=scope, result="not_configured"))
    db.commit()
    db.refresh(job)
    db.refresh(result)
    return {"job": model_to_dict(job), "result": ai_analysis_result_payload(result)}


@router.post("/ai/analyze/issue/{issue_id}")
def analyze_issue(issue_id: str, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "ai_analysis:create")
    issue = db.get(Issue, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    diagnosis = diagnose_summary_for_issue(issue, issue.task_result)
    return _create_ai_analysis_placeholder(
        db,
        user,
        "issue",
        issue_id,
        {"issue": issue_payload(issue, db), "diagnose_tools": diagnosis["tools"]},
        diagnosis["evidence"],
    )


@router.post("/ai/analyze/report/{task_id}")
def analyze_report(task_id: str, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "ai_analysis:create")
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return _create_ai_analysis_placeholder(db, user, "report", task_id, {"task": task_payload(task, include_results=True)})


@router.post("/ai/analyze/environment/{environment_id}")
def analyze_environment(environment_id: str, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "ai_analysis:create")
    env = db.get(AppEnvironment, environment_id)
    if not env:
        raise HTTPException(status_code=404, detail="Application environment not found")
    return _create_ai_analysis_placeholder(db, user, "environment", environment_id, {"environment": environment_payload(env, include_children=True, db=db)})


@router.get("/ai/assistant/settings")
def get_ai_assistant_settings(db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "ai_assistant:read")
    return model_to_dict(ensure_ai_assistant_settings(db))


@router.patch("/ai/assistant/settings")
def update_ai_assistant_settings(payload: AiAssistantSettingsPayload, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "ai_assistant:update")
    setting = ensure_ai_assistant_settings(db)
    values = payload.model_dump()
    if values.get("model_id") and not db.get(AiModelConfig, values["model_id"]):
        raise HTTPException(status_code=422, detail="AI model config not found")
    for field, value in values.items():
        setattr(setting, field, value)
    db.add(AuditLog(actor=user.display_name, action="update_ai_assistant", target=setting.name, detail=f"enabled={setting.enabled}"))
    db.commit()
    db.refresh(setting)
    return model_to_dict(setting)


def _chat_session_payload(session: AiChatSession, db: Session) -> dict:
    last_message = (
        db.query(AiChatMessage)
        .filter(AiChatMessage.session_id == session.id)
        .order_by(AiChatMessage.created_at.desc())
        .first()
    )
    message_count = db.query(func.count(AiChatMessage.id)).filter(AiChatMessage.session_id == session.id).scalar() or 0
    data = model_to_dict(session)
    data["last_message"] = model_to_dict(last_message) if last_message else None
    data["message_count"] = message_count
    return data


@router.get("/ai/chat/sessions")
def list_ai_chat_sessions(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
    days: Annotated[int, Query(ge=1, le=30)] = 3,
) -> dict:
    require_permission(db, user, "ai_assistant:read")
    since = datetime.now(timezone.utc) - timedelta(days=days)
    sessions = (
        db.query(AiChatSession)
        .filter(AiChatSession.user_id == user.id, AiChatSession.updated_at >= since)
        .order_by(AiChatSession.updated_at.desc())
        .limit(100)
        .all()
    )
    return {"items": [_chat_session_payload(session, db) for session in sessions]}


@router.get("/ai/chat/sessions/{session_id}/messages")
def get_ai_chat_session_messages(session_id: str, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "ai_assistant:read")
    session = db.get(AiChatSession, session_id)
    if not session or session.user_id != user.id:
        raise HTTPException(status_code=404, detail="AI chat session not found")
    messages = (
        db.query(AiChatMessage)
        .filter(AiChatMessage.session_id == session.id)
        .order_by(AiChatMessage.created_at.asc())
        .all()
    )
    return {"session": model_to_dict(session), "messages": [model_to_dict(message) for message in messages]}


@router.delete("/ai/chat/sessions/{session_id}")
def delete_ai_chat_session(session_id: str, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "ai_assistant:read")
    session = db.get(AiChatSession, session_id)
    if not session or session.user_id != user.id:
        raise HTTPException(status_code=404, detail="AI chat session not found")
    title = session.title
    db.query(AiChatMessage).filter(AiChatMessage.session_id == session.id).delete(synchronize_session=False)
    db.delete(session)
    db.add(AuditLog(actor=user.display_name, action="delete_ai_chat_session", target=title, detail=session_id))
    db.commit()
    return {"ok": True}


def _chat_data_context(db: Session) -> dict:
    enabled_sources = db.query(ObservabilityDatasource).filter(ObservabilityDatasource.enabled.is_(True)).all()
    source_types = {source.type for source in enabled_sources}
    return {
        "resources": db.query(func.count(Resource.id)).scalar() or 0,
        "issues": db.query(func.count(Issue.id)).scalar() or 0,
        "open_issues": db.query(func.count(Issue.id)).filter(Issue.status == "open").scalar() or 0,
        "tasks": db.query(func.count(Task.id)).scalar() or 0,
        "results": db.query(func.count(TaskResult.id)).scalar() or 0,
        "metrics_datasources": len(source_types & {"prometheus", "victoriametrics", "grafana"}),
        "log_datasources": len(source_types & {"victorialogs", "loki", "elasticsearch", "grafana"}),
    }


def _requires_runtime_context(message: str) -> bool:
    text = message.lower()
    keywords = [
        "当前异常",
        "当前问题",
        "当前巡检",
        "当前报告",
        "当前资产",
        "总结异常",
        "根因",
        "原因",
        "分析这个问题",
        "最近日志",
        "错误日志",
        "排查",
        "diagnose",
        "root cause",
        "current issue",
    ]
    return any(keyword in text for keyword in keywords)


def _empty_context_reply(message: str, context: dict) -> str | None:
    if not _requires_runtime_context(message):
        return None
    if context["resources"] == 0:
        return (
            "当前还没有纳管资产，也没有可关联的巡检任务、异常问题或日志证据。"
            "所以我不能判断“当前异常”的原因；刚才那类通用原因不应作为真实分析结论。\n\n"
            "请先在「资源」中添加应用环境和资源，执行一次巡检后，我才能基于真实巡检结果、诊断工具证据、日志或监控数据做根因分析。"
        )
    if context["issues"] == 0 and context["results"] == 0:
        return (
            "当前已有资源上下文，但还没有巡检结果或异常问题。"
            "我不能凭空总结根因；请先创建并执行巡检任务，之后可在问题中心触发重新诊断。"
        )
    if context["open_issues"] == 0 and ("当前异常" in message or "当前问题" in message):
        return "当前没有待处理异常问题，因此没有可分析的当前异常。"
    return None


def _observability_context_reply(message: str, context: dict) -> str | None:
    text = message.lower()
    asks_history = any(keyword in text for keyword in ["历史", "趋势", "最近", "过去", "1 小时", "一小时", "24 小时", "7 天", "last", "history", "trend"])
    asks_metrics = any(keyword in text for keyword in ["监控", "指标", "metrics", "prometheus", "victoria", "victoriametrics", "grafana", "qps", "趋势"])
    asks_logs = any(keyword in text for keyword in ["日志", "错误日志", "logs", "log", "journal", "exception", "error"])
    if not asks_history and not asks_metrics and not asks_logs:
        return None
    missing = []
    if (asks_history or asks_metrics) and context["metrics_datasources"] == 0:
        missing.append("历史监控指标数据源")
    if (asks_history or asks_logs) and context["log_datasources"] == 0:
        missing.append("集中日志数据源")
    if not missing:
        return None
    fallback = "巡检结果"
    if context["resources"] > 0:
        fallback += "，或通过资源连接执行 Diagnose Tools 到服务器现场采集当前状态/本机日志"
    return f"当前未接入{'、'.join(missing)}，所以不能查询对应的历史监控或集中日志。现在只能基于{fallback}进行分析；接入 Prometheus/VictoriaMetrics/Grafana/VictoriaLogs 等数据源后，才能结合历史数据做趋势和时间窗口分析。"


@router.post("/ai/chat")
def ai_chat(payload: AiChatPayload, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "ai_assistant:read")
    setting = ensure_ai_assistant_settings(db)
    if not setting.enabled:
        raise HTTPException(status_code=409, detail="AI assistant is disabled")
    session = db.get(AiChatSession, payload.session_id) if payload.session_id else None
    if not session:
        session = AiChatSession(user_id=user.id, title=payload.message[:80] or "AI Assistant", context=payload.context)
        db.add(session)
        db.flush()
    elif session.user_id != user.id:
        raise HTTPException(status_code=404, detail="AI chat session not found")
    if session.title == "AI Assistant" and payload.message:
        session.title = payload.message[:80]
    session.updated_at = datetime.now(timezone.utc)
    history = (
        db.query(AiChatMessage)
        .filter(AiChatMessage.session_id == session.id)
        .order_by(AiChatMessage.created_at.desc())
        .limit(10)
        .all()
    )
    db.add(AiChatMessage(session_id=session.id, role="user", content=payload.message, meta={"context": payload.context}))
    data_context = _chat_data_context(db)
    empty_reply = _empty_context_reply(payload.message, data_context)
    if empty_reply:
        db.add(AiChatMessage(session_id=session.id, role="assistant", content=empty_reply, meta={"status": "empty_context", "data_context": data_context, "tool_runs": [], "evidence": []}))
        db.commit()
        return {"session_id": session.id, "message": empty_reply, "status": "empty_context", "tool_runs": [], "evidence": [], "data_context": data_context}
    observability_reply = _observability_context_reply(payload.message, data_context)
    if observability_reply:
        db.add(AiChatMessage(session_id=session.id, role="assistant", content=observability_reply, meta={"status": "observability_not_configured", "data_context": data_context, "tool_runs": [], "evidence": []}))
        db.commit()
        return {"session_id": session.id, "message": observability_reply, "status": "observability_not_configured", "tool_runs": [], "evidence": [], "data_context": data_context}
    selected_tools = select_tools_for_prompt(payload.message)
    evidence = diagnose_evidence([tool.id for tool in selected_tools])
    tool_names = "、".join(tool.name for tool in selected_tools) or "智能诊断工具"
    model = db.get(AiModelConfig, setting.model_id) if setting.model_id else None
    assistant_status = "diagnose_tools_ready"
    if model and model.enabled:
        try:
            api_key = _secret_from_config(model.config)
            if not api_key:
                raise ValueError("Model API key is not configured")
            tool_context = "\n".join(f"- {tool.name}: {tool.description}" for tool in selected_tools)
            messages = [
                {
                    "role": "system",
                    "content": (
                        "你是 OpsRadar AI 助手。回答必须围绕运维巡检、问题排障、根因分析、影响分析、修复建议和验证步骤。"
                        "如果需要执行工具，请明确列出建议调用的 Diagnose Tools 和需要的参数；不要编造实时执行结果。"
                        "如果当前没有资产、巡检结果、异常问题或工具证据，必须明确说明暂无可分析数据，不能给出泛化根因结论。"
                        "查询历史监控或集中日志前必须检查数据源状态；未接入时只能使用巡检结果或通过远程连接采集现场状态。"
                        f"\n当前数据上下文: assets={data_context['resources']}, issues={data_context['issues']}, open_issues={data_context['open_issues']}, tasks={data_context['tasks']}, results={data_context['results']}, metrics_datasources={data_context['metrics_datasources']}, log_datasources={data_context['log_datasources']}."
                        f"\n当前匹配的 Diagnose Tools:\n{tool_context}"
                    ),
                }
            ]
            for item in reversed(history):
                if item.role in {"user", "assistant"}:
                    messages.append({"role": item.role, "content": item.content})
            messages.append({"role": "user", "content": payload.message})
            assistant_message = _chat_completion(model, api_key, messages)
            assistant_status = "completed"
        except Exception as exc:  # noqa: BLE001 - surface model integration errors to the operator
            assistant_message = f"模型调用失败：{_ai_model_error_message(exc)}。已匹配 Diagnose Tools：{tool_names}，请检查模型对接配置后重试。"
            assistant_status = "model_error"
    else:
        assistant_message = (
            f"已识别需要调用的 Diagnose Tools：{tool_names}。"
            "当前会话已记录工具上下文；配置模型和执行器后，回答会基于实时工具证据给出根因、影响和修复步骤。"
        )
    db.add(
        AiChatMessage(
            session_id=session.id,
            role="assistant",
            content=assistant_message,
            meta={"status": assistant_status, "tool_runs": [tool.to_dict() for tool in selected_tools], "evidence": evidence},
        )
    )
    db.commit()
    return {"session_id": session.id, "message": assistant_message, "status": assistant_status, "tool_runs": [tool.to_dict() for tool in selected_tools], "evidence": evidence}


@router.patch("/settings/site")
def update_site_settings(
    payload: SiteSettingsUpdate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "settings:update")
    site = ensure_site_settings(db)
    for field, value in payload.model_dump().items():
        setattr(site, field, value)
    db.add(AuditLog(actor=user.display_name, action="update_site_settings", target=site.site_name, detail="Updated site branding"))
    db.commit()
    db.refresh(site)
    return model_to_dict(site)


@router.get("/search")
def global_search(
    q: Annotated[str, Query(min_length=1, max_length=80)],
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_user)],
    limit: Annotated[int, Query(ge=1, le=10)] = 6,
) -> dict:
    require_permission(db, _, "dashboard:read")
    term = f"%{q.strip()}%"
    results: list[dict] = []

    def add(kind: str, title: str, subtitle: str, view: str, item_id: str, tab: str | None = None) -> None:
        results.append(
            {
                "type": kind,
                "title": title,
                "subtitle": subtitle,
                "view": view,
                "id": item_id,
                "tab": tab,
            }
        )

    for item in (
        db.query(Resource)
        .filter(or_(Resource.name.ilike(term), Resource.ip.ilike(term), Resource.type.ilike(term)))
        .order_by(Resource.created_at.desc())
        .limit(limit)
        .all()
    ):
        if can(db, _, "resources:read"):
            add("resource", item.name, f"{item.type} / {item.ip}:{item.port}", "environments", item.id, "resources")

    for item in (
        db.query(Application)
        .filter(or_(Application.name.ilike(term), Application.owner.ilike(term), Application.description.ilike(term)))
        .order_by(Application.created_at.desc())
        .limit(limit)
        .all()
    ):
        if can(db, _, "applications:read"):
            add("application", item.name, f"{item.owner} / {item.status}", "environments", item.id)

    for item in (
        db.query(AppEnvironment)
        .filter(or_(AppEnvironment.name.ilike(term), AppEnvironment.env_type.ilike(term), AppEnvironment.owner.ilike(term)))
        .order_by(AppEnvironment.created_at.desc())
        .limit(limit)
        .all()
    ):
        if can(db, _, "environments:read"):
            add("environment", item.name, f"{item.application.name if item.application else '-'} / {item.env_type}", "environments", item.id)

    for item in db.query(Task).filter(Task.name.ilike(term)).order_by(Task.created_at.desc()).limit(limit).all():
        if can(db, _, "tasks:read"):
            view = "reports" if item.status in {"finished", "failed"} else "tasks"
            add("task", item.name, item.status, view, item.id, "history" if view == "tasks" else "history")

    for item in (
        db.query(InspectionItem)
        .filter(or_(InspectionItem.name.ilike(term), InspectionItem.description.ilike(term), InspectionItem.category.ilike(term)))
        .order_by(InspectionItem.category, InspectionItem.name)
        .limit(limit)
        .all()
    ):
        if can(db, _, "templates:read"):
            add("inspection_template", item.name, f"{item.category} / {item.command_type}", "tasks", item.id, "templates")

    for item in db.query(Issue).filter(Issue.summary.ilike(term)).order_by(Issue.created_at.desc()).limit(limit).all():
        if can(db, _, "issues:read"):
            add("issue", item.summary, f"{item.severity} / {item.status}", "problem-center", item.id, "issues")

    for item in (
        db.query(User)
        .filter(or_(User.username.ilike(term), User.display_name.ilike(term), User.email.ilike(term), User.role.ilike(term)))
        .order_by(User.created_at.desc())
        .limit(limit)
        .all()
    ):
        if can(db, _, "users:read"):
            add("user", item.display_name, f"{item.username} / {item.role}", "settings", item.id, "users")

    return {"query": q, "results": results[: limit * 4]}


def default_resource_role(resource_type: str | None) -> str:
    role_map = {
        "host": "host",
        "pgsql": "postgresql",
        "postgresql": "postgresql",
        "mysql": "mysql",
        "redis": "redis",
        "container": "container",
        "compose": "compose-service",
        "systemd": "systemd",
        "nginx": "nginx",
        "slb": "load-balancer",
        "gateway": "gateway",
        "minio": "object-storage",
        "nas": "nas",
        "storage": "storage",
    }
    return role_map.get(resource_type or "", resource_type or "host")


def extract_resource_extra_params(values: dict) -> dict:
    extra: dict[str, str] = {}
    for key in ("container_name", "compose_project", "compose_service", "systemd_unit"):
        value = str(values.pop(key, "") or "").strip()
        if value:
            extra[key] = value
    return extra


def merge_resource_extra_params(current: dict | None, updates: dict) -> dict:
    extra = dict(current or {})
    for key in ("container_name", "compose_project", "compose_service", "systemd_unit"):
        extra.pop(key, None)
    extra.update(updates)
    return extra


def sync_resource_environment_bindings(db: Session, resource: Resource, bindings: list[dict] | None) -> None:
    if bindings is None:
        return
    seen: set[str] = set()
    for row in bindings:
        environment_id = row["environment_id"]
        if not db.get(AppEnvironment, environment_id):
            raise HTTPException(status_code=422, detail=f"Application environment not found: {environment_id}")
        seen.add(environment_id)
        binding = (
            db.query(EnvironmentResource)
            .filter(EnvironmentResource.resource_id == resource.id, EnvironmentResource.environment_id == environment_id)
            .one_or_none()
        )
        if not binding:
            binding = EnvironmentResource(resource_id=resource.id, environment_id=environment_id)
            db.add(binding)
        binding.layer = row.get("layer") or "os"
        binding.role = default_resource_role(resource.type)
        binding.weight = row.get("weight") or 10
    db.query(EnvironmentResource).filter(EnvironmentResource.resource_id == resource.id, EnvironmentResource.environment_id.notin_(seen)).delete(synchronize_session=False)


@router.patch("/resources/{resource_id}")
def update_resource(
    resource_id: str,
    payload: ResourceUpdate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "resources:update")
    resource = db.get(Resource, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    values = payload.model_dump()
    credential_secret = values.pop("credential_secret", None)
    environment_bindings = values.pop("environment_bindings", None)
    extra_updates = extract_resource_extra_params(values)
    if not db.query(ResourceType).filter(ResourceType.key == values["type"], ResourceType.enabled.is_(True)).first():
        raise HTTPException(status_code=422, detail="Resource type is not enabled")
    for field, value in values.items():
        setattr(resource, field, value)
    resource.extra_params = merge_resource_extra_params(resource.extra_params, extra_updates)
    if credential_secret is not None:
        if credential_secret:
            resource.extra_params = set_encrypted_credential(resource.extra_params, credential_secret)
    sync_resource_environment_bindings(db, resource, environment_bindings)
    if environment_bindings is None:
        db.query(EnvironmentResource).filter(EnvironmentResource.resource_id == resource.id).update(
            {EnvironmentResource.role: default_resource_role(resource.type)},
            synchronize_session=False,
        )
    db.add(AuditLog(actor=user.display_name, action="update_resource", target=resource.name, detail=f"{resource.ip}:{resource.port}"))
    db.commit()
    db.refresh(resource)
    return resource_payload(resource)


@router.delete("/resources/{resource_id}")
def delete_resource(
    resource_id: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "resources:delete")
    resource = db.get(Resource, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    db.query(TaskResult).filter(TaskResult.resource_id == resource.id).update({TaskResult.resource_id: None})
    db.query(Issue).filter(Issue.resource_id == resource.id).update({Issue.resource_id: None})
    db.add(AuditLog(actor=user.display_name, action="delete_resource", target=resource.name, detail=f"{resource.ip}:{resource.port}"))
    db.delete(resource)
    db.commit()
    return {"ok": True}


@router.post("/settings/resource-types")
def create_resource_type(
    payload: ResourceTypePayload,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "settings:update")
    if db.query(ResourceType).filter(ResourceType.key == payload.key).first():
        raise HTTPException(status_code=409, detail="Resource type already exists")
    item = ResourceType(**payload.model_dump())
    db.add(item)
    db.add(AuditLog(actor=user.display_name, action="create_resource_type", target=item.key, detail=item.name))
    db.commit()
    db.refresh(item)
    return model_to_dict(item)


@router.patch("/settings/resource-types/{type_id}")
def update_resource_type(
    type_id: str,
    payload: ResourceTypePayload,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "settings:update")
    item = db.get(ResourceType, type_id)
    if not item:
        raise HTTPException(status_code=404, detail="Resource type not found")
    duplicate = db.query(ResourceType).filter(ResourceType.key == payload.key, ResourceType.id != type_id).first()
    if duplicate:
        raise HTTPException(status_code=409, detail="Resource type already exists")
    old_key = item.key
    for field, value in payload.model_dump().items():
        setattr(item, field, value)
    if old_key != item.key:
        db.query(Resource).filter(Resource.type == old_key).update({Resource.type: item.key})
        db.query(InspectionItem).filter(InspectionItem.resource_type == old_key).update({InspectionItem.resource_type: item.key})
    db.add(AuditLog(actor=user.display_name, action="update_resource_type", target=item.key, detail=item.name))
    db.commit()
    db.refresh(item)
    return model_to_dict(item)


@router.delete("/settings/resource-types/{type_id}")
def delete_resource_type(
    type_id: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "settings:update")
    item = db.get(ResourceType, type_id)
    if not item:
        raise HTTPException(status_code=404, detail="Resource type not found")
    if db.query(Resource).filter(Resource.type == item.key).count():
        raise HTTPException(status_code=409, detail="Resource type is in use")
    db.add(AuditLog(actor=user.display_name, action="delete_resource_type", target=item.key, detail=item.name))
    db.delete(item)
    db.commit()
    return {"ok": True}


@router.post("/users")
def create_user(
    payload: UserCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "users:create")
    if db.query(User).filter(User.username == payload.username).one_or_none():
        raise HTTPException(status_code=400, detail="Username already exists")
    if not db.query(Role).filter(Role.name == payload.role).one_or_none():
        raise HTTPException(status_code=400, detail="Role does not exist")
    new_user = User(
        username=payload.username,
        display_name=payload.display_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
        is_active=payload.is_active,
    )
    db.add(new_user)
    db.add(AuditLog(actor=user.display_name, action="create_user", target=new_user.username, detail=new_user.role))
    db.commit()
    db.refresh(new_user)
    return user_payload(new_user)


@router.patch("/users/{user_id}")
def update_user(
    user_id: str,
    payload: UserUpdate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "users:update")
    target_user = db.get(User, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    if not db.query(Role).filter(Role.name == payload.role).one_or_none():
        raise HTTPException(status_code=400, detail="Role does not exist")
    for field, value in payload.model_dump().items():
        setattr(target_user, field, value)
    db.add(AuditLog(actor=user.display_name, action="update_user", target=target_user.username, detail=target_user.role))
    db.commit()
    db.refresh(target_user)
    return user_payload(target_user)


@router.delete("/users/{user_id}")
def delete_user(
    user_id: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "users:update")
    target_user = db.get(User, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    if target_user.id == user.id:
        raise HTTPException(status_code=400, detail="Cannot delete current user")
    db.query(Task).filter(Task.created_by == target_user.id).update({Task.created_by: None})
    db.add(AuditLog(actor=user.display_name, action="delete_user", target=target_user.username, detail=target_user.role))
    db.delete(target_user)
    db.commit()
    return {"ok": True}


@router.post("/roles")
def create_role(
    payload: RoleUpdate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "roles:update")
    if payload.name in SYSTEM_ROLE_NAMES:
        raise HTTPException(status_code=400, detail="System role name is reserved")
    existing = db.query(Role).filter(Role.name == payload.name).one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Role name already exists")
    role = Role(name=payload.name, description=payload.description, permissions=normalize_role_permissions(payload.permissions))
    db.add(role)
    db.add(AuditLog(actor=user.display_name, action="create_role", target=role.name, detail=f"{len(role.permissions)} permissions"))
    db.commit()
    db.refresh(role)
    return role_payload(role)


@router.patch("/roles/{role_id}")
def update_role(
    role_id: str,
    payload: RoleUpdate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "roles:update")
    role = db.get(Role, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    if role.name in SYSTEM_ROLE_NAMES:
        raise HTTPException(status_code=400, detail="System roles cannot be edited")
    if payload.name in SYSTEM_ROLE_NAMES:
        raise HTTPException(status_code=400, detail="System role name is reserved")
    existing = db.query(Role).filter(Role.name == payload.name, Role.id != role.id).one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Role name already exists")
    old_name = role.name
    role.name = payload.name
    role.description = payload.description
    role.permissions = normalize_role_permissions(payload.permissions)
    if old_name != role.name:
        db.query(User).filter(User.role == old_name).update({User.role: role.name})
    db.add(AuditLog(actor=user.display_name, action="update_role", target=role.name, detail=f"{len(role.permissions)} permissions"))
    db.commit()
    db.refresh(role)
    return role_payload(role)


@router.delete("/roles/{role_id}")
def delete_role(
    role_id: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "roles:update")
    role = db.get(Role, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    if role.name in SYSTEM_ROLE_NAMES:
        raise HTTPException(status_code=400, detail="System roles cannot be deleted")
    assigned = db.query(User).filter(User.role == role.name).count()
    if assigned:
        raise HTTPException(status_code=400, detail="Role is assigned to users")
    db.add(AuditLog(actor=user.display_name, action="delete_role", target=role.name, detail=""))
    db.delete(role)
    db.commit()
    return {"ok": True}


@router.get("/tasks/{task_id}")
def get_task(task_id: str, db: Annotated[Session, Depends(get_db)], _: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, _, "tasks:read")
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task_payload(task, include_results=True, include_logs=True)


@router.get("/tasks/{task_id}/logs")
def get_task_logs(task_id: str, db: Annotated[Session, Depends(get_db)], _: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, _, "tasks:read")
    logs = db.query(TaskLog).filter(TaskLog.task_id == task_id).order_by(TaskLog.created_at.asc()).all()
    task = db.get(Task, task_id)
    return {"status": task.status if task else "unknown", "logs": [model_to_dict(log) for log in logs]}


@router.delete("/tasks/{task_id}")
def delete_task(
    task_id: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "tasks:cancel")
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    result_ids = [result.id for result in task.results]
    db.query(Issue).filter(Issue.task_id == task.id).update({Issue.task_id: None})
    if result_ids:
        db.query(Issue).filter(Issue.task_result_id.in_(result_ids)).update(
            {Issue.task_result_id: None},
            synchronize_session=False,
        )
    db.add(AuditLog(actor=user.display_name, action="delete_task", target=task.name, detail=task.id))
    db.delete(task)
    db.commit()
    return {"ok": True}


@router.delete("/cron-plans/{plan_id}")
def delete_cron_plan(
    plan_id: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "tasks:cancel")
    plan = db.get(CronPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Cron plan not found")
    db.add(AuditLog(actor=user.display_name, action="delete_cron_plan", target=plan.name, detail=plan.cron_expr))
    db.delete(plan)
    db.commit()
    return {"ok": True}


def apply_cron_plan_payload(db: Session, plan: CronPlan, payload: TaskCreateRequest, creator_id: str | None) -> CronPlan:
    resource_ids = validate_task_create_payload(db, payload)
    cron_expr = cron_expr_for(payload.schedule_rule, payload.schedule_time)
    plan.name = payload.name
    plan.environment_id = payload.environment_id
    plan.created_by = creator_id
    plan.description = payload.description
    plan.cron_expr = cron_expr
    plan.resource_ids = resource_ids
    plan.item_ids = payload.item_ids
    plan.enabled = True
    plan.next_run_at = next_run_for(cron_expr)
    plan.notification_config = enrich_task_config_with_environment(db, task_create_config(payload), payload.environment_id)
    return plan


def enqueue_task(db: Session, task: Task, user: User) -> Task:
    if task.status not in {"pending", "failed"}:
        raise HTTPException(status_code=409, detail=f"Task cannot be started from status {task.status}")
    task.cancel_requested = False
    task.status = "queued"
    task.started_at = None
    task.finished_at = None
    db.add(TaskLog(task_id=task.id, level="info", message=f"Task started by {user.display_name} and queued to Celery worker."))
    db.add(AuditLog(actor=user.display_name, action="start_task", target=task.name, detail=task.id, result="success"))
    db.commit()
    db.refresh(task)
    try:
        run_inspection_task.delay(task.id)
    except Exception as exc:
        task.status = "failed"
        db.add(TaskLog(task_id=task.id, level="error", message=f"Failed to enqueue task: {exc}"))
        db.add(AuditLog(actor=user.display_name, action="enqueue_task_failed", target=task.name, detail=str(exc), result="failed"))
        db.commit()
        raise HTTPException(status_code=503, detail=f"Celery worker queue is unavailable: {exc}") from exc
    return task


@router.post("/tasks")
def create_configured_task(
    payload: TaskCreateRequest,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "tasks:create")
    resource_ids = validate_task_create_payload(db, payload)
    config = enrich_task_config_with_environment(db, task_create_config(payload), payload.environment_id)
    creator_id = payload.owner_id or user.id
    if payload.execution_mode == "periodic":
        plan = apply_cron_plan_payload(db, CronPlan(), payload, creator_id)
        db.add(plan)
        db.add(AuditLog(actor=user.display_name, action="create_cron_plan", target=plan.name, detail=plan.cron_expr))
        db.commit()
        db.refresh(plan)
        return {"mode": "periodic", "plan": model_to_dict(plan)}

    task = create_manual_task(
        db,
        name=payload.name,
        resource_ids=resource_ids,
        item_ids=payload.item_ids,
        user_id=creator_id,
        environment_id=payload.environment_id,
        config=config,
    )
    db.add(TaskLog(task_id=task.id, level="info", message="Task saved. Waiting for manual start."))
    db.add(AuditLog(actor=user.display_name, action="save_task", target=task.name, detail="pending"))
    db.commit()
    db.refresh(task)
    return {"mode": "once", "task": task_payload(task, include_results=True, include_logs=True)}


@router.patch("/cron-plans/{plan_id}")
def update_cron_plan(
    plan_id: str,
    payload: TaskCreateRequest,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "tasks:create")
    plan = db.get(CronPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Cron plan not found")
    apply_cron_plan_payload(db, plan, payload, payload.owner_id or user.id)
    db.add(AuditLog(actor=user.display_name, action="update_cron_plan", target=plan.name, detail=plan.cron_expr))
    db.commit()
    db.refresh(plan)
    return {"mode": "periodic", "plan": model_to_dict(plan)}


@router.patch("/tasks/{task_id}")
def update_task(
    task_id: str,
    payload: TaskCreateRequest,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "tasks:create")
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    resource_ids = validate_task_create_payload(db, payload)
    task.name = payload.name
    task.environment_id = payload.environment_id
    environment = db.get(AppEnvironment, payload.environment_id) if payload.environment_id else None
    task.application_id = environment.application_id if environment else None
    task.created_by = payload.owner_id or task.created_by or user.id
    task.config = enrich_task_config_with_environment(db, task_create_config(payload), payload.environment_id)
    if task.status in {"pending", "queued"}:
        db.query(TaskResult).filter(TaskResult.task_id == task.id).delete(synchronize_session=False)
        db.flush()
        resources = db.query(Resource).filter(Resource.id.in_(resource_ids)).all()
        items = db.query(InspectionItem).filter(InspectionItem.id.in_(payload.item_ids)).all()
        total = 0
        from backend.app.services.inspection_engine import _compatible, _item_snapshot
        for resource in resources:
            for item in items:
                if not _compatible(resource, item):
                    continue
                db.add(TaskResult(task_id=task.id, resource_id=resource.id, item_id=item.id, resource_snapshot=resource_snapshot_for_task(db, resource, item, payload.environment_id), item_snapshot=_item_snapshot(item, resource), status="pending"))
                total += 1
        task.summary = {"total": total, "success": 0, "fail": 0, "exception": 0}
        db.add(TaskLog(task_id=task.id, level="info", message=f"Task configuration updated with {total} executable check items."))
    db.add(AuditLog(actor=user.display_name, action="update_task", target=task.name, detail=task.id))
    db.commit()
    db.refresh(task)
    return {"mode": "once", "task": task_payload(task, include_results=True, include_logs=True)}


@router.post("/tasks/{task_id}/start")
def start_task(
    task_id: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "tasks:create")
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task = enqueue_task(db, task, user)
    return task_payload(task, include_results=True, include_logs=True)


@router.post("/tasks/{task_id}/cancel")
def cancel_task(
    task_id: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "tasks:cancel")
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.status in {"finished", "failed", "cancelled"}:
        raise HTTPException(status_code=409, detail=f"Task cannot be cancelled from status {task.status}")
    task.cancel_requested = True
    if task.status in {"pending", "queued"}:
        task.status = "cancelled"
        task.finished_at = datetime.now(timezone.utc)
    db.add(TaskLog(task_id=task.id, level="warning", message=f"Cancellation requested by {user.display_name}."))
    db.add(AuditLog(actor=user.display_name, action="cancel_task", target=task.name, detail=task.id, result="success"))
    db.commit()
    db.refresh(task)
    return task_payload(task, include_results=True, include_logs=True)


@router.post("/tasks/manual")
def create_task(
    payload: ManualTaskRequest,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "tasks:create")
    task = create_manual_task(
        db,
        name=payload.name or "Manual Inspection",
        resource_ids=payload.resource_ids,
        item_ids=payload.item_ids,
        user_id=user.id,
    )
    enqueue_task(db, task, user)
    db.refresh(task)
    return task_payload(task, include_results=True, include_logs=True)


@router.post("/resources")
def create_resource(payload: ResourceCreate, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "resources:create")
    values = payload.model_dump()
    credential_secret = values.pop("credential_secret", "")
    environment_bindings = values.pop("environment_bindings", [])
    extra_updates = extract_resource_extra_params(values)
    if not db.query(ResourceType).filter(ResourceType.key == values["type"], ResourceType.enabled.is_(True)).first():
        raise HTTPException(status_code=422, detail="Resource type is not enabled")
    extra_params = set_encrypted_credential({}, credential_secret) if credential_secret else {}
    extra_params = merge_resource_extra_params(extra_params, extra_updates)
    extra_params = apply_default_rule_binding(db, extra_params, values["type"])
    resource = Resource(**values, status="untested", disk_usage=0, extra_params=extra_params)
    db.add(resource)
    db.flush()
    sync_resource_environment_bindings(db, resource, environment_bindings)
    db.add(AuditLog(actor=user.display_name, action="create_resource", target=resource.name, detail=resource.ip))
    db.commit()
    db.refresh(resource)
    return resource_payload(resource)


@router.post("/resources/batch")
def create_resources_batch(
    payload: ResourceBatchCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "resources:create")
    created: list[Resource] = []
    for item in payload.resources:
        values = item.model_dump()
        credential_secret = values.pop("credential_secret", "")
        environment_bindings = values.pop("environment_bindings", [])
        extra_updates = extract_resource_extra_params(values)
        if not db.query(ResourceType).filter(ResourceType.key == values["type"], ResourceType.enabled.is_(True)).first():
            raise HTTPException(status_code=422, detail=f"Resource type is not enabled: {values['type']}")
        extra_params = set_encrypted_credential({}, credential_secret) if credential_secret else {}
        extra_params = merge_resource_extra_params(extra_params, extra_updates)
        extra_params = apply_default_rule_binding(db, extra_params, values["type"])
        resource = Resource(**values, status="untested", disk_usage=0, extra_params=extra_params)
        db.add(resource)
        db.flush()
        sync_resource_environment_bindings(db, resource, environment_bindings)
        created.append(resource)
    db.add(AuditLog(actor=user.display_name, action="batch_create_resources", target="resources", detail=f"{len(created)} resources"))
    db.commit()
    for resource in created:
        db.refresh(resource)
    return {"created": [resource_payload(resource) for resource in created]}


@router.post("/resources/{resource_id}/test")
async def test_resource(resource_id: str, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "resources:update")
    resource = db.get(Resource, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    resource.status = "testing"
    db.commit()
    result = await InspectionExecutor().execute(
        ExecutionContext(
            resource=resource_execution_snapshot(resource),
            item=connection_test_item(resource),
        )
    )
    resource.status = "online" if result.status == "success" else "offline"
    db.add(AuditLog(actor=user.display_name, action="test_resource", target=resource.name, detail=f"Result: {resource.status}"))
    db.commit()
    db.refresh(resource)
    return resource_payload(resource)


@router.patch("/resources/{resource_id}/inspection-rules")
def update_resource_inspection_rules(
    resource_id: str,
    payload: ResourceRuleBindingPayload,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "resources:update")
    resource = db.get(Resource, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    ids = sorted({item_id for item_id in payload.inspection_item_ids if item_id})
    if ids:
        existing_count = db.query(InspectionItem).filter(InspectionItem.id.in_(ids), InspectionItem.enabled.is_(True)).count()
        if existing_count != len(ids):
            raise HTTPException(status_code=422, detail="One or more inspection items were not found or disabled")
    extra = dict(resource.extra_params or {})
    extra["bound_inspection_item_ids"] = ids
    extra["rules_manually_configured"] = True
    resource.extra_params = extra
    if extra.get("discovered_service_id"):
        service = db.get(DiscoveredService, extra["discovered_service_id"])
        if service:
            service.bound_rule_count = len(ids)
            service.is_bound = bool(ids)
    db.add(AuditLog(actor=user.display_name, action="bind_inspection_rules", target=resource.name, detail=f"{len(ids)} rules"))
    db.commit()
    db.refresh(resource)
    return resource_payload(resource)


@router.post("/resources/{resource_id}/discover-services")
async def discover_resource_services(
    resource_id: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
    payload: ServiceDiscoveryRequest | None = None,
) -> dict:
    require_permission(db, user, "resources:update")
    resource = db.get(Resource, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    if resource.type not in {"host", "linux", "server"}:
        raise HTTPException(status_code=422, detail="Service discovery is only available for Linux host resources")
    if resource.status != "online":
        raise HTTPException(status_code=422, detail="Service discovery is only available for online resources")
    discovery_filters = payload.model_dump() if payload else {}
    try:
        services = await discover_services_for_resource(db, resource, resource_execution_snapshot(resource), discovery_filters)
    except Exception as exc:
        db.rollback()
        db.add(AuditLog(actor=user.display_name, action="discover_services_failed", target=resource.name, detail=str(exc), result="failed"))
        db.commit()
        raise HTTPException(status_code=502, detail=f"Service discovery failed: {exc}") from exc
    db.add(AuditLog(actor=user.display_name, action="discover_services", target=resource.name, detail=f"{len(services)} services"))
    db.commit()
    for service in services:
        db.refresh(service)
    return {"resource": resource_payload(resource), "services": [discovered_service_payload(service) for service in services]}


@router.delete("/discovered-services/{service_id}")
def delete_discovered_service(service_id: str, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "resources:delete")
    service = db.get(DiscoveredService, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Discovered service not found")
    service_name = service.name
    service_resource = db.get(Resource, service.service_resource_id) if service.service_resource_id else None
    db.delete(service)
    if service_resource:
        db.delete(service_resource)
    db.add(AuditLog(actor=user.display_name, action="delete_discovered_service", target=service_name, detail=service_id))
    db.commit()
    return {"deleted": service_id}


@router.patch("/discovered-services/{service_id}/credential")
def update_discovered_service_credential(
    service_id: str,
    payload: ServiceCredentialPayload,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "resources:update")
    service = db.get(DiscoveredService, service_id)
    if not service or not service.service_resource_id:
        raise HTTPException(status_code=404, detail="Discovered service not found")
    resource = db.get(Resource, service.service_resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Service resource not found")
    extra = dict(resource.extra_params or {})
    extra["service_credential_username"] = payload.username or ""
    extra["service_credential_encrypted"] = encrypt_secret(payload.credential_secret)
    extra["service_credential_configured"] = True
    resource.extra_params = extra
    service.bound_rule_count = len(extra.get("bound_inspection_item_ids") or [])
    db.add(AuditLog(actor=user.display_name, action="update_service_credential", target=service.name, detail=service.id))
    db.commit()
    db.refresh(service)
    return discovered_service_payload(service)


@router.post("/inspection-items")
def create_inspection_item(payload: InspectionItemCreate, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "templates:create")
    item = InspectionItem(**payload.model_dump(), is_builtin=False, enabled=True)
    db.add(item)
    db.add(AuditLog(actor=user.display_name, action="create_inspection_item", target=item.name, detail=item.category))
    db.commit()
    db.refresh(item)
    return model_to_dict(item)


@router.patch("/issues/{issue_id}")
def update_issue(issue_id: str, payload: IssueUpdate, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "issues:update")
    issue = db.get(Issue, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    issue.status = payload.status
    if payload.assignee is not None:
        issue.assignee = payload.assignee
    if payload.resolution_note is not None:
        issue.resolution_note = payload.resolution_note
    issue.updated_at = datetime.now(timezone.utc)
    db.add(AuditLog(actor=user.display_name, action="issue_update", target=issue.summary, detail=f"status={issue.status}"))
    db.commit()
    db.refresh(issue)
    return issue_payload(issue, db)


@router.get("/issues/{issue_id}/insight")
def get_issue_insight(issue_id: str, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "issues:read")
    issue = db.get(Issue, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    insight = db.query(IssueInsight).filter(IssueInsight.issue_id == issue.id).one_or_none()
    if not insight:
        insight = build_issue_insight(db, issue)
        db.commit()
        db.refresh(insight)
    return {"issue": issue_payload(issue, db), "insight": model_to_dict(insight)}


@router.delete("/issues/{issue_id}")
def delete_issue(
    issue_id: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "issues:update")
    issue = db.get(Issue, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    db.add(AuditLog(actor=user.display_name, action="delete_issue", target=issue.summary, detail=issue.status))
    db.delete(issue)
    db.commit()
    return {"ok": True}


@router.get("/reports/{task_id}/preview", response_class=HTMLResponse)
def preview_report(task_id: str, db: Annotated[Session, Depends(get_db)], _: Annotated[User, Depends(require_user)]) -> str:
    require_permission(db, _, "reports:read")
    return render_report_html(db, [task_id])


@router.get("/reports/{task_id}")
def download_report(
    task_id: str,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_user)],
    fmt: str = Query("html", pattern="^(html|docx|docs|pdf)$"),
):
    require_permission(db, _, "reports:export")
    path, media_type, filename = export_report(db, [task_id], fmt)
    return FileResponse(path, media_type=media_type, filename=filename)


@router.get("/reports")
def download_merged_report(
    task_ids: Annotated[list[str], Query()],
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_user)],
    fmt: str = Query("html", pattern="^(html|docx|docs|pdf)$"),
):
    require_permission(db, _, "reports:export")
    path, media_type, filename = export_report(db, task_ids, fmt)
    return FileResponse(path, media_type=media_type, filename=filename)
