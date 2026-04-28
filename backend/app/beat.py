from __future__ import annotations

import os
import time
from datetime import datetime, timezone

from croniter import croniter

from backend.app.db.session import SessionLocal
from backend.app.models import AuditLog, CronPlan, TaskLog
from backend.app.services.inspection_engine import create_manual_task
from backend.app.worker.celery_app import run_inspection_task


def _next_run(cron_expr: str, base: datetime) -> datetime:
    return croniter(cron_expr, base).get_next(datetime)


def scan_once() -> int:
    db = SessionLocal()
    created = 0
    now = datetime.now(timezone.utc)
    try:
        plans = db.query(CronPlan).filter(CronPlan.enabled.is_(True), CronPlan.next_run_at <= now).all()
        for plan in plans:
            task = create_manual_task(
                db,
                name=f"{plan.name} {now.strftime('%Y-%m-%d %H:%M')}",
                task_type=plan.task_type or "periodic",
                resource_ids=list(plan.resource_ids or []),
                item_ids=list(plan.item_ids or []),
                user_id=plan.created_by,
                group_id=plan.group_id,
                config={"source": "cron_plan", "cron_plan_id": plan.id, **dict(plan.notification_config or {})},
            )
            try:
                task.status = "queued"
                db.add(TaskLog(task_id=task.id, level="info", message=f"Cron plan queued by opsradar-beat: {plan.name}"))
                db.add(AuditLog(actor="opsradar-beat", action="enqueue_cron_task", target=plan.name, detail=task.id))
                db.commit()
                run_inspection_task.delay(task.id)
                created += 1
            except Exception as exc:
                task.status = "failed"
                db.add(TaskLog(task_id=task.id, level="error", message=f"Failed to enqueue cron task: {exc}"))
                db.add(AuditLog(actor="opsradar-beat", action="enqueue_cron_failed", target=plan.name, detail=str(exc), result="failed"))
            plan.last_run_at = now
            plan.next_run_at = _next_run(plan.cron_expr, now)
            db.commit()
        return created
    finally:
        db.close()


def main() -> int:
    interval = int(os.getenv("OPSRADAR_BEAT_INTERVAL_SECONDS", "30"))
    while True:
        scan_once()
        time.sleep(interval)


if __name__ == "__main__":
    raise SystemExit(main())
