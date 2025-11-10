from __future__ import annotations

from typing import Any

from .base import AdapterBase


class UCAdmissionsAdapter(AdapterBase):
    def parse(self, raw: Any) -> list[dict[str, Any]]:
        metrics: list[dict[str, Any]] = []
        for campus in raw.get("campuses", []):
            citation = {
                "title": raw["citation"]["title"],
                "publisher": raw["citation"]["publisher"],
                "year": raw["citation"]["year"],
                "url": raw["citation"]["url"],
                "interpretation_note": "UC admissions reporting",
            }
            metrics.append(
                {
                    "metric_key": "admit_rate",
                    "metric_year": raw["year"],
                    "value_float": campus["admit_rate"],
                    "campus": campus["slug"],
                    "campus_name": campus["name"],
                    "system": "UC",
                    "citation": citation,
                    "dataset_name": "UC Undergraduate Admissions",
                    "dataset_description": "Undergraduate admissions summary for UC campuses",
                    "table_name": "uc_admissions",
                }
            )
            metrics.append(
                {
                    "metric_key": "gpa_p50",
                    "metric_year": raw["year"],
                    "value_float": campus["gpa_p50"],
                    "campus": campus["slug"],
                    "campus_name": campus["name"],
                    "system": "UC",
                    "citation": citation,
                    "dataset_name": "UC Undergraduate Admissions",
                    "dataset_description": "Undergraduate admissions summary for UC campuses",
                    "table_name": "uc_admissions",
                }
            )
        return metrics


def build() -> UCAdmissionsAdapter:
    return UCAdmissionsAdapter(
        name="uc",
        endpoint="https://opendata.ucop.edu/api/uc_admissions_demo.json",
    )
