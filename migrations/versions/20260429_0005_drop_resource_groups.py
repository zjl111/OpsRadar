"""drop resource groups in favor of application environments

Revision ID: 20260429_0005
Revises: 20260428_0004
Create Date: 2026-04-29
"""
from __future__ import annotations

from alembic import op


revision = "20260429_0005"
down_revision = "20260428_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE resources DROP COLUMN IF EXISTS group_id CASCADE")
    op.execute("ALTER TABLE inspection_tasks DROP COLUMN IF EXISTS group_id CASCADE")
    op.execute("ALTER TABLE cron_plans DROP COLUMN IF EXISTS group_id CASCADE")
    op.execute("DROP TABLE IF EXISTS resource_groups CASCADE")


def downgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS resource_groups (
            id VARCHAR(40) PRIMARY KEY,
            name VARCHAR(128) NOT NULL,
            owner VARCHAR(128) NOT NULL,
            description TEXT DEFAULT '',
            status VARCHAR(24) NOT NULL DEFAULT 'active',
            tags JSON NOT NULL DEFAULT '[]'::json,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        )
        """
    )
    op.execute("ALTER TABLE resources ADD COLUMN IF NOT EXISTS group_id VARCHAR(40) REFERENCES resource_groups(id)")
    op.execute("ALTER TABLE inspection_tasks ADD COLUMN IF NOT EXISTS group_id VARCHAR(40) REFERENCES resource_groups(id)")
    op.execute("ALTER TABLE cron_plans ADD COLUMN IF NOT EXISTS group_id VARCHAR(40)")
