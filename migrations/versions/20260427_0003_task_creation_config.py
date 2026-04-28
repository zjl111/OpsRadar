"""add task creation configuration fields

Revision ID: 20260427_0003
Revises: 20260426_0002
Create Date: 2026-04-27
"""
from __future__ import annotations

from alembic import op


revision = "20260427_0003"
down_revision = "20260426_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE inspection_tasks ADD COLUMN IF NOT EXISTS config JSON NOT NULL DEFAULT '{}'::json")
    op.execute("ALTER TABLE cron_plans ADD COLUMN IF NOT EXISTS task_type VARCHAR(32) NOT NULL DEFAULT 'periodic'")
    op.execute("ALTER TABLE cron_plans ADD COLUMN IF NOT EXISTS group_id VARCHAR(40)")
    op.execute("ALTER TABLE cron_plans ADD COLUMN IF NOT EXISTS created_by VARCHAR(40)")
    op.execute("ALTER TABLE cron_plans ADD COLUMN IF NOT EXISTS description TEXT DEFAULT ''")


def downgrade() -> None:
    op.execute("ALTER TABLE cron_plans DROP COLUMN IF EXISTS description")
    op.execute("ALTER TABLE cron_plans DROP COLUMN IF EXISTS created_by")
    op.execute("ALTER TABLE cron_plans DROP COLUMN IF EXISTS group_id")
    op.execute("ALTER TABLE cron_plans DROP COLUMN IF EXISTS task_type")
    op.execute("ALTER TABLE inspection_tasks DROP COLUMN IF EXISTS config")
