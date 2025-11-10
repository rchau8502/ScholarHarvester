from __future__ import annotations

from typing import Any

from .base import AdapterBase


class IPEDSDegreesAdapter(AdapterBase):
    def parse(self, raw: Any) -> list[dict[str, Any]]:
        metrics: list[dict[str, Any]] = []
        citation = raw["citation"]
        for metric in raw.get("metrics", []):
            metrics.append(
                {
                    "metric_key": metric["metric_key"],
                    "metric_year": metric["year"],
                    "value_float": metric["value"],
                    "campus": metric["campus_slug"],
                    "campus_name": metric["campus_name"],
                    "system": "IPEDS",
                    "citation": {
                        "title": citation["title"],
                        "publisher": citation["publisher"],
                        "year": citation["year"],
                        "url": citation["url"],
                        "interpretation_note": citation["interpretation_note"],
                    },
                    "dataset_name": "IPEDS Completions",
                    "dataset_description": "IPEDS completions by campus",
                    "table_name": "ipeds_completions",
                }
            )
        return metrics


def build() -> IPEDSDegreesAdapter:
    return IPEDSDegreesAdapter(
        name="ipeds",
        endpoint="https://nces.ed.gov/ipeds/api/completions/demo.json",
    )
