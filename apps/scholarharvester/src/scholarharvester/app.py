from __future__ import annotations

import os
from celery import Celery

DEFAULT_BROKER_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
DEFAULT_BACKEND_URL = os.getenv("CELERY_RESULT_BACKEND", DEFAULT_BROKER_URL)


def create_celery() -> Celery:
    """Create a configured Celery application for background harvesting."""
    app = Celery(
        "scholarharvester",
        broker=DEFAULT_BROKER_URL,
        backend=DEFAULT_BACKEND_URL,
        include=["scholarharvester.tasks"],
    )
    app.conf.update(
        task_default_queue="harvest",
        task_serializer="json",
        accept_content=["json"],
        result_serializer="json",
        broker_transport_options={"visibility_timeout": 3600},
    )
    return app
