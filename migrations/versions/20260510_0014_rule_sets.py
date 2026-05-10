"""Add rule sets.

Revision ID: 20260510_0014
Revises: 20260509_0013
Create Date: 2026-05-10
"""

from alembic import op
import sqlalchemy as sa


revision = "20260510_0014"
down_revision = "20260509_0013"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "rule_sets",
        sa.Column("id", sa.String(length=40), nullable=False),
        sa.Column("name", sa.String(length=128), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("target_kind", sa.String(length=32), nullable=False, server_default="resource"),
        sa.Column("resource_types", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("service_types", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("conditions", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("exclude_keywords", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("item_ids", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("is_builtin", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_table(
        "environment_rule_sets",
        sa.Column("id", sa.String(length=40), nullable=False),
        sa.Column("environment_id", sa.String(length=40), nullable=False),
        sa.Column("rule_set_id", sa.String(length=40), nullable=False),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["environment_id"], ["app_environments.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["rule_set_id"], ["rule_sets.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("environment_id", "rule_set_id", name="ux_environment_rule_sets_env_rule"),
    )
    op.create_index(op.f("ix_environment_rule_sets_environment_id"), "environment_rule_sets", ["environment_id"], unique=False)
    op.create_index(op.f("ix_environment_rule_sets_rule_set_id"), "environment_rule_sets", ["rule_set_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_environment_rule_sets_rule_set_id"), table_name="environment_rule_sets")
    op.drop_index(op.f("ix_environment_rule_sets_environment_id"), table_name="environment_rule_sets")
    op.drop_table("environment_rule_sets")
    op.drop_table("rule_sets")
