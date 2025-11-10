from __future__ import annotations

from typing import Any

from .base import AdapterBase


class CCCPDFAdapter(AdapterBase):
    def parse(self, raw: Any) -> list[dict[str, Any]]:
        metrics: list[dict[str, Any]] = []
        citation = raw["citation"]
        for doc in raw.get("documents", []):
            metrics.append(
                {
                    "metric_key": "evidence_pdf",
                    "metric_year": doc["year"],
                    "value_float": None,
                    "value_text": doc["title"],
                    "campus": doc["campus_slug"],
                    "campus_name": doc["campus_name"],
                    "system": "CCC",
                    "citation": {
                        "title": citation["title"],
                        "publisher": citation["publisher"],
                        "year": citation["year"],
                        "url": doc["url"],
                        "interpretation_note": doc.get("interpretation_note", citation["interpretation_note"]),
                    },
                    "dataset_name": "CCC Evidence PDFs",
                    "dataset_description": "Administrative PDFs provided by CCC campuses",
                    "table_name": "ccc_pdfs",
                    "storage_path": doc["filename"],
                }
            )
        return metrics


def build() -> CCCPDFAdapter:
    return CCCPDFAdapter(
        name="ccc_pdfs",
        endpoint="https://storage.googleapis.com/ccc-admin-data/ccc_pdfs/demo.json",
    )
