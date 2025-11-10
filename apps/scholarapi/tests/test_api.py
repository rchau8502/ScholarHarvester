import pytest

from httpx import AsyncClient


@pytest.mark.asyncio
async def test_metrics_filter(client: AsyncClient) -> None:
    response = await client.get("/v1/metrics?campus=UC Irvine")
    assert response.status_code == 200
    payload = response.json()
    assert payload["items"], "Should return at least one metric"
    assert payload["items"][0]["campus"] == "UC Irvine"


@pytest.mark.asyncio
async def test_metrics_pagination(client: AsyncClient) -> None:
    response = await client.get("/v1/metrics?limit=1")
    first = response.json()
    assert first["next_cursor"], "Pagination should supply next cursor"
    response2 = await client.get(f"/v1/metrics?cursor={first['next_cursor']}&limit=1")
    assert response2.status_code == 200
    assert response2.json()["items"]


@pytest.mark.asyncio
async def test_provenance_has_citations(client: AsyncClient) -> None:
    response = await client.get("/v1/provenance?campus=UC Irvine")
    assert response.status_code == 200
    payload = response.json()
    assert payload
    assert payload[0]["citations"]


@pytest.mark.asyncio
async def test_rate_limit_enforced(client: AsyncClient) -> None:
    for _ in range(2):
        resp = await client.get("/v1/metrics")
        assert resp.status_code == 200
    third = await client.get("/v1/metrics")
    assert third.status_code == 429
