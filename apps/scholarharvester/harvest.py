from __future__ import annotations

import argparse
import asyncio
from datetime import datetime
import time
from typing import Dict

import httpx

from scholarharvester.adapters import ADAPTERS
from scholarharvester.adapters.utils import AdapterResult
from scholarharvester.provenance import update_provenance
from scholarharvester.registry import find_source, record_robot_decision
from scholarharvester.supa_writer import supabase_conn, upsert_citation, upsert_dataset, upsert_metric


async def _fetch_robots(base_url: str) -> str:
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(base_url.rstrip("/") + "/robots.txt")
            return resp.text
    except httpx.HTTPError:
        return ""


def run_harvest(adapter_name: str, params: Dict[str, str]) -> None:
    source_conf = find_source(adapter_name)
    if not source_conf:
        raise ValueError(f"Unknown adapter {adapter_name}")

    robots_text = asyncio.run(_fetch_robots(source_conf.get("base_url", "")))
    record_robot_decision(source_conf, robots_text)

    time.sleep(source_conf.get("throttle_seconds", 2))

    adapter = ADAPTERS.get(adapter_name)
    if not adapter:
        raise ValueError(f"Adapter implementation missing for {adapter_name}")

    result: AdapterResult = adapter(params)
    inserted = 0
    with supabase_conn() as connection:
        dataset_id = upsert_dataset(connection, result.dataset, source_conf["name"])
        for metric_payload in result.metrics:
            metric_id = upsert_metric(connection, dataset_id, metric_payload)
            for citation in metric_payload.citations or []:
                upsert_citation(connection, metric_id, citation)
            inserted += 1

    run_id = int(datetime.utcnow().timestamp())
    update_provenance(run_id, source_conf["name"], [source_conf.get("base_url", "")], warnings=[])
    print(f"{adapter_name}: inserted {inserted} metrics")


def main() -> None:
    parser = argparse.ArgumentParser(description="Run ScholarHarvester adapters into Supabase")
    parser.add_argument("--adapter", action="append", help="Adapter name (defaults to all)")
    parser.add_argument("--since", type=int, help="Filter by year")
    parser.add_argument("--campus", help="Limit to a campus")
    args = parser.parse_args()

    params: Dict[str, str] = {}
    if args.since:
        params["since"] = str(args.since)
    if args.campus:
        params["campus"] = args.campus

    targets = args.adapter or list(ADAPTERS.keys())
    for adapter_name in targets:
        run_harvest(adapter_name, params)


if __name__ == "__main__":
    main()
