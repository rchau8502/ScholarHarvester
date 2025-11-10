from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass
class Config:
    database_url: str = os.environ.get(
        "DATABASE_URL", "postgresql+asyncpg://scholar:scholarpass@localhost:5432/scholarstack"
    )
    redis_url: str = os.environ.get("REDIS_URL", "redis://localhost:6379")
    user_agent: str = os.environ.get(
        "SCHOLAR_HARVESTER_USER_AGENT", "ScholarHarvester/1.0 (+contact@scholarstack.org)"
    )
    legal_notes_path: str = "LEGAL_NOTES.md"
    provenance_path: str = "DATA_PROVENANCE.md"


config = Config()
