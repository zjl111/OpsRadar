"""drop discovered services

Revision ID: 20260509_0010
Revises: 20260509_0009
Create Date: 2026-05-09
"""

from alembic import op


revision = "20260509_0010"
down_revision = "20260509_0009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_index(op.f("ix_discovered_services_resource_id"), table_name="discovered_services")
    op.drop_index(op.f("ix_discovered_services_environment_id"), table_name="discovered_services")
    op.drop_index(op.f("ix_discovered_services_discovery_type"), table_name="discovered_services")
    op.drop_table("discovered_services")


def downgrade() -> None:
    pass
