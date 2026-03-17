from __future__ import annotations

from pathlib import Path

import pytest

from scholarharvester.adapters import ADAPTERS

FIXTURE_DIR = Path(__file__).resolve().parent / "fixtures"
ADAPTER_FIXTURE_ENV = {
    "uc_info_center_transfers_major": ("SCHOLARSTACK_UC_TRANSFERS_CSV_URL", "uc_transfers.csv"),
    "uc_info_center_freshman_discipline": ("SCHOLARSTACK_UC_FRESHMAN_CSV_URL", "uc_freshman.csv"),
    "uc_info_center_admissions_source_school": ("SCHOLARSTACK_UC_SOURCE_SCHOOL_CSV_URL", "uc_source_school.csv"),
    "csu_system_dashboards_transfer": ("SCHOLARSTACK_CSU_TRANSFER_CSV_URL", "csu_transfer.csv"),
    "csu_system_dashboards_freshman": ("SCHOLARSTACK_CSU_FRESHMAN_CSV_URL", "csu_freshman.csv"),
    "cccco_datamart_transfers": ("SCHOLARSTACK_CCCCO_TRANSFER_CSV_URL", "cccco_transfers.csv"),
    "ccc_catalog_courses": ("SCHOLARSTACK_CCC_CATALOG_CSV_URL", "ccc_catalog.csv"),
    "ccc_articulation_pdfs": ("SCHOLARSTACK_CCC_ARTICULATION_CSV_URL", "ccc_articulation.csv"),
}


@pytest.mark.parametrize("name, adapter", ADAPTERS.items())
def test_adapter_returns_metrics(name: str, adapter: callable, monkeypatch: pytest.MonkeyPatch) -> None:
    env_var, fixture_name = ADAPTER_FIXTURE_ENV[name]
    monkeypatch.setenv("SCHOLARHARVESTER_ALLOW_LOCAL_FIXTURES", "1")
    monkeypatch.setenv(env_var, str(FIXTURE_DIR / fixture_name))

    result = adapter({})
    assert result.metrics, f"{name} should emit metrics"
    assert result.dataset.title
    for metric in result.metrics:
        assert metric.citations, f"{name} metric missing citation"
