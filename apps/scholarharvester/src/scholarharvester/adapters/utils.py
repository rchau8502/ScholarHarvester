from __future__ import annotations

from dataclasses import dataclass
from typing import List

@dataclass
class CitationPayload:
    title: str
    publisher: str
    year: int
    source_url: str
    interpretation_note: str

@dataclass
class MetricPayload:
    campus: str
    major: str | None = None
    discipline: str | None = None
    source_school: str | None = None
    school_type: str | None = None
    cohort: str = "freshman"
    stat_name: str = "stat"
    stat_value_numeric: float | None = None
    stat_value_text: str | None = None
    unit: str | None = None
    percentile: str | None = None
    year: int = 2024
    term: str = "Fall"
    notes: str | None = None
    citations: List[CitationPayload] | None = None

    def __post_init__(self) -> None:
        if self.citations is None:
            self.citations = []

@dataclass
class DatasetPayload:
    title: str
    year: int
    term: str
    cohort: str
    notes: str | None = None

@dataclass
class AdapterResult:
    dataset: DatasetPayload
    metrics: List[MetricPayload]
