from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from scholarharvester.config import config

_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def _get_session_factory() -> async_sessionmaker[AsyncSession]:
    global _engine, _session_factory

    if _session_factory is None:
        try:
            _engine = create_async_engine(config.database_url, future=True)
        except ModuleNotFoundError as exc:
            raise RuntimeError(
                "Async database driver is not installed. Install project dependencies "
                "with Poetry or add `asyncpg` to the environment."
            ) from exc
        _session_factory = async_sessionmaker(_engine, expire_on_commit=False)
    return _session_factory


def get_session() -> AsyncSession:
    return _get_session_factory()()
