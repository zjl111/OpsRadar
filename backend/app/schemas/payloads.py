from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class LoginRequest(BaseModel):
    username: str = Field(min_length=2, max_length=64)
    password: str = Field(min_length=6, max_length=128)


class ManualTaskRequest(BaseModel):
    name: str | None = Field(default=None, max_length=255)
    resource_ids: list[str] = Field(min_length=1)
    item_ids: list[str] = Field(default_factory=list)


class TaskCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    inspection_scope: Literal["environment", "asset", "service"] = "environment"
    execution_mode: Literal["once", "periodic"] = "once"
    description: str = ""
    task_tags: list[str] = Field(default_factory=list)
    environment_id: str | None = None
    resource_ids: list[str] = Field(default_factory=list)
    service_ids: list[str] = Field(default_factory=list)
    item_ids: list[str] = Field(default_factory=list)
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


class ApplicationPayload(BaseModel):
    name: str = Field(min_length=2, max_length=128)
    owner: str = Field(default="SRE", min_length=1, max_length=128)
    description: str = ""
    status: Literal["active", "review", "disabled"] = "active"
    env_type: Literal["prod", "staging", "test", "dev"] = "prod"


class EnvironmentPayload(BaseModel):
    application_id: str
    name: str = Field(min_length=2, max_length=128)
    env_type: Literal["prod", "staging", "test", "dev"] = "prod"
    owner: str = Field(default="SRE", min_length=1, max_length=128)
    description: str = ""
    status: Literal["active", "review", "disabled"] = "active"


class ResourceEnvironmentBindingPayload(BaseModel):
    environment_id: str
    layer: Literal["os", "db", "middleware", "gateway", "storage", "queue", "service", "security"] = "os"
    role: str | None = Field(default=None, max_length=64)
    weight: int = Field(default=10, ge=1, le=100)


class ResourceCreate(BaseModel):
    name: str = Field(min_length=2, max_length=128)
    type: str = Field(min_length=2, max_length=32)
    ip: str
    port: int = Field(gt=0, le=65535)
    username: str = ""
    credential_type: Literal["password", "key"] = "password"
    credential_secret: str = Field(default="", max_length=20000)
    container_name: str = Field(default="", max_length=128, pattern=r"^[a-zA-Z0-9_.-]*$")
    compose_project: str = Field(default="", max_length=128, pattern=r"^[a-zA-Z0-9_.-]*$")
    compose_service: str = Field(default="", max_length=128, pattern=r"^[a-zA-Z0-9_.-]*$")
    systemd_unit: str = Field(default="", max_length=128, pattern=r"^[a-zA-Z0-9_.@-]*$")
    environment_bindings: list[ResourceEnvironmentBindingPayload] = Field(default_factory=list)


class ResourceBatchCreate(BaseModel):
    resources: list[ResourceCreate] = Field(min_length=1, max_length=100)


class ResourceUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=128)
    type: str = Field(min_length=2, max_length=32)
    ip: str
    port: int = Field(gt=0, le=65535)
    username: str = ""
    credential_type: Literal["password", "key"] = "password"
    credential_secret: str | None = Field(default=None, max_length=20000)
    container_name: str = Field(default="", max_length=128, pattern=r"^[a-zA-Z0-9_.-]*$")
    compose_project: str = Field(default="", max_length=128, pattern=r"^[a-zA-Z0-9_.-]*$")
    compose_service: str = Field(default="", max_length=128, pattern=r"^[a-zA-Z0-9_.-]*$")
    systemd_unit: str = Field(default="", max_length=128, pattern=r"^[a-zA-Z0-9_.@-]*$")
    environment_bindings: list[ResourceEnvironmentBindingPayload] | None = None


class RuleSetPayload(BaseModel):
    name: str = Field(min_length=2, max_length=128)
    description: str = ""
    target_kind: Literal["resource", "service", "all"] = "resource"
    resource_types: list[str] = Field(default_factory=list)
    service_types: list[str] = Field(default_factory=list)
    conditions: dict = Field(default_factory=dict)
    exclude_keywords: list[str] = Field(default_factory=list)
    item_ids: list[str] = Field(default_factory=list)
    enabled: bool = True


class EnvironmentRuleSetBindingPayload(BaseModel):
    rule_set_ids: list[str] = Field(default_factory=list)


class ServiceDiscoveryRequest(BaseModel):
    discovery_types: list[Literal["docker_container", "docker_compose", "systemd"]] = Field(
        default_factory=lambda: ["docker_container", "docker_compose", "systemd"]
    )
    include_keywords: list[str] = Field(default_factory=list)
    exclude_keywords: list[str] = Field(default_factory=list)


class UserUpdate(BaseModel):
    display_name: str = Field(min_length=2, max_length=128)
    email: str = Field(min_length=5, max_length=255)
    role: str = Field(min_length=2, max_length=64)
    is_active: bool = True


class UserCreate(UserUpdate):
    username: str = Field(min_length=2, max_length=64, pattern=r"^[a-zA-Z0-9_.@-]+$")
    password: str = Field(min_length=8, max_length=128)


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


class SiteSettingsUpdate(BaseModel):
    site_name: str = Field(min_length=2, max_length=80)
    site_subtitle: str = Field(min_length=2, max_length=120)
    icon_text: str = Field(min_length=1, max_length=8)
    icon_color: str = Field(pattern=r"^#[0-9A-Fa-f]{6}$")
    icon_image: str = Field(default="", max_length=500000)


class AnalysisRulePayload(BaseModel):
    name: str = Field(min_length=2, max_length=128)
    layer: str = Field(default="", max_length=32)
    role: str = Field(default="", max_length=64)
    item_keyword: str = Field(default="", max_length=128)
    status: str = Field(default="", max_length=24)
    error_keyword: str = Field(default="", max_length=255)
    probable_cause: str = ""
    impact: str = ""
    recommendation: str = ""
    steps: list[str] = Field(default_factory=list)
    verification: str = ""
    risk_level: Literal["low", "medium", "high", "critical"] = "medium"
    enabled: bool = True


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


class IssueBulkPayload(BaseModel):
    ids: list[str] = Field(default_factory=list)
    status: Literal["open", "in_progress", "resolved", "ignored"] | None = None
    resolution_note: str | None = None


class RepairTaskPayload(BaseModel):
    issue_id: str
    title: str = Field(min_length=2, max_length=255)
    status: Literal["pending", "in_progress", "done", "cancelled"] = "pending"
    assignee: str = Field(default="Unassigned", max_length=128)
    suggested_steps: list[str] = Field(default_factory=list)
    verification: str = ""
    created_by_ai: bool = False


class AiModelConfigPayload(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    name: str = Field(min_length=2, max_length=128)
    provider: Literal["openai_compatible", "deepseek", "qwen", "private"] = "openai_compatible"
    base_url: str = ""
    model_name: str = Field(default="", max_length=128)
    api_key: str | None = Field(default=None, max_length=20000)
    config: dict = Field(default_factory=dict)
    enabled: bool = True


class AiModelDiscoverPayload(BaseModel):
    base_url: str = Field(min_length=3, max_length=2048)
    api_key: str = Field(min_length=1, max_length=20000)
    verify_ssl: bool = True


class ObservabilityDatasourcePayload(BaseModel):
    name: str = Field(min_length=2, max_length=128)
    type: Literal["prometheus", "victoriametrics", "grafana", "victorialogs"] = "prometheus"
    endpoint: str
    tenant: str = Field(default="", max_length=128)
    default_range: str = Field(default="1h", max_length=32)
    label_mapping: dict = Field(default_factory=dict)
    token: str | None = Field(default=None, max_length=20000)
    config: dict = Field(default_factory=dict)
    enabled: bool = True


class EnvironmentDatasourceBindingPayload(BaseModel):
    environment_id: str
    datasource_id: str
    usage: Literal["metrics", "logs", "dashboard"] = "metrics"
    label_mapping: dict = Field(default_factory=dict)
    enabled: bool = True


class ObservationQueryPayload(BaseModel):
    datasource_id: str | None = None
    environment_id: str | None = None
    query: str = Field(min_length=1)
    time_range: str = Field(default="1h", max_length=64)


class AiAssistantSettingsPayload(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    enabled: bool = False
    model_id: str | None = None
    name: str = Field(default="OpsRadar AI", min_length=2, max_length=80)
    welcome_message: str = ""
    quick_prompts: list[str] = Field(default_factory=list)
    prompt_templates: list[dict] = Field(default_factory=list)


class AiChatPayload(BaseModel):
    session_id: str | None = None
    message: str = Field(min_length=1, max_length=4000)
    context: dict = Field(default_factory=dict)


class AiWorkflowPayload(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    context: dict = Field(default_factory=dict)
    session_id: str | None = None


class AiWorkflowEventPayload(BaseModel):
    event: str = Field(min_length=1, max_length=64)
    payload: dict = Field(default_factory=dict)


class AiActionInvokePayload(BaseModel):
    params: dict = Field(default_factory=dict)
    confirmed: bool = False
    session_id: str | None = None
