from __future__ import annotations

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from .schemas import Campus, Metric, Citation, CampusProfile


async def list_campuses(session: AsyncSession, limit: int, offset: int) -> list[Campus]:
    result = await session.execute(
        text("SELECT slug, name, system FROM campus ORDER BY name LIMIT :limit OFFSET :offset"),
        {"limit": limit, "offset": offset},
    )
    return [Campus(slug=row.slug, name=row.name, system=row.system) for row in result]


async def list_metrics(session: AsyncSession, campus: str | None, metric_key: str | None) -> list[Metric]:
    query = """
        SELECT m.metric_key, m.metric_year, m.value_float, m.value_text,
               c.slug AS campus_slug,
               cit.title AS citation_title, cit.publisher AS citation_publisher,
               cit.publication_year AS citation_year, cit.url AS citation_url,
               cit.interpretation_note AS interpretation_note
        FROM metric m
        JOIN campus c ON m.campus_id = c.id
        JOIN citation cit ON m.citation_id = cit.id
        WHERE (:campus IS NULL OR c.slug = :campus)
          AND (:metric_key IS NULL OR m.metric_key = :metric_key)
        ORDER BY m.metric_year DESC
    """
    result = await session.execute(
        text(query),
        {"campus": campus, "metric_key": metric_key},
    )
    return [Metric(**row._mapping) for row in result]


async def list_provenance(session: AsyncSession) -> list[Citation]:
    result = await session.execute(
        text(
            """
            SELECT DISTINCT m.metric_key AS metric_key,
                   cit.title AS citation_title,
                   cit.publisher AS publisher,
                   cit.publication_year AS publication_year,
                   cit.url AS url,
                   cit.interpretation_note AS interpretation_note
            FROM metric m
            JOIN citation cit ON m.citation_id = cit.id
            ORDER BY metric_key
            """
        )
    )
    return [Citation(**row._mapping) for row in result]


async def fetch_profile(session: AsyncSession, campus_slug: str) -> CampusProfile | None:
    campus_rows = await session.execute(
        text("SELECT slug, name, system FROM campus WHERE slug = :slug"),
        {"slug": campus_slug},
    )
    campus_row = campus_rows.one_or_none()
    if campus_row is None:
        return None
    metrics = await list_metrics(session, campus_slug, None)
    return CampusProfile(campus=Campus(**campus_row._mapping), metrics=metrics)
