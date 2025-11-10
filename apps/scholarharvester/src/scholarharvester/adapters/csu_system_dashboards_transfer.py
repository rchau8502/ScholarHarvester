from __future__ import annotations

from scholarharvester.adapters._factory import make_sample
from scholarharvester.adapters.utils import AdapterResult


def collect(params: dict[str, str]) -> AdapterResult:
    year = int(params.get("since", params.get("year", "2024")))
    campus = params.get("campus", "CSU Long Beach")
    major = params.get("major", "Mathematics")
    stats = {
        "applicants": 2600,
        "admits": 1900,
        "enrolled": 1400,
        "gpa_p25": 3.0,
        "gpa_p50": 3.45,
        "gpa_p75": 3.8,
    }
    result = make_sample(
        "csu_system_dashboards_transfer",
        cohort="transfer",
        year=year,
        campus=campus,
        major=major,
        discipline=None,
        term="Fall",
        stats=stats,
        citation_suffix="csu_transfer",
    )
    for metric in result.metrics:
        metric.school_type = "CommunityCollege"
        metric.source_school = params.get("source_school", "Mt. San Antonio College")
    return result
