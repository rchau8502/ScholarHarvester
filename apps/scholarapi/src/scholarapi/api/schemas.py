from __future__ import annotations

from pydantic import BaseModel


class Campus(BaseModel):
    slug: str
    name: str
    system: str


class Metric(BaseModel):
    metric_key: str
    metric_year: int
    value_float: float | None
    value_text: str | None
    campus_slug: str
    citation_title: str
    citation_publisher: str
    citation_year: int
    citation_url: str
    interpretation_note: str


class Citation(BaseModel):
    metric_key: str
    citation_title: str
    publisher: str
    publication_year: int
    url: str
    interpretation_note: str


class CampusProfile(BaseModel):
    campus: Campus
    metrics: list[Metric]
