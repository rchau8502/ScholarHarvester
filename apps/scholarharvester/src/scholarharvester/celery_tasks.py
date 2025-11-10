from __future__ import annotations

from .app import create_celery
from .registry import run_adapter

celery = create_celery()


@celery.task(name="scholarharvester.run_adapter")
def run_adapter_task(adapter: str) -> str:
    run_adapter(adapter)
    return adapter
