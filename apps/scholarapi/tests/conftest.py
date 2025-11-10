import os
import asyncio

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test_scholarapi.db")
os.environ.setdefault("RATE_LIMIT", "2/minute")

import pytest
import sqlalchemy
from httpx import AsyncClient

from scholarharvester.models import (
    Base,
    Campus,
    Cohort,
    Dataset,
    Metric,
    Citation,
    SchoolType,
    Source,
    SourceSchool,
)
from scholarapi.db import engine, async_session
from scholarapi.main import app


@pytest.fixture(scope="session", autouse=True)
async def prepare_database() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(autouse=True)
async def seed_data() -> None:
    async with async_session() as session:
        uc = Campus(name="UC Irvine", system="UC")
        session.add(uc)
        source = Source(
            name="Demo Source",
            publisher="ScholarStack",
            base_url="https://demo.scholarstack.org",
            adapter="uc_info_center_transfers_major",
            default_throttle=2,
        )
        session.add(source)
        await session.flush()
        dataset = Dataset(
            source_id=source.id,
            title="Demo Metrics",
            year=2024,
            term="Fall",
            cohort=Cohort.transfer,
        )
        session.add(dataset)
        await session.flush()
        metric = Metric(
            dataset=dataset,
            campus="UC Irvine",
            major="Mathematics",
            cohort=Cohort.transfer,
            stat_name="gpa_p50",
            stat_value_numeric=3.5,
            year=2024,
            term="Fall",
            school_type=SchoolType.CommunityCollege,
        )
        session.add(metric)
        await session.flush()
        citation = Citation(
            metric=metric,
            title="Demo GPA",
            publisher="UC Info Center",
            year=2024,
            source_url="https://www.universityofcalifornia.edu/infocenter",
            interpretation_note="Seeded",
        )
        session.add(citation)
        metric2 = Metric(
            dataset=dataset,
            campus="UC Irvine",
            major="Mathematics",
            cohort=Cohort.transfer,
            stat_name="admit_rate",
            stat_value_numeric=0.62,
            year=2024,
            term="Fall",
            school_type=SchoolType.CommunityCollege,
        )
        session.add(metric2)
        await session.flush()
        citation2 = Citation(
            metric=metric2,
            title="UC Irvine admit rate",
            publisher="UC Info Center",
            year=2024,
            source_url="https://www.universityofcalifornia.edu/infocenter",
            interpretation_note="Seeded",
        )
        session.add(citation2)
        await session.commit()
    yield
    async with async_session() as session:
        await session.execute(sqlalchemy.delete(Citation))
        await session.execute(sqlalchemy.delete(Metric))
        await session.execute(sqlalchemy.delete(Dataset))
        await session.execute(sqlalchemy.delete(Campus))
        await session.execute(sqlalchemy.delete(Source))
        await session.execute(sqlalchemy.delete(SourceSchool))
        await session.commit()


@pytest.fixture
async def client() -> AsyncClient:
    async with AsyncClient(app=app, base_url="http://testserver") as ac:
        yield ac
