from __future__ import annotations

import os
import re
from dataclasses import dataclass
from urllib.parse import urljoin, urlparse

import httpx
import pandas as pd

from scholarharvester.adapters.utils import CitationPayload, DatasetPayload, MetricPayload
from scholarharvester.config import config


@dataclass
class OfficialSourceConfig:
    adapter_name: str
    source_name: str
    publisher: str
    env_var: str
    base_url: str
    discovery_keywords: tuple[str, ...]


def _is_official_url(url: str, base_url: str) -> bool:
    def root_domain(host: str) -> str:
        parts = host.split(".")
        return ".".join(parts[-2:]) if len(parts) >= 2 else host

    source_host = urlparse(base_url).netloc.replace("www.", "").lower()
    target_host = urlparse(url).netloc.replace("www.", "").lower()
    if not source_host or not target_host:
        return False
    return (
        target_host == source_host
        or target_host.endswith(f".{source_host}")
        or root_domain(target_host) == root_domain(source_host)
    )


def discover_tabular_url(base_url: str, keywords: tuple[str, ...]) -> str | None:
    try:
        response = httpx.get(base_url, headers={"User-Agent": config.user_agent}, timeout=15)
        response.raise_for_status()
    except httpx.HTTPError:
        return None

    links = re.findall(r'href=["\']([^"\']+)["\']', response.text, flags=re.IGNORECASE)
    candidates: list[str] = []
    for link in links:
        absolute = urljoin(base_url, link)
        normalized = absolute.lower()
        if not (normalized.endswith(".csv") or normalized.endswith(".json") or "download" in normalized):
            continue
        if keywords and not any(keyword in normalized for keyword in keywords):
            continue
        if not _is_official_url(absolute, base_url):
            continue
        candidates.append(absolute)

    return candidates[0] if candidates else None


def resolve_official_data_url(source: OfficialSourceConfig) -> str:
    explicit = os.getenv(source.env_var)
    if explicit:
        allow_local = os.getenv("SCHOLARHARVESTER_ALLOW_LOCAL_FIXTURES") == "1"
        if allow_local and (
            explicit.startswith("/")
            or explicit.startswith("./")
            or explicit.startswith("file://")
            or explicit.lower().endswith(".csv")
            or explicit.lower().endswith(".json")
        ):
            return explicit.removeprefix("file://")
        if not _is_official_url(explicit, source.base_url):
            raise RuntimeError(
                f"{source.adapter_name}: {source.env_var} must point to an official {urlparse(source.base_url).netloc} URL"
            )
        return explicit

    discovered = discover_tabular_url(source.base_url, source.discovery_keywords)
    if discovered:
        return discovered

    raise RuntimeError(
        f"{source.adapter_name}: no official export URL found. Set {source.env_var} to an official CSV/JSON endpoint."
    )


def fetch_table(url: str) -> pd.DataFrame:
    lowered = url.lower()
    if lowered.endswith(".json") or ".json?" in lowered:
        frame = pd.read_json(url)
    else:
        frame = pd.read_csv(url)
    if frame.empty:
        raise RuntimeError(f"Source returned no rows: {url}")
    return frame


def _normalize_column(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", value.strip().lower()).strip("_")


def _normalize_value(value: object) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _find_column(frame: pd.DataFrame, candidates: tuple[str, ...]) -> str | None:
    normalized_map = {_normalize_column(col): col for col in frame.columns}

    for candidate in candidates:
        if candidate in normalized_map:
            return normalized_map[candidate]

    for candidate in candidates:
        tokens = candidate.split("_")
        for normalized, original in normalized_map.items():
            if all(token in normalized for token in tokens):
                return original
    return None


def _to_number(value: object) -> float | None:
    if value is None:
        return None
    text = _normalize_value(value)
    if not text:
        return None
    text = text.replace(",", "").replace("%", "")
    try:
        return float(text)
    except ValueError:
        return None


def _to_year(value: object, fallback: int) -> int:
    number = _to_number(value)
    if number is None:
        return fallback
    year = int(number)
    return year if 1900 <= year <= 2100 else fallback


def _metric_unit(stat_name: str) -> str:
    if stat_name.endswith("_rate"):
        return "%"
    if stat_name.startswith("gpa_"):
        return "GPA"
    return "count"


COMMON_STAT_COLUMNS: dict[str, tuple[str, ...]] = {
    "applicants": ("applicants", "applications", "applicant_count", "applied"),
    "admits": ("admits", "admitted", "admissions", "admit_count"),
    "enrolled": ("enrolled", "enrollment", "enrollees", "registered"),
    "admit_rate": ("admit_rate", "acceptance_rate", "admission_rate"),
    "yield_rate": ("yield_rate", "yield"),
    "gpa_p25": ("gpa_p25", "gpa_25", "gpa25", "gpa_25th", "gpa_25th_percentile"),
    "gpa_p50": ("gpa_p50", "gpa_50", "gpa50", "gpa_median", "gpa_50th", "average_gpa", "avg_gpa"),
    "gpa_p75": ("gpa_p75", "gpa_75", "gpa75", "gpa_75th", "gpa_75th_percentile"),
    "transfer_volume": ("transfer_volume", "transfers", "transfer_count", "students_transferred"),
    "adt_awards": ("adt_awards", "associate_degrees_for_transfer", "degrees_for_transfer"),
}


def build_metrics_from_frame(
    frame: pd.DataFrame,
    *,
    cohort: str,
    default_campus: str | None,
    default_focus: str | None,
    source_url: str,
    publisher: str,
    dataset_year: int,
    campus_filter: str | None,
    focus_filter: str | None,
    focus_kind: str,
    source_school_kind: str | None = None,
) -> tuple[list[MetricPayload], int]:
    campus_col = _find_column(frame, ("campus", "campus_name", "institution", "university"))
    year_col = _find_column(frame, ("year", "admit_year", "report_year", "calendar_year"))
    term_col = _find_column(frame, ("term", "season", "admit_term"))
    major_col = _find_column(frame, ("major", "major_name", "program", "major_program"))
    discipline_col = _find_column(frame, ("discipline", "discipline_name", "academic_discipline", "broad_discipline"))
    source_school_col = _find_column(frame, ("source_school", "school_name", "high_school", "community_college"))
    school_type_col = _find_column(frame, ("school_type", "source_school_type", "institution_type"))

    stat_columns = {
        stat_name: _find_column(frame, aliases) for stat_name, aliases in COMMON_STAT_COLUMNS.items()
    }
    stat_columns = {stat_name: column for stat_name, column in stat_columns.items() if column}
    if not stat_columns:
        raise RuntimeError("No metric columns found in source export")

    metrics: list[MetricPayload] = []
    latest_year = dataset_year

    for _, row in frame.iterrows():
        campus = _normalize_value(row[campus_col]) if campus_col else (default_campus or "")
        if not campus:
            continue
        if campus_filter and campus.lower() != campus_filter.lower():
            continue

        focus_value = ""
        major: str | None = None
        discipline: str | None = None
        if focus_kind == "major":
            focus_value = _normalize_value(row[major_col]) if major_col else (default_focus or "")
            major = focus_value or None
        elif focus_kind == "discipline":
            focus_value = _normalize_value(row[discipline_col]) if discipline_col else (default_focus or "")
            discipline = focus_value or None
        else:
            focus_value = default_focus or ""

        if focus_filter and focus_value and focus_value.lower() != focus_filter.lower():
            continue

        row_year = _to_year(row[year_col], dataset_year) if year_col else dataset_year
        latest_year = max(latest_year, row_year)
        term = _normalize_value(row[term_col]) if term_col else "Fall"
        if not term:
            term = "Fall"

        source_school = _normalize_value(row[source_school_col]) if source_school_col else None
        school_type = _normalize_value(row[school_type_col]) if school_type_col else source_school_kind
        if school_type:
            lowered = school_type.lower()
            if "high" in lowered:
                school_type = "HighSchool"
            elif "college" in lowered:
                school_type = "CommunityCollege"
            elif school_type not in {"HighSchool", "CommunityCollege", "Other"}:
                school_type = "Other"

        for stat_name, column in stat_columns.items():
            raw_value = row[column]
            numeric = _to_number(raw_value)
            text = None if numeric is not None else _normalize_value(raw_value)
            if numeric is None and not text:
                continue
            metrics.append(
                MetricPayload(
                    campus=campus,
                    major=major,
                    discipline=discipline,
                    source_school=source_school if source_school else None,
                    school_type=school_type if school_type else None,
                    cohort=cohort,
                    stat_name=stat_name,
                    stat_value_numeric=numeric,
                    stat_value_text=text,
                    unit=_metric_unit(stat_name),
                    percentile=stat_name.split("_p")[-1] if stat_name.startswith("gpa_p") else None,
                    year=row_year,
                    term=term,
                    notes=f"Official-source metric extracted from {source_url}",
                    citations=[
                        CitationPayload(
                            title=f"{publisher} official export",
                            publisher=publisher,
                            year=row_year,
                            source_url=source_url,
                            interpretation_note="Parsed from official export row values.",
                        )
                    ],
                )
            )

    return metrics, latest_year


def make_dataset(title: str, year: int, term: str, cohort: str, source_url: str) -> DatasetPayload:
    return DatasetPayload(
        title=title,
        year=year,
        term=term,
        cohort=cohort,
        notes=f"Official-source harvest from {source_url}",
    )
