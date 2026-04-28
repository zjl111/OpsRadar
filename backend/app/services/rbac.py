from __future__ import annotations

from sqlalchemy.orm import Session

from backend.app.models import Role, User


ALL_PERMISSIONS = [
    "dashboard:read",
    "resources:read",
    "resources:create",
    "resources:update",
    "resources:delete",
    "resource_groups:read",
    "resource_groups:create",
    "resource_groups:update",
    "resource_groups:delete",
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
    "audit:read",
    "settings:read",
    "settings:update",
    "users:read",
    "users:update",
    "roles:read",
    "roles:update",
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
