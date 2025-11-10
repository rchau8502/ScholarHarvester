from __future__ import annotations

import asyncio
from datetime import datetime
from typing import Any, Iterable

import httpx
from sqlalchemy import select

from scholarharvester.adapters import ADAPTERS
from scholarharvester.adapters.utils import AdapterResult
from scholarharvester.config import config
from scholarharvester.database import get_session
from scholarharvester.models import (
    Citation,
    Cohort,
    FileIngest,
    Metric,
    Runlog,
    SchoolType,
    Source,
    Dataset,
)
from scholarharvester.provenance import update_provenance
from scholarharvester.registry import find_source, record_robot_decision


async def _fetch_robots(base_url: str) -> str:
    try:
        async with httpx.AsyncClient(headers={"User-Agent": config.user_agent}, timeout=10) as client:
            resp = await client.get(base_url.rstrip("/") + "/robots.txt")
            return resp.text
    except httpx.HTTPError:
        return ""


async def run_adapter(adapter_name: str, params: dict[str, str], save_raw: bool) -> Runlog:
    source_conf = find_source(adapter_name)
    if not source_conf:
        raise ValueError(f"Unknown adapter: {adapter_name}")

    async with get_session() as session:
        source = (await session.execute(select(Source).where(Source.name == source_conf["name"]))).scalar_one_or_none()
        if not source:
            source = Source(
                name=source_conf["name"],
                publisher=source_conf.get("publisher", "ScholarStack"),
                base_url=source_conf.get("base_url", ""),
                terms_url=source_conf.get("terms_url"),
                default_throttle=source_conf.get("throttle_seconds", 2),
                adapter=adapter_name,
            )
            session.add(source)
        else:
            source.adapter = adapter_name

        runlog = Runlog(adapter=adapter_name, status="running", started_at=datetime.utcnow())
        session.add(runlog)
        await session.flush()

        robots_text = await _fetch_robots(source.base_url)
        record_robot_decision(source_conf, robots_text)
        source.robots_cache_json = {"checked_at": datetime.utcnow().isoformat(), "text": robots_text}

        await asyncio.sleep(source_conf.get("throttle_seconds", 2))

        adapter = ADAPTERS.get(adapter_name)
        if not adapter:
            raise ValueError("Adapter implementation missing")
        result: AdapterResult = adapter(params)

        dataset = Dataset(
            source=source,
            title=result.dataset.title,
            year=result.dataset.year,
            term=result.dataset.term,
            cohort=Cohort[result.dataset.cohort],
            notes=f"{result.dataset.notes or ''} runlog:{runlog.id}",
        )
        session.add(dataset)
        await session.flush()

        file_ingest = FileIngest(
            dataset=dataset,
            url=f"{source.base_url}/harvest/{adapter_name}",
            fetched_at=datetime.utcnow(),
            mime=source_conf.get("allowed_mime", ["text/csv"])[0],
            http_status=200,
            status="ok",
        )
        session.add(file_ingest)

        inserted_metrics = 0
        for metric_payload in result.metrics:
            metric = Metric(
                dataset=dataset,
                campus=metric_payload.campus,
                major=metric_payload.major,
                discipline=metric_payload.discipline,
                source_school=metric_payload.source_school,
                school_type=SchoolType[metric_payload.school_type] if metric_payload.school_type else None,
                cohort=Cohort[metric_payload.cohort],
                stat_name=metric_payload.stat_name,
                stat_value_numeric=metric_payload.stat_value_numeric,
                stat_value_text=metric_payload.stat_value_text,
                unit=metric_payload.unit,
                percentile=metric_payload.percentile,
                year=metric_payload.year,
                term=metric_payload.term,
                notes=metric_payload.notes,
            )
            session.add(metric)
            await session.flush()
            for cite in metric_payload.citations:
                citation = Citation(
                    metric=metric,
                    title=cite.title,
                    publisher=cite.publisher,
                    year=cite.year,
                    source_url=cite.source_url,
                    interpretation_note=cite.interpretation_note,
                )
                session.add(citation)
            inserted_metrics += 1

        runlog.status = "completed"
        runlog.finished_at = datetime.utcnow()
        runlog.new_records = inserted_metrics
        await session.commit()

        update_provenance(runlog.id, source.name, [file_ingest.url], warnings=[])
        return runlog


def list_adapters() -> list[str]:
    return list(ADAPTERS.keys())
