"""add application environment inspection model

Revision ID: 20260428_0004
Revises: 20260427_0003
Create Date: 2026-04-28
"""
from __future__ import annotations

from alembic import op


revision = "20260428_0004"
down_revision = "20260427_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS applications (
            id VARCHAR(40) PRIMARY KEY,
            name VARCHAR(128) NOT NULL UNIQUE,
            owner VARCHAR(128) NOT NULL DEFAULT 'SRE',
            description TEXT DEFAULT '',
            status VARCHAR(24) NOT NULL DEFAULT 'active',
            tags JSON NOT NULL DEFAULT '[]'::json,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        )
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_applications_name ON applications (name)")
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS app_environments (
            id VARCHAR(40) PRIMARY KEY,
            application_id VARCHAR(40) NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
            name VARCHAR(128) NOT NULL,
            env_type VARCHAR(32) NOT NULL DEFAULT 'prod',
            owner VARCHAR(128) NOT NULL DEFAULT 'SRE',
            description TEXT DEFAULT '',
            status VARCHAR(24) NOT NULL DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        )
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_app_environments_application_id ON app_environments (application_id)")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ux_app_environments_app_name_type ON app_environments (application_id, name, env_type)")
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS environment_resources (
            id VARCHAR(40) PRIMARY KEY,
            environment_id VARCHAR(40) NOT NULL REFERENCES app_environments(id) ON DELETE CASCADE,
            resource_id VARCHAR(40) NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
            layer VARCHAR(32) NOT NULL DEFAULT 'os',
            role VARCHAR(64) NOT NULL DEFAULT 'host',
            weight INTEGER NOT NULL DEFAULT 10,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        )
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_environment_resources_environment_id ON environment_resources (environment_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_environment_resources_resource_id ON environment_resources (resource_id)")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ux_environment_resources_env_resource ON environment_resources (environment_id, resource_id)")
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
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS analysis_rules (
            id VARCHAR(40) PRIMARY KEY,
            name VARCHAR(128) NOT NULL,
            layer VARCHAR(32) NOT NULL DEFAULT '',
            role VARCHAR(64) NOT NULL DEFAULT '',
            item_keyword VARCHAR(128) NOT NULL DEFAULT '',
            status VARCHAR(24) NOT NULL DEFAULT '',
            error_keyword VARCHAR(255) NOT NULL DEFAULT '',
            probable_cause TEXT NOT NULL DEFAULT '',
            impact TEXT NOT NULL DEFAULT '',
            recommendation TEXT NOT NULL DEFAULT '',
            steps JSON NOT NULL DEFAULT '[]'::json,
            verification TEXT NOT NULL DEFAULT '',
            risk_level VARCHAR(24) NOT NULL DEFAULT 'medium',
            enabled BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        )
        """
    )
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS issue_insights (
            id VARCHAR(40) PRIMARY KEY,
            issue_id VARCHAR(40) NOT NULL UNIQUE REFERENCES issues(id) ON DELETE CASCADE,
            rule_id VARCHAR(40) REFERENCES analysis_rules(id) ON DELETE SET NULL,
            probable_cause TEXT NOT NULL DEFAULT '',
            impact TEXT NOT NULL DEFAULT '',
            recommendation TEXT NOT NULL DEFAULT '',
            steps JSON NOT NULL DEFAULT '[]'::json,
            verification TEXT NOT NULL DEFAULT '',
            risk_level VARCHAR(24) NOT NULL DEFAULT 'medium',
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        )
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_issue_insights_issue_id ON issue_insights (issue_id)")
    op.execute("ALTER TABLE inspection_tasks ADD COLUMN IF NOT EXISTS application_id VARCHAR(40) REFERENCES applications(id) ON DELETE SET NULL")
    op.execute("ALTER TABLE inspection_tasks ADD COLUMN IF NOT EXISTS environment_id VARCHAR(40) REFERENCES app_environments(id) ON DELETE SET NULL")
    op.execute("ALTER TABLE cron_plans ADD COLUMN IF NOT EXISTS environment_id VARCHAR(40) REFERENCES app_environments(id) ON DELETE SET NULL")


def downgrade() -> None:
    op.execute("ALTER TABLE cron_plans DROP COLUMN IF EXISTS environment_id")
    op.execute("ALTER TABLE inspection_tasks DROP COLUMN IF EXISTS environment_id")
    op.execute("ALTER TABLE inspection_tasks DROP COLUMN IF EXISTS application_id")
    op.execute("DROP TABLE IF EXISTS issue_insights")
    op.execute("DROP TABLE IF EXISTS analysis_rules")
    op.execute("DROP TABLE IF EXISTS service_components")
    op.execute("DROP TABLE IF EXISTS environment_resources")
    op.execute("DROP TABLE IF EXISTS app_environments")
    op.execute("DROP TABLE IF EXISTS applications")
