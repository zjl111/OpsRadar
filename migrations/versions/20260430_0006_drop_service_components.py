"""drop service components in favor of container resources

Revision ID: 20260430_0006
Revises: 20260429_0005
Create Date: 2026-04-30
"""
from __future__ import annotations

from alembic import op


revision = "20260430_0006"
down_revision = "20260429_0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("DROP TABLE IF EXISTS service_components CASCADE")


def downgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS service_components (
            id VARCHAR(40) PRIMARY KEY,
            environment_id VARCHAR(40) NOT NULL REFERENCES app_environments(id) ON DELETE CASCADE,
            resource_id VARCHAR(40) REFERENCES resources(id) ON DELETE SET NULL,
            name VARCHAR(128) NOT NULL,
            component_type VARCHAR(32) NOT NULL DEFAULT 'service',
            layer VARCHAR(32) NOT NULL DEFAULT 'service',
            role VARCHAR(64) NOT NULL DEFAULT 'service',
            health_endpoint TEXT DEFAULT '',
            check_command TEXT DEFAULT '',
            weight INTEGER NOT NULL DEFAULT 10,
            status VARCHAR(24) NOT NULL DEFAULT 'unknown',
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        )
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_service_components_environment_id ON service_components (environment_id)")
