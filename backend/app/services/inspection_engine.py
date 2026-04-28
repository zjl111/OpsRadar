from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.db.session import SessionLocal
from backend.app.models import AuditLog, InspectionItem, Issue, Resource, Task, TaskLog, TaskResult
from backend.app.services.executors import ExecutionContext, ShellExecutor


def _resource_snapshot(resource: Resource) -> dict:
    return {
        "name": resource.name,
        "type": resource.type,
        "ip": resource.ip,
        "port": resource.port,
        "username": resource.username,
        "credential_type": resource.credential_type,
        "os": resource.os,
        "cpu": resource.cpu,
        "memory": resource.memory,
        "disk_usage": resource.disk_usage,
        "load_avg": resource.load_avg,
    }


def _item_snapshot(item: InspectionItem, resource: Resource) -> dict:
    command = item.command_template
    replacements = {
        "ip": resource.ip,
        "port": str(resource.port),
        "db_name": str((resource.extra_params or {}).get("db_name", "")),
    }
    for key, value in replacements.items():
        command = command.replace("{" + key + "}", value)
    return {
        "name": item.name,
        "category": item.category,
        "command_type": item.command_type,
        "command": command,
        "expected": item.expected_result_pattern,
    }


def _compatible(resource: Resource, item: InspectionItem) -> bool:
    if not item.enabled:
        return False
    if item.category == "network":
        return True
    if resource.type == item.resource_type:
        return True
    if resource.type == "host" and item.category in {"host", "security"}:
        return True
    return False


def create_manual_task(
    db: Session,
    *,
    name: str,
    task_type: str,
    resource_ids: list[str],
    item_ids: list[str],
    user_id: str | None,
    group_id: str | None = None,
    config: dict | None = None,
) -> Task:
    resources = db.query(Resource).filter(Resource.id.in_(resource_ids)).all()
    items = db.query(InspectionItem).filter(InspectionItem.id.in_(item_ids)).all()
    task = Task(
        name=name,
        task_type=task_type,
        status="pending",
        group_id=group_id,
        created_by=user_id,
        summary={"total": 0, "success": 0, "fail": 0, "exception": 0},
        config=config or {},
        created_at=datetime.now(timezone.utc),
    )
    db.add(task)
    db.flush()

    total = 0
    for resource in resources:
        for item in items:
            if not _compatible(resource, item):
                continue
            db.add(
                TaskResult(
                    task_id=task.id,
                    resource_id=resource.id,
                    item_id=item.id,
                    resource_snapshot=_resource_snapshot(resource),
                    item_snapshot=_item_snapshot(item, resource),
                    status="pending",
                )
            )
            total += 1

    task.summary = {"total": total, "success": 0, "fail": 0, "exception": 0}
    db.add(TaskLog(task_id=task.id, level="info", message=f"Task {task.name} created with {total} executable check items."))
    db.add(AuditLog(actor=user_id or "system", action="create_task", target=task.name, detail=f"{total} task items created."))
    db.commit()
    db.refresh(task)
    return task


def _append_log(db: Session, task_id: str, level: str, message: str) -> None:
    db.add(TaskLog(task_id=task_id, level=level, message=message))


def recover_stale_tasks(db: Session) -> int:
    cutoff = datetime.now(timezone.utc) - timedelta(seconds=settings.max_task_seconds)
    stale_tasks = db.query(Task).filter(Task.status == "running", Task.started_at < cutoff).all()
    for task in stale_tasks:
        task.status = "failed"
        task.finished_at = datetime.now(timezone.utc)
        _append_log(db, task.id, "error", "Task was marked failed because the worker did not finish within the maximum runtime.")
        db.add(AuditLog(actor="Worker", action="recover_stale_task", target=task.name, result="failed", detail=task.id))
    db.commit()
    return len(stale_tasks)


async def run_task(task_id: str) -> None:
    db = SessionLocal()
    try:
        task = db.get(Task, task_id)
        if not task:
            return
        if task.cancel_requested or task.status == "cancelled":
            task.status = "cancelled"
            task.finished_at = datetime.now(timezone.utc)
            _append_log(db, task.id, "warning", "Task cancelled before worker execution.")
            db.commit()
            return
        task.status = "running"
        task.started_at = datetime.now(timezone.utc)
        _append_log(db, task.id, "info", "Worker acquired task and initialized execution context.")
        db.commit()

        results = db.query(TaskResult).filter(TaskResult.task_id == task.id).order_by(TaskResult.id).all()
        counters = {"success": 0, "fail": 0, "exception": 0}
        executor = ShellExecutor()
        for result in results:
            db.refresh(task)
            if task.cancel_requested:
                result.status = "cancelled"
                result.finished_at = datetime.now(timezone.utc)
                _append_log(db, task.id, "warning", "Task cancellation requested; remaining inspection items skipped.")
                db.commit()
                break
            result.status = "running"
            result.started_at = datetime.now(timezone.utc)
            _append_log(db, task.id, "info", f"Running {result.resource_snapshot.get('name')} / {result.item_snapshot.get('name')}.")
            db.commit()

            resource_for_execution = dict(result.resource_snapshot or {})
            if result.resource_id:
                current_resource = db.get(Resource, result.resource_id)
                if current_resource:
                    resource_for_execution.update(
                        {
                            "username": current_resource.username,
                            "credential_type": current_resource.credential_type,
                            "extra_params": current_resource.extra_params,
                        }
                    )
            execution = await executor.execute(ExecutionContext(resource=resource_for_execution, item=result.item_snapshot))
            result.status = execution.status
            result.output = execution.output
            result.error_message = execution.error_message
            result.execution_time_ms = execution.execution_time_ms
            result.finished_at = datetime.now(timezone.utc)
            counters[execution.status] += 1
            log_level = "info" if execution.status == "success" else "warning" if execution.status == "fail" else "error"
            _append_log(db, task.id, log_level, f"{result.resource_snapshot.get('name')} / {result.item_snapshot.get('name')} -> {execution.status}.")
            if execution.status in {"fail", "exception"}:
                db.add(
                    Issue(
                        task_result_id=result.id,
                        task_id=task.id,
                        resource_id=result.resource_id,
                        item_id=result.item_id,
                        summary=f"{result.resource_snapshot.get('name')} / {result.item_snapshot.get('name')} {execution.status}",
                        severity="high" if execution.status == "exception" else "medium",
                        status="open",
                        assignee="Unassigned",
                    )
                )
            db.commit()

        task.status = "cancelled" if task.cancel_requested else "finished"
        task.finished_at = datetime.now(timezone.utc)
        task.summary = {"total": len(results), **counters}
        _append_log(db, task.id, "info", f"Task {task.status}. success={counters['success']} fail={counters['fail']} exception={counters['exception']}.")
        db.add(AuditLog(actor="Worker", action="finish_task", target=task.name, detail=str(task.summary), result=task.status))
        db.commit()
    except Exception as exc:  # pragma: no cover - defensive safety path for the worker
        task = db.get(Task, task_id)
        if task:
            task.status = "failed"
            task.finished_at = datetime.now(timezone.utc)
            _append_log(db, task.id, "error", f"Worker failed: {exc}")
            db.add(AuditLog(actor="Worker", action="run_task_failed", target=task.name, detail=str(exc), result="failed"))
            db.commit()
    finally:
        db.close()
