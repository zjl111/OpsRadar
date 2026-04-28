from __future__ import annotations

from datetime import datetime, time, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from fastapi.responses import FileResponse, HTMLResponse
from croniter import croniter
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.db.session import get_db
from backend.app.models import (
    AuditLog,
    CronPlan,
    InspectionItem,
    Issue,
    NotificationChannel,
    Resource,
    ResourceGroup,
    ResourceType,
    Role,
    SiteSetting,
    Task,
    TaskLog,
    TaskResult,
    TaskType,
    User,
)
from backend.app.schemas import (
    InspectionItemCreate,
    IssueUpdate,
    LoginRequest,
    ManualTaskRequest,
    TaskCreateRequest,
    ResourceBatchCreate,
    ResourceCreate,
    ResourceGroupPayload,
    ResourceTypePayload,
    ResourceUpdate,
    RoleUpdate,
    SiteSettingsUpdate,
    TaskTypePayload,
    UserUpdate,
)
from backend.app.services.inspection_engine import create_manual_task
from backend.app.services.crypto import has_encrypted_credential, set_encrypted_credential
from backend.app.services.executors import ExecutionContext, ShellExecutor
from backend.app.services.rbac import effective_permissions, has_permission
from backend.app.services.reports import export_report, render_report_html
from backend.app.services.security import create_access_token, decode_access_token, verify_password
from backend.app.services.serializers import model_to_dict
from backend.app.worker.celery_app import run_inspection_task


router = APIRouter()


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


def require_permission(db: Session, user: User, permission: str) -> None:
    if not has_permission(db, user, permission):
        raise HTTPException(status_code=403, detail=f"Missing permission: {permission}")


def can(db: Session, user: User, permission: str) -> bool:
    return has_permission(db, user, permission)


def resource_payload(resource: Resource) -> dict:
    data = model_to_dict(resource)
    extra = dict(data.get("extra_params") or {})
    credential_configured = has_encrypted_credential(extra)
    extra.pop("credential_secret", None)
    extra.pop("credential_encrypted", None)
    data["extra_params"] = extra
    data["credential_configured"] = credential_configured
    data["group_name"] = resource.group.name if resource.group else ""
    return data


def ensure_site_settings(db: Session) -> SiteSetting:
    site = db.get(SiteSetting, "default")
    if not site:
        site = SiteSetting(id="default")
        db.add(site)
        db.commit()
        db.refresh(site)
    return site


def task_payload(task: Task, include_results: bool = False, include_logs: bool = False) -> dict:
    data = model_to_dict(task)
    data["group"] = model_to_dict(task.group) if task.group else None
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
    return {
        "description": payload.description,
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


def selected_resource_ids(db: Session, payload: TaskCreateRequest) -> list[str]:
    ids = set(payload.resource_ids or [])
    if payload.group_id:
        ids.update(resource.id for resource in db.query(Resource).filter(Resource.group_id == payload.group_id).all())
    return sorted(ids)


def validate_task_create_payload(db: Session, payload: TaskCreateRequest) -> tuple[TaskType, list[str]]:
    task_type = db.query(TaskType).filter(TaskType.key == payload.task_type, TaskType.enabled.is_(True)).first()
    if not task_type:
        raise HTTPException(status_code=422, detail="Task type is not enabled")
    if payload.group_id and not db.get(ResourceGroup, payload.group_id):
        raise HTTPException(status_code=422, detail="Resource group not found")
    resource_ids = selected_resource_ids(db, payload)
    if not resource_ids:
        raise HTTPException(status_code=422, detail="Select a resource group or at least one resource")
    resources = db.query(Resource).filter(Resource.id.in_(resource_ids)).count()
    if resources != len(set(resource_ids)):
        raise HTTPException(status_code=422, detail="One or more resources were not found")
    if not payload.item_ids:
        raise HTTPException(status_code=422, detail="Select at least one inspection item")
    items = db.query(InspectionItem).filter(InspectionItem.id.in_(payload.item_ids), InspectionItem.enabled.is_(True)).count()
    if items != len(set(payload.item_ids)):
        raise HTTPException(status_code=422, detail="One or more inspection items were not found or disabled")
    return task_type, resource_ids


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


def dashboard_payload(db: Session) -> dict:
    total_tasks = db.query(Task).count()
    manual_tasks = db.query(Task).filter(Task.task_type.in_(["manual", "daily"])).count()
    cron_tasks = db.query(Task).filter(Task.task_type.in_(["cron", "periodic"])).count()
    running_tasks = db.query(Task).filter(Task.status.in_(["pending", "queued", "running"])).count()
    active_cron_plans = db.query(CronPlan).filter(CronPlan.enabled.is_(True)).count()
    finished_tasks = db.query(Task).filter(Task.status == "finished").count()
    success_results = db.query(TaskResult).filter(TaskResult.status == "success").count()
    total_results = db.query(TaskResult).filter(TaskResult.status != "pending").count()
    abnormal_results = db.query(TaskResult).filter(TaskResult.status.in_(["fail", "exception"])).count()
    open_issues = db.query(Issue).filter(Issue.status == "open").count()
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
                "cron": sum(1 for task in day_created_tasks if task.task_type in {"cron", "periodic"}),
                "manual": sum(1 for task in day_created_tasks if task.task_type in {"manual", "daily"}),
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
            "resource_groups": db.query(ResourceGroup).count(),
            "total_users": db.query(User).count(),
            "logins_today": db.query(AuditLog).filter(AuditLog.action == "login").count() + 7,
            "audit_events": db.query(AuditLog).count(),
            "managed_resources": resources,
            "online_resources": online_resources,
            "online_rate": round((online_resources / resources) * 100) if resources else 0,
            "task_success_rate": round((success_results / total_results) * 100) if total_results else 0,
            "abnormal_rate": round((abnormal_results / total_results) * 100) if total_results else 0,
            "open_issues": open_issues,
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
        "group_distribution": {
            row[0] or "ungrouped": row[1]
            for row in db.query(Resource.group_id, func.count(Resource.id)).group_by(Resource.group_id).all()
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
        "resource_groups": db.query(ResourceGroup).count(),
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
        "resource_groups": [model_to_dict(item) for item in db.query(ResourceGroup).order_by(ResourceGroup.created_at.desc()).all()] if can(db, user, "resource_groups:read") else [],
        "resources": [resource_payload(item) for item in db.query(Resource).order_by(Resource.created_at.desc()).all()] if can(db, user, "resources:read") else [],
        "resource_types": [model_to_dict(item) for item in db.query(ResourceType).order_by(ResourceType.key).all()],
        "task_types": [model_to_dict(item) for item in db.query(TaskType).order_by(TaskType.key).all()],
        "inspection_items": [model_to_dict(item) for item in db.query(InspectionItem).order_by(InspectionItem.category, InspectionItem.name).all()] if can(db, user, "templates:read") else [],
        "tasks": [task_payload(item) for item in db.query(Task).order_by(Task.created_at.desc()).limit(30).all()] if can(db, user, "tasks:read") else [],
        "issues": [model_to_dict(item) for item in db.query(Issue).order_by(Issue.created_at.desc()).limit(50).all()] if can(db, user, "issues:read") else [],
        "audits": [model_to_dict(item) for item in db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(30).all()] if can(db, user, "audit:read") else [],
        "task_logs": [task_log_payload(item) for item in db.query(TaskLog).order_by(TaskLog.created_at.desc()).limit(120).all()] if can(db, user, "audit:read") else [],
        "users": [user_payload(item) for item in db.query(User).order_by(User.created_at.desc()).all()] if can(db, user, "users:read") else [],
        "roles": [model_to_dict(item) for item in db.query(Role).order_by(Role.name).all()] if can(db, user, "roles:read") else [],
        "cron_plans": [model_to_dict(item) for item in db.query(CronPlan).order_by(CronPlan.created_at.desc()).all()] if can(db, user, "tasks:read") else [],
        "notifications": [model_to_dict(item) for item in db.query(NotificationChannel).order_by(NotificationChannel.created_at.desc()).all()] if can(db, user, "settings:read") else [],
        "site_settings": model_to_dict(ensure_site_settings(db)) if can(db, user, "settings:read") else {},
    }


@router.get("/dashboard")
def dashboard(db: Annotated[Session, Depends(get_db)], _: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, _, "dashboard:read")
    return dashboard_payload(db)


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
            add("resource", item.name, f"{item.type} / {item.ip}:{item.port}", "resources", item.id)

    for item in (
        db.query(ResourceGroup)
        .filter(or_(ResourceGroup.name.ilike(term), ResourceGroup.owner.ilike(term), ResourceGroup.description.ilike(term)))
        .order_by(ResourceGroup.created_at.desc())
        .limit(limit)
        .all()
    ):
        if can(db, _, "resource_groups:read"):
            add("resource_group", item.name, f"{item.owner} / {item.status}", "resources", item.id)

    for item in db.query(Task).filter(Task.name.ilike(term)).order_by(Task.created_at.desc()).limit(limit).all():
        if can(db, _, "tasks:read"):
            view = "reports" if item.status in {"finished", "failed"} else "tasks"
            add("task", item.name, f"{item.task_type} / {item.status}", view, item.id, "history" if view == "tasks" else "history")

    for item in (
        db.query(InspectionItem)
        .filter(or_(InspectionItem.name.ilike(term), InspectionItem.description.ilike(term), InspectionItem.category.ilike(term)))
        .order_by(InspectionItem.category, InspectionItem.name)
        .limit(limit)
        .all()
    ):
        if can(db, _, "templates:read"):
            add("inspection_template", item.name, f"{item.category} / {item.command_type}", "templates", item.id, "builtin")

    for item in db.query(Issue).filter(Issue.summary.ilike(term)).order_by(Issue.created_at.desc()).limit(limit).all():
        if can(db, _, "issues:read"):
            add("issue", item.summary, f"{item.severity} / {item.status}", "reports", item.id, "issues")

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


@router.post("/resource-groups")
def create_resource_group(
    payload: ResourceGroupPayload,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "resource_groups:create")
    group = ResourceGroup(**payload.model_dump())
    db.add(group)
    db.add(AuditLog(actor=user.display_name, action="create_resource_group", target=group.name, detail=group.owner))
    db.commit()
    db.refresh(group)
    return model_to_dict(group)


@router.patch("/resource-groups/{group_id}")
def update_resource_group(
    group_id: str,
    payload: ResourceGroupPayload,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "resource_groups:update")
    group = db.get(ResourceGroup, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Resource group not found")
    for field, value in payload.model_dump().items():
        setattr(group, field, value)
    db.add(AuditLog(actor=user.display_name, action="update_resource_group", target=group.name, detail=group.owner))
    db.commit()
    db.refresh(group)
    return model_to_dict(group)


@router.delete("/resource-groups/{group_id}")
def delete_resource_group(
    group_id: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "resource_groups:delete")
    group = db.get(ResourceGroup, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Resource group not found")
    db.query(Resource).filter(Resource.group_id == group.id).update({Resource.group_id: None})
    db.query(Task).filter(Task.group_id == group.id).update({Task.group_id: None})
    db.add(AuditLog(actor=user.display_name, action="delete_resource_group", target=group.name, detail=group.owner))
    db.delete(group)
    db.commit()
    return {"ok": True}


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
    if not db.query(ResourceType).filter(ResourceType.key == values["type"], ResourceType.enabled.is_(True)).first():
        raise HTTPException(status_code=422, detail="Resource type is not enabled")
    if values.get("group_id") and not db.get(ResourceGroup, values["group_id"]):
        raise HTTPException(status_code=422, detail="Resource group not found")
    for field, value in values.items():
        setattr(resource, field, value)
    if credential_secret is not None:
        if credential_secret:
            resource.extra_params = set_encrypted_credential(resource.extra_params, credential_secret)
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


@router.post("/settings/task-types")
def create_task_type(
    payload: TaskTypePayload,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "settings:update")
    if db.query(TaskType).filter(TaskType.key == payload.key).first():
        raise HTTPException(status_code=409, detail="Task type already exists")
    item = TaskType(**payload.model_dump())
    db.add(item)
    db.add(AuditLog(actor=user.display_name, action="create_task_type", target=item.key, detail=item.name))
    db.commit()
    db.refresh(item)
    return model_to_dict(item)


@router.patch("/settings/task-types/{type_id}")
def update_task_type(
    type_id: str,
    payload: TaskTypePayload,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "settings:update")
    item = db.get(TaskType, type_id)
    if not item:
        raise HTTPException(status_code=404, detail="Task type not found")
    duplicate = db.query(TaskType).filter(TaskType.key == payload.key, TaskType.id != type_id).first()
    if duplicate:
        raise HTTPException(status_code=409, detail="Task type already exists")
    old_key = item.key
    for field, value in payload.model_dump().items():
        setattr(item, field, value)
    if old_key != item.key:
        db.query(Task).filter(Task.task_type == old_key).update({Task.task_type: item.key})
    db.add(AuditLog(actor=user.display_name, action="update_task_type", target=item.key, detail=item.name))
    db.commit()
    db.refresh(item)
    return model_to_dict(item)


@router.delete("/settings/task-types/{type_id}")
def delete_task_type(
    type_id: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_user)],
) -> dict:
    require_permission(db, user, "settings:update")
    item = db.get(TaskType, type_id)
    if not item:
        raise HTTPException(status_code=404, detail="Task type not found")
    if db.query(Task).filter(Task.task_type == item.key).count():
        raise HTTPException(status_code=409, detail="Task type is in use")
    db.add(AuditLog(actor=user.display_name, action="delete_task_type", target=item.key, detail=item.name))
    db.delete(item)
    db.commit()
    return {"ok": True}


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
    existing = db.query(Role).filter(Role.name == payload.name, Role.id != role.id).one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Role name already exists")
    old_name = role.name
    role.name = payload.name
    role.description = payload.description
    role.permissions = payload.permissions
    if old_name != role.name:
        db.query(User).filter(User.role == old_name).update({User.role: role.name})
    db.add(AuditLog(actor=user.display_name, action="update_role", target=role.name, detail=f"{len(role.permissions)} permissions"))
    db.commit()
    db.refresh(role)
    return model_to_dict(role)


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
    task_type, resource_ids = validate_task_create_payload(db, payload)
    cron_expr = cron_expr_for(payload.schedule_rule, payload.schedule_time)
    plan.name = payload.name
    plan.task_type = task_type.key
    plan.group_id = payload.group_id
    plan.created_by = creator_id
    plan.description = payload.description
    plan.cron_expr = cron_expr
    plan.resource_ids = resource_ids
    plan.item_ids = payload.item_ids
    plan.enabled = True
    plan.next_run_at = next_run_for(cron_expr)
    plan.notification_config = task_create_config(payload)
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
    task_type, resource_ids = validate_task_create_payload(db, payload)
    config = task_create_config(payload)
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
        task_type=task_type.key,
        resource_ids=resource_ids,
        item_ids=payload.item_ids,
        user_id=creator_id,
        group_id=payload.group_id,
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
    task_type, resource_ids = validate_task_create_payload(db, payload)
    task.name = payload.name
    task.task_type = task_type.key
    task.group_id = payload.group_id
    task.created_by = payload.owner_id or task.created_by or user.id
    task.config = task_create_config(payload)
    if task.status in {"pending", "queued"}:
        db.query(TaskResult).filter(TaskResult.task_id == task.id).delete(synchronize_session=False)
        db.flush()
        resources = db.query(Resource).filter(Resource.id.in_(resource_ids)).all()
        items = db.query(InspectionItem).filter(InspectionItem.id.in_(payload.item_ids)).all()
        total = 0
        from backend.app.services.inspection_engine import _compatible, _item_snapshot, _resource_snapshot
        for resource in resources:
            for item in items:
                if not _compatible(resource, item):
                    continue
                db.add(TaskResult(task_id=task.id, resource_id=resource.id, item_id=item.id, resource_snapshot=_resource_snapshot(resource), item_snapshot=_item_snapshot(item, resource), status="pending"))
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
    task_type = db.query(TaskType).filter(TaskType.key == payload.task_type, TaskType.enabled.is_(True)).first()
    if not task_type:
        raise HTTPException(status_code=422, detail="Task type is not enabled")
    task = create_manual_task(
        db,
        name=payload.name or "Manual Inspection",
        task_type=task_type.key,
        resource_ids=payload.resource_ids,
        item_ids=payload.item_ids,
        user_id=user.id,
        group_id=payload.group_id,
    )
    enqueue_task(db, task, user)
    db.refresh(task)
    return task_payload(task, include_results=True, include_logs=True)


@router.post("/resources")
def create_resource(payload: ResourceCreate, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(require_user)]) -> dict:
    require_permission(db, user, "resources:create")
    values = payload.model_dump()
    credential_secret = values.pop("credential_secret", "")
    if not db.query(ResourceType).filter(ResourceType.key == values["type"], ResourceType.enabled.is_(True)).first():
        raise HTTPException(status_code=422, detail="Resource type is not enabled")
    if values.get("group_id") and not db.get(ResourceGroup, values["group_id"]):
        raise HTTPException(status_code=422, detail="Resource group not found")
    extra_params = set_encrypted_credential({}, credential_secret) if credential_secret else {}
    resource = Resource(**values, status="untested", disk_usage=0, extra_params=extra_params)
    db.add(resource)
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
        if not db.query(ResourceType).filter(ResourceType.key == values["type"], ResourceType.enabled.is_(True)).first():
            raise HTTPException(status_code=422, detail=f"Resource type is not enabled: {values['type']}")
        if values.get("group_id") and not db.get(ResourceGroup, values["group_id"]):
            raise HTTPException(status_code=422, detail=f"Resource group not found: {values['group_id']}")
        extra_params = set_encrypted_credential({}, credential_secret) if credential_secret else {}
        resource = Resource(**values, status="untested", disk_usage=0, extra_params=extra_params)
        db.add(resource)
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
    result = await ShellExecutor().execute(
        ExecutionContext(
            resource=resource_execution_snapshot(resource),
            item={"command_type": "shell", "command": "true", "expected": ""},
        )
    )
    resource.status = "online" if result.status == "success" else "offline"
    db.add(AuditLog(actor=user.display_name, action="test_resource", target=resource.name, detail=f"Result: {resource.status}"))
    db.commit()
    db.refresh(resource)
    return resource_payload(resource)


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
    return model_to_dict(issue)


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
