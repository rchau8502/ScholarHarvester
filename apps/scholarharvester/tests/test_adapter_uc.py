import vcr

from scholarharvester.adapters.uc import build


@vcr.use_cassette("tests/vcr/uc_adapter.yaml")
def test_uc_adapter_parses_metrics():
    adapter = build()
    metrics = adapter.run()
    assert any(m["metric_key"] == "admit_rate" for m in metrics)
    assert all(m["citation"]["title"] == "UC Undergraduate Admissions" for m in metrics)
