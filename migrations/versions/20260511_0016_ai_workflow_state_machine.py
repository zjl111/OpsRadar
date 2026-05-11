"""Add AI workflow state machine tables.

Revision ID: 20260511_0016
Revises: 20260511_0015
Create Date: 2026-05-11
"""

from alembic import op
import sqlalchemy as sa


revision = "20260511_0016"
down_revision = "20260511_0015"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "ai_workflows",
        sa.Column("id", sa.String(length=40), nullable=False),
        sa.Column("session_id", sa.String(length=40), nullable=True),
        sa.Column("intent", sa.String(length=64), nullable=False),
        sa.Column("state", sa.String(length=64), nullable=False, server_default="START"),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="running"),
        sa.Column("target", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("context", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("current_step", sa.String(length=64), nullable=False, server_default=""),
        sa.Column("next_actions", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("last_error", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_by", sa.String(length=40), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["session_id"], ["ai_chat_sessions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_ai_workflows_created_by"), "ai_workflows", ["created_by"], unique=False)
    op.create_index(op.f("ix_ai_workflows_intent"), "ai_workflows", ["intent"], unique=False)
    op.create_index(op.f("ix_ai_workflows_session_id"), "ai_workflows", ["session_id"], unique=False)
    op.create_index(op.f("ix_ai_workflows_state"), "ai_workflows", ["state"], unique=False)
    op.create_index(op.f("ix_ai_workflows_status"), "ai_workflows", ["status"], unique=False)

    op.create_table(
        "ai_workflow_events",
        sa.Column("id", sa.String(length=40), nullable=False),
        sa.Column("workflow_id", sa.String(length=40), nullable=False),
        sa.Column("event", sa.String(length=64), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("result", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["workflow_id"], ["ai_workflows.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_ai_workflow_events_event"), "ai_workflow_events", ["event"], unique=False)
    op.create_index(op.f("ix_ai_workflow_events_workflow_id"), "ai_workflow_events", ["workflow_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_ai_workflow_events_workflow_id"), table_name="ai_workflow_events")
    op.drop_index(op.f("ix_ai_workflow_events_event"), table_name="ai_workflow_events")
    op.drop_table("ai_workflow_events")
    op.drop_index(op.f("ix_ai_workflows_status"), table_name="ai_workflows")
    op.drop_index(op.f("ix_ai_workflows_state"), table_name="ai_workflows")
    op.drop_index(op.f("ix_ai_workflows_session_id"), table_name="ai_workflows")
    op.drop_index(op.f("ix_ai_workflows_intent"), table_name="ai_workflows")
    op.drop_index(op.f("ix_ai_workflows_created_by"), table_name="ai_workflows")
    op.drop_table("ai_workflows")
