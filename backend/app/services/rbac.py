from __future__ import annotations

from sqlalchemy.orm import Session

from backend.app.models import Role, User


ALL_PERMISSIONS = [
    "dashboard:read",
    "resources:read",
    "resources:create",
    "resources:update",
    "resources:delete",
    "applications:read",
    "applications:create",
    "applications:update",
    "applications:delete",
    "environments:read",
    "environments:create",
    "environments:update",
    "environments:delete",
    "templates:read",
    "templates:create",
    "templates:update",
    "templates:delete",
    "tasks:read",
    "tasks:create",
    "tasks:cancel",
    "reports:read",
    "reports:export",
    "issues:read",
    "issues:update",
    "repair_tasks:read",
    "repair_tasks:create",
    "repair_tasks:update",
    "audit:read",
    "settings:read",
    "settings:update",
    "analysis_rules:read",
    "analysis_rules:create",
    "analysis_rules:update",
    "analysis_rules:delete",
    "users:read",
    "users:create",
    "users:update",
    "roles:read",
    "roles:update",
    "resource_center:read",
    "smart_inspection:read",
    "problem_center:read",
    "report_center:read",
    "ai_center:read",
    "ai_models:read",
    "ai_models:create",
    "ai_models:update",
    "ai_models:delete",
    "ai_datasources:read",
    "ai_datasources:create",
    "ai_datasources:update",
    "ai_diagnostics:read",
    "ai_analysis:read",
    "ai_analysis:create",
    "ai_knowledge:read",
    "ai_assistant:read",
    "ai_assistant:update",
]


def _role_permissions(db: Session, user: User) -> list[str]:
    role = db.query(Role).filter(Role.name == user.role).one_or_none()
    return list(role.permissions or []) if role else []


def effective_permissions(db: Session, user: User) -> list[str]:
    return _role_permissions(db, user)


def has_permission(db: Session, user: User, permission: str) -> bool:
    permissions = _role_permissions(db, user)
    if "*" in permissions:
        return True
    area = permission.split(":", 1)[0]
    return permission in permissions or f"{area}:*" in permissions
