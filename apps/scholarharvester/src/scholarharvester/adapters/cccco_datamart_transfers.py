from __future__ import annotations

from scholarharvester.adapters._factory import make_sample
from scholarharvester.adapters.utils import AdapterResult


def collect(params: dict[str, str]) -> AdapterResult:
    year = int(params.get("since", params.get("year", "2024")))
    campus = params.get("campus", "All CCCs")
    stats = {
        "transfer_volume": 17200,
        "adt_awards": 5600,
    }
    return make_sample(
        "cccco_datamart_transfers",
        cohort="transfer",
        year=year,
        campus=campus,
        major=None,
        discipline=None,
        term="Academic Year",
        stats=stats,
        citation_suffix="ccc_datamart",
    )
