"""add ai assistant model setting

Revision ID: 20260508_0008
Revises: 20260508_0007
Create Date: 2026-05-08
"""

from alembic import op
import sqlalchemy as sa


revision = "20260508_0008"
down_revision = "20260508_0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = {column["name"] for column in inspector.get_columns("ai_assistant_settings")}
    if "model_id" in columns:
        return
    op.add_column("ai_assistant_settings", sa.Column("model_id", sa.String(length=40), nullable=True))
    op.create_foreign_key(
        "fk_ai_assistant_settings_model_id",
        "ai_assistant_settings",
        "ai_model_configs",
        ["model_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_ai_assistant_settings_model_id", "ai_assistant_settings", type_="foreignkey")
    op.drop_column("ai_assistant_settings", "model_id")
