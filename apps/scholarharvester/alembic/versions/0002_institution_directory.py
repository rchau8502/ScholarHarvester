"""Add institution directory table"""

from alembic import op
import sqlalchemy as sa


revision = "0002_institution_directory"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "institution",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("external_id", sa.String(), nullable=False),
        sa.Column("source", sa.String(), nullable=False, server_default="College Scorecard"),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("city", sa.String(), nullable=True),
        sa.Column("state", sa.String(), nullable=True),
        sa.Column("zip", sa.String(), nullable=True),
        sa.Column("control", sa.String(), nullable=True),
        sa.Column("locale", sa.String(), nullable=True),
        sa.Column("locale_code", sa.Integer(), nullable=True),
        sa.Column("carnegie_basic", sa.String(), nullable=True),
        sa.Column("highest_degree", sa.String(), nullable=True),
        sa.Column("website", sa.String(), nullable=True),
        sa.Column("price_calculator_url", sa.String(), nullable=True),
        sa.Column("student_size", sa.Integer(), nullable=True),
        sa.Column("admission_rate", sa.Numeric(), nullable=True),
        sa.Column("sat_average", sa.Integer(), nullable=True),
        sa.Column("act_midpoint", sa.Numeric(), nullable=True),
        sa.Column("avg_net_price", sa.Integer(), nullable=True),
        sa.Column("tuition_in_state", sa.Integer(), nullable=True),
        sa.Column("tuition_out_of_state", sa.Integer(), nullable=True),
        sa.Column("federal_aid_rate", sa.Numeric(), nullable=True),
        sa.Column("completion_rate", sa.Numeric(), nullable=True),
        sa.Column("retention_rate", sa.Numeric(), nullable=True),
        sa.Column("median_earnings_10yr", sa.Integer(), nullable=True),
        sa.Column("latitude", sa.Numeric(), nullable=True),
        sa.Column("longitude", sa.Numeric(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("external_id", name="institution_external_id_key"),
    )
    op.create_index("ix_institution_name", "institution", ["name"])
    op.create_index("ix_institution_state", "institution", ["state"])
    op.create_index("ix_institution_control", "institution", ["control"])


def downgrade() -> None:
    op.drop_index("ix_institution_control", table_name="institution")
    op.drop_index("ix_institution_state", table_name="institution")
    op.drop_index("ix_institution_name", table_name="institution")
    op.drop_table("institution")
