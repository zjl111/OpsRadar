from __future__ import annotations

from collections import defaultdict
from typing import Any

from sqlalchemy.orm import Session

from backend.app.models import AnalysisRule, AppEnvironment, Issue, IssueInsight, Task, TaskResult
from backend.app.services.serializers import model_to_dict


LAYER_WEIGHTS = {
    "os": 20,
    "db": 20,
    "middleware": 15,
    "gateway": 10,
    "storage": 5,
    "queue": 5,
    "service": 20,
    "security": 5,
}


def _contains(haystack: str, needle: str) -> bool:
    return not needle or needle.lower() in haystack.lower()


def _rule_score(rule: AnalysisRule, issue: Issue, result: TaskResult | None) -> int:
    resource = result.resource_snapshot if result else {}
    item = result.item_snapshot if result else {}
    output = " ".join(
        [
            issue.summary or "",
            result.output if result else "",
            result.error_message if result else "",
            str(item.get("name", "")),
        ]
    )
    score = 0
    if rule.layer and rule.layer == resource.get("environment_layer"):
        score += 3
    if rule.role and rule.role in {resource.get("environment_role"), resource.get("type"), item.get("category")}:
        score += 3
    if rule.item_keyword and _contains(str(item.get("name", "")), rule.item_keyword):
        score += 2
    if rule.status and result and rule.status == result.status:
        score += 1
    if rule.error_keyword and _contains(output, rule.error_keyword):
        score += 4
    return score


def build_issue_insight(db: Session, issue: Issue) -> IssueInsight:
    existing = db.query(IssueInsight).filter(IssueInsight.issue_id == issue.id).one_or_none()
    result = db.get(TaskResult, issue.task_result_id) if issue.task_result_id else None
    candidates = db.query(AnalysisRule).filter(AnalysisRule.enabled.is_(True)).all()
    ranked = sorted(((rule, _rule_score(rule, issue, result)) for rule in candidates), key=lambda item: item[1], reverse=True)
    rule = ranked[0][0] if ranked and ranked[0][1] > 0 else None
    if rule:
        values: dict[str, Any] = {
            "rule_id": rule.id,
            "probable_cause": rule.probable_cause,
            "impact": rule.impact,
            "recommendation": rule.recommendation,
            "steps": rule.steps or [],
            "verification": rule.verification,
            "risk_level": rule.risk_level,
        }
    else:
        values = {
            "rule_id": None,
            "probable_cause": "巡检项返回异常，暂未命中明确规则。建议先查看巡检输出、资源状态和近期变更。",
            "impact": "可能影响该资源或组件承载的业务能力，需要结合应用环境上下文确认影响范围。",
            "recommendation": "确认资源连通性、服务状态、错误日志和配置变更，并在修复后重新执行巡检。",
            "steps": ["查看巡检输出和错误信息。", "登录对应资源检查服务状态和日志。", "完成处理后重新执行巡检验证。"],
            "verification": "异常项重新巡检成功，环境健康评分恢复。",
            "risk_level": issue.severity or "medium",
        }
    if not existing:
        existing = IssueInsight(issue_id=issue.id)
        db.add(existing)
    for key, value in values.items():
        setattr(existing, key, value)
    return existing


def layer_status(score: int | None) -> str:
    if score is None:
        return "unknown"
    if score >= 90:
        return "healthy"
    if score >= 70:
        return "warning"
    return "critical"


def environment_overview(db: Session, environment: AppEnvironment) -> dict:
    tasks = (
        db.query(Task)
        .filter(Task.environment_id == environment.id)
        .order_by(Task.created_at.desc())
        .limit(20)
        .all()
    )
    latest_task = next((task for task in tasks if task.status in {"finished", "failed", "cancelled"}), tasks[0] if tasks else None)
    latest_started_task = max((task for task in tasks if task.started_at), key=lambda task: task.started_at, default=None)
    results = db.query(TaskResult).filter(TaskResult.task_id == latest_task.id).all() if latest_task else []
    layer_counts: dict[str, dict[str, int]] = defaultdict(lambda: {"total": 0, "success": 0, "fail": 0, "exception": 0})
    for result in results:
        layer = (result.resource_snapshot or {}).get("environment_layer") or (result.item_snapshot or {}).get("category") or "os"
        if layer == "postgresql" or layer == "mysql":
            layer = "db"
        if result.status == "pending":
            continue
        layer_counts[layer]["total"] += 1
        if result.status in layer_counts[layer]:
            layer_counts[layer][result.status] += 1
    layers = []
    weighted_total = 0
    weighted_score = 0
    for layer, counts in sorted(layer_counts.items()):
        total = counts["total"]
        if not total:
            continue
        score = max(0, round(((counts["success"] + counts["fail"] * 0.45) / total) * 100))
        weight = LAYER_WEIGHTS.get(layer, 10)
        weighted_total += weight
        weighted_score += score * weight
        layers.append({"layer": layer, "score": score, "status": layer_status(score), **counts})
    health_score = round(weighted_score / weighted_total) if weighted_total else None
    open_issues = (
        db.query(Issue)
        .join(Task, Issue.task_id == Task.id)
        .filter(Task.environment_id == environment.id, Issue.status == "open")
        .order_by(Issue.created_at.desc())
        .limit(10)
        .all()
    )
    insights = []
    for issue in open_issues:
        insight = db.query(IssueInsight).filter(IssueInsight.issue_id == issue.id).one_or_none()
        row = model_to_dict(issue)
        row["insight"] = model_to_dict(insight) if insight else None
        insights.append(row)
    return {
        "health_score": health_score,
        "status": layer_status(health_score),
        "layers": layers,
        "latest_task": model_to_dict(latest_task) if latest_task else None,
        "latest_started_task": model_to_dict(latest_started_task) if latest_started_task else None,
        "recent_tasks": [model_to_dict(task) for task in tasks],
        "open_issues": insights,
    }
