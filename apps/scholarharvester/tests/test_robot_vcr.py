from __future__ import annotations

from pathlib import Path

import httpx
import pytest
import vcr

from scholarharvester.registry import load_sources
from scholarharvester.config import config


CASSETTE_DIR = Path(__file__).resolve().parent / "cassettes"
USER_AGENT = config.user_agent


@pytest.mark.parametrize("source", load_sources())
def test_robots_txt_checked(source: dict) -> None:
    vcr_obj = vcr.VCR(cassette_library_dir=CASSETTE_DIR, record_mode="once", filter_headers=[("authorization", "***")])
    cassette_name = f"{source['adapter']}.yaml"
    with vcr_obj.use_cassette(cassette_name):
        resp = httpx.get(
            source["base_url"].rstrip("/") + "/robots.txt",
            headers={"User-Agent": USER_AGENT},
            timeout=5,
        )
        assert resp.status_code in {200, 403}
