from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
import re
from typing import Any, Callable

from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.app.models import (
    AppEnvironment,
    AuditLog,
    AiWorkflow,
    AiWorkflowEvent,
    DiscoveredService,
    EnvironmentResource,
    EnvironmentRuleSet,
    InspectionReport,
    Issue,
    RepairTask,
    Resource,
    RuleSet,
    Task,
    TaskResult,
    User,
)
from backend.app.services.executors import ExecutionContext, InspectionExecutor
from backend.app.services.analysis import build_issue_insight
from backend.app.services.reports import persist_inspection_report
from backend.app.services.serializers import model_to_dict
from backend.app.worker.celery_app import run_inspection_task


OPSRADAR_AGENT_SYSTEM_PROMPT = """你是 OpsRadar AI 智能巡检助手。

你的职责不是单轮回答，而是根据用户意图编排平台工作流。

你必须先识别用户意图，包括：
1. 创建/执行巡检任务
2. 添加资产
3. 服务发现
4. 分析巡检异常
5. 根因定位
6. 生成修复建议
7. 创建修复任务
8. 执行修复任务
9. 查看报告或问题列表

当用户表达“创建巡检、执行巡检、帮我巡检某环境/应用”时，你必须将其识别为 create_and_run_inspection 工作流。

如果在执行过程中发现环境、应用、资产、服务或规则缺失，不要结束流程。你需要引导用户补齐缺失信息，并在补齐后继续原始工作流。

涉及创建、执行、修复、删除、重启、修改配置等动作时，必须先向用户确认。

你不能伪造资产、巡检结果、报告或问题。所有结果必须来自平台 Action 返回。

每次 Action 执行完成后，你必须根据 workflow 当前状态判断下一步，而不是直接结束对话。"""


@dataclass(frozen=True)
class ActionSpec:
    name: str
    permission: str
    description: str
    mutating: bool = False


ACTION_SPECS = {
    "get_platform_summary": ActionSpec("get_platform_summary", "ai_assistant:read", "查询平台真实统计"),
    "list_issues": ActionSpec("list_issues", "issues:read", "查询问题列表"),
    "list_environments": ActionSpec("list_environments", "environments:read", "查询应用环境"),
    "list_assets": ActionSpec("list_assets", "resources:read", "查询资产"),
    "create_asset": ActionSpec("create_asset", "resources:create", "创建资产", True),
    "test_asset_connection": ActionSpec("test_asset_connection", "resources:update", "测试资产连通性", True),
    "discover_services": ActionSpec("discover_services", "resources:update", "发现资产上的服务", True),
    "list_inspection_rule_sets": ActionSpec("list_inspection_rule_sets", "templates:read", "查询巡检规则集"),
    "create_inspection_task": ActionSpec("create_inspection_task", "tasks:create", "创建巡检任务", True),
    "run_inspection_task": ActionSpec("run_inspection_task", "tasks:create", "启动巡检任务", True),
    "get_inspection_result": ActionSpec("get_inspection_result", "tasks:read", "查询巡检结果"),
    "generate_inspection_report": ActionSpec("generate_inspection_report", "reports:export", "生成并持久化巡检报告", True),
    "create_issues_from_result": ActionSpec("create_issues_from_result", "issues:update", "从异常巡检结果创建问题", True),
}

WORKFLOW_ACTIONS = {
    "confirm_environment": ActionSpec("confirm_environment", "environments:read", "确认应用环境", True),
    "confirm_scope": ActionSpec("confirm_scope", "resources:read", "确认巡检范围", True),
    "skip_connection_test": ActionSpec("skip_connection_test", "resources:read", "跳过连通性测试", True),
    "skip_service_discovery": ActionSpec("skip_service_discovery", "resources:read", "跳过服务发现", True),
    "confirm_rules": ActionSpec("confirm_rules", "templates:read", "确认规则集", True),
    "refresh_workflow": ActionSpec("refresh_workflow", "ai_assistant:read", "刷新工作流状态"),
    "generate_repair_suggestion": ActionSpec("generate_repair_suggestion", "issues:read", "生成修复建议"),
    "create_repair_task": ActionSpec("create_repair_task", "repair_tasks:create", "创建修复任务", True),
    **ACTION_SPECS,
}


ENV_TYPE_LABELS = {
    "prod": "生产环境",
    "staging": "预发环境",
    "test": "测试环境",
    "dev": "开发环境",
    "uat": "UAT",
}


def _normalize_name(value: str) -> str:
    text = (value or "").lower()
    text = re.sub(r"(环境|系统|平台|集群|应用|服务)", "", text)
    text = re.sub(r"[^a-z0-9\u4e00-\u9fff]+", "", text)
    return text


def list_actions() -> list[dict]:
    return [
        {
            "name": item.name,
            "permission": item.permission,
            "description": item.description,
            "mutating": item.mutating,
        }
        for item in ACTION_SPECS.values()
    ]


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _env_payload(env: AppEnvironment) -> dict:
    data = model_to_dict(env)
    data["application_name"] = env.application.name if env.application else ""
    return data


def _resource_payload(resource: Resource) -> dict:
    data = model_to_dict(resource)
    data.pop("extra_params", None)
    return data


def _requested_application_name(message: str, envs: list[AppEnvironment]) -> str:
    text = (message or "").lower()
    normalized_message = _normalize_name(message)
    known_aliases = {
        "jumpserver": "JumpServer",
        "jms": "JumpServer",
        "itdevops": "ITDevOps",
        "itdevops环境": "ITDevOps 环境",
    }
    for alias, name in known_aliases.items():
        if alias in text or _normalize_name(alias) in normalized_message:
            return name
    for env in envs:
        app_name = env.application.name if env.application else ""
        normalized_app = _normalize_name(app_name)
        if app_name and (app_name.lower() in text or normalized_app and normalized_app in normalized_message):
            return app_name
    return ""


def _requested_env_type(message: str) -> str:
    text = (message or "").lower()
    if any(keyword in message for keyword in ["生产", "生成", "正式"]) or "prod" in text:
        return "prod"
    if "uat" in text:
        return "uat"
    if any(keyword in message for keyword in ["预发", "staging"]) or "stage" in text:
        return "staging"
    if any(keyword in message for keyword in ["测试", "qa"]) or "test" in text:
        return "test"
    if any(keyword in message for keyword in ["开发"]) or "dev" in text:
        return "dev"
    return ""


def _detect_intent(message: str) -> str:
    text = (message or "").lower()
    if any(keyword in message for keyword in ["多少问题", "几个问题", "问题数量", "当前问题", "现在问题", "有多少异常", "多少异常"]) or any(keyword in text for keyword in ["how many issues", "issue count", "list issues"]):
        return "query_issues"
    if any(keyword in message for keyword in ["平台概况", "系统概况", "当前数据", "统计", "多少资产", "多少任务", "多少报告"]) or any(keyword in text for keyword in ["summary", "overview", "how many assets", "how many tasks"]):
        return "query_platform_summary"
    if any(keyword in message for keyword in ["修复建议", "处理建议"]) or "repair suggestion" in text:
        return "generate_repair_suggestion"
    if any(keyword in message for keyword in ["创建修复任务", "生成修复任务"]):
        return "create_repair_task"
    if any(keyword in message for keyword in ["执行修复任务", "执行修复"]):
        return "execute_repair_task"
    if any(keyword in message for keyword in ["根因", "定位", "分析异常", "分析问题", "排障"]):
        return "analyze_issue"
    if any(keyword in message for keyword in ["服务发现", "发现服务"]):
        return "discover_services"
    if any(keyword in message for keyword in ["添加资产", "添加资源", "纳管资产", "纳管资源"]):
        return "add_asset"
    if any(keyword in message for keyword in ["报告", "问题列表", "查看问题"]):
        return "view_report_or_issues"
    if any(keyword in message for keyword in ["巡检", "检查"]) or any(keyword in text for keyword in ["inspection", "jumpserver", "itdevops"]):
        return "create_and_run_inspection"
    return "opsradar_qna"


def _is_inspection_intent(intent: str) -> bool:
    return intent == "create_and_run_inspection"


def _match_environment(message: str, envs: list[AppEnvironment]) -> tuple[AppEnvironment | None, str, str]:
    text = (message or "").lower()
    normalized_message = _normalize_name(message)
    requested_app = _requested_application_name(message, envs)
    requested_env_type = _requested_env_type(message)
    if requested_app:
        normalized_requested_app = _normalize_name(requested_app)
        candidates = [
            env
            for env in envs
            if env.application
            and (
                requested_app.lower() == env.application.name.lower()
                or normalized_requested_app == _normalize_name(env.application.name)
                or normalized_requested_app in _normalize_name(env.application.name)
                or _normalize_name(env.application.name) in normalized_requested_app
            )
        ]
        if requested_env_type:
            candidates = [
                env
                for env in candidates
                if env.env_type == requested_env_type or requested_env_type in env.name.lower()
            ]
        return (candidates[0] if candidates else None, requested_app, requested_env_type)

    candidates = [
        env
        for env in envs
        if env.name.lower() in text
        or (env.application and env.application.name.lower() in text)
        or (env.application and _normalize_name(env.application.name) in normalized_message)
    ]
    # For create/run inspection, matching by environment type alone is unsafe:
    # "生产环境 JumpServer" must not silently bind to ITDevOps / prod.
    return (candidates[0] if candidates else None, "", requested_env_type)


def _task_default_name(env: AppEnvironment | None) -> str:
    if not env:
        return "应用环境巡检"
    app_name = env.application.name if env.application else "应用"
    return f"{app_name} / {env.name} 巡检"


def _environment_resource_ids(env: AppEnvironment | None) -> list[str]:
    if not env:
        return []
    return sorted({binding.resource_id for binding in env.resources if binding.resource_id})


def _environment_rule_set_ids(env: AppEnvironment | None) -> list[str]:
    if not env:
        return []
    return sorted({binding.rule_set_id for binding in env.rule_sets if binding.enabled and binding.rule_set_id})


def _service_count_for_resources(db: Session, resource_ids: list[str]) -> int:
    if not resource_ids:
        return 0
    return db.query(DiscoveredService).filter(DiscoveredService.resource_id.in_(resource_ids)).count()


def _issues_for_task(db: Session, task_id: str | None) -> list[str]:
    if not task_id:
        return []
    return [row[0] for row in db.query(Issue.id).filter(Issue.task_id == task_id).all()]


def _report_for_task(db: Session, task_id: str | None) -> InspectionReport | None:
    if not task_id:
        return None
    return (
        db.query(InspectionReport)
        .filter(InspectionReport.task_id == task_id)
        .order_by(InspectionReport.created_at.desc())
        .first()
    )


def _ui_action(label: str, ui_action: str, **kwargs: Any) -> dict:
    data = {
        "label": label,
        "ui_action": ui_action,
        "action_name": kwargs.pop("action_name", None),
        "event": kwargs.pop("event", None),
        "params": kwargs.pop("params", {}),
        "requires_confirmation": kwargs.pop("requires_confirmation", False),
        "style": kwargs.pop("style", "secondary"),
    }
    data.update(kwargs)
    return data


def _set_workflow_state(
    workflow: AiWorkflow,
    state: str,
    status: str,
    current_step: str,
    next_actions: list[dict],
    last_error: str = "",
) -> None:
    workflow.state = state
    workflow.status = status
    workflow.current_step = current_step
    workflow.next_actions = next_actions
    workflow.last_error = last_error
    workflow.updated_at = _utcnow()


def _workflow_steps(workflow: AiWorkflow) -> list[dict]:
    state = workflow.state
    context = workflow.context or {}
    definitions = [
        ("ENV", "确认应用环境", "environment_id"),
        ("ASSET", "确认巡检范围", "scope_confirmed"),
        ("CONNECTION", "测试资产连通性", "connection_tested"),
        ("SERVICE", "服务发现", "service_discovered"),
        ("RULE", "确认规则集", "rules_confirmed"),
        ("TASK", "创建并执行巡检", "task_id"),
        ("REPORT", "生成报告与问题", "report_id"),
        ("SUMMARY", "AI 总结", "ai_summarized"),
    ]
    waiting = {
        "WAITING_ENV_CREATE": "ENV",
        "WAITING_ENV_CONFIRM": "ENV",
        "WAITING_ASSET_CREATE": "ASSET",
        "WAITING_SCOPE_CONFIRM": "ASSET",
        "WAITING_CONNECTION_TEST": "CONNECTION",
        "WAITING_SERVICE_DISCOVERY": "SERVICE",
        "WAITING_RULE_SELECT": "RULE",
        "WAITING_RULE_CONFIRM": "RULE",
        "WAITING_TASK_CREATE": "TASK",
        "WAITING_TASK_START": "TASK",
        "TASK_RUNNING": "TASK",
        "WAITING_REPORT_GENERATE": "REPORT",
        "WAITING_ISSUES_SYNC": "REPORT",
        "AI_SUMMARIZED": "SUMMARY",
    }.get(state)
    items = []
    for code, title, key in definitions:
        if state == "DONE":
            status = "completed"
        elif state == "CANCELLED":
            status = "skipped"
        elif waiting == code:
            status = "running" if state in {"TASK_RUNNING", "AI_SUMMARIZED"} else "awaiting_confirmation"
        elif context.get(key):
            status = "completed"
        else:
            status = "pending"
        items.append({"code": code, "title": title, "status": status})
    return items


def workflow_payload(db: Session, workflow: AiWorkflow) -> dict:
    return {
        "id": workflow.id,
        "intent": workflow.intent,
        "state": workflow.state,
        "status": workflow.status,
        "target": workflow.target or {},
        "context": workflow.context or {},
        "current_step": workflow.current_step,
        "next_actions": workflow.next_actions or [],
        "steps": _workflow_steps(workflow),
        "last_error": workflow.last_error,
        "created_at": workflow.created_at.isoformat() if workflow.created_at else None,
        "updated_at": workflow.updated_at.isoformat() if workflow.updated_at else None,
    }


def _record_workflow_event(db: Session, workflow: AiWorkflow, event: str, payload: dict | None = None, result: dict | None = None) -> None:
    db.add(AiWorkflowEvent(workflow_id=workflow.id, event=event, payload=payload or {}, result=result or {}))


def create_workflow(db: Session, user: User, session_id: str | None, message: str, context: dict | None = None) -> dict:
    intent = _detect_intent(message)
    envs = db.query(AppEnvironment).all()
    matched_env, requested_app, requested_env_type = _match_environment(message, envs)
    target = {
        "message": message,
        "application_name": requested_app,
        "env_type": requested_env_type or "prod",
        "env_label": ENV_TYPE_LABELS.get(requested_env_type or "prod", "生产环境"),
    }
    workflow = AiWorkflow(
        session_id=session_id,
        intent=intent,
        state="START",
        status="running",
        target=target,
        context={"request_context": context or {}},
        created_by=user.id,
    )
    db.add(workflow)
    db.flush()
    if matched_env:
        workflow.context = {
            **(workflow.context or {}),
            "candidate_environment_id": matched_env.id,
            "candidate_application_name": matched_env.application.name if matched_env.application else "",
            "candidate_environment_name": matched_env.name,
        }
    _record_workflow_event(db, workflow, "workflow_created", {"message": message, "context": context or {}}, {"intent": intent})
    _advance_workflow(db, workflow)
    db.commit()
    db.refresh(workflow)
    return workflow_payload(db, workflow)


def build_workflow(db: Session, message: str, context: dict | None = None) -> dict:
    envs = db.query(AppEnvironment).all()
    matched_env, requested_app, requested_env_type = _match_environment(message, envs)
    intent = _detect_intent(message)
    workflow = AiWorkflow(
        id="preview",
        intent=intent,
        state="START",
        status="running",
        target={
            "message": message,
            "application_name": requested_app,
            "env_type": requested_env_type or "prod",
            "env_label": ENV_TYPE_LABELS.get(requested_env_type or "prod", "生产环境"),
        },
        context={"request_context": context or {}},
    )
    if matched_env:
        workflow.context = {
            **(workflow.context or {}),
            "candidate_environment_id": matched_env.id,
            "candidate_application_name": matched_env.application.name if matched_env.application else "",
            "candidate_environment_name": matched_env.name,
        }
    _advance_workflow(db, workflow)
    return workflow_payload(db, workflow)


def _advance_workflow(db: Session, workflow: AiWorkflow) -> None:
    if workflow.status == "cancelled":
        _set_workflow_state(workflow, "CANCELLED", "cancelled", "已取消", [], workflow.last_error)
        return
    if workflow.intent == "opsradar_qna":
        _set_workflow_state(workflow, "NO_WORKFLOW", "not_required", "", [], "")
        return
    if workflow.intent != "create_and_run_inspection":
        _set_workflow_state(
            workflow,
            "INTENT_PARSED",
            "waiting_user",
            "等待用户确认动作",
            [
                _ui_action("添加资产", "open_resource_modal", event="asset_created", style="primary"),
                _ui_action("查看问题列表", "navigate", params={"view": "problem-center", "tab": "issues"}),
                _ui_action("查看报告", "navigate", params={"view": "reports", "tab": "reports"}),
            ],
        )
        return

    context = dict(workflow.context or {})
    target = workflow.target or {}
    env_id = context.get("environment_id")
    env = db.get(AppEnvironment, env_id) if env_id else None
    if not env and context.get("candidate_environment_id"):
        candidate = db.get(AppEnvironment, context.get("candidate_environment_id"))
        if candidate:
            _set_workflow_state(
                workflow,
                "WAITING_ENV_CONFIRM",
                "waiting_user",
                "确认应用环境",
                [
                    _ui_action(
                        "确认使用该应用环境",
                        "run_workflow_action",
                        action_name="confirm_environment",
                        params={"environment_id": candidate.id},
                        requires_confirmation=True,
                        style="primary",
                    ),
                    _ui_action("重新选择", "open_application_modal", event="environment_created", params={"env_type": target.get("env_type") or "prod"}),
                    _ui_action("取消", "run_workflow_action", action_name="cancel", requires_confirmation=True),
                ],
            )
            return
    if not env:
        app_name = target.get("application_name") or ""
        _set_workflow_state(
            workflow,
            "WAITING_ENV_CREATE",
            "waiting_user",
            "确认应用环境",
            [
                _ui_action(
                    "创建应用环境",
                    "open_application_modal",
                    event="environment_created",
                    params={"name": app_name, "env_type": target.get("env_type") or "prod"},
                    style="primary",
                ),
                _ui_action("终止流程", "run_workflow_action", action_name="cancel", requires_confirmation=True),
            ],
            f"未找到 {app_name or '目标应用'} / {target.get('env_label') or '目标环境'}",
        )
        return

    resource_ids = sorted({item for item in (context.get("resource_ids") or []) if item})
    env_resource_ids = _environment_resource_ids(env)
    service_count = _service_count_for_resources(db, resource_ids or env_resource_ids)
    if not context.get("scope_confirmed"):
        if env_resource_ids:
            _set_workflow_state(
                workflow,
                "WAITING_SCOPE_CONFIRM",
                "waiting_user",
                "确认巡检范围",
                [
                    _ui_action(
                        "确认巡检范围",
                        "run_workflow_action",
                        action_name="confirm_scope",
                        params={"environment_id": env.id, "resource_ids": env_resource_ids},
                        requires_confirmation=True,
                        style="primary",
                    ),
                    _ui_action("添加资产", "open_resource_modal", event="asset_created", params={"environment_id": env.id}),
                    _ui_action("选择资产", "select_assets", event="asset_selected", params={"environment_id": env.id}),
                ],
            )
            return
        _set_workflow_state(
            workflow,
            "WAITING_ASSET_CREATE",
            "waiting_user",
            "添加/选择资产",
            [
                _ui_action("添加资产", "open_resource_modal", event="asset_created", params={"environment_id": env.id}, style="primary"),
                _ui_action("终止流程", "run_workflow_action", action_name="cancel", requires_confirmation=True),
            ],
            "该应用环境下暂无可巡检资产",
        )
        return

    if not resource_ids:
        resource_ids = env_resource_ids
        context["resource_ids"] = resource_ids
        workflow.context = context

    if not context.get("connection_tested"):
        _set_workflow_state(
            workflow,
            "WAITING_CONNECTION_TEST",
            "waiting_user",
            "测试资产连通性",
            [
                _ui_action(
                    "测试资产连通性",
                    "run_workflow_action",
                    action_name="test_asset_connection",
                    params={"resource_ids": resource_ids},
                    requires_confirmation=True,
                    style="primary",
                ),
                _ui_action("跳过测试", "run_workflow_action", action_name="skip_connection_test", requires_confirmation=True),
            ],
        )
        return

    if not context.get("service_discovered"):
        _set_workflow_state(
            workflow,
            "WAITING_SERVICE_DISCOVERY",
            "waiting_user",
            "服务发现",
            [
                _ui_action(
                    "执行服务发现",
                    "run_workflow_action",
                    action_name="discover_services",
                    params={"resource_ids": resource_ids},
                    requires_confirmation=True,
                    style="primary",
                ),
                _ui_action("跳过服务发现", "run_workflow_action", action_name="skip_service_discovery", requires_confirmation=True),
            ],
        )
        return

    rule_set_ids = sorted({item for item in (context.get("rule_set_ids") or []) if item})
    env_rule_set_ids = _environment_rule_set_ids(env)
    if not context.get("rules_confirmed"):
        if env_rule_set_ids:
            _set_workflow_state(
                workflow,
                "WAITING_RULE_CONFIRM",
                "waiting_user",
                "确认规则集",
                [
                    _ui_action(
                        "确认规则集",
                        "run_workflow_action",
                        action_name="confirm_rules",
                        params={"environment_id": env.id, "rule_set_ids": env_rule_set_ids},
                        requires_confirmation=True,
                        style="primary",
                    ),
                    _ui_action("调整规则集", "open_environment_rules_modal", event="rules_confirmed", params={"environment_id": env.id}),
                ],
            )
            return
        _set_workflow_state(
            workflow,
            "WAITING_RULE_SELECT",
            "waiting_user",
            "选择规则集",
            [
                _ui_action("绑定规则集", "open_environment_rules_modal", event="rules_confirmed", params={"environment_id": env.id}, style="primary"),
                _ui_action("跳过规则集", "run_workflow_action", action_name="confirm_rules", params={"rule_set_ids": []}, requires_confirmation=True),
            ],
            "应用环境尚未绑定规则集",
        )
        return

    if not rule_set_ids:
        rule_set_ids = env_rule_set_ids
        context["rule_set_ids"] = rule_set_ids
        workflow.context = context

    task_id = context.get("task_id")
    task = db.get(Task, task_id) if task_id else None
    if not task:
        _set_workflow_state(
            workflow,
            "WAITING_TASK_CREATE",
            "waiting_user",
            "创建巡检任务",
            [
                _ui_action(
                    "打开巡检任务",
                    "open_task_modal",
                    event="task_created",
                    params={
                        "environment_id": env.id,
                        "name": _task_default_name(env),
                        "resource_ids": resource_ids,
                        "rule_set_ids": rule_set_ids,
                    },
                    style="primary",
                )
            ],
        )
        return

    if task.status in {"pending", "failed"} and not context.get("task_started"):
        _set_workflow_state(
            workflow,
            "WAITING_TASK_START",
            "waiting_user",
            "启动巡检任务",
            [
                _ui_action(
                    "启动巡检任务",
                    "run_workflow_action",
                    action_name="run_inspection_task",
                    params={"task_id": task.id},
                    requires_confirmation=True,
                    style="primary",
                ),
                _ui_action("查看任务", "navigate", params={"view": "inspection", "tab": "tasks"}),
            ],
        )
        return

    if task.status in {"queued", "running"}:
        _set_workflow_state(
            workflow,
            "TASK_RUNNING",
            "running",
            "执行巡检任务",
            [
                _ui_action("刷新状态", "run_workflow_action", action_name="refresh_workflow"),
                _ui_action("查看任务", "navigate", params={"view": "inspection", "tab": "tasks"}),
            ],
        )
        return

    report = _report_for_task(db, task.id)
    if report and not context.get("report_id"):
        context["report_id"] = report.id
        workflow.context = context
    if task.status in {"finished", "failed", "cancelled"} and not context.get("report_id"):
        _set_workflow_state(
            workflow,
            "WAITING_REPORT_GENERATE",
            "waiting_user",
            "生成巡检报告",
            [
                _ui_action(
                    "生成巡检报告",
                    "run_workflow_action",
                    action_name="generate_inspection_report",
                    params={"task_id": task.id},
                    requires_confirmation=True,
                    style="primary",
                )
            ],
        )
        return

    issue_ids = _issues_for_task(db, task.id)
    if issue_ids and not context.get("issues_created"):
        context["issue_ids"] = issue_ids
        context["issues_created"] = True
        workflow.context = context
    if task.status in {"finished", "failed", "cancelled"} and not context.get("issues_created"):
        _set_workflow_state(
            workflow,
            "WAITING_ISSUES_SYNC",
            "waiting_user",
            "同步问题列表",
            [
                _ui_action(
                    "同步问题列表",
                    "run_workflow_action",
                    action_name="create_issues_from_result",
                    params={"task_id": task.id},
                    requires_confirmation=True,
                    style="primary",
                )
            ],
        )
        return

    context["ai_summarized"] = True
    workflow.context = context
    _set_workflow_state(
        workflow,
        "DONE",
        "done",
        "巡检闭环完成",
        [
            _ui_action("查看巡检报告", "navigate", params={"view": "reports", "tab": "reports", "report_id": context.get("report_id")}, style="primary"),
            _ui_action("查看问题列表", "navigate", params={"view": "problem-center", "tab": "issues"}),
            _ui_action("生成修复建议", "run_workflow_action", action_name="generate_repair_suggestion", params={"issue_ids": context.get("issue_ids", [])}),
            _ui_action("创建修复任务", "run_workflow_action", action_name="create_repair_task", params={"issue_ids": context.get("issue_ids", [])}, requires_confirmation=True),
        ],
    )


def _find_environment_from_event(db: Session, workflow: AiWorkflow, payload: dict) -> AppEnvironment | None:
    env_id = payload.get("environment_id") or payload.get("id")
    if env_id:
        env = db.get(AppEnvironment, env_id)
        if env:
            return env
    app_id = payload.get("application_id") or payload.get("app_id")
    target = workflow.target or {}
    if app_id:
        env_type = payload.get("env_type") or target.get("env_type") or "prod"
        env = (
            db.query(AppEnvironment)
            .filter(AppEnvironment.application_id == app_id, AppEnvironment.env_type == env_type)
            .order_by(AppEnvironment.created_at.asc())
            .first()
        )
        if env:
            return env
    app_name = payload.get("application_name") or payload.get("name") or target.get("application_name")
    if app_name:
        env_type = payload.get("env_type") or target.get("env_type") or "prod"
        return (
            db.query(AppEnvironment)
            .filter(AppEnvironment.env_type == env_type)
            .filter(AppEnvironment.application.has(name=app_name))
            .order_by(AppEnvironment.created_at.asc())
            .first()
        )
    return None


def handle_workflow_event(db: Session, workflow: AiWorkflow, event: str, payload: dict | None = None) -> dict:
    payload = payload or {}
    context = dict(workflow.context or {})
    result: dict[str, Any] = {}
    if event in {"environment_created", "environment_selected"}:
        env = _find_environment_from_event(db, workflow, payload)
        if env:
            context.update({"environment_id": env.id, "application_id": env.application_id, "environment_confirmed": True})
            context.pop("candidate_environment_id", None)
            result = {"environment_id": env.id}
    elif event in {"asset_created", "asset_selected"}:
        ids = payload.get("resource_ids") or payload.get("asset_ids") or []
        if payload.get("resource_id"):
            ids.append(payload["resource_id"])
        if payload.get("id") and event == "asset_created":
            ids.append(payload["id"])
        context["resource_ids"] = sorted(set((context.get("resource_ids") or []) + [item for item in ids if item]))
        context["scope_confirmed"] = bool(context["resource_ids"])
        result = {"resource_ids": context.get("resource_ids", [])}
    elif event == "connection_tested":
        context["connection_tested"] = True
        result = {"connection_tested": True}
    elif event == "services_discovered":
        context["service_discovered"] = True
        context["service_ids"] = sorted(set((context.get("service_ids") or []) + (payload.get("service_ids") or [])))
        result = {"service_count": len(context.get("service_ids") or [])}
    elif event == "rules_confirmed":
        context["rule_set_ids"] = sorted({item for item in (payload.get("rule_set_ids") or []) if item})
        context["rules_confirmed"] = True
        result = {"rule_set_ids": context["rule_set_ids"]}
    elif event == "task_created":
        task_id = payload.get("task_id") or payload.get("id")
        task = db.get(Task, task_id) if task_id else None
        if task:
            context["task_id"] = task.id
            result = {"task_id": task.id}
    elif event == "task_finished":
        task_id = payload.get("task_id") or context.get("task_id")
        if task_id:
            context["task_id"] = task_id
            report = _report_for_task(db, task_id)
            if report:
                context["report_id"] = report.id
            issue_ids = _issues_for_task(db, task_id)
            if issue_ids:
                context["issue_ids"] = issue_ids
                context["issues_created"] = True
            result = {"task_id": task_id, "report_id": context.get("report_id"), "issue_ids": context.get("issue_ids", [])}
    workflow.context = context
    _record_workflow_event(db, workflow, event, payload, result)
    _advance_workflow(db, workflow)
    db.commit()
    db.refresh(workflow)
    return workflow_payload(db, workflow)


async def execute_workflow_action(
    db: Session,
    user: User,
    workflow: AiWorkflow,
    action_name: str,
    params: dict | None,
    confirmed: bool,
    has_permission: Callable[[str], bool],
) -> dict:
    params = params or {}
    if action_name == "cancel":
        workflow.status = "cancelled"
        workflow.state = "CANCELLED"
        workflow.last_error = "用户取消"
        _record_workflow_event(db, workflow, "cancelled", params, {"status": "cancelled"})
        db.commit()
        db.refresh(workflow)
        return {"workflow": workflow_payload(db, workflow), "action_result": _action_result("cancelled", "流程已取消")}
    spec = WORKFLOW_ACTIONS.get(action_name)
    if not spec:
        raise HTTPException(status_code=404, detail="Workflow action is not registered")
    if not has_permission(spec.permission):
        raise HTTPException(status_code=403, detail=f"Missing permission: {spec.permission}")
    if spec.mutating and not confirmed:
        return {
            "workflow": workflow_payload(db, workflow),
            "action_result": _action_result("awaiting_confirmation", "该动作会推进流程或修改平台数据，需要确认。", requires_confirmation=True, action=action_name, params=params),
        }

    context = dict(workflow.context or {})
    result: dict[str, Any]
    if action_name == "confirm_environment":
        env_id = params.get("environment_id") or context.get("candidate_environment_id")
        env = db.get(AppEnvironment, env_id) if env_id else None
        if not env:
            raise HTTPException(status_code=404, detail="Application environment not found")
        context.update({"environment_id": env.id, "application_id": env.application_id, "environment_confirmed": True})
        context.pop("candidate_environment_id", None)
        workflow.context = context
        result = _action_result("success", "已确认应用环境", {"environment_id": env.id}, next_state="ENV_CHECKED")
    elif action_name == "confirm_scope":
        env = db.get(AppEnvironment, params.get("environment_id") or context.get("environment_id"))
        resource_ids = params.get("resource_ids") or _environment_resource_ids(env)
        if not resource_ids:
            raise HTTPException(status_code=422, detail="No resources selected")
        context["resource_ids"] = sorted(set(resource_ids))
        context["scope_confirmed"] = True
        workflow.context = context
        result = _action_result("success", "已确认巡检范围", {"resource_ids": context["resource_ids"]}, next_state="ASSET_CHECKED")
    elif action_name == "skip_connection_test":
        context["connection_tested"] = True
        context["connection_test_skipped"] = True
        workflow.context = context
        result = _action_result("success", "已跳过连通性测试", next_state="CONNECTION_TESTED")
    elif action_name == "skip_service_discovery":
        context["service_discovered"] = True
        context["service_discovery_skipped"] = True
        workflow.context = context
        result = _action_result("success", "已跳过服务发现", next_state="SERVICE_DISCOVERED")
    elif action_name == "confirm_rules":
        env = db.get(AppEnvironment, params.get("environment_id") or context.get("environment_id"))
        rule_set_ids = params.get("rule_set_ids")
        if rule_set_ids is None:
            rule_set_ids = _environment_rule_set_ids(env)
        context["rule_set_ids"] = sorted({item for item in rule_set_ids if item})
        context["rules_confirmed"] = True
        workflow.context = context
        result = _action_result("success", "已确认规则集", {"rule_set_ids": context["rule_set_ids"]}, next_state="RULE_MATCHED")
    elif action_name == "test_asset_connection":
        ids = params.get("resource_ids") or context.get("resource_ids") or []
        tested = []
        for resource_id in ids:
            item = await _execute_registered_action(db, user, "test_asset_connection", {"resource_id": resource_id})
            tested.append(item)
        context["connection_tested"] = True
        workflow.context = context
        result = _action_result("success", f"已测试 {len(tested)} 个资产", {"items": tested}, next_state="CONNECTION_TESTED")
    elif action_name == "discover_services":
        ids = params.get("resource_ids") or context.get("resource_ids") or []
        discovered: list[dict] = []
        for resource_id in ids:
            try:
                discovered.append(await _execute_registered_action(db, user, "discover_services", {"resource_id": resource_id}))
            except HTTPException as exc:
                discovered.append({"status": "failed", "resource_id": resource_id, "message": exc.detail})
        context["service_discovered"] = True
        context["service_ids"] = sorted({service["id"] for item in discovered for service in item.get("services", []) if service.get("id")})
        workflow.context = context
        result = _action_result("success", f"服务发现完成，发现 {len(context['service_ids'])} 个服务", {"items": discovered}, next_state="SERVICE_DISCOVERED")
    elif action_name == "run_inspection_task":
        result = await _execute_registered_action(db, user, "run_inspection_task", {"task_id": params.get("task_id") or context.get("task_id")})
        context["task_started"] = True
        workflow.context = context
    elif action_name == "generate_inspection_report":
        result = await _execute_registered_action(db, user, "generate_inspection_report", {"task_id": params.get("task_id") or context.get("task_id")})
        report = result.get("report") or {}
        context["report_id"] = report.get("id")
        workflow.context = context
    elif action_name == "create_issues_from_result":
        result = await _execute_registered_action(db, user, "create_issues_from_result", {"task_id": params.get("task_id") or context.get("task_id")})
        context["issues_created"] = True
        context["issue_ids"] = _issues_for_task(db, context.get("task_id"))
        workflow.context = context
    elif action_name == "refresh_workflow":
        result = _action_result("success", "已刷新流程状态")
    elif action_name == "generate_repair_suggestion":
        issue_ids = params.get("issue_ids") or context.get("issue_ids") or []
        issues = db.query(Issue).filter(Issue.id.in_(issue_ids)).all() if issue_ids else []
        suggestions = []
        for issue in issues:
            insight = build_issue_insight(db, issue)
            suggestions.append(
                {
                    "issue_id": issue.id,
                    "summary": issue.summary,
                    "probable_cause": insight.probable_cause,
                    "recommendation": insight.recommendation,
                    "steps": insight.steps or [],
                    "verification": insight.verification,
                }
            )
        result = _action_result("success", f"已生成 {len(suggestions)} 条修复建议", {"suggestions": suggestions}, next_action="create_repair_task")
    elif action_name == "create_repair_task":
        issue_ids = params.get("issue_ids") or context.get("issue_ids") or []
        issues = db.query(Issue).filter(Issue.id.in_(issue_ids)).all() if issue_ids else []
        created = []
        for issue in issues:
            existing = db.query(RepairTask).filter(RepairTask.issue_id == issue.id).first()
            if existing:
                created.append(model_to_dict(existing))
                continue
            insight = build_issue_insight(db, issue)
            task = RepairTask(
                issue_id=issue.id,
                title=f"修复：{issue.summary[:180]}",
                status="pending",
                assignee=issue.assignee or "Unassigned",
                suggested_steps=insight.steps or [],
                verification=insight.verification or "",
                created_by_ai=True,
            )
            db.add(task)
            db.flush()
            created.append(model_to_dict(task))
        result = _action_result("success", f"已创建/关联 {len(created)} 个修复任务", {"repair_tasks": created})
    elif action_name in ACTION_SPECS:
        result = await _execute_registered_action(db, user, action_name, params)
    else:
        result = _action_result("not_implemented", "该工作流动作暂未实现")

    _record_workflow_event(db, workflow, f"action:{action_name}", params, result)
    db.add(AuditLog(actor=user.display_name, action=f"ai_workflow_action:{action_name}", target=workflow.id, detail=str({k: v for k, v in params.items() if k not in {"credential_secret", "api_key"}})[:1000], result=result.get("status", "success")))
    _advance_workflow(db, workflow)
    db.commit()
    db.refresh(workflow)
    return {"workflow": workflow_payload(db, workflow), "action_result": result}


def cancel_workflow(db: Session, workflow: AiWorkflow) -> dict:
    workflow.status = "cancelled"
    workflow.state = "CANCELLED"
    workflow.last_error = "用户取消"
    _record_workflow_event(db, workflow, "cancelled", {}, {"status": "cancelled"})
    db.commit()
    db.refresh(workflow)
    return workflow_payload(db, workflow)


def _action_result(
    status: str,
    summary: str,
    data: dict | None = None,
    next_action: str | None = None,
    next_state: str | None = None,
    requires_confirmation: bool = False,
    ui_action: dict | None = None,
    **extra: Any,
) -> dict:
    payload = {
        "status": status,
        "summary": summary,
        "data": data or {},
        "next_action": next_action,
        "next_state": next_state,
        "requires_confirmation": requires_confirmation,
        "ui_action": ui_action,
    }
    payload.update(extra)
    return payload


def platform_summary(db: Session) -> dict:
    return {
        "applications": db.query(AppEnvironment.application_id).distinct().count(),
        "environments": db.query(AppEnvironment).count(),
        "resources": db.query(Resource).count(),
        "online_resources": db.query(Resource).filter(Resource.status == "online").count(),
        "tasks": db.query(Task).count(),
        "running_tasks": db.query(Task).filter(Task.status.in_(["pending", "queued", "running"])).count(),
        "reports": db.query(InspectionReport).count(),
        "issues": db.query(Issue).count(),
        "open_issues": db.query(Issue).filter(Issue.status == "open").count(),
        "resolved_issues": db.query(Issue).filter(Issue.status == "resolved").count(),
        "critical_issues": db.query(Issue).filter(Issue.severity == "critical").count(),
        "high_issues": db.query(Issue).filter(Issue.severity == "high").count(),
    }


def issue_list_payload(db: Session, limit: int = 20) -> dict:
    items = (
        db.query(Issue)
        .order_by(Issue.created_at.desc())
        .limit(max(1, min(limit, 100)))
        .all()
    )
    return {
        "total": db.query(Issue).count(),
        "open": db.query(Issue).filter(Issue.status == "open").count(),
        "items": [
            {
                "id": issue.id,
                "summary": issue.summary,
                "severity": issue.severity,
                "status": issue.status,
                "resource_id": issue.resource_id,
                "task_id": issue.task_id,
                "created_at": issue.created_at.isoformat() if issue.created_at else None,
            }
            for issue in items
        ],
    }


async def execute_action(db: Session, user: User, action_name: str, params: dict, confirmed: bool, has_permission: Callable[[str], bool]) -> dict:
    spec = ACTION_SPECS.get(action_name)
    if not spec:
        raise HTTPException(status_code=404, detail="AI action is not registered")
    if not has_permission(spec.permission):
        raise HTTPException(status_code=403, detail=f"Missing permission: {spec.permission}")
    if spec.mutating and not confirmed:
        return _action_result("awaiting_confirmation", "该动作会修改平台数据，需要用户确认。", action=spec.name, params=params, requires_confirmation=True)

    result = await _execute_registered_action(db, user, spec.name, params)
    db.add(
        AuditLog(
            actor=user.display_name,
            action=f"ai_action:{spec.name}",
            target=str(params.get("name") or params.get("id") or params.get("task_id") or ""),
            detail=str({key: value for key, value in params.items() if key not in {"credential_secret", "api_key"}})[:1000],
            result=result.get("status", "success"),
        )
    )
    db.commit()
    return result


async def _execute_registered_action(db: Session, user: User, action_name: str, params: dict) -> dict:
    if action_name == "get_platform_summary":
        return _action_result("success", "平台统计查询完成", platform_summary(db), next_state="DATA_RETURNED")
    if action_name == "list_issues":
        data = issue_list_payload(db, int(params.get("limit") or 20))
        return _action_result("success", f"问题查询完成：共 {data['total']} 个问题，待处理 {data['open']} 个", data, next_state="DATA_RETURNED")
    if action_name == "list_environments":
        return _action_result("success", "应用环境查询完成", {"items": [_env_payload(item) for item in db.query(AppEnvironment).order_by(AppEnvironment.created_at.desc()).all()]})
    if action_name == "list_assets":
        query = db.query(Resource).order_by(Resource.created_at.desc())
        return _action_result("success", "资产查询完成", {"items": [_resource_payload(item) for item in query.limit(200).all()]})
    if action_name == "list_inspection_rule_sets":
        return _action_result("success", "规则集查询完成", {"items": [model_to_dict(item) for item in db.query(RuleSet).order_by(RuleSet.name).all()]})
    if action_name == "get_inspection_result":
        task = db.get(Task, params.get("task_id"))
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        results = db.query(TaskResult).filter(TaskResult.task_id == task.id).limit(200).all()
        return _action_result("success", "巡检结果查询完成", {"task": model_to_dict(task), "results": [model_to_dict(item) for item in results]})
    if action_name == "test_asset_connection":
        resource = db.get(Resource, params.get("resource_id") or params.get("id"))
        if not resource:
            raise HTTPException(status_code=404, detail="Resource not found")
        from backend.app.api.routes import connection_test_item, resource_execution_snapshot

        execution = await InspectionExecutor().execute(ExecutionContext(resource=resource_execution_snapshot(resource), item=connection_test_item(resource)))
        resource.status = "online" if execution.status == "success" else "offline"
        return _action_result(execution.status, execution.error_message or execution.output or "连通性测试完成", {"resource": _resource_payload(resource)})
    if action_name == "discover_services":
        resource = db.get(Resource, params.get("resource_id") or params.get("id"))
        if not resource:
            raise HTTPException(status_code=404, detail="Resource not found")
        if resource.type not in {"host", "linux", "server"}:
            raise HTTPException(status_code=422, detail="Service discovery is only available for Linux host resources")
        if resource.status != "online":
            raise HTTPException(status_code=422, detail="Service discovery is only available for online resources")
        from backend.app.api.routes import resource_execution_snapshot
        from backend.app.services.service_discovery import discover_services_for_resource, discovered_service_payload

        services = await discover_services_for_resource(db, resource, resource_execution_snapshot(resource), params.get("filters") or {})
        return _action_result("success", f"发现 {len(services)} 个服务", {"resource": _resource_payload(resource), "services": [discovered_service_payload(item) for item in services]})
    if action_name == "run_inspection_task":
        task = db.get(Task, params.get("task_id"))
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        if task.status not in {"pending", "failed"}:
            raise HTTPException(status_code=409, detail=f"Task cannot be started from status {task.status}")
        task.status = "queued"
        task.started_at = None
        task.finished_at = None
        run_inspection_task.delay(task.id)
        return _action_result("queued", "巡检任务已投递 worker", {"task_id": task.id}, next_state="TASK_RUNNING")
    if action_name == "generate_inspection_report":
        task = db.get(Task, params.get("task_id"))
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        report = persist_inspection_report(db, task)
        return _action_result("success", "巡检报告已生成", {"report": model_to_dict(report)}, next_state="REPORT_GENERATED")
    if action_name == "create_issues_from_result":
        task_id = params.get("task_id")
        task = db.get(Task, task_id) if task_id else None
        report = _report_for_task(db, task_id)
        results = db.query(TaskResult).filter(TaskResult.task_id == task_id, TaskResult.status.in_(["fail", "exception"])).all()
        created = 0
        for result in results:
            exists = db.query(Issue).filter(Issue.task_result_id == result.id).first()
            if exists:
                continue
            db.add(
                Issue(
                    task_result_id=result.id,
                    task_id=result.task_id,
                    resource_id=result.resource_id,
                    item_id=result.item_id,
                    report_id=report.id if report else None,
                    source_type="inspection_task",
                    source_id=result.task_id,
                    evidence_snapshot={"resource": result.resource_snapshot, "item": result.item_snapshot, "output": result.output, "error_message": result.error_message},
                    summary=f"{result.resource_snapshot.get('name')} / {result.item_snapshot.get('name')} {result.status}",
                    severity="high" if result.status == "exception" else "medium",
                    status="open",
                )
            )
            created += 1
        return _action_result("success", f"已同步 {created} 个问题", {"created": created, "task": model_to_dict(task) if task else {}}, next_state="ISSUES_CREATED")
    if action_name in {"create_asset", "create_inspection_task"}:
        return _action_result("not_implemented", "该动作需要打开业务弹窗，由用户确认后提交。")
    raise HTTPException(status_code=404, detail="AI action handler is not implemented")
