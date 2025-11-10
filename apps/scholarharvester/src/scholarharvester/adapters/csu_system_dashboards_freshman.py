from __future__ import annotations

from scholarharvester.adapters._factory import make_sample
from scholarharvester.adapters.utils import AdapterResult


def collect(params: dict[str, str]) -> AdapterResult:
    year = int(params.get("since", params.get("year", "2024")))
    campus = params.get("campus", "CSU Fullerton")
    discipline = params.get("major", "Business")
    stats = {
        "applicants": 4100,
        "admits": 2700,
        "enrolled": 1600,
        "gpa_p25": 2.9,
        "gpa_p50": 3.35,
        "gpa_p75": 3.7,
    }
    result = make_sample(
        "csu_system_dashboards_freshman",
        cohort="freshman",
        year=year,
        campus=campus,
        major=None,
        discipline=discipline,
        term="Fall",
        stats=stats,
        citation_suffix="csu_freshman",
    )
    return result
