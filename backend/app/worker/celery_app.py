from __future__ import annotations

import asyncio

from celery import Celery
from celery.signals import worker_ready

from backend.app.core.config import settings
from backend.app.db.session import SessionLocal
from backend.app.services.inspection_engine import recover_stale_tasks, run_task


celery_app = Celery(
    "opsradar",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)

celery_app.conf.update(
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=1,
    task_time_limit=settings.max_task_seconds,
    task_soft_time_limit=max(settings.max_task_seconds - 30, 30),
    task_track_started=True,
    result_expires=86400,
    timezone="UTC",
)


@worker_ready.connect
def on_worker_ready(**_: object) -> None:
    db = SessionLocal()
    try:
        recover_stale_tasks(db)
    finally:
        db.close()


@celery_app.task(name="opsradar.run_inspection_task", bind=True, max_retries=2, default_retry_delay=10)
def run_inspection_task(self, task_id: str) -> str:
    try:
        asyncio.run(run_task(task_id))
    except Exception as exc:
        raise self.retry(exc=exc) from exc
    return task_id
