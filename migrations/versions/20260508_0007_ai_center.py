"""add AI center and observability integration tables

Revision ID: 20260508_0007
Revises: 20260430_0006
Create Date: 2026-05-08
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260508_0007"
down_revision = "20260430_0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    if inspector.has_table("ai_model_configs"):
        return
    op.create_table(
        "ai_model_configs",
        sa.Column("id", sa.String(length=40), primary_key=True),
        sa.Column("name", sa.String(length=128), nullable=False),
        sa.Column("provider", sa.String(length=48), nullable=False, server_default="openai_compatible"),
        sa.Column("base_url", sa.Text(), nullable=False, server_default=""),
        sa.Column("model_name", sa.String(length=128), nullable=False, server_default=""),
        sa.Column("config", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_table(
        "observability_datasources",
        sa.Column("id", sa.String(length=40), primary_key=True),
        sa.Column("name", sa.String(length=128), nullable=False),
        sa.Column("type", sa.String(length=32), nullable=False),
        sa.Column("endpoint", sa.Text(), nullable=False, server_default=""),
        sa.Column("tenant", sa.String(length=128), nullable=False, server_default=""),
        sa.Column("default_range", sa.String(length=32), nullable=False, server_default="1h"),
        sa.Column("label_mapping", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("config", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_table(
        "environment_datasource_bindings",
        sa.Column("id", sa.String(length=40), primary_key=True),
        sa.Column("environment_id", sa.String(length=40), sa.ForeignKey("app_environments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("datasource_id", sa.String(length=40), sa.ForeignKey("observability_datasources.id", ondelete="CASCADE"), nullable=False),
        sa.Column("usage", sa.String(length=32), nullable=False, server_default="metrics"),
        sa.Column("label_mapping", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("environment_id", "datasource_id", "usage", name="ux_env_datasource_usage"),
    )
    op.create_index("ix_environment_datasource_bindings_environment_id", "environment_datasource_bindings", ["environment_id"])
    op.create_index("ix_environment_datasource_bindings_datasource_id", "environment_datasource_bindings", ["datasource_id"])
    op.create_table(
        "observation_query_results",
        sa.Column("id", sa.String(length=40), primary_key=True),
        sa.Column("datasource_id", sa.String(length=40), sa.ForeignKey("observability_datasources.id", ondelete="SET NULL")),
        sa.Column("environment_id", sa.String(length=40), sa.ForeignKey("app_environments.id", ondelete="SET NULL")),
        sa.Column("query_type", sa.String(length=32), nullable=False),
        sa.Column("query", sa.Text(), nullable=False),
        sa.Column("time_range", sa.String(length=64), nullable=False, server_default=""),
        sa.Column("status", sa.String(length=24), nullable=False, server_default="pending"),
        sa.Column("summary", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("samples", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("error_message", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_table(
        "ai_analysis_jobs",
        sa.Column("id", sa.String(length=40), primary_key=True),
        sa.Column("scope", sa.String(length=32), nullable=False),
        sa.Column("target_id", sa.String(length=40), nullable=False),
        sa.Column("model_config_id", sa.String(length=40), sa.ForeignKey("ai_model_configs.id", ondelete="SET NULL")),
        sa.Column("status", sa.String(length=24), nullable=False, server_default="pending"),
        sa.Column("context", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("error_message", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_by", sa.String(length=40), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("finished_at", sa.DateTime(timezone=True)),
    )
    op.create_table(
        "ai_analysis_results",
        sa.Column("id", sa.String(length=40), primary_key=True),
        sa.Column("job_id", sa.String(length=40), sa.ForeignKey("ai_analysis_jobs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("scope", sa.String(length=32), nullable=False),
        sa.Column("target_id", sa.String(length=40), nullable=False),
        sa.Column("conclusion", sa.Text(), nullable=False, server_default=""),
        sa.Column("probable_cause", sa.Text(), nullable=False, server_default=""),
        sa.Column("impact", sa.Text(), nullable=False, server_default=""),
        sa.Column("recommendation", sa.Text(), nullable=False, server_default=""),
        sa.Column("evidence", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("risk_level", sa.String(length=24), nullable=False, server_default="medium"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_ai_analysis_results_job_id", "ai_analysis_results", ["job_id"])
    op.create_table(
        "ai_assistant_settings",
        sa.Column("id", sa.String(length=24), primary_key=True),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("name", sa.String(length=80), nullable=False, server_default="OpsRadar AI"),
        sa.Column("welcome_message", sa.Text(), nullable=False, server_default="你好，我可以基于当前页面上下文辅助排障。"),
        sa.Column("quick_prompts", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("prompt_templates", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_table(
        "ai_chat_sessions",
        sa.Column("id", sa.String(length=40), primary_key=True),
        sa.Column("user_id", sa.String(length=40), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("title", sa.String(length=128), nullable=False, server_default="AI Assistant"),
        sa.Column("context", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_table(
        "ai_chat_messages",
        sa.Column("id", sa.String(length=40), primary_key=True),
        sa.Column("session_id", sa.String(length=40), sa.ForeignKey("ai_chat_sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("role", sa.String(length=16), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("meta", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_ai_chat_messages_session_id", "ai_chat_messages", ["session_id"])


def downgrade() -> None:
    for table in (
        "ai_chat_messages",
        "ai_chat_sessions",
        "ai_assistant_settings",
        "ai_analysis_results",
        "ai_analysis_jobs",
        "observation_query_results",
        "environment_datasource_bindings",
        "observability_datasources",
        "ai_model_configs",
    ):
        op.drop_table(table)
