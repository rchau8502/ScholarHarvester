from __future__ import annotations

import json
from pathlib import Path
from typing import Annotated

import pendulum
import typer

from ..config import settings
from ..legal import robots_registry
from ..provenance import export_provenance
from ..registry import ADAPTERS, run_adapter
from ..seeds import seed_demo

app = typer.Typer(help="ScholarHarvester command line interface")


@app.command()
def adapters() -> None:
    """List available adapters."""
    typer.echo("Available adapters:")
    for key in sorted(ADAPTERS):
        typer.echo(f"- {key}")


@app.command()
def harvest(adapter: Annotated[str, typer.Argument(help="Adapter key to run")]):
    if adapter not in ADAPTERS:
        raise typer.BadParameter(f"Unknown adapter '{adapter}'. Use `adapters` to list options.")
    run_adapter(adapter)
    typer.echo(f"Harvest {adapter} completed")


@app.command()
def provenance_export(output: Annotated[Path, typer.Option(help="Output markdown file") | None] = None):
    path = output or Path(settings.provenance_file)
    export_provenance(path)
    typer.echo(f"Wrote provenance ledger to {path}")


@app.command()
def robots_review(url: Annotated[str, typer.Argument(help="URL to inspect")]):
    decision = robots_registry.get(url)
    if decision is None:
        typer.echo("No decision recorded yet. Run an adapter that touches this domain first.")
        raise typer.Exit(code=1)
    typer.echo(json.dumps(decision.__dict__, indent=2))


@app.command()
def seed(kind: Annotated[str, typer.Argument(help="Seed dataset (demo)")]):
    if kind != "demo":
        raise typer.BadParameter("Only 'demo' seed is available")
    seed_demo()
    export_provenance(Path(settings.provenance_file))
    typer.echo("Inserted demo seed data")


@app.command()
def status() -> None:
    typer.echo(f"Provenance ledger: {settings.provenance_file}")
    typer.echo(f"Adapters loaded: {', '.join(sorted(ADAPTERS))}")
    typer.echo(f"Last robots decisions: {len(robots_registry._decisions)} recorded")
    typer.echo(f"Timestamp: {pendulum.now().to_iso8601_string()}")
