from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(min_length=2, max_length=64)
    password: str = Field(min_length=6, max_length=128)


class ManualTaskRequest(BaseModel):
    name: str | None = Field(default=None, max_length=255)
    task_type: str = Field(default="daily", min_length=2, max_length=32)
    resource_ids: list[str] = Field(min_length=1)
    item_ids: list[str] = Field(min_length=1)
    group_id: str | None = None


class TaskCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    task_type: str = Field(default="daily", min_length=2, max_length=32)
    execution_mode: Literal["once", "periodic"] = "once"
    description: str = ""
    group_id: str | None = None
    resource_ids: list[str] = Field(default_factory=list)
    item_ids: list[str] = Field(min_length=1)
    owner_id: str | None = None
    notify_channels: list[Literal["site", "email", "sms"]] = Field(default_factory=list)
    reminder_rules: list[str] = Field(default_factory=list)
    schedule_rule: Literal["daily", "weekly", "monthly"] = "daily"
    schedule_time: str = Field(default="09:00", pattern=r"^\d{2}:\d{2}$")
    effective_start: str | None = None
    effective_end: str | None = None
    deadline_policy: str = "1h"
    retry_policy: str = "none"
    note: str = ""


class ResourceCreate(BaseModel):
    name: str = Field(min_length=2, max_length=128)
    type: str = Field(min_length=2, max_length=32)
    ip: str
    port: int = Field(gt=0, le=65535)
    username: str = ""
    credential_type: Literal["password", "key"] = "password"
    credential_secret: str = Field(default="", max_length=20000)
    group_id: str | None = None


class ResourceBatchCreate(BaseModel):
    resources: list[ResourceCreate] = Field(min_length=1, max_length=100)


class ResourceGroupPayload(BaseModel):
    name: str = Field(min_length=2, max_length=128)
    owner: str = Field(default="SRE", min_length=1, max_length=128)
    description: str = ""
    status: Literal["active", "review", "disabled"]
    tags: list[str] = Field(default_factory=list)


class ResourceUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=128)
    type: str = Field(min_length=2, max_length=32)
    ip: str
    port: int = Field(gt=0, le=65535)
    username: str = ""
    credential_type: Literal["password", "key"] = "password"
    credential_secret: str | None = Field(default=None, max_length=20000)
    group_id: str | None = None


class UserUpdate(BaseModel):
    display_name: str = Field(min_length=2, max_length=128)
    email: str = Field(min_length=5, max_length=255)
    role: str = Field(min_length=2, max_length=64)
    is_active: bool = True


class RoleUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=64)
    description: str = ""
    permissions: list[str] = Field(default_factory=list)


class ResourceTypePayload(BaseModel):
    key: str = Field(min_length=2, max_length=32, pattern=r"^[a-zA-Z0-9_-]+$")
    name: str = Field(min_length=2, max_length=80)
    default_port: int = Field(gt=0, le=65535)
    enabled: bool = True
    description: str = ""


class TaskTypePayload(BaseModel):
    key: str = Field(min_length=2, max_length=32, pattern=r"^[a-zA-Z0-9_-]+$")
    name: str = Field(min_length=2, max_length=80)
    enabled: bool = True
    description: str = ""


class SiteSettingsUpdate(BaseModel):
    site_name: str = Field(min_length=2, max_length=80)
    site_subtitle: str = Field(min_length=2, max_length=120)
    icon_text: str = Field(min_length=1, max_length=8)
    icon_color: str = Field(pattern=r"^#[0-9A-Fa-f]{6}$")
    icon_image: str = Field(default="", max_length=500000)


class InspectionItemCreate(BaseModel):
    name: str = Field(min_length=2, max_length=128)
    category: Literal["os", "postgresql", "mysql", "redis", "container", "middleware"]
    resource_type: str
    command_template: str = Field(min_length=2)
    command_type: Literal["shell", "sql"]
    expected_result_pattern: str = ""
    description: str = ""


class IssueUpdate(BaseModel):
    status: Literal["open", "in_progress", "resolved", "ignored"]
    assignee: str | None = Field(default=None, max_length=128)
    resolution_note: str | None = None
