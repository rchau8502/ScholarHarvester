from __future__ import annotations

from scholarharvester.adapters.official import (
    OfficialSourceConfig,
    build_metrics_from_frame,
    fetch_table,
    make_dataset,
    resolve_official_data_url,
)
from scholarharvester.adapters.utils import AdapterResult


def collect(params: dict[str, str]) -> AdapterResult:
    requested_year = int(params.get("since", params.get("year", "2022")))
    campus = params.get("campus")
    discipline = params.get("major")

    source = OfficialSourceConfig(
        adapter_name="csu_system_dashboards_freshman",
        source_name="CSU Freshman Dashboard",
        publisher="California State University",
        env_var="SCHOLARSTACK_CSU_FRESHMAN_CSV_URL",
        base_url="https://www.calstate.edu/data",
        discovery_keywords=("freshman", "csv"),
    )
    source_url = resolve_official_data_url(source)
    frame = fetch_table(source_url)
    metrics, latest_year = build_metrics_from_frame(
        frame,
        cohort="freshman",
        default_campus=campus,
        default_focus=discipline,
        source_url=source_url,
        publisher=source.publisher,
        dataset_year=requested_year,
        campus_filter=campus,
        focus_filter=discipline,
        focus_kind="discipline",
    )
    if not metrics:
        raise RuntimeError(
            f"csu_system_dashboards_freshman: no metrics extracted from {source_url}. "
            "Verify column names or refine the export URL."
        )
    dataset = make_dataset(
        title="CSU Freshman Admissions Dashboard",
        year=latest_year,
        term="Fall",
        cohort="freshman",
        source_url=source_url,
    )
    return AdapterResult(dataset=dataset, metrics=metrics)
