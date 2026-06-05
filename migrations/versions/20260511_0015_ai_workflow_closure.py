"""Add AI workflow closure tables and issue source fields.

Revision ID: 20260511_0015
Revises: 20260510_0014
Create Date: 2026-05-11
"""

from alembic import op
import sqlalchemy as sa


revision = "20260511_0015"
down_revision = "20260510_0014"
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    if inspector.has_table("inspection_reports"):
        return
    op.create_table(
        "inspection_reports",
        sa.Column("id", sa.String(length=40), nullable=False),
        sa.Column("task_id", sa.String(length=40), nullable=True),
        sa.Column("environment_id", sa.String(length=40), nullable=True),
        sa.Column("application_id", sa.String(length=40), nullable=True),
        sa.Column("status", sa.String(length=24), nullable=False, server_default="generated"),
        sa.Column("summary", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("html_path", sa.Text(), nullable=False, server_default=""),
        sa.Column("docx_path", sa.Text(), nullable=False, server_default=""),
        sa.Column("pdf_path", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["application_id"], ["applications.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["environment_id"], ["app_environments.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["task_id"], ["inspection_tasks.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_inspection_reports_application_id"), "inspection_reports", ["application_id"], unique=False)
    op.create_index(op.f("ix_inspection_reports_environment_id"), "inspection_reports", ["environment_id"], unique=False)
    op.create_index(op.f("ix_inspection_reports_task_id"), "inspection_reports", ["task_id"], unique=False)

    op.add_column("issues", sa.Column("report_id", sa.String(length=40), nullable=True))
    op.add_column("issues", sa.Column("service_id", sa.String(length=40), nullable=True))
    op.add_column("issues", sa.Column("source_type", sa.String(length=32), nullable=False, server_default="inspection_task"))
    op.add_column("issues", sa.Column("source_id", sa.String(length=40), nullable=False, server_default=""))
    op.add_column("issues", sa.Column("evidence_snapshot", sa.JSON(), nullable=False, server_default="{}"))
    op.create_foreign_key("fk_issues_report_id", "issues", "inspection_reports", ["report_id"], ["id"], ondelete="SET NULL")
    op.create_foreign_key("fk_issues_service_id", "issues", "discovered_services", ["service_id"], ["id"], ondelete="SET NULL")

    op.create_table(
        "repair_tasks",
        sa.Column("id", sa.String(length=40), nullable=False),
        sa.Column("issue_id", sa.String(length=40), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("status", sa.String(length=24), nullable=False, server_default="pending"),
        sa.Column("assignee", sa.String(length=128), nullable=False, server_default="Unassigned"),
        sa.Column("suggested_steps", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("verification", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_by_ai", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["issue_id"], ["issues.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_repair_tasks_issue_id"), "repair_tasks", ["issue_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_repair_tasks_issue_id"), table_name="repair_tasks")
    op.drop_table("repair_tasks")
    op.drop_constraint("fk_issues_service_id", "issues", type_="foreignkey")
    op.drop_constraint("fk_issues_report_id", "issues", type_="foreignkey")
    op.drop_column("issues", "evidence_snapshot")
    op.drop_column("issues", "source_id")
    op.drop_column("issues", "source_type")
    op.drop_column("issues", "service_id")
    op.drop_column("issues", "report_id")
    op.drop_index(op.f("ix_inspection_reports_task_id"), table_name="inspection_reports")
    op.drop_index(op.f("ix_inspection_reports_environment_id"), table_name="inspection_reports")
    op.drop_index(op.f("ix_inspection_reports_application_id"), table_name="inspection_reports")
    op.drop_table("inspection_reports")
