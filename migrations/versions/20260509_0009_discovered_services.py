"""add discovered services

Revision ID: 20260509_0009
Revises: 20260508_0008
Create Date: 2026-05-09
"""

from alembic import op
import sqlalchemy as sa


revision = "20260509_0009"
down_revision = "20260508_0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    if inspector.has_table("discovered_services"):
        return
    op.create_table(
        "discovered_services",
        sa.Column("id", sa.String(length=40), nullable=False),
        sa.Column("resource_id", sa.String(length=40), nullable=False),
        sa.Column("environment_id", sa.String(length=40), nullable=True),
        sa.Column("name", sa.String(length=128), nullable=False),
        sa.Column("discovery_type", sa.String(length=32), nullable=False),
        sa.Column("identity", sa.String(length=255), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="unknown"),
        sa.Column("ip", sa.String(length=64), nullable=False, server_default=""),
        sa.Column("port", sa.String(length=64), nullable=False, server_default=""),
        sa.Column("protocol", sa.String(length=16), nullable=False, server_default="tcp"),
        sa.Column("image", sa.String(length=255), nullable=False, server_default=""),
        sa.Column("compose_project", sa.String(length=128), nullable=False, server_default=""),
        sa.Column("compose_service", sa.String(length=128), nullable=False, server_default=""),
        sa.Column("container_id", sa.String(length=128), nullable=False, server_default=""),
        sa.Column("container_name", sa.String(length=128), nullable=False, server_default=""),
        sa.Column("systemd_unit", sa.String(length=128), nullable=False, server_default=""),
        sa.Column("process_name", sa.String(length=128), nullable=False, server_default=""),
        sa.Column("command", sa.Text(), nullable=False, server_default=""),
        sa.Column("labels", sa.JSON(), nullable=False),
        sa.Column("meta", sa.JSON(), nullable=False),
        sa.Column("bound_rule_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_bound", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("last_discovered_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["environment_id"], ["app_environments.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["resource_id"], ["resources.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("resource_id", "discovery_type", "identity", name="ux_discovered_services_resource_type_identity"),
    )
    op.create_index(op.f("ix_discovered_services_discovery_type"), "discovered_services", ["discovery_type"], unique=False)
    op.create_index(op.f("ix_discovered_services_environment_id"), "discovered_services", ["environment_id"], unique=False)
    op.create_index(op.f("ix_discovered_services_resource_id"), "discovered_services", ["resource_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_discovered_services_resource_id"), table_name="discovered_services")
    op.drop_index(op.f("ix_discovered_services_environment_id"), table_name="discovered_services")
    op.drop_index(op.f("ix_discovered_services_discovery_type"), table_name="discovered_services")
    op.drop_table("discovered_services")
