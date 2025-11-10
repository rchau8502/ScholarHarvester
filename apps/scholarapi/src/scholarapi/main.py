from __future__ import annotations

import os
from functools import lru_cache

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address

from .api import repository
from .api.schemas import Campus, Metric, Citation, CampusProfile
from .db.session import get_session

RATE_LIMIT = int(os.getenv("RATE_LIMIT_PER_MINUTE", "240"))
ALLOWED_ORIGINS = os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:3000").split(",")

limiter = Limiter(key_func=get_remote_address, default_limits=[f"{RATE_LIMIT}/minute"])


@lru_cache
def create_app() -> FastAPI:
    app = FastAPI(title="ScholarAPI", version="1.0.0")
    app.state.limiter = limiter
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/v1/campuses", response_model=list[Campus])
    @limiter.limit("5/second")
    async def campuses(limit: int = Query(default=20, le=100), offset: int = Query(default=0)):
        async with get_session() as session:
            return await repository.list_campuses(session, limit, offset)

    @app.get("/v1/metrics", response_model=list[Metric])
    @limiter.limit("5/second")
    async def metrics(
        campus: str | None = Query(default=None),
        metric_key: str | None = Query(default=None),
    ):
        async with get_session() as session:
            return await repository.list_metrics(session, campus, metric_key)

    @app.get("/v1/provenance", response_model=list[Citation])
    @limiter.limit("5/second")
    async def provenance():
        async with get_session() as session:
            return await repository.list_provenance(session)

    @app.get("/v1/profile/{campus_slug}", response_model=CampusProfile)
    @limiter.limit("5/second")
    async def profile(campus_slug: str):
        async with get_session() as session:
            profile = await repository.fetch_profile(session, campus_slug)
            if profile is None:
                raise HTTPException(status_code=404, detail="Campus not found")
            return profile

    return app


app = create_app()


def run() -> None:  # pragma: no cover
    import uvicorn

    uvicorn.run(
        "scholarapi.main:app",
        host=os.getenv("UVICORN_HOST", "0.0.0.0"),
        port=int(os.getenv("UVICORN_PORT", "8080")),
        reload=bool(os.getenv("UVICORN_RELOAD", "")),
    )
