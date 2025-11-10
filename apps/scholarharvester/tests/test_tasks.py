from scholarharvester.db.models import Base
from scholarharvester.db.models import Base
from scholarharvester.db.session import engine, get_session
from scholarharvester.tasks import persist_metric


Base.metadata.create_all(bind=engine)


def test_persist_metric_creates_related():
    metric = {
        "metric_key": "admit_rate",
        "metric_year": 2023,
        "value_float": 0.5,
        "campus": "uc-merced",
        "campus_name": "UC Merced",
        "citation": {
            "title": "Test",
            "publisher": "UCOP",
            "year": 2023,
            "url": "https://data.ucop.edu/test",
            "interpretation_note": "Demo",
        },
    }
    with get_session() as session:
        result = persist_metric(session, metric)
        assert result.id is not None
