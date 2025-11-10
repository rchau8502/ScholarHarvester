from __future__ import annotations

from scholarharvester.adapters._factory import make_sample
from scholarharvester.adapters.utils import AdapterResult


def collect(params: dict[str, str]) -> AdapterResult:
    year = int(params.get("since", params.get("year", "2024")))
    campus = params.get("campus", "UCLA")
    discipline = params.get("major", "Physical Sciences")
    stats = {
        "applicants": 4800,
        "admits": 2200,
        "enrolled": 1100,
        "gpa_p25": 3.3,
        "gpa_p50": 3.7,
        "gpa_p75": 3.95,
    }
    return make_sample(
        "uc_info_center_freshman_discipline",
        cohort="freshman",
        year=year,
        campus=campus,
        major=None,
        discipline=discipline,
        term="Fall",
        stats=stats,
        citation_suffix="freshman",
    )
