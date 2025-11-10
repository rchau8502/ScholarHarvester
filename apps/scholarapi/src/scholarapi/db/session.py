from __future__ import annotations

import os
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

DEFAULT_URL = "postgresql+asyncpg://scholar:scholar@localhost:5432/scholarstack"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_URL)

engine = create_async_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


@asynccontextmanager
async def get_session() -> AsyncSession:
    session: AsyncSession = SessionLocal()
    try:
        yield session
    finally:
        await session.close()
