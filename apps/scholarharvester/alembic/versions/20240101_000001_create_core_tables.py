"""create core tables"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "20240101_000001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "source",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(255), nullable=False, unique=True),
        sa.Column("publisher", sa.String(255), nullable=False),
        sa.Column("url", sa.String(1024), nullable=False),
        sa.Column("license", sa.String(255), nullable=True),
    )

    op.create_table(
        "dataset",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("source_id", sa.Integer, sa.ForeignKey("source.id"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("latest_refresh", sa.DateTime, nullable=False),
    )

    op.create_table(
        "file_ingest",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("dataset_id", sa.Integer, sa.ForeignKey("dataset.id"), nullable=False),
        sa.Column("storage_path", sa.String(512), nullable=False),
        sa.Column("checksum", sa.String(64), nullable=False),
        sa.Column("ingested_at", sa.DateTime, nullable=False),
    )

    op.create_table(
        "table_extract",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("file_ingest_id", sa.Integer, sa.ForeignKey("file_ingest.id"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
    )

    op.create_table(
        "citation",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("publisher", sa.String(255), nullable=False),
        sa.Column("publication_year", sa.Integer, nullable=False),
        sa.Column("url", sa.String(1024), nullable=False),
        sa.Column("interpretation_note", sa.Text, nullable=False),
    )

    op.create_table(
        "campus",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("slug", sa.String(64), nullable=False, unique=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("system", sa.String(64), nullable=False),
    )

    op.create_table(
        "major",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("discipline", sa.String(255), nullable=False),
        sa.Column("cip_code", sa.String(16), nullable=False),
    )

    op.create_table(
        "sourceschool",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("type", sa.String(32), nullable=False),
    )

    op.create_table(
        "metric",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("table_extract_id", sa.Integer, sa.ForeignKey("table_extract.id"), nullable=False),
        sa.Column("campus_id", sa.Integer, sa.ForeignKey("campus.id"), nullable=True),
        sa.Column("major_id", sa.Integer, sa.ForeignKey("major.id"), nullable=True),
        sa.Column("source_school_id", sa.Integer, sa.ForeignKey("sourceschool.id"), nullable=True),
        sa.Column("citation_id", sa.Integer, sa.ForeignKey("citation.id"), nullable=False),
        sa.Column("metric_key", sa.String(128), nullable=False),
        sa.Column("metric_year", sa.Integer, nullable=False),
        sa.Column("value_float", sa.Float, nullable=True),
        sa.Column("value_text", sa.Text, nullable=True),
        sa.Column("is_estimate", sa.Boolean, nullable=False, server_default=sa.text("false")),
    )
    op.create_index("ix_metric_metric_key", "metric", ["metric_key"])
    op.create_index("ix_metric_metric_year", "metric", ["metric_year"])

    op.create_table(
        "runlog",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("adapter", sa.String(64), nullable=False),
        sa.Column("started_at", sa.DateTime, nullable=False),
        sa.Column("finished_at", sa.DateTime, nullable=True),
        sa.Column("success", sa.Boolean, nullable=False),
        sa.Column("message", sa.Text, nullable=True),
    )

    op.create_table(
        "robots_decision",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("url", sa.String(1024), nullable=False, unique=True),
        sa.Column("allowed", sa.Boolean, nullable=False),
        sa.Column("reason", sa.Text, nullable=False),
        sa.Column("decided_at", sa.DateTime, nullable=False),
    )


def downgrade() -> None:
    op.drop_table("robots_decision")
    op.drop_table("runlog")
    op.drop_index("ix_metric_metric_year", table_name="metric")
    op.drop_index("ix_metric_metric_key", table_name="metric")
    op.drop_table("metric")
    op.drop_table("sourceschool")
    op.drop_table("major")
    op.drop_table("campus")
    op.drop_table("citation")
    op.drop_table("table_extract")
    op.drop_table("file_ingest")
    op.drop_table("dataset")
    op.drop_table("source")
