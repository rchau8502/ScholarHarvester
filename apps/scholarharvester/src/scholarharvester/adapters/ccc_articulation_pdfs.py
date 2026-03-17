from __future__ import annotations

from scholarharvester.adapters.official import OfficialSourceConfig, fetch_table, make_dataset, resolve_official_data_url
from scholarharvester.adapters.utils import AdapterResult, CitationPayload, MetricPayload


def collect(params: dict[str, str]) -> AdapterResult:
    year = int(params.get("since", params.get("year", "2022")))
    campus = params.get("campus", "All CCCs")

    source = OfficialSourceConfig(
        adapter_name="ccc_articulation_pdfs",
        source_name="CCC Articulation PDFs",
        publisher="California Community Colleges Chancellor's Office",
        env_var="SCHOLARSTACK_CCC_ARTICULATION_CSV_URL",
        base_url="https://www.cccco.edu",
        discovery_keywords=("articulation", "pdf", "csv"),
    )
    source_url = resolve_official_data_url(source)
    frame = fetch_table(source_url)
    pdf_column = next((column for column in frame.columns if "pdf" in column.lower() or "file" in column.lower()), None)
    table_count = len(frame[pdf_column].dropna()) if pdf_column else len(frame)

    metrics = [
        MetricPayload(
            campus=campus,
            cohort="transfer",
            stat_name="articulation_table_count",
            stat_value_numeric=float(table_count),
            stat_value_text=None,
            unit="count",
            year=year,
            term="Academic Year",
            notes="Official articulation resource count.",
            citations=[
                CitationPayload(
                    title="CCC Articulation Export",
                    publisher=source.publisher,
                    year=year,
                    source_url=source_url,
                    interpretation_note="Count of articulation resources from official export listing.",
                )
            ],
        )
    ]

    dataset = make_dataset(
        title="CCC Articulation Resources",
        year=year,
        term="Academic Year",
        cohort="transfer",
        source_url=source_url,
    )
    return AdapterResult(dataset=dataset, metrics=metrics)
