from __future__ import annotations

import asyncio
from typing import Optional

import typer
from sqlalchemy import func, select

from scholarharvester.config import config
from scholarharvester.database import get_session
from scholarharvester.models import Citation, Dataset, Institution, Metric
from scholarharvester.services.college_scorecard import sync_college_scorecard
from scholarharvester.services.runner import list_adapters, run_adapter

app = typer.Typer(help="ScholarHarvester CLI")

data_app = typer.Typer()
app.add_typer(data_app, name="harvest")

institutions_app = typer.Typer()
app.add_typer(institutions_app, name="institutions")

@data_app.command("list")
def _list_adapters() -> None:
    typer.echo("\n".join(list_adapters()))

def _ensure_models_loaded() -> None:
    pass

@data_app.command("run")
def run(
    adapter: str = typer.Argument(...),
    since: Optional[int] = typer.Option(None, help="Filter by year"),
    campus: Optional[str] = typer.Option(None, help="Limit campus"),
    save_raw: bool = typer.Option(False, help="Save raw file records"),
) -> None:
    params = {}
    if since:
        params["since"] = str(since)
    if campus:
        params["campus"] = campus
    typer.echo(f"Running {adapter} with {params}")
    runlog = asyncio.run(run_adapter(adapter, params, save_raw))
    typer.echo(f"Run completed: {runlog.id} with {runlog.new_records} metrics")

@data_app.command("provenance")
def provenance(
    year: Optional[int] = typer.Option(None),
    campus: Optional[str] = typer.Option(None),
) -> None:
    async def _inner() -> None:
        async with get_session() as session:
            query = select(Dataset, Metric, Citation).join(Metric).join(Citation)
            if year:
                query = query.where(Dataset.year == year)
            if campus:
                query = query.where(Metric.campus.ilike(f"%{campus}%"))
            query = query.limit(10)
            results = await session.execute(query)
            for dataset, metric, citation in results.all():
                typer.echo(
                    f"{dataset.title} ({metric.campus}) – {metric.stat_name}: {metric.stat_value_numeric or metric.stat_value_text} | {citation.title}"
                )
    asyncio.run(_inner())

@data_app.command("replay")
def replay(dataset_id: int) -> None:
    async def _inner() -> None:
        async with get_session() as session:
            dataset = await session.get(Dataset, dataset_id)
            if not dataset:
                typer.echo("Dataset not found")
                raise typer.Exit(code=1)
            adapter_name = dataset.source.adapter
            if not adapter_name:
                typer.echo("No adapter link found")
                raise typer.Exit(code=1)
            typer.echo(f"Replaying adapter {adapter_name} for dataset {dataset.id}")
            await run_adapter(adapter_name, {"campus": dataset.metrics[0].campus}, False)
    asyncio.run(_inner())


@institutions_app.command("sync-scorecard")
def sync_scorecard(
    max_records: Optional[int] = typer.Option(None, help="Optional max number of institutions to import"),
    per_page: int = typer.Option(100, min=1, max=100, help="API page size"),
    state: Optional[str] = typer.Option(None, help="Optional two-letter state filter"),
) -> None:
    api_key = config.college_scorecard_api_key
    if not api_key:
        typer.echo("COLLEGE_SCORECARD_API_KEY is required")
        raise typer.Exit(code=1)

    summary = asyncio.run(
        sync_college_scorecard(
            api_key=api_key,
            per_page=per_page,
            max_records=max_records,
            state=state,
        )
    )
    typer.echo(
        f"Imported {summary['imported']} institutions across {summary['pages']} pages"
        + (f" (source total: {summary['source_total']})" if summary["source_total"] is not None else "")
    )


@institutions_app.command("count")
def count_institutions() -> None:
    async def _inner() -> None:
        async with get_session() as session:
            total = await session.scalar(select(func.count()).select_from(Institution))
            typer.echo(str(total or 0))

    asyncio.run(_inner())
