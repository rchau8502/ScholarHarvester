from __future__ import annotations

from scholarharvester.adapters._factory import make_sample
from scholarharvester.adapters.utils import AdapterResult


def collect(params: dict[str, str]) -> AdapterResult:
    year = int(params.get("since", params.get("year", "2024")))
    campus = params.get("campus", "CCC Course Catalog")
    stats = {
        "course_catalog_entry": '{"catalog_number": "MATH 33", "title": "Calculus for Statistics", "units": "5", "prereqs": "MATH 10"}',
    }
    return make_sample(
        "ccc_catalog_courses",
        cohort="transfer",
        year=year,
        campus=campus,
        major="Calculus",
        discipline="Mathematics",
        term="2024",
        stats=stats,
        citation_suffix="ccc_catalog",
    )
