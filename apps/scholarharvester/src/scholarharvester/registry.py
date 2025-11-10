from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List

import yaml

REGISTRY_PATH = Path(__file__).resolve().parents[1] / "SOURCE_REGISTRY.yaml"

class SourceConfig(Dict):
    pass


def load_sources() -> List[SourceConfig]:
    with REGISTRY_PATH.open("r", encoding="utf-8") as fh:
        doc = yaml.safe_load(fh)
    return doc.get("sources", [])


def find_source(adapter_name: str) -> SourceConfig | None:
    for src in load_sources():
        if src.get("adapter") == adapter_name:
            return src
    return None


def record_robot_decision(config: SourceConfig, rules: str) -> None:
    cache_path = REGISTRY_PATH.with_suffix(".robots.json")
    existing = {}
    if cache_path.exists():
        existing = json.loads(cache_path.read_text())
    existing[config["adapter"]] = {
        "rules": rules,
        "base_url": config.get("base_url"),
    }
    cache_path.write_text(json.dumps(existing, indent=2))
