from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from backend.app.db.session import Base


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid4().hex[:12]}"


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(40), primary_key=True, default=lambda: new_id("usr"))
    username = Column(String(64), unique=True, nullable=False, index=True)
    display_name = Column(String(128), nullable=False)
    email = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(32), nullable=False, default="operator")
    is_active = Column(Boolean, default=True, nullable=False)
    last_login_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)


class Role(Base):
    __tablename__ = "roles"

    id = Column(String(40), primary_key=True, default=lambda: new_id("rol"))
    name = Column(String(64), unique=True, nullable=False)
    description = Column(Text, default="")
    permissions = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)


class SiteSetting(Base):
    __tablename__ = "site_settings"

    id = Column(String(24), primary_key=True, default="default")
    site_name = Column(String(80), default="OpsRadar", nullable=False)
    site_subtitle = Column(String(120), default="巡检运营中心", nullable=False)
    icon_text = Column(String(8), default="OR", nullable=False)
    icon_color = Column(String(24), default="#1d8a7a", nullable=False)
    icon_image = Column(Text, default="", nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class ResourceGroup(Base):
    __tablename__ = "resource_groups"

    id = Column(String(40), primary_key=True, default=lambda: new_id("grp"))
    name = Column(String(128), nullable=False)
    owner = Column(String(128), nullable=False)
    description = Column(Text, default="")
    status = Column(String(24), default="active", nullable=False)
    tags = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    resources = relationship("Resource", back_populates="group")
    tasks = relationship("Task", back_populates="group")


class Resource(Base):
    __tablename__ = "resources"

    id = Column(String(40), primary_key=True, default=lambda: new_id("res"))
    group_id = Column(String(40), ForeignKey("resource_groups.id"))
    name = Column(String(128), nullable=False)
    type = Column(String(32), nullable=False)
    ip = Column(String(64), nullable=False)
    port = Column(Integer, nullable=False)
    username = Column(String(64), default="")
    credential_type = Column(String(24), default="password", nullable=False)
    status = Column(String(24), default="untested", nullable=False)
    os = Column(String(128), default="")
    cpu = Column(String(32), default="")
    memory = Column(String(32), default="")
    disk_usage = Column(Integer, default=0, nullable=False)
    load_avg = Column(String(32), default="0.00")
    extra_params = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    group = relationship("ResourceGroup", back_populates="resources")


class ResourceType(Base):
    __tablename__ = "resource_types"

    id = Column(String(40), primary_key=True, default=lambda: new_id("rtp"))
    key = Column(String(32), unique=True, nullable=False, index=True)
    name = Column(String(80), nullable=False)
    default_port = Column(Integer, default=22, nullable=False)
    enabled = Column(Boolean, default=True, nullable=False)
    description = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)


class TaskType(Base):
    __tablename__ = "task_types"

    id = Column(String(40), primary_key=True, default=lambda: new_id("ttp"))
    key = Column(String(32), unique=True, nullable=False, index=True)
    name = Column(String(80), nullable=False)
    enabled = Column(Boolean, default=True, nullable=False)
    description = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)


class InspectionItem(Base):
    __tablename__ = "inspection_items"

    id = Column(String(40), primary_key=True, default=lambda: new_id("itm"))
    name = Column(String(128), nullable=False)
    category = Column(String(32), nullable=False)
    resource_type = Column(String(32), nullable=False)
    command_template = Column(Text, nullable=False)
    command_type = Column(String(16), nullable=False)
    expected_result_pattern = Column(String(255), default="")
    is_builtin = Column(Boolean, default=False, nullable=False)
    enabled = Column(Boolean, default=True, nullable=False)
    description = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)


class CronPlan(Base):
    __tablename__ = "cron_plans"

    id = Column(String(40), primary_key=True, default=lambda: new_id("crn"))
    name = Column(String(128), nullable=False)
    task_type = Column(String(32), default="periodic", nullable=False)
    group_id = Column(String(40))
    created_by = Column(String(40))
    description = Column(Text, default="")
    cron_expr = Column(String(64), nullable=False)
    resource_ids = Column(JSON, default=list, nullable=False)
    item_ids = Column(JSON, default=list, nullable=False)
    enabled = Column(Boolean, default=True, nullable=False)
    notification_config = Column(JSON, default=dict, nullable=False)
    last_run_at = Column(DateTime(timezone=True))
    next_run_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)


class Task(Base):
    __tablename__ = "inspection_tasks"

    id = Column(String(40), primary_key=True, default=lambda: new_id("tsk"))
    name = Column(String(255), nullable=False)
    task_type = Column(String(32), nullable=False)
    status = Column(String(24), default="pending", nullable=False)
    group_id = Column(String(40), ForeignKey("resource_groups.id"))
    created_by = Column(String(40), ForeignKey("users.id"))
    summary = Column(JSON, default=dict, nullable=False)
    config = Column(JSON, default=dict, nullable=False)
    report_path = Column(Text, default="")
    cancel_requested = Column(Boolean, default=False, nullable=False)
    started_at = Column(DateTime(timezone=True))
    finished_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    group = relationship("ResourceGroup", back_populates="tasks")
    results = relationship("TaskResult", back_populates="task", cascade="all, delete-orphan")
    logs = relationship("TaskLog", back_populates="task", cascade="all, delete-orphan")


class TaskResult(Base):
    __tablename__ = "task_results"

    id = Column(String(40), primary_key=True, default=lambda: new_id("rst"))
    task_id = Column(String(40), ForeignKey("inspection_tasks.id", ondelete="CASCADE"), nullable=False)
    resource_id = Column(String(40), ForeignKey("resources.id"))
    item_id = Column(String(40), ForeignKey("inspection_items.id"))
    resource_snapshot = Column(JSON, default=dict, nullable=False)
    item_snapshot = Column(JSON, default=dict, nullable=False)
    status = Column(String(24), default="pending", nullable=False)
    output = Column(Text, default="")
    error_message = Column(Text, default="")
    execution_time_ms = Column(Integer, default=0, nullable=False)
    started_at = Column(DateTime(timezone=True))
    finished_at = Column(DateTime(timezone=True))

    task = relationship("Task", back_populates="results")
    resource = relationship("Resource")
    item = relationship("InspectionItem")


class Issue(Base):
    __tablename__ = "issues"

    id = Column(String(40), primary_key=True, default=lambda: new_id("iss"))
    task_result_id = Column(String(40), ForeignKey("task_results.id", ondelete="SET NULL"))
    task_id = Column(String(40), ForeignKey("inspection_tasks.id", ondelete="SET NULL"))
    resource_id = Column(String(40), ForeignKey("resources.id", ondelete="SET NULL"))
    item_id = Column(String(40), ForeignKey("inspection_items.id", ondelete="SET NULL"))
    summary = Column(Text, nullable=False)
    severity = Column(String(24), default="medium", nullable=False)
    status = Column(String(24), default="open", nullable=False)
    assignee = Column(String(128), default="Unassigned")
    resolution_note = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    task_result = relationship("TaskResult")
    resource = relationship("Resource")
    item = relationship("InspectionItem")
    task = relationship("Task")


class TaskLog(Base):
    __tablename__ = "task_logs"

    id = Column(String(40), primary_key=True, default=lambda: new_id("log"))
    task_id = Column(String(40), ForeignKey("inspection_tasks.id", ondelete="CASCADE"), nullable=False)
    level = Column(String(16), default="info", nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    task = relationship("Task", back_populates="logs")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(40), primary_key=True, default=lambda: new_id("aud"))
    actor = Column(String(128), nullable=False)
    action = Column(String(128), nullable=False)
    target = Column(String(255), default="")
    result = Column(String(32), default="success", nullable=False)
    detail = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)


class NotificationChannel(Base):
    __tablename__ = "notification_channels"

    id = Column(String(40), primary_key=True, default=lambda: new_id("ntf"))
    type = Column(String(32), nullable=False)
    name = Column(String(64), nullable=False)
    config = Column(JSON, default=dict, nullable=False)
    enabled = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
