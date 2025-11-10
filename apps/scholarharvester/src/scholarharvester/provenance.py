from __future__ import annotations

from pathlib import Path

from scholarharvester.config import config


def update_provenance(run_id: int, source: str, files: list[str], warnings: list[str] | None) -> None:
    path = Path(__file__).resolve().parents[1] / config.provenance_path
    entry = f"| {run_id} | {source} | {', '.join(files)} | {', '.join(warnings or [])} |\n"
    path.parent.mkdir(exist_ok=True, parents=True)
    if not path.exists():
        path.write_text("# Data Provenance\n\n| Run | Source | Files | Warnings |\n| --- | --- | --- | --- |\n")
    path.write_text(path.read_text() + entry)
