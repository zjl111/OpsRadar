"""add configurable task types

Revision ID: 20260426_0002
Revises: 20260425_0001
Create Date: 2026-04-26
"""
from __future__ import annotations

from alembic import op


revision = "20260426_0002"
down_revision = "20260425_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS task_types (
            id VARCHAR(40) PRIMARY KEY,
            key VARCHAR(32) NOT NULL UNIQUE,
            name VARCHAR(80) NOT NULL,
            enabled BOOLEAN NOT NULL DEFAULT true,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        )
        """
    )
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_task_types_key ON task_types (key)")
    op.execute(
        """
        INSERT INTO task_types (id, key, name, enabled, description)
        VALUES
            ('ttp_daily', 'daily', '日常巡检', true, '日常例行健康检查与可用性巡检'),
            ('ttp_periodic', 'periodic', '周期巡检', true, '按计划周期执行的资源与模板巡检'),
            ('ttp_compliance', 'compliance', '合规检查', true, '安全基线、等保和审计合规检查')
        ON CONFLICT (key) DO NOTHING
        """
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_task_types_key")
    op.execute("DROP TABLE IF EXISTS task_types")
