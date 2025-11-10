from __future__ import annotations

from typing import Any

from .base import AdapterBase


class CSUAdmissionsAdapter(AdapterBase):
    def parse(self, raw: Any) -> list[dict[str, Any]]:
        citation = raw["citation"]
        metrics: list[dict[str, Any]] = []
        for campus in raw.get("campuses", []):
            metrics.append(
                {
                    "metric_key": "admit_rate",
                    "metric_year": raw["year"],
                    "value_float": campus["admit_rate"],
                    "campus": campus["slug"],
                    "campus_name": campus["name"],
                    "system": "CSU",
                    "citation": {
                        "title": citation["title"],
                        "publisher": citation["publisher"],
                        "year": citation["year"],
                        "url": citation["url"],
                        "interpretation_note": "CSU systemwide admissions",
                    },
                    "dataset_name": "CSU Enrollment Management",
                    "dataset_description": "CSU admissions summary",
                    "table_name": "csu_admissions",
                }
            )
        return metrics


def build() -> CSUAdmissionsAdapter:
    return CSUAdmissionsAdapter(
        name="csu",
        endpoint="https://www.calstate.edu/datadash/api/csu_admissions_demo.json",
    )
