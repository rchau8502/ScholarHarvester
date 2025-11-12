from __future__ import annotations

import os
from contextlib import contextmanager
from decimal import Decimal
from typing import Any

import psycopg

from scholarharvester.adapters.utils import CitationPayload, DatasetPayload, MetricPayload


@contextmanager
def supabase_conn():
    dsn = os.getenv("SUPABASE_DB_DSN")
    if not dsn:
        raise RuntimeError("SUPABASE_DB_DSN is not set")
    with psycopg.connect(dsn, autocommit=True) as connection:
        yield connection


def _as_number(value: Any) -> float | None:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, Decimal):
        return float(value)
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def upsert_dataset(connection: psycopg.Connection, payload: DatasetPayload, source_name: str) -> int:
    notes = payload.notes or ""
    merged_notes = notes if source_name in notes else f"{notes} | source:{source_name}".strip()
    with connection.cursor() as cur:
        cur.execute(
            """
            insert into dataset (title, year, cohort, term, source, notes)
            values (%s, %s, %s, %s, %s, %s)
            on conflict (title, year, cohort, term)
            do update set notes = excluded.notes
            returning id
            """,
            (payload.title, payload.year, payload.cohort, payload.term, source_name, merged_notes),
        )
        row = cur.fetchone()
        if not row:
            raise RuntimeError("Failed to insert dataset")
        return row[0]


def upsert_metric(connection: psycopg.Connection, dataset_id: int, payload: MetricPayload) -> int:
    cols = [
        "dataset_id",
        "campus",
        "major",
        "discipline",
        "source_school",
        "school_type",
        "cohort",
        "year",
        "term",
        "stat_name",
        "stat_value_numeric",
        "stat_value_text",
        "unit",
        "percentile",
        "notes",
    ]
    values = [
        dataset_id,
        payload.campus,
        payload.major,
        payload.discipline,
        payload.source_school,
        payload.school_type,
        payload.cohort,
        payload.year,
        payload.term,
        payload.stat_name,
        _as_number(payload.stat_value_numeric),
        payload.stat_value_text,
        payload.unit,
        payload.percentile,
        payload.notes,
    ]
    placeholders = ", ".join(["%s"] * len(cols))
    with connection.cursor() as cur:
        cur.execute(
            f"""
            insert into metric ({", ".join(cols)})
            values ({placeholders})
            on conflict on constraint metric_dedupe_idx
            do update set notes = excluded.notes
            returning id
            """,
            values,
        )
        row = cur.fetchone()
        if not row:
            raise RuntimeError("Failed to insert metric")
        return row[0]


def upsert_citation(connection: psycopg.Connection, metric_id: int, citation: CitationPayload) -> None:
    with connection.cursor() as cur:
        cur.execute(
            """
            insert into citation (metric_id, title, publisher, year, source_url, interpretation_note)
            values (%s, %s, %s, %s, %s, %s)
            on conflict on constraint citation_unique_idx do nothing
            """,
            (
                metric_id,
                citation.title,
                citation.publisher,
                citation.year,
                citation.source_url,
                citation.interpretation_note,
            ),
        )
