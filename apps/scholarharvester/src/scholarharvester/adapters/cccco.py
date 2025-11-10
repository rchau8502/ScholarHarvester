from __future__ import annotations

from typing import Any

from .base import AdapterBase


class CCCCOTransferAdapter(AdapterBase):
    def parse(self, raw: Any) -> list[dict[str, Any]]:
        citation = raw["citation"]
        metrics: list[dict[str, Any]] = []
        for record in raw.get("records", []):
            metrics.append(
                {
                    "metric_key": record["metric_key"],
                    "metric_year": record["year"],
                    "value_float": record.get("value"),
                    "campus": record["campus_slug"],
                    "campus_name": record["campus_name"],
                    "system": record.get("system", "CCC"),
                    "citation": {
                        "title": citation["title"],
                        "publisher": citation["publisher"],
                        "year": citation["year"],
                        "url": citation["url"],
                        "interpretation_note": record.get("interpretation_note", citation["interpretation_note"]),
                    },
                    "dataset_name": "CCCCO Student Success Metrics",
                    "dataset_description": "Transfer pipeline metrics for CCC to UC/CSU",
                    "table_name": "cccco_transfer",
                }
            )
        return metrics


def build() -> CCCCOTransferAdapter:
    return CCCCOTransferAdapter(
        name="cccco",
        endpoint="https://public.tableau.com/views/CCCCO_transfer/demo.json",
    )
