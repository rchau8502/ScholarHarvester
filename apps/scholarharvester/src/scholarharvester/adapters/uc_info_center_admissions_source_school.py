from __future__ import annotations

from scholarharvester.adapters._factory import make_sample
from scholarharvester.adapters.utils import AdapterResult


def collect(params: dict[str, str]) -> AdapterResult:
    year = int(params.get("since", params.get("year", "2024")))
    campus = params.get("campus", "UC San Diego")
    major = params.get("major", "Computer Science")
    stats = {
        "applicants": 5800,
        "admits": 2100,
        "enrolled": 950,
        "avg_gpa": 3.82,
    }
    result = make_sample(
        "uc_info_center_admissions_source_school",
        cohort="freshman",
        year=year,
        campus=campus,
        major=major,
        discipline=None,
        term="Fall",
        stats=stats,
        citation_suffix="source_school",
    )
    for metric in result.metrics:
        metric.source_school = params.get("source_school", "Walnut High School")
        metric.school_type = "HighSchool"
    return result
