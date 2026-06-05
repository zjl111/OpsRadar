"""Drop task type columns.

Revision ID: 20260509_0012
Revises: 20260509_0011
Create Date: 2026-05-09
"""

from alembic import op
import sqlalchemy as sa


revision = "20260509_0012"
down_revision = "20260509_0011"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE inspection_tasks DROP COLUMN IF EXISTS task_type")
    op.execute("ALTER TABLE cron_plans DROP COLUMN IF EXISTS task_type")


def downgrade() -> None:
    op.add_column("cron_plans", sa.Column("task_type", sa.String(length=32), nullable=False, server_default="periodic"))
    op.add_column("inspection_tasks", sa.Column("task_type", sa.String(length=32), nullable=False, server_default="inspection"))
