from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from structlog import get_logger

from ..legal import guarded_get, sleep

logger = get_logger(__name__)


@dataclass
class AdapterBase:
    name: str
    endpoint: str

    async def fetch(self) -> Any:  # pragma: no cover - to be overridden
        raise NotImplementedError

    def parse(self, raw: Any) -> list[dict[str, Any]]:  # pragma: no cover - to be overridden
        raise NotImplementedError

    def run(self) -> list[dict[str, Any]]:
        import asyncio

        async def _run() -> list[dict[str, Any]]:
            logger.info("adapter.fetch", adapter=self.name, endpoint=self.endpoint)
            response = await guarded_get(self.endpoint)
            await sleep()
            payload = response.json()
            metrics = self.parse(payload)
            logger.info("adapter.parse", adapter=self.name, count=len(metrics))
            return metrics

        return asyncio.run(_run())
