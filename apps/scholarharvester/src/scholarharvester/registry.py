from __future__ import annotations

from collections.abc import Callable
from typing import Protocol

from structlog import get_logger

from .db.session import get_session
from . import tasks
from .adapters import build_uc, build_csu, build_cccco, build_ipeds, build_ccc_pdfs

logger = get_logger(__name__)


class Adapter(Protocol):
    name: str

    def run(self) -> list[dict[str, str]]:  # metric dictionaries
        ...


ADAPTERS: dict[str, Adapter] = {}


def register_adapter(key: str, adapter: Adapter) -> None:
    ADAPTERS[key] = adapter


def run_adapter(key: str) -> None:
    adapter = ADAPTERS[key]
    logger.info("adapter.start", key=key)
    metrics = adapter.run()
    logger.info("adapter.metrics", key=key, count=len(metrics))

    with get_session() as session:
        for metric in metrics:
            tasks.persist_metric(session, metric)
    logger.info("adapter.finish", key=key)


register_adapter("uc", build_uc())
register_adapter("csu", build_csu())
register_adapter("cccco", build_cccco())
register_adapter("ipeds", build_ipeds())
register_adapter("ccc_pdfs", build_ccc_pdfs())
