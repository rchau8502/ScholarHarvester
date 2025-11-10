from __future__ import annotations

from datetime import datetime

from sqlalchemy import select

from .db import models
from .db.session import get_session


def seed_demo() -> None:
    """Insert demo data so ScholarPath renders KPIs."""
    with get_session() as session:
        existing = session.execute(select(models.Campus).limit(1)).first()
        if existing:
            return

        source = models.Source(
            name="IPEDS",
            publisher="National Center for Education Statistics",
            url="https://nces.ed.gov/ipeds/",
            license="Public Domain",
        )
        session.add(source)
        session.flush()

        dataset = models.Dataset(
            source_id=source.id,
            name="IPEDS Admissions",
            description="Admissions data for UC campuses",
            latest_refresh=datetime.utcnow(),
        )
        session.add(dataset)
        session.flush()

        file_ingest = models.FileIngest(
            dataset_id=dataset.id,
            storage_path="demo/ipeds_admissions.csv",
            checksum="demo",
            ingested_at=datetime.utcnow(),
        )
        session.add(file_ingest)
        session.flush()

        table_extract = models.TableExtract(
            file_ingest_id=file_ingest.id,
            name="admissions_metrics",
            description="Seeded admissions metrics for demo",
        )
        session.add(table_extract)
        session.flush()

        campus = models.Campus(slug="uc-davis", name="UC Davis", system="UC")
        session.add(campus)
        session.flush()

        citation = models.Citation(
            title="IPEDS Admissions Survey",
            publisher="NCES",
            publication_year=2023,
            url="https://nces.ed.gov/ipeds/",
            interpretation_note="IPEDS admissions data for fall term",
        )
        session.add(citation)
        session.flush()

        metric = models.Metric(
            table_extract_id=table_extract.id,
            campus_id=campus.id,
            metric_key="admit_rate",
            metric_year=2023,
            value_float=0.37,
            value_text=None,
            is_estimate=False,
            citation_id=citation.id,
        )
        session.add(metric)

        gpa_metric = models.Metric(
            table_extract_id=table_extract.id,
            campus_id=campus.id,
            metric_key="gpa_p50",
            metric_year=2023,
            value_float=3.85,
            value_text=None,
            is_estimate=False,
            citation_id=citation.id,
        )
        session.add(gpa_metric)
