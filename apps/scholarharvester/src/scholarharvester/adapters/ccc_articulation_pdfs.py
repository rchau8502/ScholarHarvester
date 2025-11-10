from __future__ import annotations

from scholarharvester.adapters._factory import make_sample
from scholarharvester.adapters.utils import AdapterResult


def collect(params: dict[str, str]) -> AdapterResult:
    year = int(params.get("since", params.get("year", "2024")))
    campus = params.get("campus", "Mt. San Antonio College")
    stats = {
        "articulation_tables": '{"pdf": "MTSAC-UCSD-2024.pdf", "notes": "transfer pathways"}',
    }
    return make_sample(
        "ccc_articulation_pdfs",
        cohort="transfer",
        year=year,
        campus=campus,
        major="Engineering",
        discipline="STEM",
        term="2024",
        stats=stats,
        citation_suffix="ccc_articulation",
    )
