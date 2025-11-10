from __future__ import annotations

from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://scholar:scholarpass@localhost:5432/scholarstack"
    cors_origins: List[str] = ["http://localhost:3000"]
    rate_limit: str = "60/minute"
    environment: str = "development"

    class Config:
        env_file = Path(__file__).resolve().parents[1] / ".env"
        env_file_encoding = "utf-8"


settings = Settings()
