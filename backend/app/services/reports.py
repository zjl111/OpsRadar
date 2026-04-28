from __future__ import annotations

import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from docx import Document
from fastapi import HTTPException
from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.models import ResourceGroup, Task, TaskResult


env = Environment(
    loader=FileSystemLoader(settings.project_root / "backend" / "app" / "templates"),
    autoescape=select_autoescape(["html", "xml"]),
)


def _task_bundle(db: Session, task_ids: list[str]) -> tuple[list[dict], list[dict], dict, list[str], list[ResourceGroup]]:
    tasks = db.query(Task).filter(Task.id.in_(task_ids)).order_by(Task.created_at.desc()).all()
    if not tasks:
        raise HTTPException(status_code=404, detail="No tasks found for report export")

    task_dicts: list[dict] = []
    all_results: list[dict] = []
    group_ids = {task.group_id for task in tasks if task.group_id}
    clusters = db.query(ResourceGroup).filter(ResourceGroup.id.in_(group_ids)).all() if group_ids else []
    groups = [group.name for group in clusters]
    summary = {"total": 0, "success": 0, "fail": 0, "exception": 0}

    for task in tasks:
        results = db.query(TaskResult).filter(TaskResult.task_id == task.id).order_by(TaskResult.id).all()
        result_dicts = []
        for result in results:
            row = {
                "id": result.id,
                "task_id": task.id,
                "resource_snapshot": result.resource_snapshot,
                "item_snapshot": result.item_snapshot,
                "status": result.status,
                "output": result.output,
                "error_message": result.error_message,
                "execution_time_ms": result.execution_time_ms,
            }
            result_dicts.append(row)
            all_results.append(row)
            if result.status in summary:
                summary[result.status] += 1
            summary["total"] += 1
        task_dicts.append(
            {
                "id": task.id,
                "name": task.name,
                "task_type": task.task_type,
                "status": task.status,
                "started_at": task.started_at,
                "finished_at": task.finished_at,
                "results": result_dicts,
            }
        )

    issues = [
        {**result, "severity": "High" if result["status"] == "exception" else "Medium"}
        for result in all_results
        if result["status"] in {"fail", "exception"}
    ]
    return task_dicts, issues, summary, groups, clusters


def render_report_html(db: Session, task_ids: list[str]) -> str:
    tasks, issues, summary, groups, clusters = _task_bundle(db, task_ids)
    template = env.get_template("report.html")
    return template.render(
        title="OpsRadar Inspection Report" if len(task_ids) == 1 else "OpsRadar Merged Inspection Report",
        company_name="Operations Center",
        environment="Production",
        generated_at=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
        summary=summary,
        tasks=tasks,
        issues=issues,
        resource_groups=groups,
        clusters=clusters,
    )


def build_docx_report(db: Session, task_ids: list[str], output_path: Path) -> Path:
    tasks, issues, summary, groups, _ = _task_bundle(db, task_ids)
    doc = Document()
    doc.add_heading("OpsRadar Inspection Report", 0)
    doc.add_paragraph(f"Resource Groups: {', '.join(groups) if groups else 'Ungrouped Resources'}")
    doc.add_paragraph(f"Generated at: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}")
    doc.add_heading("Summary", level=1)
    summary_table = doc.add_table(rows=2, cols=4)
    summary_table.style = "Table Grid"
    for index, label in enumerate(["Success", "Failed", "Exception", "Total"]):
        summary_table.cell(0, index).text = label
    for index, value in enumerate([summary["success"], summary["fail"], summary["exception"], summary["total"]]):
        summary_table.cell(1, index).text = str(value)

    for task in tasks:
        doc.add_heading(task["name"], level=1)
        doc.add_paragraph(f"Task ID: {task['id']} | Type: {task['task_type']} | Status: {task['status']}")
        table = doc.add_table(rows=1, cols=7)
        table.style = "Table Grid"
        headers = ["Resource", "Type", "Address", "Check Item", "Command", "Status", "Cost"]
        for index, header in enumerate(headers):
            table.cell(0, index).text = header
        for result in task["results"]:
            row = table.add_row().cells
            row[0].text = str(result["resource_snapshot"].get("name", ""))
            row[1].text = str(result["resource_snapshot"].get("type", ""))
            row[2].text = f"{result['resource_snapshot'].get('ip')}:{result['resource_snapshot'].get('port')}"
            row[3].text = str(result["item_snapshot"].get("name", ""))
            row[4].text = str(result["item_snapshot"].get("command", ""))
            row[5].text = result["status"]
            row[6].text = f"{result['execution_time_ms']}ms"

    doc.add_heading("Issue Details", level=1)
    if issues:
        issue_table = doc.add_table(rows=1, cols=5)
        issue_table.style = "Table Grid"
        for index, header in enumerate(["Severity", "Task", "Node", "Message", "Recommendation"]):
            issue_table.cell(0, index).text = header
        for issue in issues:
            row = issue_table.add_row().cells
            row[0].text = "High" if issue["status"] == "exception" else "Medium"
            row[1].text = issue["task_id"]
            row[2].text = str(issue["resource_snapshot"].get("name", ""))
            row[3].text = issue["output"] or issue["error_message"]
            row[4].text = "Review resource status, validate threshold, and track remediation in OpsRadar Issues."
    else:
        doc.add_paragraph("No issues found.")

    doc.save(output_path)
    return output_path


def build_pdf_report(html: str, output_path: Path) -> Path:
    chrome = Path(settings.chrome_path)
    if not chrome.exists():
        raise HTTPException(status_code=501, detail="Chrome headless is not configured; PDF export is unavailable")
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as handle:
        handle.write(html)
        html_path = Path(handle.name)
    try:
        subprocess.run(
            [
                str(chrome),
                "--headless",
                "--disable-gpu",
                "--no-sandbox",
                "--allow-file-access-from-files",
                f"--print-to-pdf={output_path}",
                html_path.as_uri(),
            ],
            check=True,
            timeout=40,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
    except subprocess.CalledProcessError as exc:
        raise HTTPException(status_code=500, detail=f"PDF export failed: {exc.stderr.decode('utf-8', errors='ignore')[:240]}") from exc
    finally:
        html_path.unlink(missing_ok=True)
    return output_path


def export_report(db: Session, task_ids: list[str], fmt: str) -> tuple[Path, str, str]:
    safe_id = "merged" if len(task_ids) > 1 else task_ids[0]
    fmt = fmt.lower()
    if fmt == "html":
        path = settings.report_dir / f"{safe_id}.html"
        path.write_text(render_report_html(db, task_ids), encoding="utf-8")
        return path, "text/html; charset=utf-8", path.name
    if fmt in {"doc", "docx", "docs"}:
        path = settings.report_dir / f"{safe_id}.docx"
        return build_docx_report(db, task_ids, path), "application/vnd.openxmlformats-officedocument.wordprocessingml.document", path.name
    if fmt == "pdf":
        path = settings.report_dir / f"{safe_id}.pdf"
        return build_pdf_report(render_report_html(db, task_ids), path), "application/pdf", path.name
    raise HTTPException(status_code=400, detail="Unsupported report format")
