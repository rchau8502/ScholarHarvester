from __future__ import annotations

from enum import Enum
from typing import Any, List, Optional

from pydantic import BaseModel, Field


class Cohort(str, Enum):
    freshman = "freshman"
    transfer = "transfer"


class SchoolType(str, Enum):
    HighSchool = "HighSchool"
    CommunityCollege = "CommunityCollege"
    Other = "Other"


class CitationOut(BaseModel):
    title: str
    publisher: str
    year: int
    source_url: str
    interpretation_note: Optional[str]


class MetricOut(BaseModel):
    id: int
    campus: str
    major: Optional[str]
    discipline: Optional[str]
    source_school: Optional[str]
    school_type: Optional[SchoolType]
    cohort: Cohort
    stat_name: str
    stat_value_numeric: Optional[float]
    stat_value_text: Optional[str]
    unit: Optional[str]
    percentile: Optional[str]
    year: int
    term: str
    notes: Optional[str]
    citations: List[CitationOut]


class MetricPage(BaseModel):
    items: List[MetricOut]
    next_cursor: Optional[int]


class CampusOut(BaseModel):
    name: str
    system: str


class MajorOut(BaseModel):
    id: int
    name: str
    campus: str
    cip_code: Optional[str]
    is_impacted: Optional[str]


class SourceSchoolOut(BaseModel):
    name: str
    school_type: SchoolType
    city: Optional[str]
    state: Optional[str]


class DatasetOut(BaseModel):
    id: int
    title: str
    year: int
    term: str
    cohort: Cohort
    notes: Optional[str]


class ProvenanceOut(BaseModel):
    dataset: DatasetOut
    campus: str
    citations: List[CitationOut]


class ProfileOut(BaseModel):
    campus: str
    cohort: Cohort
    major: Optional[str]
    discipline: Optional[str]
    years: List[int]
    metrics: List[MetricOut]
