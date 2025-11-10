from __future__ import annotations

import asyncio

from sqlalchemy import select

from scholarharvester.database import get_session
from scholarharvester.models import (
    Campus,
    Cohort,
    Major,
    Metric,
    Source,
    Citation,
    Dataset,
)


async def main() -> None:
    async with get_session() as session:
        uc_campuses = [
            Campus(name="UC Irvine", system="UC"),
            Campus(name="UCLA", system="UC"),
            Campus(name="UC San Diego", system="UC"),
        ]
        csu_campuses = [
            Campus(name="CSU Long Beach", system="CSU"),
            Campus(name="CSU Fullerton", system="CSU"),
        ]
        session.add_all(uc_campuses + csu_campuses)
        await session.commit()

        campuses = await session.execute(select(Campus))
        campus_map = {c.name: c for c, in campuses.all()}

        majors = [
            Major(campus_id=campus_map["UC Irvine"].id, name="Mathematics", cip_code="27.0101", is_impacted="yes"),
            Major(campus_id=campus_map["UC Irvine"].id, name="Computer Science", cip_code="11.0701", is_impacted="yes"),
            Major(campus_id=campus_map["UCLA"].id, name="Mathematics", cip_code="27.0101"),
            Major(campus_id=campus_map["UC San Diego"].id, name="Computer Science", cip_code="11.0701"),
        ]
        session.add_all(majors)

        source = Source(
            name="Demo Source",
            publisher="ScholarStack Demo",
            base_url="https://demo.scholarstack.org",
            adapter="uc_info_center_transfers_major",
            default_throttle=2,
        )
        session.add(source)
        await session.flush()

        dataset = Dataset(
            source_id=source.id,
            title="Demo UC Irvine transfer math",
            year=2024,
            term="Fall",
            cohort=Cohort.transfer,
        )
        session.add(dataset)
        await session.flush()

        metric_values = [
            ("UC Irvine", "Mathematics", 3.25),
            ("UC Irvine", "Mathematics", 3.6),
        ]
        for idx, (campus, major, value) in enumerate(metric_values, start=25):
            metric = Metric(
                dataset_id=dataset.id,
                campus=campus,
                major=major,
                cohort=Cohort.transfer,
                stat_name=f"gpa_p{idx}",
                stat_value_numeric=value,
                year=2024,
                term="Fall",
            )
            session.add(metric)
            await session.flush()
            citation = Citation(
                metric_id=metric.id,
                title=f"UC Irvine transfer {major} median",
                publisher="UC Info Center",
                year=2024,
                source_url="https://www.universityofcalifornia.edu/infocenter",
                interpretation_note="Seeded demo value; verify with official report.",
            )
            session.add(citation)

        await session.commit()

if __name__ == "__main__":
    asyncio.run(main())
