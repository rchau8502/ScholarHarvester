from __future__ import annotations

from datetime import datetime

from scholarharvester.adapters.utils import (
    AdapterResult,
    CitationPayload,
    DatasetPayload,
    MetricPayload,
)


def make_sample(
    adapter_key: str,
    cohort: str,
    year: int,
    campus: str,
    major: str | None,
    discipline: str | None,
    term: str,
    stats: dict[str, float | str],
    citation_suffix: str,
) -> AdapterResult:
    dataset = DatasetPayload(
        title=f"{adapter_key} harvest for {campus} {major or discipline}",
        year=year,
        term=term,
        cohort=cohort,
        notes=f"Automated sample from {adapter_key} on {datetime.utcnow().date()}.",
    )
    metrics: list[MetricPayload] = []
    for stat_name, value in stats.items():
        citations = [
            CitationPayload(
                title=f"{adapter_key} Metric {stat_name}",
                publisher="ScholarStack Demo",
                year=year,
                source_url=f"https://scholarstack.org/{adapter_key}/{stat_name}",
                interpretation_note="Seeded demo value; verify with official report.",
            )
        ]
        metric = MetricPayload(
            campus=campus,
            major=major,
            discipline=discipline,
            cohort=cohort,
            stat_name=stat_name,
            stat_value_numeric=float(value)
            if isinstance(value, (int, float))
            else None,
            stat_value_text=str(value) if not isinstance(value, (int, float)) else None,
            unit="percent" if stat_name.endswith("rate") else "GPA" if "GPA" in stat_name else "headcount",
            year=year,
            term=term,
            citations=citations,
        )
        metrics.append(metric)
    return AdapterResult(dataset=dataset, metrics=metrics)
