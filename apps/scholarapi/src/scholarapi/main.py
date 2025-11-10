from __future__ import annotations

from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from scholarapi.config import settings
from scholarapi.db import get_session
from scholarapi.schemas import (
    CampusOut,
    CitationOut,
    Cohort,
    DatasetOut,
    MajorOut,
    MetricOut,
    MetricPage,
    ProfileOut,
    ProvenanceOut,
    SchoolType,
    SourceSchoolOut,
)
from scholarharvester.models import (
    Citation,
    Cohort as ModelCohort,
    Dataset,
    Major,
    Metric,
    SchoolType as ModelSchoolType,
    Campus,
    SourceSchool,
)

limiter = Limiter(key_func=get_remote_address, default_limits=[settings.rate_limit])
app = FastAPI(title="ScholarAPI", version="0.1.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, lambda request, exc: HTTPException(status_code=429, detail="Rate limit exceeded"))
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET"],
    allow_headers=["*"],
)


async def _to_metric_out(metric: Metric) -> MetricOut:
    citations = [
        CitationOut(
            title=c.title,
            publisher=c.publisher,
            year=c.year,
            source_url=c.source_url,
            interpretation_note=c.interpretation_note,
        )
        for c in metric.citations
    ]
    return MetricOut(
        id=metric.id,
        campus=metric.campus,
        major=metric.major,
        discipline=metric.discipline,
        source_school=metric.source_school,
        school_type=SchoolType(metric.school_type.value) if metric.school_type else None,
        cohort=Cohort(metric.cohort.value),
        stat_name=metric.stat_name,
        stat_value_numeric=float(metric.stat_value_numeric) if metric.stat_value_numeric is not None else None,
        stat_value_text=metric.stat_value_text,
        unit=metric.unit,
        percentile=metric.percentile,
        year=metric.year,
        term=metric.term,
        notes=metric.notes,
        citations=citations,
    )


@limiter.limit(settings.rate_limit)
@app.get("/healthz", status_code=status.HTTP_200_OK)
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


@limiter.limit(settings.rate_limit)
@app.get("/v1/campuses", response_model=List[CampusOut])
async def list_campuses(
    system: Optional[str] = Query(None, description="Filter by UC or CSU"),
    session: AsyncSession = Depends(get_session),
) -> List[CampusOut]:
    stmt = select(Campus)
    if system:
        stmt = stmt.where(Campus.system == system)
    result = await session.execute(stmt)
    return [CampusOut(name=item.name, system=item.system) for item in result.scalars()]


@limiter.limit(settings.rate_limit)
@app.get("/v1/majors", response_model=List[MajorOut])
async def list_majors(
    campus: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    session: AsyncSession = Depends(get_session),
) -> List[MajorOut]:
    stmt = select(Major, Campus).join(Campus)
    if campus:
        stmt = stmt.where(Campus.name.ilike(f"%{campus}%"))
    if search:
        stmt = stmt.where(Major.name.ilike(f"%{search}%"))
    result = await session.execute(stmt)
    majors = []
    for major, campus_obj in result.all():
        majors.append(
            MajorOut(
                id=major.id,
                name=major.name,
                campus=campus_obj.name,
                cip_code=major.cip_code,
                is_impacted=major.is_impacted,
            )
        )
    return majors


@limiter.limit(settings.rate_limit)
@app.get("/v1/source-schools", response_model=List[SourceSchoolOut])
async def list_source_schools(
    type: Optional[SchoolType] = Query(None),
    search: Optional[str] = Query(None),
    session: AsyncSession = Depends(get_session),
) -> List[SourceSchoolOut]:
    query = select(SourceSchool)
    if type:
        query = query.where(SourceSchool.school_type == ModelSchoolType(type.value))
    if search:
        query = query.where(SourceSchool.name.ilike(f"%{search}%"))
    results = await session.execute(query)
    return [
        SourceSchoolOut(
            name=school.name,
            school_type=SchoolType(school.school_type.value),
            city=school.city,
            state=school.state,
        )
        for school in results.scalars().all()
    ]


@limiter.limit(settings.rate_limit)
@app.get("/v1/datasets", response_model=List[DatasetOut])
async def list_datasets(
    year: Optional[int] = Query(None),
    cohort: Optional[Cohort] = Query(None),
    session: AsyncSession = Depends(get_session),
) -> List[DatasetOut]:
    stmt = select(Dataset)
    if year:
        stmt = stmt.where(Dataset.year == year)
    if cohort:
        stmt = stmt.where(Dataset.cohort == ModelCohort(cohort.value))
    result = await session.execute(stmt)
    return [
        DatasetOut(
            id=dataset.id,
            title=dataset.title,
            year=dataset.year,
            term=dataset.term,
            cohort=Cohort(dataset.cohort.value),
            notes=dataset.notes,
        )
        for dataset in result.scalars().all()
    ]


@limiter.limit(settings.rate_limit)
@app.get("/v1/metrics", response_model=MetricPage)
async def list_metrics(
    cohort: Optional[Cohort] = Query(None),
    campus: Optional[str] = Query(None),
    major: Optional[str] = Query(None),
    discipline: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    year_min: Optional[int] = Query(None),
    year_max: Optional[int] = Query(None),
    source_school: Optional[str] = Query(None),
    school_type: Optional[SchoolType] = Query(None),
    stat_name: Optional[str] = Query(None),
    percentile: Optional[str] = Query(None),
    cursor: Optional[int] = Query(None),
    limit: int = Query(25, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
) -> MetricPage:
    stmt = select(Metric).options(selectinload(Metric.citations)).order_by(Metric.id)
    if cursor:
        stmt = stmt.where(Metric.id > cursor)
    if cohort:
        stmt = stmt.where(Metric.cohort == ModelCohort(cohort.value))
    if campus:
        stmt = stmt.where(Metric.campus.ilike(f"%{campus}%"))
    if major:
        stmt = stmt.where(Metric.major.ilike(f"%{major}%"))
    if discipline:
        stmt = stmt.where(Metric.discipline.ilike(f"%{discipline}%"))
    if year:
        stmt = stmt.where(Metric.year == year)
    if year_min:
        stmt = stmt.where(Metric.year >= year_min)
    if year_max:
        stmt = stmt.where(Metric.year <= year_max)
    if source_school:
        stmt = stmt.where(Metric.source_school.ilike(f"%{source_school}%"))
    if school_type:
        stmt = stmt.where(Metric.school_type == ModelSchoolType(school_type.value))
    if stat_name:
        stmt = stmt.where(Metric.stat_name.ilike(f"%{stat_name}%"))
    if percentile:
        stmt = stmt.where(Metric.percentile == percentile)
    result = await session.execute(stmt.limit(limit + 1))
    metrics = result.scalars().all()
    next_cursor = metrics[-1].id if len(metrics) > limit else None
    return MetricPage(
        items=[await _to_metric_out(metric) for metric in metrics[:limit]],
        next_cursor=next_cursor,
    )


async def _profile_stats(
    cohort: Cohort,
    campus: Optional[str],
    major: Optional[str],
    discipline: Optional[str],
    years: Optional[list[int]],
    session: AsyncSession,
) -> ProfileOut:
    stmt = select(Metric).options(selectinload(Metric.citations)).where(Metric.cohort == ModelCohort(cohort.value))
    if campus:
        stmt = stmt.where(Metric.campus.ilike(f"%{campus}%"))
    if major:
        stmt = stmt.where(Metric.major.ilike(f"%{major}%"))
    if discipline:
        stmt = stmt.where(Metric.discipline.ilike(f"%{discipline}%"))
    if years:
        stmt = stmt.where(Metric.year.in_(years))
    result = await session.execute(stmt.order_by(Metric.year.desc()))
    metrics = result.scalars().all()
    if not metrics:
        raise HTTPException(status_code=404, detail="No profile data found")

    return ProfileOut(
        campus=metrics[0].campus,
        cohort=cohort,
        major=major,
        discipline=discipline,
        years=sorted({metric.year for metric in metrics}),
        metrics=[await _to_metric_out(metric) for metric in metrics],
    )


@limiter.limit(settings.rate_limit)
@app.get("/v1/profile/transfer", response_model=ProfileOut)
async def transfer_profile(
    campus: Optional[str] = Query(None),
    major: Optional[str] = Query(None),
    years: Optional[list[int]] = Query(None),
    session: AsyncSession = Depends(get_session),
) -> ProfileOut:
    return await _profile_stats(
        cohort=Cohort.transfer, campus=campus, major=major, discipline=None, years=years, session=session
    )


@limiter.limit(settings.rate_limit)
@app.get("/v1/profile/freshman", response_model=ProfileOut)
async def freshman_profile(
    campus: Optional[str] = Query(None),
    discipline: Optional[str] = Query(None),
    years: Optional[list[int]] = Query(None),
    session: AsyncSession = Depends(get_session),
) -> ProfileOut:
    return await _profile_stats(
        cohort=Cohort.freshman, campus=campus, major=None, discipline=discipline, years=years, session=session
    )


@limiter.limit(settings.rate_limit)
@app.get("/v1/provenance", response_model=List[ProvenanceOut])
async def provenance(
    campus: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    session: AsyncSession = Depends(get_session),
) -> List[ProvenanceOut]:
    stmt = select(Dataset, Metric, Citation).join(Metric).join(Citation)
    if campus:
        stmt = stmt.where(Metric.campus.ilike(f"%{campus}%"))
    if year:
        stmt = stmt.where(Dataset.year == year)
    result = await session.execute(stmt.limit(25))
    groups: dict[int, ProvenanceOut] = {}
    for dataset, metric, citation in result.fetchall():
        if dataset.id not in groups:
            groups[dataset.id] = ProvenanceOut(
                dataset=DatasetOut(
                    id=dataset.id,
                    title=dataset.title,
                    year=dataset.year,
                    term=dataset.term,
                    cohort=Cohort(dataset.cohort.value),
                    notes=dataset.notes,
                ),
                campus=metric.campus,
                citations=[],
            )
        groups[dataset.id].citations.append(
            CitationOut(
                title=citation.title,
                publisher=citation.publisher,
                year=citation.year,
                source_url=citation.source_url,
                interpretation_note=citation.interpretation_note,
            )
        )
    return list(groups.values())
