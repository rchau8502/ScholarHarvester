from __future__ import annotations

from scholarharvester.adapters._factory import make_sample
from scholarharvester.adapters.utils import AdapterResult


def collect(params: dict[str, str]) -> AdapterResult:
    year = int(params.get("since", params.get("year", "2024")))
    campus = params.get("campus", "UC Irvine")
    major = params.get("major", "Mathematics")
    stats = {
        "applicants": 3200,
        "admits": 1650,
        "enrolled": 840,
        "gpa_p25": 3.1,
        "gpa_p50": 3.52,
        "gpa_p75": 3.85,
    }
    return make_sample(
        "uc_info_center_transfers_major",
        cohort="transfer",
        year=year,
        campus=campus,
        major=major,
        discipline=None,
        term="Fall",
        stats=stats,
        citation_suffix="transfers",
    )
