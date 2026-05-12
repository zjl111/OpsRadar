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
    if rule.error_keyword and not _contains(output, rule.error_keyword):
        return 0
    if rule.item_keyword and not _contains(str(item.get("name", "")), rule.item_keyword):
        return 0
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


def _fallback_issue_insight_values(issue: Issue, result: TaskResult | None) -> dict[str, Any] | None:
    item = result.item_snapshot if result else {}
    resource = result.resource_snapshot if result else {}
    item_name = str(item.get("name") or issue.summary or "巡检项")
    resource_name = str(resource.get("name") or "目标资源")
    error = str(result.error_message if result else issue.summary or "")
    output = str(result.output if result else "")
    combined = f"{issue.summary or ''} {item_name} {error} {output}".lower()

    if "timed out" in combined or "超时" in combined:
        return {
            "rule_id": None,
            "probable_cause": "巡检命令执行超时。资源连通性测试只验证 SSH 登录和握手成功，不代表具体巡检命令一定能在超时时间内完成；该问题更可能是命令执行慢、命令在目标系统上阻塞、权限等待、命令兼容性问题或目标主机瞬时负载较高。",
            "impact": "该巡检项没有拿到有效指标值，因此不能判断 CPU、内存、磁盘、负载等真实状态；如果同一主机大量巡检项超时，会影响环境健康评分准确性。",
            "recommendation": "先在目标主机手工执行证据链里的巡检命令，确认命令是否能快速返回；如果命令本身较慢，应优化命令或为该规则单独提高超时时间，而不是按 SSH 账号错误处理。",
            "steps": [
                f"登录 {resource_name}，复制证据链中的巡检命令手工执行，确认实际耗时和输出。",
                "检查命令是否依赖交互式终端、是否等待锁、是否访问慢路径或大量文件。",
                "查看 top、uptime、iostat、journalctl，确认目标主机是否存在瞬时高负载或 IO 阻塞。",
                "将该巡检项命令改成非交互、轻量命令；必要时为该规则提高超时时间。",
                "重新诊断或重新执行巡检，确认该项可以在超时时间内完成。",
            ],
            "verification": "该巡检项重新执行后返回真实指标值，并按阈值正常判定为 success/fail。",
            "risk_level": issue.severity or "high",
        }

    if "authentication failed" in combined or "permission denied" in combined or "认证失败" in combined:
        return {
            "rule_id": None,
            "probable_cause": "SSH 认证失败：资源中配置的用户名、密码或私钥未通过目标主机认证，或目标主机不允许该用户通过 SSH 登录。",
            "impact": "会导致该主机上的 OS、安全基线和容器服务巡检无法执行，影响环境健康判断。",
            "recommendation": "检查资源配置中的用户名、密码或私钥是否正确，确认目标主机允许该用户通过 SSH 登录；必要时重新录入凭据。",
            "steps": [
                "在资源列表点击测试确认 SSH 连通性。",
                "检查账号是否被锁定、过期，或是否禁止 root 登录。",
                "如果使用私钥，确认私钥内容、passphrase 和目标主机 authorized_keys。",
                "检查 sshd_config 中 PasswordAuthentication、PubkeyAuthentication、PermitRootLogin、AllowUsers 等策略。",
            ],
            "verification": "资源测试成功后重新启动巡检任务。",
            "risk_level": issue.severity or "high",
        }

    if any(keyword in item_name.lower() for keyword in ["cpu", "内存", "memory", "磁盘", "inode", "负载", "load", "进程", "process"]):
        return {
            "rule_id": None,
            "probable_cause": f"{item_name} 巡检项返回异常，需要结合当前输出、判定阈值和目标主机运行状态判断。",
            "impact": "可能影响该主机承载的业务服务稳定性，或影响应用环境健康评分。",
            "recommendation": "优先查看问题概览中的当前值、阈值和现场输出，再登录主机定位具体进程、分区、负载来源或服务状态。",
            "steps": [
                "查看问题概览中的当前值、阈值、执行命令和原始输出。",
                "登录目标主机，针对 CPU/内存/磁盘/负载/进程分别执行 top、free、df、uptime、ps 等命令复核。",
                "结合近期发布、定时任务、容器状态和系统日志确认异常来源。",
                "完成清理、扩容、限流或服务修复后重新执行巡检验证。",
            ],
            "verification": "重新巡检后该指标返回真实输出，并且当前值低于告警阈值。",
            "risk_level": issue.severity or "medium",
        }

    return None


def build_issue_insight(db: Session, issue: Issue) -> IssueInsight:
    existing = db.query(IssueInsight).filter(IssueInsight.issue_id == issue.id).one_or_none()
    result = db.get(TaskResult, issue.task_result_id) if issue.task_result_id else None
    direct_values = _fallback_issue_insight_values(issue, result)
    candidates = db.query(AnalysisRule).filter(AnalysisRule.enabled.is_(True)).all() if not direct_values else []
    ranked = sorted(((rule, _rule_score(rule, issue, result)) for rule in candidates), key=lambda item: item[1], reverse=True) if candidates else []
    rule = ranked[0][0] if ranked and ranked[0][1] > 0 else None
    if direct_values:
        values = direct_values
    elif rule:
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
