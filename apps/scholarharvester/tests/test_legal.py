import asyncio

import pytest

from scholarharvester.legal import AssistAccessError, _respect_throttle, ensure_legal, throttled_client


def test_assist_blocked(monkeypatch):
    with pytest.raises(AssistAccessError):
        async def _run():
            async with throttled_client() as client:
                await ensure_legal("https://assist.org/data.json", client)

        asyncio.run(_run())


def test_respect_throttle_sleep(monkeypatch):
    calls = []

    def fake_sleep(seconds):
        calls.append(seconds)

    monkeypatch.setattr("time.sleep", fake_sleep)
    _respect_throttle("example.com")
    _respect_throttle("example.com")
    assert calls
