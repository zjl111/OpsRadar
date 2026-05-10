"""drop task types

Revision ID: 20260509_0011
Revises: 20260509_0010
Create Date: 2026-05-09
"""

from alembic import op


revision = "20260509_0011"
down_revision = "20260509_0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_table("task_types")


def downgrade() -> None:
    pass
