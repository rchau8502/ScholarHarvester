from __future__ import annotations

from scholarharvester.adapters.official import OfficialSourceConfig, fetch_table, make_dataset, resolve_official_data_url
from scholarharvester.adapters.utils import AdapterResult, CitationPayload, MetricPayload


def collect(params: dict[str, str]) -> AdapterResult:
    year = int(params.get("since", params.get("year", "2022")))
    campus_filter = params.get("campus")

    source = OfficialSourceConfig(
        adapter_name="ccc_catalog_courses",
        source_name="CCC Catalog Courses",
        publisher="California Community Colleges Chancellor's Office",
        env_var="SCHOLARSTACK_CCC_CATALOG_CSV_URL",
        base_url="https://www.cccco.edu/catalog",
        discovery_keywords=("catalog", "course", "csv"),
    )
    source_url = resolve_official_data_url(source)
    frame = fetch_table(source_url)

    campus_column = next(
        (column for column in frame.columns if "college" in column.lower() or "campus" in column.lower()),
        None,
    )
    if campus_column:
        grouped = frame.groupby(frame[campus_column].astype(str).str.strip())
    else:
        grouped = [("All CCCs", frame)]

    metrics: list[MetricPayload] = []
    for campus_name, subset in grouped:
        if not campus_name or campus_name.lower() == "nan":
            continue
        if campus_filter and campus_name.lower() != campus_filter.lower():
            continue
        metrics.append(
            MetricPayload(
                campus=campus_name,
                cohort="transfer",
                stat_name="course_count",
                stat_value_numeric=float(len(subset)),
                stat_value_text=None,
                unit="count",
                year=year,
                term="Academic Year",
                notes="Official CCC catalog row count.",
                citations=[
                    CitationPayload(
                        title="CCCCO Catalog Export",
                        publisher=source.publisher,
                        year=year,
                        source_url=source_url,
                        interpretation_note="Count of catalog rows per campus in the official export.",
                    )
                ],
            )
        )

    if not metrics:
        raise RuntimeError(f"ccc_catalog_courses: no rows available from {source_url}")

    dataset = make_dataset(
        title="CCCCO Course Catalog Snapshot",
        year=year,
        term="Academic Year",
        cohort="transfer",
        source_url=source_url,
    )
    return AdapterResult(dataset=dataset, metrics=metrics)
