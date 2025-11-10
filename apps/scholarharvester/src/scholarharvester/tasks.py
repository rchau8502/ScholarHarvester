from __future__ import annotations

from datetime import datetime

from sqlalchemy.orm import Session

from .db import models


REQUIRED_FIELDS = {
    "metric_key",
    "metric_year",
    "value_float",
    "citation",
    "campus",
}


def persist_metric(session: Session, payload: dict[str, object]) -> models.Metric:
    missing = REQUIRED_FIELDS - payload.keys()
    if missing:
        raise ValueError(f"Metric missing required fields: {sorted(missing)}")

    campus_slug = payload["campus"]
    campus = session.query(models.Campus).filter_by(slug=campus_slug).one_or_none()
    if campus is None:
        campus = models.Campus(slug=campus_slug, name=payload.get("campus_name", campus_slug.title()), system=payload.get("system", "UC"))
        session.add(campus)
        session.flush()

    citation_payload = payload["citation"]
    citation = models.Citation(
        title=citation_payload["title"],
        publisher=citation_payload["publisher"],
        publication_year=int(citation_payload["year"]),
        url=citation_payload["url"],
        interpretation_note=citation_payload["interpretation_note"],
    )
    session.add(citation)
    session.flush()

    metric = models.Metric(
        table_extract_id=payload.get("table_extract_id"),
        campus_id=campus.id,
        metric_key=str(payload["metric_key"]),
        metric_year=int(payload["metric_year"]),
        value_float=float(payload["value_float"]),
        value_text=payload.get("value_text"),
        is_estimate=bool(payload.get("is_estimate", False)),
        citation_id=citation.id,
    )
    if metric.table_extract_id is None:
        source = session.query(models.Source).filter_by(name=payload.get("source_name", "Demo Source")).one_or_none()
        if source is None:
            source = models.Source(
                name=payload.get("source_name", "Demo Source"),
                publisher=payload.get("source_publisher", "Scholarstack"),
                url=payload.get("source_url", "https://data.ca.gov"),
                license=payload.get("source_license", "Public Domain"),
            )
            session.add(source)
            session.flush()

        dataset = models.Dataset(
            source_id=source.id,
            name=payload.get("dataset_name", "Demo Dataset"),
            description=payload.get("dataset_description", "Seeded metric"),
            latest_refresh=datetime.utcnow(),
        )
        session.add(dataset)
        session.flush()
        file_ingest = models.FileIngest(
            dataset_id=dataset.id,
            storage_path=payload.get("storage_path", "demo.csv"),
            checksum=payload.get("checksum", "demo"),
            ingested_at=datetime.utcnow(),
        )
        session.add(file_ingest)
        session.flush()
        table_extract = models.TableExtract(
            file_ingest_id=file_ingest.id,
            name=payload.get("table_name", "metrics"),
            description=payload.get("table_description", "Seeded metrics table"),
        )
        session.add(table_extract)
        session.flush()
        metric.table_extract_id = table_extract.id

    session.add(metric)
    session.flush()
    return metric
