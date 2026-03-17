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
    focus = params.get("major")

    source = OfficialSourceConfig(
        adapter_name="uc_info_center_admissions_source_school",
        source_name="UC Source School Admissions",
        publisher="University of California",
        env_var="SCHOLARSTACK_UC_SOURCE_SCHOOL_CSV_URL",
        base_url="https://www.universityofcalifornia.edu/infocenter",
        discovery_keywords=("source", "school", "admission", "csv"),
    )
    source_url = resolve_official_data_url(source)
    frame = fetch_table(source_url)
    metrics, latest_year = build_metrics_from_frame(
        frame,
        cohort="freshman",
        default_campus=campus,
        default_focus=focus,
        source_url=source_url,
        publisher=source.publisher,
        dataset_year=requested_year,
        campus_filter=campus,
        focus_filter=focus,
        focus_kind="major",
        source_school_kind="HighSchool",
    )
    if not metrics:
        raise RuntimeError(
            f"uc_info_center_admissions_source_school: no metrics extracted from {source_url}. "
            "Verify column names or refine the export URL."
        )
    dataset = make_dataset(
        title="UC Admissions by Source School",
        year=latest_year,
        term="Fall",
        cohort="freshman",
        source_url=source_url,
    )
    return AdapterResult(dataset=dataset, metrics=metrics)
