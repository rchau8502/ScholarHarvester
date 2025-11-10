from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://scholar:scholar@localhost:5432/scholarstack",
    )
    throttle_seconds: float = float(os.getenv("HARVESTER_THROTTLE_SECONDS", "2.0"))
    user_agent: str = os.getenv(
        "HARVESTER_USER_AGENT",
        "ScholarHarvester/2.0 (https://github.com/scholarstack)",
    )
    provenance_file: str = os.getenv(
        "PROVENANCE_FILE", "apps/scholarharvester/DATA_PROVENANCE.md"
    )
    blocklisted_domains: tuple[str, ...] = ("assist.org", "www.assist.org")


settings = Settings()
