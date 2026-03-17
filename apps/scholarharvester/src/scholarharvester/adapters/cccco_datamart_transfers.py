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

    source = OfficialSourceConfig(
        adapter_name="cccco_datamart_transfers",
        source_name="CCCCO Datamart Transfers",
        publisher="California Community Colleges Chancellor's Office",
        env_var="SCHOLARSTACK_CCCCO_TRANSFER_CSV_URL",
        base_url="https://datamart.cccco.edu",
        discovery_keywords=("transfer", "csv"),
    )
    source_url = resolve_official_data_url(source)
    frame = fetch_table(source_url)
    metrics, latest_year = build_metrics_from_frame(
        frame,
        cohort="transfer",
        default_campus=campus or "All CCCs",
        default_focus=None,
        source_url=source_url,
        publisher=source.publisher,
        dataset_year=requested_year,
        campus_filter=campus,
        focus_filter=None,
        focus_kind="none",
        source_school_kind="CommunityCollege",
    )
    if not metrics:
        raise RuntimeError(
            f"cccco_datamart_transfers: no metrics extracted from {source_url}. "
            "Verify column names or refine the export URL."
        )
    dataset = make_dataset(
        title="CCCCO Datamart Transfers",
        year=latest_year,
        term="Academic Year",
        cohort="transfer",
        source_url=source_url,
    )
    return AdapterResult(dataset=dataset, metrics=metrics)
