from __future__ import annotations

import asyncio
import time
from contextlib import asynccontextmanager
from dataclasses import dataclass
from typing import AsyncIterator
from urllib.parse import urlparse

import httpx
from structlog import get_logger

from .config import settings

logger = get_logger(__name__)


class AssistAccessError(RuntimeError):
    """Raised when an ASSIST.org resource is requested."""


@dataclass
class RobotsDecision:
    url: str
    allowed: bool
    reason: str


class RobotsRegistry:
    """Stores robots decisions in-memory and optionally persists them."""

    def __init__(self) -> None:
        self._decisions: dict[str, RobotsDecision] = {}

    def record(self, decision: RobotsDecision) -> None:
        logger.info("robots.decision", url=decision.url, allowed=decision.allowed, reason=decision.reason)
        self._decisions[decision.url] = decision

    def get(self, url: str) -> RobotsDecision | None:
        return self._decisions.get(url)


robots_registry = RobotsRegistry()


async def ensure_legal(url: str, client: httpx.AsyncClient) -> RobotsDecision:
    parsed = urlparse(url)
    if parsed.hostname and parsed.hostname.lower() in settings.blocklisted_domains:
        raise AssistAccessError("ASSIST.org access is forbidden by policy")

    cached = robots_registry.get(url)
    if cached:
        return cached

    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    try:
        response = await client.get(robots_url, timeout=10)
    except httpx.HTTPError as exc:  # pragma: no cover - network failure path
        decision = RobotsDecision(url=robots_url, allowed=False, reason=f"robots fetch failed: {exc}")
        robots_registry.record(decision)
        return decision

    allowed = response.status_code == 200 and "disallow" not in response.text.lower()
    reason = "robots allows" if allowed else "robots disallow detected"
    decision = RobotsDecision(url=robots_url, allowed=allowed, reason=reason)
    robots_registry.record(decision)
    return decision


@asynccontextmanager
async def throttled_client() -> AsyncIterator[httpx.AsyncClient]:
    async with httpx.AsyncClient(headers={"User-Agent": settings.user_agent}) as client:
        yield client


_last_hit: dict[str, float] = {}


def _respect_throttle(domain: str) -> None:
    now = time.monotonic()
    last = _last_hit.get(domain)
    if last is not None:
        elapsed = now - last
        if elapsed < settings.throttle_seconds:
            time.sleep(settings.throttle_seconds - elapsed)
    _last_hit[domain] = time.monotonic()


async def guarded_get(url: str) -> httpx.Response:
    async with throttled_client() as client:
        parsed = urlparse(url)
        _respect_throttle(parsed.hostname or "")
        decision = await ensure_legal(url, client)
        if not decision.allowed:
            raise PermissionError(f"robots disallows fetching {url}: {decision.reason}")
        response = await client.get(url, timeout=30)
        response.raise_for_status()
        return response


async def sleep(seconds: float | None = None) -> None:
    await asyncio.sleep(seconds or settings.throttle_seconds)
