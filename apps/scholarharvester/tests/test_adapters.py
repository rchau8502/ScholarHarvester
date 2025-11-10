from __future__ import annotations

import pytest

from scholarharvester.adapters import ADAPTERS


@pytest.mark.parametrize("name, adapter", ADAPTERS.items())
def test_adapter_returns_metrics(name: str, adapter: callable) -> None:
    result = adapter({})
    assert result.metrics, f"{name} should emit metrics"
    assert result.dataset.title
    for metric in result.metrics:
        assert metric.citations, f"{name} metric missing citation"
