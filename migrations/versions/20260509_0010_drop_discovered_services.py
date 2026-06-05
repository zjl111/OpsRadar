"""drop discovered services

Revision ID: 20260509_0010
Revises: 20260509_0009
Create Date: 2026-05-09
"""

from alembic import op
import sqlalchemy as sa


revision = "20260509_0010"
down_revision = "20260509_0009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    if not inspector.has_table("discovered_services"):
        return
    columns = {column["name"] for column in inspector.get_columns("discovered_services")}
    if "service_resource_id" in columns:
        return
    op.drop_index(op.f("ix_discovered_services_resource_id"), table_name="discovered_services")
    op.drop_index(op.f("ix_discovered_services_environment_id"), table_name="discovered_services")
    op.drop_index(op.f("ix_discovered_services_discovery_type"), table_name="discovered_services")
    op.drop_table("discovered_services")


def downgrade() -> None:
    pass
