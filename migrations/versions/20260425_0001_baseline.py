"""baseline schema

Revision ID: 20260425_0001
Revises:
Create Date: 2026-04-25
"""
from __future__ import annotations

from alembic import op

from backend.app.db.session import Base
from backend.app.models import entities  # noqa: F401


revision = "20260425_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    Base.metadata.create_all(bind=bind)
    op.execute("ALTER TABLE inspection_tasks ADD COLUMN IF NOT EXISTS cancel_requested BOOLEAN NOT NULL DEFAULT false")


def downgrade() -> None:
    bind = op.get_bind()
    Base.metadata.drop_all(bind=bind)
