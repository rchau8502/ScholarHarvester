from __future__ import annotations

from typing import Any

import httpx
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import insert

from scholarharvester.database import get_session
from scholarharvester.models import Institution

SCORECARD_URL = "https://api.data.gov/ed/collegescorecard/v1/schools"
SCORECARD_FIELDS = [
    "id",
    "school.name",
    "school.city",
    "school.state",
    "school.zip",
    "school.school_url",
    "school.price_calculator_url",
    "school.locale",
    "school.locale_id",
    "school.ownership",
    "school.carnegie_basic",
    "school.degrees_awarded.predominant",
    "school.main_campus",
    "school.operating",
    "latest.student.size",
    "latest.admissions.admission_rate.overall",
    "latest.admissions.sat_scores.average.overall",
    "latest.admissions.act_scores.midpoint.cumulative",
    "latest.cost.avg_net_price.overall",
    "latest.cost.tuition.in_state",
    "latest.cost.tuition.out_of_state",
    "latest.aid.percent_receiving_federal_student_aid",
    "latest.completion.rate",
    "latest.student.retention_rate.four_year.full_time",
    "latest.earnings.10_yrs_after_entry.median",
    "location.lat",
    "location.lon",
]

OWNERSHIP_LABELS = {
    1: "Public",
    2: "Private nonprofit",
    3: "Private for-profit",
}

DEGREE_LABELS = {
    1: "Certificate",
    2: "Associate",
    3: "Bachelor's",
    4: "Graduate",
}

LOCALE_LABELS = {
    11: "City: Large",
    12: "City: Midsize",
    13: "City: Small",
    21: "Suburb: Large",
    22: "Suburb: Midsize",
    23: "Suburb: Small",
    31: "Town: Fringe",
    32: "Town: Distant",
    33: "Town: Remote",
    41: "Rural: Fringe",
    42: "Rural: Distant",
    43: "Rural: Remote",
}


def _as_int(value: Any) -> int | None:
    if value is None or value == "":
        return None
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


def _as_float(value: Any) -> float | None:
    if value is None or value == "":
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _as_str(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _normalize_website(value: Any) -> str | None:
    website = _as_str(value)
    if not website:
        return None
    if website.startswith("http://") or website.startswith("https://"):
        return website
    return f"https://{website}"


def _map_row(result: dict[str, Any]) -> dict[str, Any] | None:
    school = result.get("school") or {}
    latest = result.get("latest") or {}
    admissions = latest.get("admissions") or {}
    cost = latest.get("cost") or {}
    aid = latest.get("aid") or {}
    student = latest.get("student") or {}
    earnings = latest.get("earnings") or {}
    location = result.get("location") or {}

    if school.get("operating") == 0 or school.get("main_campus") == 0:
        return None

    external_id = _as_str(result.get("id"))
    name = _as_str(school.get("name"))
    if not external_id or not name:
        return None

    ownership_code = _as_int(school.get("ownership"))
    degree_code = _as_int(school.get("degrees_awarded", {}).get("predominant"))
    locale_code = _as_int(school.get("locale_id"))

    return {
        "external_id": external_id,
        "source": "College Scorecard",
        "name": name,
        "city": _as_str(school.get("city")),
        "state": _as_str(school.get("state")),
        "zip": _as_str(school.get("zip")),
        "control": OWNERSHIP_LABELS.get(ownership_code),
        "locale": LOCALE_LABELS.get(locale_code) or _as_str(school.get("locale")),
        "locale_code": locale_code,
        "carnegie_basic": _as_str(school.get("carnegie_basic")),
        "highest_degree": DEGREE_LABELS.get(degree_code),
        "website": _normalize_website(school.get("school_url")),
        "price_calculator_url": _normalize_website(school.get("price_calculator_url")),
        "student_size": _as_int(student.get("size")),
        "admission_rate": _as_float(admissions.get("admission_rate", {}).get("overall")),
        "sat_average": _as_int(admissions.get("sat_scores", {}).get("average", {}).get("overall")),
        "act_midpoint": _as_float(admissions.get("act_scores", {}).get("midpoint", {}).get("cumulative")),
        "avg_net_price": _as_int(cost.get("avg_net_price", {}).get("overall")),
        "tuition_in_state": _as_int(cost.get("tuition", {}).get("in_state")),
        "tuition_out_of_state": _as_int(cost.get("tuition", {}).get("out_of_state")),
        "federal_aid_rate": _as_float(aid.get("percent_receiving_federal_student_aid")),
        "completion_rate": _as_float((latest.get("completion") or {}).get("rate")),
        "retention_rate": _as_float((student.get("retention_rate") or {}).get("four_year", {}).get("full_time")),
        "median_earnings_10yr": _as_int((earnings.get("10_yrs_after_entry") or {}).get("median")),
        "latitude": _as_float(location.get("lat")),
        "longitude": _as_float(location.get("lon")),
    }


async def _fetch_page(
    client: httpx.AsyncClient,
    *,
    api_key: str,
    page: int,
    per_page: int,
    state: str | None,
) -> dict[str, Any]:
    params = {
        "api_key": api_key,
        "fields": ",".join(SCORECARD_FIELDS),
        "keys_nested": "true",
        "per_page": per_page,
        "page": page,
        "school.operating": 1,
        "school.main_campus": 1,
        "sort": "school.name:asc",
    }
    if state:
        params["school.state"] = state.upper()

    response = await client.get(SCORECARD_URL, params=params)
    response.raise_for_status()
    return response.json()


async def sync_college_scorecard(
    *,
    api_key: str,
    per_page: int = 100,
    max_records: int | None = None,
    state: str | None = None,
) -> dict[str, int | None]:
    page = 0
    imported = 0
    source_total: int | None = None

    async with httpx.AsyncClient(timeout=60.0) as client:
        while True:
            payload = await _fetch_page(client, api_key=api_key, page=page, per_page=per_page, state=state)
            if source_total is None:
                source_total = _as_int((payload.get("metadata") or {}).get("total"))

            raw_results = payload.get("results") or []
            rows = []
            for result in raw_results:
                mapped = _map_row(result)
                if mapped:
                    rows.append(mapped)

            if not rows:
                break

            if max_records is not None:
                remaining = max_records - imported
                if remaining <= 0:
                    break
                rows = rows[:remaining]

            async with get_session() as session:
                statement = insert(Institution).values(rows)
                update_columns = {
                    key: getattr(statement.excluded, key)
                    for key in rows[0].keys()
                    if key not in {"external_id"}
                }
                update_columns["updated_at"] = func.now()
                await session.execute(
                    statement.on_conflict_do_update(
                        index_elements=[Institution.external_id],
                        set_=update_columns,
                    )
                )
                await session.commit()

            imported += len(rows)

            if len(raw_results) < per_page or (max_records is not None and imported >= max_records):
                break
            page += 1

    return {
        "imported": imported,
        "pages": page + 1 if imported else 0,
        "source_total": source_total,
    }
