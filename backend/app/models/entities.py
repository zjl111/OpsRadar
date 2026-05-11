from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String, Text, UniqueConstraint
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


class Application(Base):
    __tablename__ = "applications"

    id = Column(String(40), primary_key=True, default=lambda: new_id("app"))
    name = Column(String(128), unique=True, nullable=False, index=True)
    owner = Column(String(128), default="SRE", nullable=False)
    description = Column(Text, default="")
    status = Column(String(24), default="active", nullable=False)
    tags = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    environments = relationship("AppEnvironment", back_populates="application", cascade="all, delete-orphan")


class AppEnvironment(Base):
    __tablename__ = "app_environments"
    __table_args__ = (UniqueConstraint("application_id", "name", "env_type", name="ux_app_environments_app_name_type"),)

    id = Column(String(40), primary_key=True, default=lambda: new_id("env"))
    application_id = Column(String(40), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    env_type = Column(String(32), default="prod", nullable=False)
    owner = Column(String(128), default="SRE", nullable=False)
    description = Column(Text, default="")
    status = Column(String(24), default="active", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    application = relationship("Application", back_populates="environments")
    resources = relationship("EnvironmentResource", back_populates="environment", cascade="all, delete-orphan")
    rule_sets = relationship("EnvironmentRuleSet", back_populates="environment", cascade="all, delete-orphan")


class EnvironmentResource(Base):
    __tablename__ = "environment_resources"
    __table_args__ = (UniqueConstraint("environment_id", "resource_id", name="ux_environment_resources_env_resource"),)

    id = Column(String(40), primary_key=True, default=lambda: new_id("ebr"))
    environment_id = Column(String(40), ForeignKey("app_environments.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_id = Column(String(40), ForeignKey("resources.id", ondelete="CASCADE"), nullable=False, index=True)
    layer = Column(String(32), default="os", nullable=False)
    role = Column(String(64), default="host", nullable=False)
    weight = Column(Integer, default=10, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    environment = relationship("AppEnvironment", back_populates="resources")
    resource = relationship("Resource", back_populates="environment_bindings")


class Resource(Base):
    __tablename__ = "resources"

    id = Column(String(40), primary_key=True, default=lambda: new_id("res"))
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

    environment_bindings = relationship("EnvironmentResource", back_populates="resource", cascade="all, delete-orphan")


class DiscoveredService(Base):
    __tablename__ = "discovered_services"
    __table_args__ = (UniqueConstraint("resource_id", "discovery_type", "identity", name="ux_discovered_services_resource_type_identity"),)

    id = Column(String(40), primary_key=True, default=lambda: new_id("dsv"))
    resource_id = Column(String(40), ForeignKey("resources.id", ondelete="CASCADE"), nullable=False, index=True)
    service_resource_id = Column(String(40), ForeignKey("resources.id", ondelete="SET NULL"), index=True)
    environment_id = Column(String(40), ForeignKey("app_environments.id", ondelete="SET NULL"), index=True)
    name = Column(String(128), nullable=False)
    discovery_type = Column(String(32), nullable=False, index=True)
    identity = Column(String(255), nullable=False)
    status = Column(String(32), default="unknown", nullable=False)
    ip = Column(String(64), default="", nullable=False)
    port = Column(String(64), default="", nullable=False)
    protocol = Column(String(16), default="tcp", nullable=False)
    image = Column(String(255), default="", nullable=False)
    compose_project = Column(String(128), default="", nullable=False)
    compose_service = Column(String(128), default="", nullable=False)
    container_id = Column(String(128), default="", nullable=False)
    container_name = Column(String(128), default="", nullable=False)
    systemd_unit = Column(String(128), default="", nullable=False)
    process_name = Column(String(128), default="", nullable=False)
    command = Column(Text, default="", nullable=False)
    labels = Column(JSON, default=list, nullable=False)
    meta = Column(JSON, default=dict, nullable=False)
    bound_rule_count = Column(Integer, default=0, nullable=False)
    is_bound = Column(Boolean, default=True, nullable=False)
    last_discovered_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    host_resource = relationship("Resource", foreign_keys=[resource_id])
    service_resource = relationship("Resource", foreign_keys=[service_resource_id])
    environment = relationship("AppEnvironment")


class ResourceType(Base):
    __tablename__ = "resource_types"

    id = Column(String(40), primary_key=True, default=lambda: new_id("rtp"))
    key = Column(String(32), unique=True, nullable=False, index=True)
    name = Column(String(80), nullable=False)
    default_port = Column(Integer, default=22, nullable=False)
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


class RuleSet(Base):
    __tablename__ = "rule_sets"

    id = Column(String(40), primary_key=True, default=lambda: new_id("rset"))
    name = Column(String(128), unique=True, nullable=False)
    description = Column(Text, default="")
    target_kind = Column(String(32), default="resource", nullable=False)
    resource_types = Column(JSON, default=list, nullable=False)
    service_types = Column(JSON, default=list, nullable=False)
    conditions = Column(JSON, default=dict, nullable=False)
    exclude_keywords = Column(JSON, default=list, nullable=False)
    item_ids = Column(JSON, default=list, nullable=False)
    is_builtin = Column(Boolean, default=False, nullable=False)
    enabled = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class EnvironmentRuleSet(Base):
    __tablename__ = "environment_rule_sets"
    __table_args__ = (UniqueConstraint("environment_id", "rule_set_id", name="ux_environment_rule_sets_env_rule"),)

    id = Column(String(40), primary_key=True, default=lambda: new_id("ers"))
    environment_id = Column(String(40), ForeignKey("app_environments.id", ondelete="CASCADE"), nullable=False, index=True)
    rule_set_id = Column(String(40), ForeignKey("rule_sets.id", ondelete="CASCADE"), nullable=False, index=True)
    enabled = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    environment = relationship("AppEnvironment", back_populates="rule_sets")
    rule_set = relationship("RuleSet")


class CronPlan(Base):
    __tablename__ = "cron_plans"

    id = Column(String(40), primary_key=True, default=lambda: new_id("crn"))
    name = Column(String(128), nullable=False)
    environment_id = Column(String(40), ForeignKey("app_environments.id", ondelete="SET NULL"))
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

    environment = relationship("AppEnvironment")


class Task(Base):
    __tablename__ = "inspection_tasks"

    id = Column(String(40), primary_key=True, default=lambda: new_id("tsk"))
    name = Column(String(255), nullable=False)
    status = Column(String(24), default="pending", nullable=False)
    application_id = Column(String(40), ForeignKey("applications.id", ondelete="SET NULL"))
    environment_id = Column(String(40), ForeignKey("app_environments.id", ondelete="SET NULL"))
    created_by = Column(String(40), ForeignKey("users.id"))
    summary = Column(JSON, default=dict, nullable=False)
    config = Column(JSON, default=dict, nullable=False)
    report_path = Column(Text, default="")
    cancel_requested = Column(Boolean, default=False, nullable=False)
    started_at = Column(DateTime(timezone=True))
    finished_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    application = relationship("Application")
    environment = relationship("AppEnvironment")
    results = relationship("TaskResult", back_populates="task", cascade="all, delete-orphan")
    logs = relationship("TaskLog", back_populates="task", cascade="all, delete-orphan")


class InspectionReport(Base):
    __tablename__ = "inspection_reports"

    id = Column(String(40), primary_key=True, default=lambda: new_id("rpt"))
    task_id = Column(String(40), ForeignKey("inspection_tasks.id", ondelete="SET NULL"), index=True)
    environment_id = Column(String(40), ForeignKey("app_environments.id", ondelete="SET NULL"), index=True)
    application_id = Column(String(40), ForeignKey("applications.id", ondelete="SET NULL"), index=True)
    status = Column(String(24), default="generated", nullable=False)
    summary = Column(JSON, default=dict, nullable=False)
    html_path = Column(Text, default="", nullable=False)
    docx_path = Column(Text, default="", nullable=False)
    pdf_path = Column(Text, default="", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    task = relationship("Task")
    environment = relationship("AppEnvironment")
    application = relationship("Application")


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
    report_id = Column(String(40), ForeignKey("inspection_reports.id", ondelete="SET NULL"))
    service_id = Column(String(40), ForeignKey("discovered_services.id", ondelete="SET NULL"))
    source_type = Column(String(32), default="inspection_task", nullable=False)
    source_id = Column(String(40), default="", nullable=False)
    evidence_snapshot = Column(JSON, default=dict, nullable=False)
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
    report = relationship("InspectionReport")
    service = relationship("DiscoveredService")


class RepairTask(Base):
    __tablename__ = "repair_tasks"

    id = Column(String(40), primary_key=True, default=lambda: new_id("fix"))
    issue_id = Column(String(40), ForeignKey("issues.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    status = Column(String(24), default="pending", nullable=False)
    assignee = Column(String(128), default="Unassigned", nullable=False)
    suggested_steps = Column(JSON, default=list, nullable=False)
    verification = Column(Text, default="", nullable=False)
    created_by_ai = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    issue = relationship("Issue")


class AnalysisRule(Base):
    __tablename__ = "analysis_rules"

    id = Column(String(40), primary_key=True, default=lambda: new_id("arl"))
    name = Column(String(128), nullable=False)
    layer = Column(String(32), default="", nullable=False)
    role = Column(String(64), default="", nullable=False)
    item_keyword = Column(String(128), default="", nullable=False)
    status = Column(String(24), default="", nullable=False)
    error_keyword = Column(String(255), default="", nullable=False)
    probable_cause = Column(Text, default="", nullable=False)
    impact = Column(Text, default="", nullable=False)
    recommendation = Column(Text, default="", nullable=False)
    steps = Column(JSON, default=list, nullable=False)
    verification = Column(Text, default="", nullable=False)
    risk_level = Column(String(24), default="medium", nullable=False)
    enabled = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)


class IssueInsight(Base):
    __tablename__ = "issue_insights"

    id = Column(String(40), primary_key=True, default=lambda: new_id("ins"))
    issue_id = Column(String(40), ForeignKey("issues.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    rule_id = Column(String(40), ForeignKey("analysis_rules.id", ondelete="SET NULL"))
    probable_cause = Column(Text, default="", nullable=False)
    impact = Column(Text, default="", nullable=False)
    recommendation = Column(Text, default="", nullable=False)
    steps = Column(JSON, default=list, nullable=False)
    verification = Column(Text, default="", nullable=False)
    risk_level = Column(String(24), default="medium", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    issue = relationship("Issue")
    rule = relationship("AnalysisRule")


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


class AiModelConfig(Base):
    __tablename__ = "ai_model_configs"

    id = Column(String(40), primary_key=True, default=lambda: new_id("aim"))
    name = Column(String(128), nullable=False)
    provider = Column(String(48), default="openai_compatible", nullable=False)
    base_url = Column(Text, default="", nullable=False)
    model_name = Column(String(128), default="", nullable=False)
    config = Column(JSON, default=dict, nullable=False)
    enabled = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class ObservabilityDatasource(Base):
    __tablename__ = "observability_datasources"

    id = Column(String(40), primary_key=True, default=lambda: new_id("ods"))
    name = Column(String(128), nullable=False)
    type = Column(String(32), nullable=False)
    endpoint = Column(Text, default="", nullable=False)
    tenant = Column(String(128), default="", nullable=False)
    default_range = Column(String(32), default="1h", nullable=False)
    label_mapping = Column(JSON, default=dict, nullable=False)
    config = Column(JSON, default=dict, nullable=False)
    enabled = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class EnvironmentDatasourceBinding(Base):
    __tablename__ = "environment_datasource_bindings"
    __table_args__ = (UniqueConstraint("environment_id", "datasource_id", "usage", name="ux_env_datasource_usage"),)

    id = Column(String(40), primary_key=True, default=lambda: new_id("edb"))
    environment_id = Column(String(40), ForeignKey("app_environments.id", ondelete="CASCADE"), nullable=False, index=True)
    datasource_id = Column(String(40), ForeignKey("observability_datasources.id", ondelete="CASCADE"), nullable=False, index=True)
    usage = Column(String(32), default="metrics", nullable=False)
    label_mapping = Column(JSON, default=dict, nullable=False)
    enabled = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    environment = relationship("AppEnvironment")
    datasource = relationship("ObservabilityDatasource")


class ObservationQueryResult(Base):
    __tablename__ = "observation_query_results"

    id = Column(String(40), primary_key=True, default=lambda: new_id("oqr"))
    datasource_id = Column(String(40), ForeignKey("observability_datasources.id", ondelete="SET NULL"))
    environment_id = Column(String(40), ForeignKey("app_environments.id", ondelete="SET NULL"))
    query_type = Column(String(32), nullable=False)
    query = Column(Text, nullable=False)
    time_range = Column(String(64), default="", nullable=False)
    status = Column(String(24), default="pending", nullable=False)
    summary = Column(JSON, default=dict, nullable=False)
    samples = Column(JSON, default=list, nullable=False)
    error_message = Column(Text, default="", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    datasource = relationship("ObservabilityDatasource")
    environment = relationship("AppEnvironment")


class AiAnalysisJob(Base):
    __tablename__ = "ai_analysis_jobs"

    id = Column(String(40), primary_key=True, default=lambda: new_id("aij"))
    scope = Column(String(32), nullable=False)
    target_id = Column(String(40), nullable=False)
    model_config_id = Column(String(40), ForeignKey("ai_model_configs.id", ondelete="SET NULL"))
    status = Column(String(24), default="pending", nullable=False)
    context = Column(JSON, default=dict, nullable=False)
    error_message = Column(Text, default="", nullable=False)
    created_by = Column(String(40), ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    finished_at = Column(DateTime(timezone=True))

    model_config = relationship("AiModelConfig")


class AiAnalysisResult(Base):
    __tablename__ = "ai_analysis_results"

    id = Column(String(40), primary_key=True, default=lambda: new_id("air"))
    job_id = Column(String(40), ForeignKey("ai_analysis_jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    scope = Column(String(32), nullable=False)
    target_id = Column(String(40), nullable=False)
    conclusion = Column(Text, default="", nullable=False)
    probable_cause = Column(Text, default="", nullable=False)
    impact = Column(Text, default="", nullable=False)
    recommendation = Column(Text, default="", nullable=False)
    evidence = Column(JSON, default=list, nullable=False)
    risk_level = Column(String(24), default="medium", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    job = relationship("AiAnalysisJob")


class AiAssistantSetting(Base):
    __tablename__ = "ai_assistant_settings"

    id = Column(String(24), primary_key=True, default="default")
    enabled = Column(Boolean, default=False, nullable=False)
    model_id = Column(String(40), ForeignKey("ai_model_configs.id", ondelete="SET NULL"))
    name = Column(String(80), default="OpsRadar AI", nullable=False)
    welcome_message = Column(Text, default="👋 你好，我是 OpsRadar AI 智能巡检助手", nullable=False)
    quick_prompts = Column(JSON, default=list, nullable=False)
    prompt_templates = Column(JSON, default=list, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class AiChatSession(Base):
    __tablename__ = "ai_chat_sessions"

    id = Column(String(40), primary_key=True, default=lambda: new_id("acs"))
    user_id = Column(String(40), ForeignKey("users.id", ondelete="SET NULL"))
    title = Column(String(128), default="AI Assistant", nullable=False)
    context = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class AiChatMessage(Base):
    __tablename__ = "ai_chat_messages"

    id = Column(String(40), primary_key=True, default=lambda: new_id("acm"))
    session_id = Column(String(40), ForeignKey("ai_chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(16), nullable=False)
    content = Column(Text, nullable=False)
    meta = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    session = relationship("AiChatSession")


class AiWorkflow(Base):
    __tablename__ = "ai_workflows"

    id = Column(String(40), primary_key=True, default=lambda: new_id("wf"))
    session_id = Column(String(40), ForeignKey("ai_chat_sessions.id", ondelete="CASCADE"), nullable=True, index=True)
    intent = Column(String(64), nullable=False, index=True)
    state = Column(String(64), nullable=False, default="START", index=True)
    status = Column(String(32), nullable=False, default="running", index=True)
    target = Column(JSON, default=dict, nullable=False)
    context = Column(JSON, default=dict, nullable=False)
    current_step = Column(String(64), default="", nullable=False)
    next_actions = Column(JSON, default=list, nullable=False)
    last_error = Column(Text, default="", nullable=False)
    created_by = Column(String(40), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    session = relationship("AiChatSession")
    events = relationship("AiWorkflowEvent", back_populates="workflow", cascade="all, delete-orphan")


class AiWorkflowEvent(Base):
    __tablename__ = "ai_workflow_events"

    id = Column(String(40), primary_key=True, default=lambda: new_id("wfe"))
    workflow_id = Column(String(40), ForeignKey("ai_workflows.id", ondelete="CASCADE"), nullable=False, index=True)
    event = Column(String(64), nullable=False, index=True)
    payload = Column(JSON, default=dict, nullable=False)
    result = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    workflow = relationship("AiWorkflow", back_populates="events")
