import typer

from .main import app

__all__ = ["app"]

def run() -> None:  # pragma: no cover - console entrypoint
    app()
