const NAV_ITEMS = [
  ["dashboard", "dashboard"],
  ["environments", "cloud"],
  ["tasks", "tasks"],
  ["problem-center", "alert"],
  ["reports", "reports"],
  ["ai-center", "shield"],
  ["audit", "audit"],
  ["settings", "settings"],
];

const I18N = {
  en: {
    "brand.subtitle": "Inspection Operations",
    "brand.loginSubtitle": "Automated Inspection Management Platform",
    "login.eyebrow": "AI-driven Intelligent Inspection Platform",
    "login.title": "AI-driven Intelligent Inspection Platform",
    "login.desc": "Automatically detect issues, analyze root causes, provide remediation suggestions, and support AI-assisted interactive incident handling and task execution with report archiving and issue closure.",
    "login.applications": "Applications",
    "login.managedResources": "Managed Resources",
    "login.auditEvents": "Audit Events",
    "login.signIn": "Sign in",
    "login.access": "",
    "login.username": "Username",
    "login.password": "Password",
    "login.submit": "Sign in to console",
    "login.remember": "Remember me",
    "login.forgot": "Forgot password?",
    "login.issueLoop": "Smart Overview",
    "login.issueLoopDesc": "Summarize resources, tasks, issues and risk trends",
    "login.taskOps": "Smart Inspection",
    "login.taskOpsDesc": "Run inspections with rules, tools and intelligent checks",
    "login.reportHub": "Analysis Reports",
    "login.reportHubDesc": "Generate summaries, root causes and remediation advice",
    "login.issueClosure": "Issue Closure",
    "login.issueClosureDesc": "Drive diagnosis, suggestions, validation and closure",
    "nav.dashboard": "Overview",
    "nav.environments": "Resources",
    "nav.templates": "Inspection Templates",
    "nav.tasks": "Inspection",
    "nav.problem-center": "Issues",
    "nav.reports": "Reports",
    "nav.ai-center": "AI +",
    "nav.issues": "Issues",
    "nav.users": "User Management",
    "nav.roles": "Roles & Permissions",
    "nav.audit": "Audit",
    "nav.settings": "Settings",
    "page.dashboard": "Overview",
    "page.environments": "Resources",
    "page.templates": "Inspection Templates",
    "page.tasks": "Inspection",
    "page.problem-center": "Issues",
    "page.reports": "Reports",
    "page.ai-center": "AI +",
    "page.issues": "Issue Management",
    "page.users": "User Management",
    "page.roles": "Roles & Permissions",
    "page.audit": "Audit",
    "page.settings": "Settings",
    "top.home": "Home",
    "top.notifications": "Notifications",
    "top.sync": "Sync Status",
    "top.light": "Light",
    "top.dark": "Dark",
    "top.darkMode": "Dark Mode",
    "top.lightMode": "Light Mode",
    "top.language": "Language",
    "top.logout": "Logout",
    "search.placeholder": "Search resources, templates, tasks, problems, reports...",
    "search.local": "Search current list...",
    "search.empty": "No matching records",
    "search.hint": "Global search",
    "cards.totalUsers": "Total Users",
    "cards.totalUsersFoot": "RBAC-enabled operators",
    "cards.loginsToday": "Logins Today",
    "cards.loginsTodayFoot": "Interactive and token sessions",
    "cards.auditEvents": "Audit Events",
    "cards.auditEventsFoot": "Recent control-plane events",
    "cards.applications": "Applications",
    "cards.applicationsFoot": "Application environment units",
    "cards.managedResources": "Resources",
    "cards.openIssues": "Open Issues",
    "dashboard.cronTasks": "Cron",
    "dashboard.manualTasks": "Manual",
    "dashboard.scheduledTasks": "Plans",
    "dashboard.runningTasks": "Running",
    "dashboard.weekReports": "Last 7 days: {count}",
    "dashboard.onlineRate": "Online {rate}%",
    "dashboard.onlineRateLabel": "Online Rate",
    "dashboard.abnormalRate": "Abnormal {rate}%",
    "dashboard.abnormalRateLabel": "Abnormal Rate",
    "dashboard.taskTrend": "Inspection Task Trend",
    "dashboard.taskTrendDesc": "Tasks created in the last seven days, separated by total and cron tasks.",
    "dashboard.reportTrend": "Report Trend",
    "dashboard.reportTrendDesc": "Reports generated in the last seven days and abnormal findings.",
    "dashboard.taskCount": "Tasks",
    "dashboard.reportCount": "Reports",
    "dashboard.abnormalItems": "Abnormal Items",
    "dashboard.successItems": "Successful Items",
    "dashboard.inspectionOverview": "Inspection Overview",
    "dashboard.resourceCoverage": "Resource Coverage",
    "dashboard.taskComposition": "Task Composition",
    "dashboard.issueFocus": "Open Issue Focus",
    "dashboard.noIssues": "No open inspection issues.",
    "dashboard.viewAll": "View all",
    "dashboard.viewIssues": "View issues",
    "dashboard.realTimeAudit": "Real-time Audit",
    "dashboard.realTimeAuditDesc": "Latest operational actions and system events.",
    "dashboard.opsOverview": "Operations Overview",
    "dashboard.resourceCoveragePanel": "Resource Coverage",
    "dashboard.riskReminder": "Risk Reminder",
    "dashboard.importantIssues": "Key Issues",
    "dashboard.totalTasks": "Total Tasks",
    "dashboard.online": "Online Rate",
    "dashboard.abnormal": "Abnormal Rate",
    "dashboard.openIssueCount": "Open issues",
    "dashboard.riskHint": "Abnormal ratio is high. Please handle issues in time.",
    "dashboard.onlineText": "Online {online} / Total {total}",
    "dashboard.recentAbnormalReports": "Abnormal reports in last 7 days",
    "tasks.dueSoon": "Due Soon",
    "tasks.completed": "Completed",
    "tasks.owner": "Owner",
    "tasks.schedule": "Schedule",
    "tasks.progress": "Progress",
    "tasks.new": "Create Task",
    "tasks.reset": "Reset",
    "tasks.searchPlaceholder": "Search task name / id / target",
    "tasks.all": "All",
    "tasks.daily": "Daily Inspection",
    "tasks.weekly": "Weekly Inspection",
    "tasks.special": "Special Check",
    "table.environmentBinding": "Environment",
    "table.tags": "Tags",
    "table.owner": "Owner",
    "table.status": "Status",
    "table.credential": "Credential",
    "table.resource": "Resource",
    "table.name": "Name",
    "table.type": "Type",
    "table.address": "Address",
    "table.system": "System",
    "table.metrics": "Metrics",
    "table.action": "Action",
    "table.task": "Task",
    "table.summary": "Summary",
    "table.started": "Started",
    "table.select": "Select",
    "table.report": "Report",
    "table.finished": "Finished",
    "table.downloads": "Downloads",
    "table.issue": "Issue",
    "table.severity": "Severity",
    "table.assignee": "Assignee",
    "table.application": "Application",
    "table.environment": "Environment",
    "table.resourceName": "Resource Name",
    "table.resourceIp": "Resource IP",
    "table.created": "Created",
    "table.email": "Email",
    "table.role": "Role",
    "table.lastLogin": "Last Login",
    "table.description": "Description",
    "table.permissions": "Permissions",
    "table.category": "Category",
    "table.resourceType": "Resource Type",
    "table.command": "Command",
    "table.source": "Source",
    "table.actor": "Actor",
    "table.result": "Result",
    "table.detail": "Detail",
    "table.target": "Target",
    "resources.title": "Managed Resources",
    "resources.desc": "Hosts, databases and middleware instances with connection status.",
    "resources.testOnline": "One-click test",
    "resources.testSelected": "Test selected",
    "resources.discoverOnline": "One-click discover",
    "resources.discoverSelected": "Discover selected",
    "resources.discoverServices": "Discover services",
    "resources.discovering": "Scanning",
    "resources.serviceCount": "Services",
    "resources.applyRecommendedRules": "Apply recommended rules",
    "resources.test": "Test",
    "resources.testing": "Testing",
    "resources.list": "Resource List",
    "resources.groups": "Environment Bindings",
    "resources.columns": "Columns",
    "resources.unGrouped": "Ungrouped",
    "resources.credentialConfigured": "Configured",
    "resources.credentialMissing": "Missing",
    "resources.password": "Password",
    "resources.key": "Key",
    "action.edit": "Edit",
    "action.addResource": "Add resource",
    "action.addResourceType": "Add resource type",
    "action.deleteSelected": "Delete selected",
    "action.delete": "Delete",
    "action.test": "Test",
    "action.confirmDelete": "Confirm delete",
    "action.prev": "Previous",
    "action.next": "Next",
    "action.save": "Save changes",
    "action.create": "Create",
    "action.cancel": "Cancel",
    "action.ok": "OK",
    "action.selectAll": "Select all",
    "action.clearSelection": "Clear",
    "action.clearIcon": "Clear icon",
    "modal.addResource": "Add resource",
    "modal.editResource": "Edit resource",
    "modal.addResourceType": "Add resource type",
    "modal.editResourceType": "Edit resource type",
    "modal.createTask": "Create Task",
    "modal.editTask": "Edit Task",
    "modal.addApplication": "Add application",
    "modal.editApplication": "Edit application",
    "modal.addInspectionItem": "Add Custom Check",
    "modal.addAiModel": "Add model integration",
    "modal.editAiModel": "Edit model integration",
    "modal.addAiDatasource": "Add datasource",
    "modal.editAiDatasource": "Edit datasource",
    "modal.editAiAssistant": "Edit AI assistant",
    "modal.addKnowledge": "Add knowledge",
    "modal.editKnowledge": "Edit knowledge",
    "modal.editUser": "Edit user",
    "modal.editRole": "Edit role",
    "form.status": "Status",
    "form.health": "Health",
    "form.active": "Active",
    "form.inactive": "Inactive",
    "form.permissionsHelp": "One permission per line or comma-separated.",
    "form.siteName": "Website Name",
    "form.siteSubtitle": "Website Subtitle",
    "form.iconText": "Icon Text",
    "form.iconColor": "Icon Color",
    "form.iconImage": "Icon Image",
    "form.iconImageHelp": "Optional PNG/JPG/SVG. Leave empty to use text icon.",
    "form.defaultPort": "Default Port",
    "form.credentialType": "Credential Type",
    "form.credentialSecret": "Password / Private Key",
    "form.credentialHelp": "Leave empty when editing to keep the existing secret.",
    "form.basicInfo": "Basic information",
    "form.executionConfig": "Execution config",
    "form.resourceSelection": "Resource selection",
    "form.ownerNotify": "Owner and notification",
    "form.executionContent": "Inspection Metrics",
    "form.taskName": "Task name",
    "form.taskTags": "Task tags",
    "form.taskDescription": "Task description",
    "form.executionMode": "Execution mode",
    "form.once": "One-time",
    "form.periodic": "Periodic",
    "form.scheduleRule": "Cycle rule",
    "form.daily": "Daily",
    "form.weekly": "Weekly",
    "form.monthly": "Monthly",
    "form.scheduleTime": "Execution time",
    "form.effectiveStart": "Effective start",
    "form.effectiveEnd": "Effective end",
    "form.deadlinePolicy": "Deadline",
    "form.retryPolicy": "Retry policy",
    "form.owner": "Owner",
    "form.notifyChannels": "Notification",
    "form.reminderRules": "Reminder rules",
    "form.note": "Note",
    "form.environmentBinding": "Environment binding",
    "form.targetResources": "Target resources",
    "form.noResources": "No resources available. Add resources first.",
    "form.noInspectionItems": "No inspection items available.",
    "form.expectedPattern": "Judgement rule",
    "form.commandType": "Command type",
    "tasks.logs": "Logs",
    "tasks.start": "Start",
    "tasks.rerun": "Rerun",
    "tasks.viewReport": "Report",
    "tasks.inspectionTasks": "Inspection Tasks",
    "tasks.templates": "Inspection Templates",
    "tasks.schedules": "Schedules",
    "tasks.executionRecords": "Execution Records",
    "tasks.fixTasks": "Remediation Tasks",
    "environments.title": "Resources",
    "environments.desc": "Inspect by business system environment: OS, database, middleware, gateway, storage, queue, containers and security baselines.",
    "environments.applications": "Applications",
    "environments.resources": "Resource Inventory",
    "environments.health": "Health Score",
    "environments.layers": "Layer Status",
    "environments.insights": "Issue Insights",
    "environments.addApplication": "Add application",
    "environments.addEnvironment": "New application",
    "environments.bindResource": "Bind resource",
    "environments.noData": "No application environment data yet.",
    "environments.unknown": "Unknown",
    "form.application": "Application",
    "form.environment": "Application environment",
    "form.environmentType": "Environment type",
    "form.layer": "Layer",
    "form.layerHelp": "Resource category in the application environment, such as OS, database, middleware or gateway. It is used for grouped inspection and reports.",
    "form.role": "Role",
    "form.roleHelp": "The role this resource plays in the environment, for example postgresql-primary, redis, nginx or worker-node.",
    "form.weight": "Weight",
    "form.weightHelp": "The impact weight for environment health scoring. Higher values mean this resource has greater influence on the environment score.",
    "reports.archive": "Report Archive",
    "reports.desc": "Single report export or multi-report merge in HTML, DOCX and PDF.",
    "reports.merge": "Merge export",
    "reports.history": "History Reports",
    "reports.weekly": "Weekly Reports",
    "reports.issues": "Abnormal Issues",
    "templates.category": "Rule Set Management",
    "templates.categoryDesc": "Bind rule sets to application environments and match checks by asset or discovered service type.",
    "templates.builtin": "Built-in Metrics",
    "templates.custom": "Custom Scripts",
    "templates.rules": "Judgement Rules",
    "templates.bindings": "Asset Bindings",
    "templates.standard": "Standard Metrics",
    "templates.security": "Security Baselines",
    "templates.customScripts": "Custom Scripts",
    "templates.weight": "Weight",
    "templates.parameterized": "Parameterized execution, scoring, masking and concurrency controls are modeled here.",
    "issues.queue": "Issue Queue",
    "issues.desc": "Automatically created from failed and exception inspection items.",
    "issues.process": "Process",
    "issues.resolve": "Resolve",
    "issues.ignore": "Ignore",
    "issues.allSeverities": "All severities",
    "issues.allStatuses": "All statuses",
    "issues.allResourceTypes": "All resource types",
    "problem.aiRootCause": "AI Root Cause",
    "problem.riskEvents": "Risk Events",
    "problem.suggestions": "Remediation Suggestions",
    "problem.tickets": "Issue Tickets",
    "ai.models": "Model Integration",
    "ai.datasources": "Datasource Integration",
    "ai.diagnostics": "Smart Diagnosis",
    "ai.knowledge": "Knowledge Base",
    "ai.diagnoseTools": "Diagnose Tools",
    "ai.assistant": "AI Assistant",
    "ai.notConfigured": "Not configured yet. OpsRadar will not fabricate AI analysis or observability evidence.",
    "ai.modelProvider": "Provider",
    "ai.datasourceType": "Datasource Type",
    "ai.assistantEnabled": "Assistant enabled",
    "ai.apiKey": "API Key",
    "ai.token": "Access Token",
    "ai.fetchModels": "Fetch Models",
    "ai.modelFetchHint": "Enter Base URL and API Key first, then fetch available model IDs.",
    "ai.defaultRange": "Default Range",
    "ai.quickPrompts": "Quick Prompts",
    "ai.online": "AI assistant online · Smart diagnosis ready",
    "ai.placeholder": "Ask about inspection issues, logs, root causes or fixes...",
    "ai.footerHint": "Supports log analysis, remediation advice and task planning",
    "ai.clearChat": "Clear chat",
    "ai.chatFallback": "AI assistant received your question. Model integration is not complete yet, so this answer is recorded as context only.",
    "ai.sendFailed": "Failed to send message",
    "users.title": "Users",
    "roles.title": "Roles & Permissions",
    "audit.title": "Audit",
    "audit.desc": "Control-plane activity and inspection operations.",
    "audit.login": "Login Logs",
    "audit.operation": "Operation Logs",
    "audit.execution": "Execution Logs",
    "audit.level": "Level",
    "audit.message": "Message",
    "settings.notifications": "Notification Channels",
    "settings.notificationsDesc": "Email, WeCom and Feishu gateway configuration.",
    "settings.resourceTypes": "Resource Types",
    "settings.site": "Website Settings",
    "settings.siteDesc": "Configure the product name, subtitle and brand icon.",
    "settings.users": "Users",
    "settings.audit": "Audit",
    "settings.adminRecords": "Administrative records from the OpsRadar control plane.",
    "pagination.summary": "{start}-{end} of {total}",
    "confirm.deleteSelected": "Delete {count} selected record(s)? This cannot be undone.",
    "confirm.deleteTitle": "Delete selected records",
    "confirm.deleteSubtitle": "This action will remove the selected data from OpsRadar and cannot be undone.",
    "confirm.deleteScope": "Scope",
    "confirm.deleteCount": "Records",
    "alert.loginTitle": "Sign-in failed",
    "alert.loginMessage": "Invalid username or password. Please check your credentials and try again.",
    "toast.noSelection": "Select at least one record",
    "toast.deleted": "Selected records deleted",
    "label.builtin": "Built-in",
    "label.custom": "Custom",
    "label.enabled": "Enabled",
    "label.disabled": "Disabled",
    "toast.signedOut": "Signed out",
    "toast.syncComplete": "Sync complete",
    "toast.synchronized": "Synchronized",
    "toast.languageChanged": "Language switched",
    "toast.selectTaskInputs": "Select at least one resource and one inspection item",
    "toast.selectTaskResources": "Select an application environment or at least one target resource",
    "toast.selectTaskItems": "Select at least one inspection metric",
    "toast.missingPermission": "Missing permission",
    "toast.taskQueued": "Inspection task queued",
    "toast.selectReport": "Select at least one report",
    "toast.issueUpdated": "Issue updated",
    "toast.resourceTested": "Resource test completed",
    "toast.resourcesTested": "Selected resources tested",
    "toast.servicesDiscovered": "Service discovery completed",
    "toast.reportExported": "report exported",
    "toast.saved": "Changes saved",
    "toast.testSuccess": "Connection test succeeded",
    "toast.testFailed": "Connection test failed",
    "toast.knowledgeCreated": "Knowledge saved",
  },
  zh: {
    "brand.subtitle": "巡检运营中心",
    "brand.loginSubtitle": "运维自动化巡检管理平台",
    "login.eyebrow": "AI 驱动的智能巡检平台",
    "login.title": "AI 驱动的智能巡检平台",
    "login.desc": "自动发现问题、根因分析、提供修复建议，并支持 AI 交互式故障处理与任务执行，实现报告归档和异常闭环。",
    "login.applications": "应用",
    "login.managedResources": "纳管资源",
    "login.auditEvents": "审计事件",
    "login.signIn": "登录",
    "login.access": "",
    "login.username": "用户名",
    "login.password": "密码",
    "login.submit": "登录控制台",
    "login.remember": "记住我",
    "login.forgot": "忘记密码？",
    "login.issueLoop": "智能总览",
    "login.issueLoopDesc": "汇总资源、任务、问题与风险趋势",
    "login.taskOps": "智能巡检",
    "login.taskOpsDesc": "结合规则、工具与智能判断执行巡检",
    "login.reportHub": "分析报告",
    "login.reportHubDesc": "生成总结、根因分析与修复建议",
    "login.issueClosure": "异常闭环",
    "login.issueClosureDesc": "诊断、建议、验证到闭环全程跟踪",
    "nav.dashboard": "概览",
    "nav.environments": "资源",
    "nav.templates": "巡检模板",
    "nav.tasks": "巡检",
    "nav.problem-center": "问题",
    "nav.reports": "报告",
    "nav.ai-center": "AI +",
    "nav.issues": "异常管理",
    "nav.users": "用户管理",
    "nav.roles": "角色与权限",
    "nav.audit": "审计",
    "nav.settings": "设置",
    "page.dashboard": "概览",
    "page.environments": "资源",
    "page.templates": "巡检模板",
    "page.tasks": "巡检",
    "page.problem-center": "问题",
    "page.reports": "报告",
    "page.ai-center": "AI +",
    "page.issues": "异常管理",
    "page.users": "用户管理",
    "page.roles": "角色与权限",
    "page.audit": "审计",
    "page.settings": "设置",
    "top.home": "首页",
    "top.notifications": "通知",
    "top.sync": "同步状态",
    "top.light": "浅色",
    "top.dark": "深色",
    "top.darkMode": "深色模式",
    "top.lightMode": "浅色模式",
    "top.language": "语言",
    "top.logout": "退出登录",
    "search.placeholder": "搜索资源、模板、任务、问题、报告...",
    "search.local": "搜索当前列表...",
    "search.empty": "没有匹配记录",
    "search.hint": "全局搜索",
    "cards.totalUsers": "用户总数",
    "cards.totalUsersFoot": "启用 RBAC 的运维人员",
    "cards.loginsToday": "今日登录",
    "cards.loginsTodayFoot": "交互登录与令牌会话",
    "cards.auditEvents": "审计事件",
    "cards.auditEventsFoot": "近期控制面事件",
    "cards.applications": "应用",
    "cards.applicationsFoot": "应用环境单元",
    "cards.managedResources": "资源总数",
    "cards.openIssues": "待处理异常",
    "dashboard.cronTasks": "定时",
    "dashboard.manualTasks": "手动",
    "dashboard.scheduledTasks": "计划",
    "dashboard.runningTasks": "执行中",
    "dashboard.weekReports": "近 7 天 {count} 份",
    "dashboard.onlineRate": "在线率 {rate}%",
    "dashboard.onlineRateLabel": "在线率",
    "dashboard.abnormalRate": "异常占比 {rate}%",
    "dashboard.abnormalRateLabel": "异常占比",
    "dashboard.taskTrend": "巡检任务趋势",
    "dashboard.taskTrendDesc": "近七天巡检任务创建趋势，区分总任务与定时任务。",
    "dashboard.reportTrend": "报告趋势",
    "dashboard.reportTrendDesc": "近七天巡检报告产出与异常发现趋势。",
    "dashboard.taskCount": "任务数",
    "dashboard.reportCount": "报告数",
    "dashboard.abnormalItems": "异常项",
    "dashboard.successItems": "成功项",
    "dashboard.inspectionOverview": "巡检概况",
    "dashboard.resourceCoverage": "资源覆盖",
    "dashboard.taskComposition": "任务构成",
    "dashboard.issueFocus": "待处理异常",
    "dashboard.noIssues": "暂无待处理巡检异常。",
    "dashboard.viewAll": "查看全部",
    "dashboard.viewIssues": "查看异常",
    "dashboard.realTimeAudit": "实时审计",
    "dashboard.realTimeAuditDesc": "最新运维操作与系统事件。",
    "dashboard.opsOverview": "运营概览",
    "dashboard.resourceCoveragePanel": "资源覆盖",
    "dashboard.riskReminder": "风险提醒",
    "dashboard.importantIssues": "重点异常",
    "dashboard.totalTasks": "总任务",
    "dashboard.online": "在线率",
    "dashboard.abnormal": "异常占比",
    "dashboard.openIssueCount": "待处理异常",
    "dashboard.riskHint": "异常占比较高，请及时处理以降低风险。",
    "dashboard.onlineText": "在线 {online} / 总计 {total}",
    "dashboard.recentAbnormalReports": "近7天异常报告",
    "tasks.dueSoon": "即将到期",
    "tasks.completed": "已完成",
    "tasks.owner": "负责人",
    "tasks.schedule": "计划时间",
    "tasks.progress": "进度",
    "tasks.new": "创建任务",
    "tasks.reset": "重置",
    "tasks.searchPlaceholder": "搜索任务名称/编号/执行对象",
    "tasks.all": "全部",
    "tasks.daily": "日常巡检",
    "tasks.weekly": "周期巡检",
    "tasks.special": "专项检查",
    "table.environmentBinding": "应用环境",
    "table.tags": "标签",
    "table.owner": "负责人",
    "table.status": "状态",
    "table.credential": "凭据",
    "table.resource": "资源",
    "table.name": "名称",
    "table.type": "类型",
    "table.address": "地址",
    "table.system": "系统",
    "table.metrics": "指标",
    "table.action": "操作",
    "table.task": "任务",
    "table.summary": "汇总",
    "table.started": "开始时间",
    "table.select": "选择",
    "table.report": "报告",
    "table.finished": "完成时间",
    "table.downloads": "下载",
    "table.issue": "异常",
    "table.severity": "级别",
    "table.assignee": "负责人",
    "table.application": "所属应用",
    "table.environment": "所属环境",
    "table.resourceName": "资源名称",
    "table.resourceIp": "资源 IP",
    "table.created": "创建时间",
    "table.email": "邮箱",
    "table.role": "角色",
    "table.lastLogin": "最近登录",
    "table.description": "描述",
    "table.permissions": "权限",
    "table.category": "类别",
    "table.resourceType": "资源类型",
    "table.command": "命令",
    "table.source": "来源",
    "table.actor": "操作人",
    "table.result": "结果",
    "table.detail": "详情",
    "table.target": "对象",
    "resources.title": "纳管资源",
    "resources.desc": "主机、数据库与中间件实例，以及连接状态。",
    "resources.testOnline": "一键测试",
    "resources.testSelected": "测试所选",
    "resources.discoverOnline": "一键发现",
    "resources.discoverSelected": "发现所选",
    "resources.discoverServices": "发现服务",
    "resources.discovering": "扫描中",
    "resources.serviceCount": "服务",
    "resources.applyRecommendedRules": "应用推荐规则",
    "resources.test": "测试",
    "resources.testing": "测试中",
    "resources.list": "资源列表",
    "resources.groups": "环境绑定",
    "resources.columns": "列设置",
    "resources.unGrouped": "未分组",
    "resources.credentialConfigured": "已配置",
    "resources.credentialMissing": "未配置",
    "resources.password": "密码",
    "resources.key": "密钥",
    "action.edit": "编辑",
    "action.addResource": "添加资源",
    "action.addResourceType": "添加资源类型",
    "action.deleteSelected": "删除所选",
    "action.delete": "删除",
    "action.test": "测试",
    "action.confirmDelete": "确认删除",
    "action.prev": "上一页",
    "action.next": "下一页",
    "action.save": "保存修改",
    "action.create": "创建",
    "action.cancel": "取消",
    "action.ok": "知道了",
    "action.selectAll": "全选",
    "action.clearSelection": "取消全选",
    "action.clearIcon": "清除图标",
    "modal.addResource": "添加资源",
    "modal.editResource": "编辑资源",
    "modal.addResourceType": "添加资源类型",
    "modal.editResourceType": "编辑资源类型",
    "modal.createTask": "创建任务",
    "modal.editTask": "编辑任务",
    "modal.addApplication": "添加应用",
    "modal.editApplication": "编辑应用",
    "modal.addInspectionItem": "新增自定义巡检项",
    "modal.addAiModel": "添加模型对接",
    "modal.editAiModel": "编辑模型对接",
    "modal.addAiDatasource": "添加数据源",
    "modal.editAiDatasource": "编辑数据源",
    "modal.editAiAssistant": "编辑 AI 助手",
    "modal.addKnowledge": "添加知识",
    "modal.editKnowledge": "编辑知识",
    "modal.editUser": "编辑用户",
    "modal.editRole": "编辑角色",
    "form.status": "状态",
    "form.health": "健康状态",
    "form.active": "启用",
    "form.inactive": "停用",
    "form.permissionsHelp": "每行一个权限，或用逗号分隔。",
    "form.siteName": "网站名字",
    "form.siteSubtitle": "网站副标题",
    "form.iconText": "图标文字",
    "form.iconColor": "图标颜色",
    "form.iconImage": "图标图片",
    "form.iconImageHelp": "可选 PNG/JPG/SVG。留空时使用文字图标。",
    "form.defaultPort": "默认端口",
    "form.credentialType": "凭据类型",
    "form.credentialSecret": "密码 / 私钥",
    "form.credentialHelp": "编辑资源时留空表示保留原凭据。",
    "form.basicInfo": "基本信息",
    "form.executionConfig": "执行配置",
    "form.resourceSelection": "资源选择",
    "form.ownerNotify": "负责人和通知",
    "form.executionContent": "巡检指标",
    "form.taskName": "任务名称",
    "form.taskTags": "任务标签",
    "form.taskDescription": "任务描述",
    "form.executionMode": "执行方式",
    "form.once": "一次性",
    "form.periodic": "周期任务",
    "form.scheduleRule": "周期规则",
    "form.daily": "每日",
    "form.weekly": "每周",
    "form.monthly": "每月",
    "form.scheduleTime": "执行时间",
    "form.effectiveStart": "生效时间",
    "form.effectiveEnd": "结束时间",
    "form.deadlinePolicy": "截止时限",
    "form.retryPolicy": "失败策略",
    "form.owner": "负责人",
    "form.notifyChannels": "通知方式",
    "form.reminderRules": "提醒规则",
    "form.note": "备注",
    "form.environmentBinding": "应用环境绑定",
    "form.targetResources": "目标资源",
    "form.noResources": "暂无可选资源，请先添加资源。",
    "form.noInspectionItems": "暂无可选巡检项。",
    "form.expectedPattern": "判定规则",
    "form.commandType": "命令类型",
    "tasks.logs": "日志",
    "tasks.start": "启动",
    "tasks.rerun": "重新执行",
    "tasks.viewReport": "查看报告",
    "tasks.inspectionTasks": "巡检任务",
    "tasks.templates": "巡检模板",
    "tasks.schedules": "调度策略",
    "tasks.executionRecords": "执行记录",
    "tasks.fixTasks": "修复任务",
    "environments.title": "资源",
    "environments.desc": "以业务系统环境为中心组织巡检：覆盖 OS、数据库、中间件、网关、存储、队列、容器服务与安全基线。",
    "environments.applications": "应用列表",
    "environments.resources": "资源列表",
    "environments.health": "健康评分",
    "environments.layers": "分层状态",
    "environments.insights": "异常洞察",
    "environments.addApplication": "添加应用",
    "environments.addEnvironment": "新建应用",
    "environments.bindResource": "绑定资源",
    "environments.noData": "暂无应用环境数据。",
    "environments.unknown": "未知",
    "form.application": "业务系统",
    "form.environment": "应用环境",
    "form.environmentType": "环境类型",
    "form.layer": "层级",
    "form.layerHelp": "资源在应用环境里的分类，例如 OS、数据库、中间件、网关。用于分层巡检、健康评分和报告展示。",
    "form.role": "角色",
    "form.roleHelp": "用于说明该资源在环境中的职责，例如 postgresql-primary、redis、nginx、worker-node。",
    "form.weight": "权重",
    "form.weightHelp": "用于计算环境健康分的影响权重，数值越高，该资源对应用环境健康分影响越大。",
    "reports.archive": "报告归档",
    "reports.desc": "支持单份报告导出或多份合并导出，格式为 HTML、DOCX 与 PDF。",
    "reports.merge": "合并导出",
    "reports.history": "历史报告",
    "reports.weekly": "周报",
    "reports.issues": "异常问题",
    "templates.category": "规则集管理",
    "templates.categoryDesc": "规则集绑定到应用环境，执行时按资产类型与发现服务自动命中。",
    "templates.builtin": "内置指标仓库",
    "templates.custom": "自定义脚本库",
    "templates.rules": "判定逻辑配置",
    "templates.bindings": "关联资产绑定",
    "templates.standard": "基础巡检指标",
    "templates.security": "安全基线指标",
    "templates.customScripts": "自定义巡检",
    "templates.weight": "权重",
    "templates.parameterized": "这里统一表达参数化执行、健康分、结果脱敏和并发控制。",
    "issues.queue": "异常队列",
    "issues.desc": "由失败和异常巡检项自动生成。",
    "issues.process": "处理",
    "issues.resolve": "解决",
    "issues.ignore": "忽略",
    "issues.allSeverities": "全部级别",
    "issues.allStatuses": "全部状态",
    "issues.allResourceTypes": "全部资源类型",
    "problem.aiRootCause": "AI 根因分析",
    "problem.riskEvents": "风险事件",
    "problem.suggestions": "修复建议",
    "problem.tickets": "问题工单",
    "ai.models": "模型对接",
    "ai.datasources": "数据源集成",
    "ai.diagnostics": "智能诊断",
    "ai.knowledge": "知识库",
    "ai.diagnoseTools": "Diagnose Tools",
    "ai.assistant": "AI 助手",
    "ai.notConfigured": "暂未配置。OpsRadar 不会伪造 AI 分析或监控日志证据。",
    "ai.modelProvider": "模型提供商",
    "ai.datasourceType": "数据源类型",
    "ai.assistantEnabled": "助手已启用",
    "ai.apiKey": "API Key",
    "ai.token": "访问 Token",
    "ai.fetchModels": "获取模型",
    "ai.modelFetchHint": "先填写 Base URL 和 API Key，再获取可用模型名称。",
    "ai.defaultRange": "默认时间范围",
    "ai.quickPrompts": "快捷问题",
    "ai.online": "AI 助手在线 · 智能诊断中",
    "ai.placeholder": "询问巡检问题、日志异常或修复建议...",
    "ai.footerHint": "支持日志分析、根因定位与修复任务编排",
    "ai.clearChat": "清除对话",
    "ai.chatFallback": "AI 助手已收到问题。当前模型尚未完成对接，已先记录为对话上下文。",
    "ai.sendFailed": "消息发送失败",
    "users.title": "用户",
    "roles.title": "角色与权限",
    "audit.title": "审计",
    "audit.desc": "控制面活动与巡检操作记录。",
    "audit.login": "登录日志",
    "audit.operation": "操作日志",
    "audit.execution": "执行日志",
    "audit.level": "级别",
    "audit.message": "消息",
    "settings.notifications": "通知通道",
    "settings.notificationsDesc": "邮件、企业微信与飞书网关配置。",
    "settings.resourceTypes": "资源类型",
    "settings.site": "网站设置",
    "settings.siteDesc": "配置网站名称、副标题和品牌图标。",
    "settings.users": "用户管理",
    "settings.audit": "审计",
    "settings.adminRecords": "来自 OpsRadar 控制面的管理记录。",
    "pagination.summary": "第 {start}-{end} 条 / 共 {total} 条",
    "confirm.deleteSelected": "确认删除选中的 {count} 条记录？此操作不可撤销。",
    "confirm.deleteTitle": "删除所选记录",
    "confirm.deleteSubtitle": "此操作会从 OpsRadar 中移除所选数据，删除后不可恢复。",
    "confirm.deleteScope": "删除范围",
    "confirm.deleteCount": "记录数量",
    "alert.loginTitle": "登录失败",
    "alert.loginMessage": "用户名或密码错误，请检查后重新登录。",
    "toast.noSelection": "请至少选择一条记录",
    "toast.deleted": "所选记录已删除",
    "label.builtin": "内置",
    "label.custom": "自定义",
    "label.enabled": "启用",
    "label.disabled": "停用",
    "toast.signedOut": "已退出登录",
    "toast.syncComplete": "同步完成",
    "toast.synchronized": "已同步",
    "toast.languageChanged": "语言已切换",
    "toast.selectTaskInputs": "请至少选择一个资源和一个巡检项",
    "toast.selectTaskResources": "请选择应用环境或至少一个目标资源",
    "toast.selectTaskItems": "请至少选择一个巡检指标",
    "toast.missingPermission": "缺少操作权限",
    "toast.taskQueued": "巡检任务已入队",
    "toast.selectReport": "请至少选择一份报告",
    "toast.issueUpdated": "异常已更新",
    "toast.resourceTested": "资源测试完成",
    "toast.resourcesTested": "已测试所选资源",
    "toast.servicesDiscovered": "服务发现完成",
    "toast.reportExported": "报告已导出",
    "toast.saved": "修改已保存",
    "toast.testSuccess": "连接测试成功",
    "toast.testFailed": "连接测试失败",
    "toast.knowledgeCreated": "已沉淀到知识库",
  },
};

const state = {
  token: localStorage.getItem("opsradar_token"),
  view: localStorage.getItem("opsradar_view") || "dashboard",
  theme: localStorage.getItem("opsradar_theme") || "light",
  lang: localStorage.getItem("opsradar_lang") || "zh",
  data: null,
  user: null,
  siteSettings: JSON.parse(localStorage.getItem("opsradar_site_settings") || "null"),
  selectedReports: new Set(),
  bulkSelected: {},
  filters: {},
  pages: {},
  pageSizes: JSON.parse(localStorage.getItem("opsradar_page_sizes") || "{}"),
  resourceColumns: JSON.parse(localStorage.getItem("opsradar_resource_columns") || "null"),
  issueColumns: JSON.parse(localStorage.getItem("opsradar_issue_columns") || "null"),
  filterPanels: JSON.parse(localStorage.getItem("opsradar_filter_panels") || "{}"),
  testingResources: new Set(),
  discoveringResources: new Set(),
  expandedResources: new Set(),
  taskCreateStep: 1,
  taskFilters: {
    status: "all",
    owner: "all",
  },
  resourceFilters: {
    environment: "all",
    type: "all",
    status: "all",
  },
  reportFilters: {
    environment: "all",
    status: "all",
  },
  issueFilters: {
    task: "all",
    environment: "all",
    severity: "all",
    status: "all",
    resourceType: "all",
  },
  filterSubmenus: {},
  environmentStatusFilter: "all",
  taskCreateDefaults: null,
  resourceCreateDefaults: null,
  applicationCreateDefaults: null,
  workflowCallback: null,
  workflowBatchAssets: [],
  taskCreateDraft: null,
  issueDetailId: null,
  issueDetailTab: "overview",
  tabs: {
    reports: localStorage.getItem("opsradar_tab_reports") || "history",
    audit: localStorage.getItem("opsradar_tab_audit") || "login",
    resources: localStorage.getItem("opsradar_tab_resources") || "list",
    environments: localStorage.getItem("opsradar_tab_environments") || "applications",
    templates: localStorage.getItem("opsradar_tab_templates") || "builtin",
    tasks: localStorage.getItem("opsradar_tab_tasks") || "tasks",
    problems: localStorage.getItem("opsradar_tab_problems") || "issues",
    ai: localStorage.getItem("opsradar_tab_ai") || "assistant",
    settings: localStorage.getItem("opsradar_tab_settings") || "site",
  },
  globalSearch: {
    query: "",
    results: [],
    open: false,
    seq: 0,
  },
  aiAssistant: {
    sessionId: null,
    title: "",
    sessions: [],
    messages: [],
    typing: false,
    sidebarWidth: Number(localStorage.getItem("opsradar_ai_session_width") || 176),
  },
  floatingAssistant: {
    open: false,
    sessionId: null,
    title: "",
    messages: [],
    typing: false,
    position: JSON.parse(localStorage.getItem("opsradar_ai_float_position") || "null"),
    dragging: null,
    suppressToggle: false,
  },
  polling: null,
  modal: null,
};

if (state.view === "resources") {
  state.view = "environments";
}
if (state.tabs.environments === "environments") {
  state.tabs.environments = "applications";
}
if (state.view === "templates") {
  state.view = "tasks";
  state.tabs.tasks = "templates";
}

function t(key) {
  return I18N[state.lang]?.[key] || I18N.en[key] || key;
}

function hasPermission(permission) {
  const permissions = state.user?.permissions || state.data?.user?.permissions || [];
  if (permissions.includes("*")) return true;
  const area = permission.split(":", 1)[0];
  return permissions.includes(permission) || permissions.includes(`${area}:*`);
}

const iconPaths = {
  dashboard: "M4 13h6V4H4v9Zm10 7h6V4h-6v16ZM4 20h6v-5H4v5Zm10-9h6V4h-6v7Z",
  apps: "M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z",
  server: "M4 5h16v6H4V5Zm0 8h16v6H4v-6Zm3-5h.01M7 16h.01",
  tasks: "M9 6h11M9 12h11M9 18h11M4 6h1M4 12h1M4 18h1",
  reports: "M6 3h9l5 5v13H6V3Zm8 1v5h5M9 14h8M9 18h6",
  alert: "M12 3 2 21h20L12 3Zm0 6v5m0 3h.01",
  target: "M12 3v3m0 12v3M3 12h3m12 0h3M7.8 7.8l2.1 2.1m4.2 4.2 2.1 2.1m0-8.4-2.1 2.1m-4.2 4.2-2.1 2.1M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
  plus: "M12 5v14M5 12h14",
  briefcase: "M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1m-8 0h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 6h12",
  sparkles: "M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Zm6 9 .9 2.1L21 15l-2.1.9L18 18l-.9-2.1L15 15l2.1-.9L18 12ZM5 13l1 2.5L9 16.5l-2.5 1L5 20l-1.5-2.5L1 16.5l2.5-1L5 13Z",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm-3-10 2 2 4-5",
  audit: "M4 4h16v16H4V4Zm4 5h8M8 13h8M8 17h5",
  settings: "M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Zm0-13v3m0 13v3m9-9h-3M6 12H3m15.36-6.36-2.12 2.12M7.76 16.24l-2.12 2.12m12.72 0-2.12-2.12M7.76 7.76 5.64 5.64",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Zm-8.27 11a2 2 0 0 0 4.54 0",
  cloud: "M17.5 19H7a5 5 0 1 1 1.17-9.86A7 7 0 0 1 21 12.5 3.5 3.5 0 0 1 17.5 19Z",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6v3m0 14v3m10-10h-3M5 12H2m17.07-7.07-2.12 2.12M7.05 16.95l-2.12 2.12m14.14 0-2.12-2.12M7.05 7.05 4.93 4.93",
  moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z",
  logout: "M10 17l5-5-5-5m5 5H3m7 9h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-8",
  play: "M8 5v14l11-7-11-7Z",
  download: "M12 3v12m0 0 4-4m-4 4-4-4M4 21h16",
  search: "M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z",
  "chevron-right": "M9 5l7 7-7 7",
  "chevron-down": "M5 9l7 7 7-7",
  calendar: "M7 3v3m10-3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Zm3 7h3m3 0h3m-9 4h3m3 0h3",
  trash: "M3 6h18M8 6V4h8v2m-9 0 1 15h8l1-15M10 11v6m4-6v6",
  send: "M22 2 11 13m11-11-7 20-4-9-9-4 20-7Z",
  close: "M18 6 6 18M6 6l12 12",
  language: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0c2.2 2.35 3.3 5.35 3.3 9s-1.1 6.65-3.3 9m0-18c-2.2 2.35-3.3 5.35-3.3 9s1.1 6.65 3.3 9M3.6 9h16.8M3.6 15h16.8",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  lock: "M7 11V8a5 5 0 0 1 10 0v3M6 11h12v10H6V11Zm6 4v2",
  checklist: "M9 5h6l1 2h3v14H5V7h3l1-2Zm0 6 2 2 4-4M9 17h6",
  document: "M6 3h9l5 5v13H6V3Zm8 1v5h5M9 14h3M9 18h6",
  trend: "M4 19V5m0 14h16M7 15l4-4 3 3 5-7M17 7h2v2",
};

function icon(name) {
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${iconPaths[name] || iconPaths.dashboard}"></path></svg>`;
}

function defaultSiteSettings() {
  return {
    site_name: "OpsRadar",
    site_subtitle: t("brand.subtitle"),
    icon_text: "OR",
    icon_color: "#1d8a7a",
    icon_image: "",
  };
}

function siteSettings() {
  return { ...defaultSiteSettings(), ...(state.siteSettings || state.data?.site_settings || {}) };
}

function persistSiteSettings(settings) {
  state.siteSettings = settings;
  localStorage.setItem("opsradar_site_settings", JSON.stringify(settings));
  syncSiteFavicon(settings);
}

function logoMark(size = "normal") {
  const site = siteSettings();
  const style = site.icon_image ? "" : `style="background:${escapeHtml(site.icon_color)}"`;
  const body = site.icon_image
    ? `<img src="${escapeHtml(site.icon_image)}" alt="${escapeHtml(site.site_name)}">`
    : escapeHtml(site.icon_text || "OR");
  return `<div class="logo-mark ${size === "small" ? "small" : ""}" ${style}>${body}</div>`;
}

function syncSiteFavicon(settings = siteSettings()) {
  const site = { ...defaultSiteSettings(), ...settings };
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  if (site.icon_image) {
    link.type = site.icon_image.match(/^data:([^;,]+)/)?.[1] || "image/png";
    link.href = site.icon_image;
    return;
  }
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="14" fill="${escapeHtml(site.icon_color)}"/>
      <text x="50%" y="53%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="22" font-weight="800" fill="#fff">${escapeHtml(site.icon_text || "OR")}</text>
    </svg>
  `;
  link.type = "image/svg+xml";
  link.href = `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
}

function updateSitePreview(form) {
  const preview = form?.querySelector(".site-preview");
  if (!preview) return;
  const site = {
    ...siteSettings(),
    site_name: form.site_name?.value || "OpsRadar",
    site_subtitle: form.site_subtitle?.value || "",
    icon_text: form.icon_text?.value || "OR",
    icon_color: form.icon_color?.value || "#1d8a7a",
    icon_image: form.icon_image?.value || "",
  };
  const mark = preview.querySelector(".logo-mark");
  if (mark) {
    if (site.icon_image) {
      mark.removeAttribute("style");
      mark.innerHTML = `<img src="${escapeHtml(site.icon_image)}" alt="${escapeHtml(site.site_name)}">`;
    } else {
      mark.style.background = site.icon_color;
      mark.textContent = site.icon_text;
    }
  }
  const name = preview.querySelector("strong");
  const subtitle = preview.querySelector("span");
  if (name) name.textContent = site.site_name;
  if (subtitle) subtitle.textContent = site.site_subtitle;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  return fetch(path, { ...options, headers }).then(async (response) => {
    const detail = response.ok ? {} : await response.json().catch(() => ({}));
    if (response.status === 401 && state.token) {
      logout(false);
      throw new Error(detail.detail || "Session expired");
    }
    if (!response.ok) {
      throw new Error(detail.detail || `Request failed: ${response.status}`);
    }
    if (options.raw) return response;
    return response.json();
  });
}

function friendlyError(message) {
  const raw = String(message || "");
  if (raw.includes("Select a resource group or at least one resource")) return t("toast.selectTaskResources");
  if (raw.includes("Select at least one inspection item")) return t("toast.selectTaskItems");
  if (raw.includes("Missing permission")) return `${t("toast.missingPermission")}：${raw.split(":").slice(1).join(":").trim()}`;
  if (raw.includes("Invalid username or password")) return t("alert.loginMessage");
  if (raw.includes("Session expired")) return state.lang === "zh" ? "登录已过期，请重新登录" : "Session expired. Please sign in again.";
  if (raw.includes("Request failed: 500")) return state.lang === "zh" ? "服务端处理失败，请查看后端日志" : "Server request failed. Check backend logs.";
  if (raw.includes("Service discovery failed:")) return raw.replace("Service discovery failed:", state.lang === "zh" ? "服务发现失败：" : "Service discovery failed:");
  if (raw.includes("Service discovery is only available for online resources")) return state.lang === "zh" ? "只有在线的 Linux 主机可以进行服务发现" : "Only online Linux hosts can run service discovery.";
  return raw;
}

function statusClass(status) {
  if (["active", "online", "success", "finished", "resolved", "healthy"].includes(status)) return status;
  if (["running", "queued", "in_progress", "testing", "review", "fail", "warning"].includes(status)) return status;
  if (["offline", "exception", "open", "failed", "critical"].includes(status)) return status;
  if (["cancelled", "disabled", "skipped"].includes(status)) return status;
  return status || "pending";
}

function statusText(status) {
  const maps = {
    en: {
      active: "Active",
      review: "In Review",
      online: "Online",
      testing: "Testing",
      offline: "Offline",
      untested: "Untested",
      pending: "Pending",
      queued: "Queued",
      running: "Running",
      finished: "Finished",
      failed: "Failed",
      cancelled: "Cancelled",
      skipped: "Skipped",
      success: "Success",
      fail: "Failed",
      exception: "Exception",
      open: "Open",
      in_progress: "In Progress",
      resolved: "Resolved",
      ignored: "Ignored",
      disabled: "Disabled",
      warning: "Warning",
      critical: "Critical",
      healthy: "Healthy",
      unknown: "Unknown",
    },
    zh: {
      active: "启用",
      review: "审核中",
      online: "在线",
      testing: "测试中",
      offline: "离线",
      untested: "未测试",
      pending: "等待中",
      queued: "排队中",
      running: "执行中",
      finished: "已完成",
      failed: "失败",
      cancelled: "已取消",
      skipped: "已跳过",
      success: "成功",
      fail: "失败",
      exception: "异常",
      open: "待处理",
      in_progress: "处理中",
      resolved: "已解决",
      ignored: "已忽略",
      disabled: "停用",
      warning: "预警",
      critical: "严重",
      healthy: "健康",
      unknown: "未知",
    },
  };
  return maps[state.lang]?.[status] || maps.en[status] || status || "-";
}

function resourceTypes() {
  return state.data?.resource_types || [];
}

function resourceTypeLabel(key) {
  const found = resourceTypes().find((item) => item.key === key);
  return found ? `${found.name} (${found.key})` : key;
}

function resourceTypeOptions() {
  return resourceTypes()
    .filter((item) => item.enabled)
    .map((item) => [item.key, resourceTypeLabel(item.key)]);
}

function resourceFormTypeOptions(selected = "") {
  const hiddenManualTypes = new Set(["container", "compose", "systemd"]);
  return resourceTypeOptions().filter(([key]) => !hiddenManualTypes.has(key) || key === selected);
}

function resourceTypeDefaultPort(type) {
  return Number(resourceTypes().find((item) => item.key === type)?.default_port || 0);
}

function applications() {
  return state.data?.applications || [];
}

function environments() {
  return state.data?.environments || [];
}

function environmentResourceBindings() {
  return environments().flatMap((env) =>
    (env.resources || []).map((binding) => ({
      ...binding,
      environment_id: binding.environment_id || env.id,
      environment_name: binding.environment_name || env.name,
      application_name: binding.application_name || env.application_name,
    })),
  );
}

function applicationOptions() {
  return applications().map((app) => [app.id, app.name]);
}

function displayApplicationName(name) {
  return String(name || "-").replace(/\s*环境\s*$/, "") || "-";
}

function environmentOptions() {
  return [["", "-"], ...environments().map((env) => [env.id, `${displayApplicationName(env.application_name)} / ${env.name}`])];
}

function environmentName(id) {
  const env = environments().find((item) => item.id === id);
  return env ? `${displayApplicationName(env.application_name)} / ${env.name}` : "";
}

function environmentLayerLabel(layer) {
  const labels = {
    zh: {
      os: "OS",
      db: "数据库",
      middleware: "中间件",
      gateway: "网关/LB",
      storage: "存储",
      queue: "队列",
      service: "容器服务",
      security: "安全基线",
    },
    en: {
      os: "OS",
      db: "Database",
      middleware: "Middleware",
      gateway: "Gateway/LB",
      storage: "Storage",
      queue: "Queue",
      service: "Container Service",
      security: "Security",
    },
  };
  return labels[state.lang]?.[layer] || labels.en[layer] || layer || "-";
}

function environmentLayerOptions() {
  return ["os", "db", "middleware", "gateway", "storage", "queue", "service", "security"].map((layer) => [layer, environmentLayerLabel(layer)]);
}

function defaultLayerForResourceType(type) {
  if (["pgsql", "postgresql", "mysql"].includes(type)) return "db";
  if (type === "redis") return "middleware";
  if (["nginx", "slb", "gateway"].includes(type)) return "gateway";
  if (["minio", "nas", "storage"].includes(type)) return "storage";
  if (["container", "compose"].includes(type)) return "service";
  return "os";
}

const RESOURCE_COLUMNS = [
  ["name", "table.name"],
  ["type", "table.type"],
  ["environments", "table.environmentBinding"],
  ["address", "table.address"],
  ["credential", "table.credential"],
  ["status", "table.status"],
  ["system", "table.system"],
  ["metrics", "table.metrics"],
  ["created", "table.created"],
];

const ISSUE_COLUMNS = [
  ["issue", "table.issue"],
  ["application", "table.application"],
  ["environment", "table.environment"],
  ["resourceName", "table.resourceName"],
  ["resourceIp", "table.resourceIp"],
  ["resourceType", "table.resourceType"],
  ["severity", "table.severity"],
  ["status", "table.status"],
  ["assignee", "table.assignee"],
  ["created", "table.created"],
];

function visibleResourceColumns() {
  const fallback = ["name", "type", "environments", "address", "credential", "status"];
  const configured = Array.isArray(state.resourceColumns) && state.resourceColumns.length ? state.resourceColumns : fallback;
  return RESOURCE_COLUMNS.filter(([key]) => configured.includes(key));
}

function visibleIssueColumns() {
  const fallback = ["issue", "application", "environment", "resourceName", "resourceIp", "resourceType", "severity", "status", "created"];
  const configured = Array.isArray(state.issueColumns) && state.issueColumns.length ? state.issueColumns : fallback;
  return ISSUE_COLUMNS.filter(([key]) => configured.includes(key));
}

function toggleIssueColumn(key, checked) {
  const fallback = visibleIssueColumns().map(([columnKey]) => columnKey);
  const next = new Set(fallback);
  checked ? next.add(key) : next.delete(key);
  if (!next.size) next.add("issue");
  state.issueColumns = [...next];
  localStorage.setItem("opsradar_issue_columns", JSON.stringify(state.issueColumns));
}

function toggleResourceColumn(key, checked) {
  const fallback = visibleResourceColumns().map(([columnKey]) => columnKey);
  const next = new Set(fallback);
  checked ? next.add(key) : next.delete(key);
  if (!next.size) next.add("name");
  state.resourceColumns = [...next];
  localStorage.setItem("opsradar_resource_columns", JSON.stringify(state.resourceColumns));
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(state.lang === "zh" ? "zh-CN" : "en-US", { hour12: false });
}

function currentDateLabel() {
  return new Intl.DateTimeFormat(state.lang === "zh" ? "zh-CN" : "en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date());
}

function formatTemplate(template, values) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template,
  );
}

function normalizeQuery(value) {
  return String(value ?? "").trim().toLowerCase();
}

function rowText(row, fields) {
  return fields.map((field) => String(row[field] ?? "")).join(" ").toLowerCase();
}

function selectionSet(scope) {
  if (scope === "reports") return state.selectedReports;
  if (!state.bulkSelected[scope]) state.bulkSelected[scope] = new Set();
  return state.bulkSelected[scope];
}

function filterRows(scope, rows, fields) {
  const query = normalizeQuery(state.filters[scope]);
  if (!query) return rows;
  return rows.filter((row) => rowText(row, fields).includes(query));
}

function pageSize(scope) {
  const value = Number(state.pageSizes[scope] || 10);
  return [10, 20, 50, 100].includes(value) ? value : 10;
}

function setPageSize(scope, value) {
  state.pageSizes[scope] = Number(value);
  localStorage.setItem("opsradar_page_sizes", JSON.stringify(state.pageSizes));
  resetPage(scope);
}

function paginate(scope, rows, pageSizeValue = pageSize(scope)) {
  const pageSize = pageSizeValue;
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(Math.max(Number(state.pages[scope] || 1), 1), pages);
  state.pages[scope] = current;
  const start = (current - 1) * pageSize;
  return {
    items: rows.slice(start, start + pageSize),
    page: current,
    pages,
    total: rows.length,
    start: rows.length ? start + 1 : 0,
    end: Math.min(start + pageSize, rows.length),
  };
}

function resetPage(scope) {
  state.pages[scope] = 1;
}

function selectedCount(scope) {
  return selectionSet(scope).size;
}

function filterPanelOpen(scope) {
  return state.filterPanels?.[scope] === true;
}

function toggleFilterPanel(scope) {
  state.filterPanels = state.filterPanels || {};
  state.filterPanels[scope] = !filterPanelOpen(scope);
  if (!state.filterPanels[scope]) state.filterSubmenus[scope] = null;
  localStorage.setItem("opsradar_filter_panels", JSON.stringify(state.filterPanels));
}

function toggleFilterSubmenu(scope, name) {
  state.filterSubmenus[scope] = state.filterSubmenus[scope] === name ? null : name;
}

function rowBulkId(row) {
  return row.bulk_id || row.id;
}

function checkboxCell(scope, id) {
  return `<input type="checkbox" data-kind="bulk" data-scope="${scope}" data-id="${escapeHtml(id)}" ${selectionSet(scope).has(id) ? "checked" : ""}>`;
}

function selectAllCell(scope, rows) {
  const ids = rows.map(rowBulkId);
  const checked = ids.length > 0 && ids.every((id) => selectionSet(scope).has(id));
  return `<input type="checkbox" data-kind="bulk-all" data-scope="${scope}" data-ids="${escapeHtml(ids.join("|"))}" ${checked ? "checked" : ""}>`;
}

function bulkDeleteButton(scope) {
  const count = selectedCount(scope);
  return `<button class="btn danger small bulk-delete ${count ? "active" : ""}" data-action="delete-selected" data-scope="${scope}" ${count ? "" : "disabled"}>${icon("trash")} ${t("action.deleteSelected")} ${count ? `(${count})` : ""}</button>`;
}

function bulkResolveIssuesButton() {
  const count = selectedCount("issues");
  return `<button class="btn primary small ${count ? "active" : ""}" data-action="bulk-resolve-issues" ${count ? "" : "disabled"}>${icon("check")} ${state.lang === "zh" ? "标记已修复" : "Mark resolved"} ${count ? `(${count})` : ""}</button>`;
}

function tableToolbar(scope, title, subtitle, total, extra = "", allowDelete = false) {
  const hasTitle = Boolean(title || subtitle);
  const hasExtra = Boolean(extra);
  const filterOpen = ["tasks", "issues", "resources", "reports"].includes(scope) ? filterPanelOpen(scope) : null;
  const extraObject = typeof extra === "object" && extra !== null ? extra : {};
  const filterPanel = extraObject.filterPanel || "";
  const extraHtml = typeof extra === "string" ? extra : (extra.html || "");
  return `
    <div class="table-toolbar ${hasTitle ? "" : "compact"} ${hasExtra ? "with-extra" : ""}">
      ${hasTitle ? `<div class="table-toolbar-title">
        <h2 class="panel-title">${escapeHtml(title)}</h2>
        <div class="panel-subtitle">${escapeHtml(subtitle)}</div>
      </div>` : ""}
      <div class="table-toolbar-actions">
        <div class="search-filter-anchor">
          <label class="table-search search-right-icon search-with-toggle">
            ${filterOpen === null ? "" : `<button class="filter-toggle-inline ${filterOpen ? "active" : ""}" type="button" data-action="toggle-filter-panel" data-scope="${escapeHtml(scope)}" aria-label="${state.lang === "zh" ? "展开或收起筛选" : "Toggle filters"}">${icon(filterOpen ? "chevron-down" : "chevron-right")}</button>`}
            <input value="${escapeHtml(state.filters[scope] || "")}" data-filter-scope="${scope}" placeholder="${t("search.local")}">
            ${icon("search")}
          </label>
          ${filterPanel}
        </div>
        ${extraHtml}
        ${allowDelete ? bulkDeleteButton(scope) : ""}
      </div>
    </div>
  `;
}

function pagination(scope, pageInfo) {
  return `
    <div class="pagination">
      <span>${formatTemplate(t("pagination.summary"), { start: pageInfo.start, end: pageInfo.end, total: pageInfo.total })}</span>
      <div class="toolbar">
        <select class="select compact-select" data-page-size="${scope}" aria-label="Page size">
          ${[10, 20, 50, 100].map((size) => `<option value="${size}" ${size === pageSize(scope) ? "selected" : ""}>${size} / ${state.lang === "zh" ? "页" : "page"}</option>`).join("")}
        </select>
        <button class="btn small" data-action="page" data-scope="${scope}" data-page="${pageInfo.page - 1}" ${pageInfo.page <= 1 ? "disabled" : ""}>${t("action.prev")}</button>
        <span class="page-index">${pageInfo.page} / ${pageInfo.pages}</span>
        <button class="btn small" data-action="page" data-scope="${scope}" data-page="${pageInfo.page + 1}" ${pageInfo.page >= pageInfo.pages ? "disabled" : ""}>${t("action.next")}</button>
      </div>
    </div>
  `;
}

function subnav(scope, items) {
  return `
    <div class="subnav">
      ${items.map(([id, label, count]) => `
        <button class="subnav-button ${state.tabs[scope] === id ? "active" : ""}" data-action="tab" data-scope="${scope}" data-tab="${id}">
          <span>${escapeHtml(label)}</span>
          ${Number.isFinite(count) ? `<strong>${count}</strong>` : ""}
        </button>
      `).join("")}
    </div>
  `;
}

function setTheme(theme) {
  state.theme = theme;
  localStorage.setItem("opsradar_theme", theme);
  document.documentElement.dataset.theme = theme;
}

function setLanguage(lang) {
  state.lang = lang;
  localStorage.setItem("opsradar_lang", lang);
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
}

for (const scope of ["tasks", "issues"]) {
  if (state.filterPanels?.[scope] !== true) {
    state.filterPanels[scope] = false;
    state.filterSubmenus[scope] = null;
  }
}
for (const scope of ["resources", "reports"]) {
  if (state.filterPanels?.[scope] !== true) {
    state.filterPanels[scope] = false;
    state.filterSubmenus[scope] = null;
  }
}

function toast(message, type = "success") {
  const node = document.getElementById("toast");
  node.textContent = message;
  node.classList.remove("success", "error");
  node.classList.add("show", type === "error" ? "error" : "success");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove("show"), 3200);
}

function searchResultsHtml() {
  const query = normalizeQuery(state.globalSearch.query);
  if (!query) return "";
  if (!state.globalSearch.results.length) {
    return `<div class="search-empty">${t("search.empty")}</div>`;
  }
  return state.globalSearch.results.map((item) => `
    <button class="search-result" data-action="search-result" data-view="${escapeHtml(item.view)}" data-tab="${escapeHtml(item.tab || "")}" data-id="${escapeHtml(item.id)}">
      <span class="status pending">${escapeHtml(item.type)}</span>
      <strong>${escapeHtml(item.title)}</strong>
      <small>${escapeHtml(item.subtitle || "")}</small>
    </button>
  `).join("");
}

function syncSearchPanel() {
  const panel = document.getElementById("search-results");
  if (!panel) return;
  panel.innerHTML = searchResultsHtml();
  panel.hidden = !state.globalSearch.open || !normalizeQuery(state.globalSearch.query);
}

async function runGlobalSearch(query) {
  state.globalSearch.query = query;
  state.globalSearch.open = Boolean(normalizeQuery(query));
  const seq = state.globalSearch.seq + 1;
  state.globalSearch.seq = seq;
  if (!normalizeQuery(query)) {
    state.globalSearch.results = [];
    syncSearchPanel();
    return;
  }
  try {
    const payload = await api(`/api/search?q=${encodeURIComponent(query)}`);
    if (state.globalSearch.seq !== seq) return;
    state.globalSearch.results = payload.results || [];
  } catch {
    if (state.globalSearch.seq !== seq) return;
    state.globalSearch.results = [];
  }
  syncSearchPanel();
}

async function loadPublicSiteSettings() {
  try {
    const payload = await api("/api/site");
    persistSiteSettings(payload);
  } catch {
    if (!state.siteSettings) persistSiteSettings(defaultSiteSettings());
  }
}

async function loadBootstrap() {
  state.data = await api("/api/bootstrap");
  state.user = state.data.user;
  persistSiteSettings(state.data.site_settings || defaultSiteSettings());
  await loadAiChatSessions();
}

async function loadAiChatSessions() {
  if (!state.token) return;
  try {
    const payload = await api("/api/ai/chat/sessions?days=3");
    state.aiAssistant.sessions = payload.items || [];
  } catch {
    state.aiAssistant.sessions = [];
  }
}

function render() {
  setTheme(state.theme);
  setLanguage(state.lang);
  document.title = `${pageTitle()} · ${siteSettings().site_name}`;
  if (["roles", "users"].includes(state.view)) {
    state.view = "settings";
    localStorage.setItem("opsradar_view", state.view);
  }
  if (state.view === "issues") {
    state.view = "problem-center";
    state.tabs.problems = "issues";
    localStorage.setItem("opsradar_view", state.view);
    localStorage.setItem("opsradar_tab_problems", state.tabs.problems);
  }
  if (state.view === "templates") {
    state.view = "tasks";
    state.tabs.tasks = "templates";
    localStorage.setItem("opsradar_view", state.view);
    localStorage.setItem("opsradar_tab_tasks", state.tabs.tasks);
  }
  if (!NAV_ITEMS.some(([id]) => id === state.view)) {
    state.view = "dashboard";
    localStorage.setItem("opsradar_view", state.view);
  }
  if (!state.token || !state.user || !state.data) {
    renderLogin();
    return;
  }
  const nav = NAV_ITEMS.find((item) => item[0] === state.view) || NAV_ITEMS[0];
  document.getElementById("app").innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="sidebar-brand">
          ${logoMark()}
          <div>
            <div class="brand-name">${escapeHtml(siteSettings().site_name)}</div>
            <div class="brand-caption">${escapeHtml(siteSettings().site_subtitle)}</div>
          </div>
        </div>
        <nav class="nav" aria-label="Primary navigation">
          ${NAV_ITEMS.map(([id, glyph]) => `
            <button class="nav-button ${state.view === id ? "active" : ""}" data-action="nav" data-view="${id}">
              ${icon(glyph)} <span>${t(`nav.${id}`)}</span>
            </button>
          `).join("")}
        </nav>
        <div class="profile-box">
          <div>
            <div class="profile-name">${escapeHtml(state.user.display_name)}</div>
            <div class="profile-meta">${escapeHtml(state.user.role)} · ${escapeHtml(state.user.system_version)}</div>
          </div>
          <button class="profile-logout" data-action="logout" title="${t("top.logout")}">${icon("logout")}</button>
        </div>
      </aside>
      <section class="content">
        <header class="topbar">
          <div class="topbar-right">
            <label class="global-search" aria-label="${t("search.hint")}">
              ${icon("search")}
              <input id="global-search" value="${escapeHtml(state.globalSearch.query)}" placeholder="${t("search.placeholder")}" autocomplete="off">
              <div class="search-results" id="search-results" ${state.globalSearch.open && normalizeQuery(state.globalSearch.query) ? "" : "hidden"}>
                ${searchResultsHtml()}
              </div>
            </label>
            <span class="date-chip">${currentDateLabel()}</span>
            <button class="icon-button" title="${t("top.notifications")}">${icon("bell")}</button>
            <button class="icon-button" title="${t("top.sync")}" data-action="refresh">${icon("cloud")}</button>
            <button class="icon-button" data-action="theme" title="${state.theme === "light" ? t("top.darkMode") : t("top.lightMode")}" aria-label="${state.theme === "light" ? t("top.darkMode") : t("top.lightMode")}">${icon(state.theme === "light" ? "sun" : "moon")}</button>
            <button class="icon-button" data-action="language" title="${t("top.language")}" aria-label="${t("top.language")}">${icon("language")}</button>
          </div>
        </header>
        <main class="main">${renderView()}</main>
      </section>
    </div>
    ${renderAiAssistantLauncher()}
    ${renderModal()}
  `;
}

function renderAiAssistantLauncher() {
  const settings = state.data?.ai_assistant_settings || {};
  if (!settings.enabled) return "";
  const name = settings.name || t("ai.assistant");
  const assistantState = state.floatingAssistant;
  const floatStyles = aiFloatingStyles();
  const messages = assistantState.messages.length
    ? assistantState.messages
    : [{ role: "assistant", content: assistantWelcomeMessage(settings), default: true }];
  return `
    <aside class="ai-chat-window ${assistantState.open ? "open" : ""}" style="${escapeHtml(floatStyles.window)}" aria-label="${escapeHtml(name)}">
      <div class="ai-chat-head" data-ai-drag-handle="window">
        <div class="ai-chat-id">
          <div class="ai-chat-avatar">${aiBotIcon()}</div>
          <div>
            <strong>${escapeHtml(name)}</strong>
            <span>${escapeHtml(t("ai.online"))}</span>
          </div>
        </div>
        <button class="icon-button ai-chat-close" data-action="toggle-ai-assistant" title="${t("action.cancel")}">×</button>
      </div>
      <div class="ai-chat-messages">
        ${messages.map((message) => aiChatMessageHtml(message, "floating")).join("")}
        ${assistantState.typing ? aiTypingHtml() : ""}
      </div>
      <div class="ai-chat-compose">
        <textarea id="ai-chat-input" rows="1" placeholder="${escapeHtml(t("ai.placeholder"))}"></textarea>
        <button type="button" data-action="send-ai-chat" data-chat-scope="floating" title="${t("action.create")}">${icon("send")}</button>
      </div>
      <div class="ai-chat-foot">
        <button type="button" data-action="clear-ai-chat" data-chat-scope="floating">${escapeHtml(t("ai.clearChat"))}</button>
      </div>
    </aside>
    <button class="ai-assistant-launcher ${assistantState.open ? "open" : ""}" style="${escapeHtml(floatStyles.launcher)}" data-action="toggle-ai-assistant" data-ai-drag-handle="launcher" title="${escapeHtml(name)}" aria-label="${escapeHtml(name)}">
      ${assistantState.open ? icon("close") : aiBotIcon()}
    </button>
  `;
}

function aiFloatingStyles() {
  const position = state.floatingAssistant.position;
  if (!position || typeof window === "undefined") {
    return { launcher: "", window: "" };
  }
  const left = Math.max(16, Math.min(Number(position.x) || 0, window.innerWidth - 80));
  const top = Math.max(16, Math.min(Number(position.y) || 0, window.innerHeight - 80));
  const panelWidth = Math.min(380, window.innerWidth - 32);
  const panelHeight = Math.min(600, window.innerHeight - 132);
  const panelLeft = Math.max(16, Math.min(left - panelWidth + 64, window.innerWidth - panelWidth - 16));
  const panelTop = Math.max(16, Math.min(top - panelHeight - 12, window.innerHeight - panelHeight - 16));
  return {
    launcher: `left:${left}px;top:${top}px;right:auto;bottom:auto;`,
    window: `left:${panelLeft}px;top:${panelTop}px;right:auto;bottom:auto;`,
  };
}

function aiBotIcon() {
  return `
    <svg class="ai-bot-icon" viewBox="0 0 48 48" aria-hidden="true">
      <path class="ai-bot-face" d="M14 17.5C14 13.9 16.9 11 20.5 11h7C31.1 11 34 13.9 34 17.5v1.2h1.2c2.1 0 3.8 1.7 3.8 3.8v8.2c0 4-3.3 7.3-7.3 7.3H16.3c-4 0-7.3-3.3-7.3-7.3v-8.2c0-2.1 1.7-3.8 3.8-3.8H14v-1.2Z"/>
      <path class="ai-bot-line" d="M19 11V7m10 4V7M15 24h18M17.5 31.5c3.8 2.5 9.2 2.5 13 0"/>
      <circle class="ai-bot-dot" cx="19" cy="26.5" r="2"/>
      <circle class="ai-bot-dot" cx="29" cy="26.5" r="2"/>
      <path class="ai-bot-line" d="M9 27H5m38 0h-4"/>
      <path class="ai-bot-scan" d="M16 20.5h16"/>
    </svg>
  `;
}

function aiChatMessageHtml(message, scope = "page") {
  const isUser = message.role === "user";
  const workflow = message.meta?.workflow;
  return `
    <div class="ai-chat-row ${isUser ? "user" : "assistant"}">
      <div class="ai-chat-bubble">
        <div class="ai-message-content">${isUser ? escapeHtml(message.content) : renderAssistantMarkdown(message.content, scope)}</div>
        ${!isUser ? aiIssueChoicesHtml(message.meta || {}, scope) : ""}
        ${!isUser ? aiActionSourceHtml(message.meta || {}) : ""}
        ${!isUser && workflow && workflow.status !== "not_required" ? aiWorkflowHtml(workflow) : ""}
        <span>${escapeHtml(message.time || currentTimeLabel())}</span>
      </div>
    </div>
  `;
}

function aiAnalyzeIssuePrompt(issueId) {
  return state.lang === "zh"
    ? `分析问题 ${issueId} 的可能原因，并生成修复建议`
    : `Analyze issue ${issueId} and generate repair suggestions`;
}

function aiIssueChoicesHtml(meta = {}, scope = "page") {
  const issues = meta.issues?.items || [];
  if (!issues.length) return "";
  const title = state.lang === "zh" ? "选择问题继续分析" : "Select an issue to analyze";
  return `
    <div class="ai-issue-choice-card">
      <div class="ai-issue-choice-head">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(state.lang === "zh" ? `共 ${meta.issues.total || issues.length} 个问题` : `${meta.issues.total || issues.length} issues`)}</span>
      </div>
      <div class="ai-issue-choice-list">
        ${issues.slice(0, 6).map((issue) => {
          const asset = [issue.resource_name, issue.resource_ip].filter(Boolean).join(" / ") || "-";
          const env = [issue.application_name, issue.environment_name].filter(Boolean).join(" / ") || "-";
          return `
            <button type="button" class="ai-issue-choice" data-action="ai-analyze-issue" data-id="${escapeHtml(issue.id)}" data-chat-scope="${escapeHtml(scope)}">
              <span class="ai-issue-severity ${escapeHtml(issue.severity || "medium")}">${escapeHtml(issue.severity || "-")}</span>
              <span class="ai-issue-choice-main">
                <strong>${escapeHtml(issue.summary || issue.id)}</strong>
                <small>${escapeHtml(asset)} · ${escapeHtml(env)} · ${escapeHtml(issue.status || "-")}</small>
              </span>
              ${icon("chevron-right")}
            </button>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function aiActionSourceHtml(meta = {}) {
  const status = meta.status || "";
  const sourceMap = {
    "action:list_issues": state.lang === "zh" ? "OpsRadar 问题列表" : "OpsRadar Issues",
    "action:list_assets": state.lang === "zh" ? "OpsRadar 资产列表" : "OpsRadar Assets",
    "action:analyze_issue": state.lang === "zh" ? "OpsRadar 问题详情 / 规则知识库" : "OpsRadar Issue Detail / Knowledge Base",
    "action:get_platform_summary": state.lang === "zh" ? "OpsRadar 平台统计" : "OpsRadar Summary",
    empty_context: state.lang === "zh" ? "OpsRadar 数据上下文" : "OpsRadar Context",
    workflow_ready: state.lang === "zh" ? "OpsRadar 工作流" : "OpsRadar Workflow",
    observability_not_configured: state.lang === "zh" ? "OpsRadar 数据源配置" : "OpsRadar Datasources",
  };
  const source = sourceMap[status];
  if (!source) return "";
  const chips = [];
  const ctx = meta.data_context || {};
  if (ctx.target_application) chips.push(`${state.lang === "zh" ? "目标应用" : "Target app"} ${ctx.target_application}`);
  if (ctx.target_environment) chips.push(`${state.lang === "zh" ? "目标环境" : "Target env"} ${ctx.target_environment}`);
  if (Number.isFinite(Number(ctx.matched_environments))) chips.push(`${state.lang === "zh" ? "匹配环境" : "Matched envs"} ${ctx.matched_environments}`);
  if (Number.isFinite(Number(ctx.matched_assets))) chips.push(`${state.lang === "zh" ? "匹配资产" : "Matched assets"} ${ctx.matched_assets}`);
  if (Number.isFinite(Number(ctx.issues))) chips.push(`${state.lang === "zh" ? "问题" : "Issues"} ${ctx.issues}`);
  if (status !== "workflow_ready" && Number.isFinite(Number(ctx.resources))) chips.push(`${state.lang === "zh" ? "资产" : "Assets"} ${ctx.resources}`);
  if (status !== "workflow_ready" && Number.isFinite(Number(ctx.tasks))) chips.push(`${state.lang === "zh" ? "任务" : "Tasks"} ${ctx.tasks}`);
  return `
    <div class="ai-source-card">
      <strong>${state.lang === "zh" ? "数据来源" : "Source"}：${escapeHtml(source)}</strong>
      ${chips.length ? `<div>${chips.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>` : ""}
    </div>
  `;
}

function aiWorkflowHtml(workflow) {
  const steps = workflow.steps || [];
  if (!steps.length) return "";
  const target = workflow.target || {};
  const context = workflow.context || {};
  const activeIndex = Math.max(0, steps.findIndex((step) => ["awaiting_confirmation", "running", "blocked"].includes(step.status)));
  const nextAction = (workflow.next_actions || [])[0] || {};
  const actionMap = {
    open_application_modal: { icon: "plus", label: nextAction.label || (state.lang === "zh" ? "创建应用环境" : "Create environment") },
    open_resource_modal: { icon: "plus", label: nextAction.label || (state.lang === "zh" ? "添加资产" : "Add asset") },
    open_task_modal: { icon: "checklist", label: nextAction.label || (state.lang === "zh" ? "创建巡检任务" : "Create task") },
    open_environment_rules_modal: { icon: "settings", label: nextAction.label || (state.lang === "zh" ? "绑定规则集" : "Bind rules") },
    run_workflow_action: { icon: "play", label: nextAction.label || (state.lang === "zh" ? "继续" : "Continue") },
    select_assets: { icon: "server", label: nextAction.label || (state.lang === "zh" ? "选择资产" : "Select assets") },
    navigate: { icon: "trend", label: nextAction.label || (state.lang === "zh" ? "查看详情" : "View details") },
  };
  const workflowActions = workflow.next_actions || [];
  const primaryAction = workflowActions[0] || null;
  const secondaryActions = workflowActions.slice(1);
  return `
    <div class="ai-workflow-card">
      <div class="ai-workflow-head">
        <h3>${state.lang === "zh" ? "巡检任务" : "Inspection Task"}</h3>
      </div>
      <div class="ai-workflow-summary">
        <div><span>${state.lang === "zh" ? "目标应用" : "Application"}</span><strong>${escapeHtml(target.application_name || context.candidate_application_name || "-")}</strong></div>
        <div><span>${state.lang === "zh" ? "目标环境" : "Environment"}</span><strong>${escapeHtml(target.env_label || context.candidate_environment_name || "-")}</strong></div>
        <div><span>${state.lang === "zh" ? "匹配环境" : "Matched envs"}</span><strong>${escapeHtml(context.environment_id || context.candidate_environment_id ? 1 : 0)}</strong></div>
        <div><span>${state.lang === "zh" ? "匹配资产" : "Matched assets"}</span><strong>${escapeHtml((context.resource_ids || []).length || 0)}</strong></div>
        <div><span>${state.lang === "zh" ? "下一步" : "Next"}</span><strong>${escapeHtml(workflow.current_step || "-")}</strong></div>
      </div>
      <div class="ai-workflow-action-strip">
        ${primaryAction ? aiWorkflowActionButton(primaryAction, workflow.id, actionMap[primaryAction.ui_action]?.icon || "play", true) : ""}
        ${secondaryActions.map((item) => aiWorkflowActionButton(item, workflow.id, actionMap[item.ui_action]?.icon || "briefcase", false)).join("")}
      </div>
      <div class="ai-workflow-timeline">
      ${steps.map((step, index) => `
        <div class="ai-workflow-node ${escapeHtml(step.status || "")} ${index === activeIndex ? "active" : ""}">
          <i>${step.status === "completed" ? icon("shield") : ""}</i>
          ${index < steps.length - 1 ? `<b>${icon("chevron-right")}</b>` : ""}
          <span>${escapeHtml(step.title || step.action_name || "-")}</span>
        </div>
      `).join("")}
      </div>
      <div class="ai-workflow-current">${state.lang === "zh" ? "当前步骤" : "Current step"}：<strong>${escapeHtml(workflow.current_step || "-")}</strong></div>
    </div>
  `;
}

function aiWorkflowActionButton(item, workflowId, iconName = "play", primary = false) {
  const classes = `btn ${primary || item.style === "primary" ? "primary" : ""} ${primary ? "workflow-primary-action" : "workflow-secondary-action"}`.trim();
  return `<button class="${classes}" type="button" data-action="workflow-next-action" data-workflow-id="${escapeHtml(workflowId || "")}" data-ui-action="${escapeHtml(item.ui_action || "")}" data-action-name="${escapeHtml(item.action_name || "")}" data-event-name="${escapeHtml(item.event || "")}" data-params="${escapeHtml(encodeWorkflowParams(item.params || {}))}" data-confirm="${item.requires_confirmation ? "true" : "false"}">${icon(iconName)} ${escapeHtml(item.label || item.action_name || "-")}</button>`;
}

function aiWorkflowActionsHtml(workflow) {
  const workflowId = workflow.id || "";
  const actions = (workflow.next_actions || []).map((item) => {
    const classes = `btn ${item.style === "primary" ? "primary" : ""} micro`.trim();
    return `<button class="${classes}" type="button" data-action="workflow-next-action" data-workflow-id="${escapeHtml(workflowId)}" data-ui-action="${escapeHtml(item.ui_action || "")}" data-action-name="${escapeHtml(item.action_name || "")}" data-event-name="${escapeHtml(item.event || "")}" data-params="${escapeHtml(encodeWorkflowParams(item.params || {}))}" data-confirm="${item.requires_confirmation ? "true" : "false"}">${escapeHtml(item.label || item.action_name || "-")}</button>`;
  });
  return actions.length ? `<div class="ai-workflow-actions">${actions.join("")}</div>` : "";
}

function encodeWorkflowParams(params) {
  return encodeURIComponent(JSON.stringify(params || {}));
}

function decodeWorkflowParams(value) {
  try {
    return JSON.parse(decodeURIComponent(value || "%7B%7D"));
  } catch {
    return {};
  }
}

function inlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function renderAssistantMarkdown(content = "", scope = "page") {
  const lines = String(content || "").split(/\r?\n/);
  const html = [];
  let list = [];
  const flushList = () => {
    if (list.length) {
      html.push(`<ul>${list.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`);
      list = [];
    }
  };
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }
    const prompt = trimmed.match(/^\[\s*(.+?)\s*\]$/);
    if (prompt) {
      flushList();
      html.push(`<button type="button" class="ai-inline-prompt" data-action="ai-quick-prompt" data-chat-scope="${escapeHtml(scope)}" data-prompt="${escapeHtml(prompt[1])}">${escapeHtml(prompt[1])}</button>`);
      continue;
    }
    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushList();
      const level = Math.min(heading[1].length + 2, 5);
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }
    const bullet = trimmed.match(/^[-*]\s+(.+)$/) || trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (bullet) {
      list.push(bullet[1]);
      continue;
    }
    flushList();
    html.push(`<p>${inlineMarkdown(trimmed)}</p>`);
  }
  flushList();
  return html.join("") || "<p></p>";
}

function aiTypingHtml() {
  return `
    <div class="ai-chat-row assistant">
      <div class="ai-chat-typing">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
}

function currentTimeLabel() {
  return new Date().toLocaleTimeString(state.lang === "zh" ? "zh-CN" : "en-US", { hour: "2-digit", minute: "2-digit" });
}

function defaultAiWelcomeMessage() {
  return state.lang === "zh"
    ? "👋 你好，我是 OpsRadar AI 智能巡检助手\n\n我可以帮你分析巡检异常、定位问题原因、生成修复建议，也可以通过对话引导你创建巡检任务、添加资产、执行巡检并生成报告。\n\n你可以试着问我：\n[ 帮我给生产环境创建一次 JumpServer 集群巡检 ]\n[ 分析当前异常的可能原因 ]\n[ 根据巡检结果生成修复建议 ]"
    : "👋 Hi, I am the OpsRadar AI inspection assistant.\n\nI can help analyze inspection anomalies, locate probable causes, generate remediation suggestions, and guide you through creating inspection tasks, adding assets, running inspections, and generating reports.\n\nTry asking:\n[ Create a JumpServer cluster inspection for production ]\n[ Analyze the likely cause of current anomalies ]\n[ Generate remediation suggestions from inspection results ]";
}

function assistantWelcomeMessage(settings = {}) {
  return settings.welcome_message || defaultAiWelcomeMessage();
}

function renderLogin() {
  setLanguage(state.lang);
  document.title = `${t("login.signIn")} · ${siteSettings().site_name}`;
  document.getElementById("app").innerHTML = `
    <main class="login-screen">
      <section class="login-brand">
        <div class="login-brand-top">
          ${logoMark()}
          <div>
            <div class="brand-name">${escapeHtml(siteSettings().site_name)}</div>
            <div class="brand-caption">${escapeHtml(siteSettings().site_subtitle)}</div>
          </div>
        </div>
        <div class="login-statement">
          <h1>${t("login.title")}</h1>
          <p>${t("login.desc")}</p>
        </div>
        <div class="login-hero-visual" aria-hidden="true">
          <div class="visual-base"></div>
          <div class="visual-card visual-card-a"><span></span><i></i><i></i><i></i></div>
          <div class="visual-card visual-card-b"><span></span><i></i><i></i></div>
          <div class="visual-shield">${icon("sparkles")}</div>
        </div>
        <div class="login-features">
          <div class="login-feature">${icon("sparkles")}<div><strong>${t("login.issueLoop")}</strong><span>${t("login.issueLoopDesc")}</span></div></div>
          <div class="login-feature">${icon("checklist")}<div><strong>${t("login.taskOps")}</strong><span>${t("login.taskOpsDesc")}</span></div></div>
          <div class="login-feature">${icon("document")}<div><strong>${t("login.reportHub")}</strong><span>${t("login.reportHubDesc")}</span></div></div>
          <div class="login-feature">${icon("alert")}<div><strong>${t("login.issueClosure")}</strong><span>${t("login.issueClosureDesc")}</span></div></div>
        </div>
      </section>
      <section class="login-panel-wrap">
        <form class="login-panel" id="login-form">
          <h2>${t("login.signIn")}</h2>
          ${t("login.access") ? `<p>${t("login.access")}</p>` : ""}
          <div class="field">
            <label for="username">${t("login.username")}</label>
            <div class="login-input-wrap">
              <input class="input" id="username" name="username" autocomplete="username" value="admin">
              ${icon("user")}
            </div>
          </div>
          <div class="field">
            <label for="password">${t("login.password")}</label>
            <div class="login-input-wrap">
              <input class="input" id="password" name="password" type="password" autocomplete="current-password">
              ${icon("lock")}
            </div>
          </div>
          <div class="login-options">
            <label><input type="checkbox" checked> ${t("login.remember")}</label>
            <button type="button" class="login-link">${t("login.forgot")}</button>
          </div>
          <div class="login-error" id="login-error"></div>
          <div class="login-actions">
            <button class="icon-button language-login-button" type="button" data-action="language" title="${t("top.language")}" aria-label="${t("top.language")}">${icon("language")}</button>
            <button class="btn primary login-submit" type="submit">${t("login.submit")}</button>
          </div>
        </form>
      </section>
    </main>
    ${renderModal()}
  `;
}

function pageTitle() {
  return t(`page.${state.view}`) || t("page.dashboard");
}

function renderView() {
  switch (state.view) {
    case "environments":
      return renderEnvironments();
    case "tasks":
      return renderTasks();
    case "problem-center":
      return renderProblemCenter();
    case "reports":
      return renderReports();
    case "ai-center":
      return renderAiCenter();
    case "audit":
      return renderAudit();
    case "settings":
      return renderSettings();
    default:
      return renderDashboard();
  }
}

function statCard(label, value, iconName, foot = "", tone = "brand") {
  return `
    <article class="data-card ops-kpi-card ${tone}">
      <span class="ops-card-icon">${icon(iconName)}</span>
      <div>
        <div class="card-label">${escapeHtml(label)}</div>
        <div class="card-value">${escapeHtml(value)}</div>
        ${foot ? `<div class="card-foot">${escapeHtml(foot)}</div>` : ""}
      </div>
    </article>
  `;
}

function overviewKpiCard({ label, value, iconName, tone = "brand", body = "", wave = false }) {
  return `
    <article class="overview-kpi-card ${tone} ${wave ? "has-wave" : ""}">
      <div class="overview-kpi-head">
        <span class="overview-kpi-icon">${icon(iconName)}</span>
        <strong>${escapeHtml(label)}</strong>
      </div>
      <div class="overview-kpi-value">${escapeHtml(value)}</div>
      ${body ? `<div class="overview-kpi-body">${body}</div>` : ""}
      ${wave ? `<div class="overview-kpi-wave" aria-hidden="true"></div>` : ""}
    </article>
  `;
}

function overviewRateRing(rate) {
  const value = Math.max(0, Math.min(100, Number(rate || 0)));
  return `
    <div class="overview-rate-ring" style="--rate:${value}%">
      <strong>${value}%</strong>
    </div>
  `;
}

function renderOverviewKpis(cards, weeklyReports = []) {
  const issues = state.data.issues || [];
  const totalIssues = cards.total_issues ?? issues.length;
  const severeIssues = cards.severe_issues ?? issues.filter((issue) => ["critical", "high"].includes(issue.severity)).length;
  const resolvedIssues = cards.resolved_issues ?? issues.filter((issue) => issue.status === "resolved").length;
  return `
    <div class="overview-kpi-grid">
      ${overviewKpiCard({
        label: state.lang === "zh" ? "总资产数" : "Total Assets",
        value: cards.managed_resources || 0,
        iconName: "server",
        body: `<div class="overview-kpi-note">${state.lang === "zh" ? "资源列表实体资产" : "Resource list entities"}</div>`,
      })}
      ${overviewKpiCard({
        label: state.lang === "zh" ? "巡检任务" : "Inspection Tasks",
        value: cards.total_tasks || 0,
        iconName: "checklist",
        body: `<div class="overview-kpi-note">${state.lang === "zh" ? "累计创建任务" : "Total tasks"}</div>`,
      })}
      ${overviewKpiCard({
        label: state.lang === "zh" ? "发现问题" : "Issues Found",
        value: totalIssues,
        iconName: "alert",
        tone: "bad",
        body: `<div class="overview-kpi-note">${state.lang === "zh" ? "累计异常记录" : "Total issue records"}</div>`,
      })}
      ${overviewKpiCard({
        label: state.lang === "zh" ? "严重问题" : "Severe Issues",
        value: severeIssues,
        iconName: "alert",
        tone: "bad",
        body: `<div class="overview-kpi-note">${state.lang === "zh" ? "严重 / 高危" : "Critical / high"}</div>`,
      })}
      ${overviewKpiCard({
        label: state.lang === "zh" ? "已修复问题" : "Resolved Issues",
        value: resolvedIssues,
        iconName: "shield",
        body: `<div class="overview-kpi-note">${state.lang === "zh" ? "已完成闭环" : "Closed issues"}</div>`,
      })}
    </div>
  `;
}

function percent(value, total) {
  if (!total) return 0;
  return Number(((Number(value || 0) / Number(total || 1)) * 100).toFixed(1));
}

function sumBy(rows, key) {
  return rows.reduce((sum, item) => sum + Number(item[key] || 0), 0);
}

function severityMeta(severity) {
  const key = severity || "low";
  const maps = {
    critical: { label: state.lang === "zh" ? "严重" : "Critical", tone: "bad", color: "var(--bad)" },
    high: { label: state.lang === "zh" ? "高危" : "High", tone: "warn", color: "#ff8a1d" },
    medium: { label: state.lang === "zh" ? "中危" : "Medium", tone: "yellow", color: "#f6c34a" },
    low: { label: state.lang === "zh" ? "低危" : "Low", tone: "blue", color: "var(--brand-2)" },
  };
  return maps[key] || maps.low;
}

function issueSeverityParts() {
  const order = ["critical", "high", "medium", "low"];
  const counts = Object.fromEntries(order.map((key) => [key, 0]));
  (state.data.issues || []).forEach((issue) => {
    const key = order.includes(issue.severity) ? issue.severity : "low";
    counts[key] += 1;
  });
  return order.map((key) => ({
    key,
    value: counts[key],
    label: severityMeta(key).label,
    color: severityMeta(key).color,
    tone: severityMeta(key).tone,
  }));
}

function donutPanel({ title, total, centerLabel, parts, footerLabel, action }) {
  const gradient = donutGradient(parts);
  return `
    <section class="panel dashboard-card-panel">
      <div class="panel-head ops-panel-head">
        <h2 class="panel-title">${escapeHtml(title)}</h2>
      </div>
      <div class="dashboard-donut-layout">
        <div class="ops-donut" style="--donut:${gradient}">
          <div class="ops-donut-center">
            <strong>${escapeHtml(total)}</strong>
            <span>${escapeHtml(centerLabel)}</span>
          </div>
        </div>
        <div class="ops-overview-list">
          ${parts.map((part) => overviewLegend(part.label, part.value, part.tone, `${percent(part.value, total)}%`)).join("")}
        </div>
      </div>
      ${action ? `<div class="dashboard-panel-footer"><button class="btn ghost" data-action="${action.action}" data-view="${action.view || ""}">${escapeHtml(footerLabel)} ${icon("trend")}</button></div>` : ""}
    </section>
  `;
}

function renderIssueStats() {
  const parts = issueSeverityParts();
  const total = parts.reduce((sum, part) => sum + part.value, 0);
  return donutPanel({
    title: state.lang === "zh" ? "问题统计" : "Issue Statistics",
    total,
    centerLabel: state.lang === "zh" ? "总问题" : "Issues",
    parts,
    footerLabel: state.lang === "zh" ? "查看全部问题" : "View all issues",
    action: { action: "nav", view: "problem-center" },
  });
}

function daysBack(count = 7) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (count - 1 - index));
    return {
      date,
      key: date.toISOString().slice(0, 10),
      label: `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`,
    };
  });
}

function issueTrendRows() {
  const severities = ["critical", "high", "medium", "low"];
  return daysBack(7).map((day) => {
    const row = { label: day.label };
    severities.forEach((severity) => {
      row[severity] = (state.data.issues || []).filter((issue) => {
        const created = String(issue.created_at || "").slice(0, 10);
        return created === day.key && (issue.severity || "low") === severity;
      }).length;
    });
    return row;
  });
}

function renderMultiLineChart({ title, data, series }) {
  const width = 680;
  const height = 260;
  const padX = 40;
  const padTop = 24;
  const padBottom = 36;
  const plotWidth = width - padX * 2;
  const plotHeight = height - padTop - padBottom;
  const maxValue = Math.max(1, ...data.flatMap((item) => series.map((line) => item[line.key] || 0)));
  const point = (index, value) => {
    const x = padX + (data.length <= 1 ? 0 : (index / (data.length - 1)) * plotWidth);
    const y = padTop + plotHeight - ((value || 0) / maxValue) * plotHeight;
    return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
  };
  return `
    <div class="ops-chart-body">
      <svg class="ops-line-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(title)}">
        <g class="ops-chart-grid">
          <line x1="${padX}" y1="${padTop}" x2="${padX + plotWidth}" y2="${padTop}"></line>
          <line x1="${padX}" y1="${padTop + plotHeight / 2}" x2="${padX + plotWidth}" y2="${padTop + plotHeight / 2}"></line>
          <line x1="${padX}" y1="${padTop + plotHeight}" x2="${padX + plotWidth}" y2="${padTop + plotHeight}"></line>
        </g>
        ${series.map((line) => {
          const points = data.map((item, index) => point(index, item[line.key] || 0));
          return `<polyline class="ops-trend-line multi" style="stroke:${line.color}" points="${points.map((item) => `${item.x},${item.y}`).join(" ")}"></polyline>
            ${points.map((item, index) => `<circle class="ops-trend-dot multi" style="stroke:${line.color}" cx="${item.x}" cy="${item.y}" r="3.5"><title>${escapeHtml(data[index].label)} ${escapeHtml(line.label)} ${data[index][line.key] || 0}</title></circle>`).join("")}`;
        }).join("")}
        ${data.map((item, index) => {
          const labelPoint = point(index, 0);
          return `<text class="ops-chart-label" x="${labelPoint.x}" y="${height - 8}" text-anchor="middle">${escapeHtml(item.label)}</text>`;
        }).join("")}
      </svg>
      <div class="ops-trend-legend">
        ${series.map((line) => `<span><i class="legend-line" style="background:${line.color}"></i>${escapeHtml(line.label)}</span>`).join("")}
      </div>
    </div>
  `;
}

function renderIssueTrendPanel() {
  const series = ["critical", "high", "medium", "low"].map((key) => ({
    key,
    label: severityMeta(key).label,
    color: severityMeta(key).color,
  }));
  return `
    <section class="panel ops-panel">
      <div class="panel-head ops-panel-head">
        <h2 class="panel-title">${state.lang === "zh" ? "问题趋势" : "Issue Trend"}</h2>
        <span class="status pending">${state.lang === "zh" ? "近 7 天" : "Last 7 days"}</span>
      </div>
      ${renderMultiLineChart({ title: state.lang === "zh" ? "问题趋势" : "Issue Trend", data: issueTrendRows(), series })}
    </section>
  `;
}

function renderLatestSevereIssues() {
  const issues = [...(state.data.issues || [])]
    .filter((issue) => ["critical", "high"].includes(issue.severity || ""))
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 5);
  return `
    <section class="panel ops-panel latest-issues-panel">
      <div class="panel-head ops-panel-head">
        <h2 class="panel-title">${state.lang === "zh" ? "最新严重问题" : "Latest Severe Issues"}</h2>
        <button class="btn ghost small" data-action="nav" data-view="problem-center">${t("dashboard.viewAll")}</button>
      </div>
      <div class="latest-issue-list">
        ${issues.length ? issues.map((issue) => {
          const meta = severityMeta(issue.severity);
          return `
            <button class="latest-issue-item" data-action="nav" data-view="problem-center">
              <span class="latest-issue-icon ${escapeHtml(meta.tone)}">${icon("alert")}</span>
              <span>
                <strong>${escapeHtml(issue.summary || "-")}</strong>
                <small>${escapeHtml(issue.resource_name || issue.resource_ip || issue.environment_name || "-")}</small>
              </span>
              <em class="status ${statusClass(issue.severity === "critical" ? "critical" : "warning")}">${escapeHtml(meta.label)}</em>
              <time>${formatDate(issue.created_at)}</time>
            </button>
          `;
        }).join("") : `<div class="empty">${t("dashboard.noIssues")}</div>`}
      </div>
    </section>
  `;
}

function applicationHealthRows() {
  return applications().map((app) => {
    const appEnvs = environments().filter((env) => env.application_id === app.id || env.application_name === app.name);
    const scores = appEnvs.map((env) => env.overview?.health_score).filter((score) => score !== null && score !== undefined);
    const score = scores.length ? Math.round(scores.reduce((sum, item) => sum + Number(item), 0) / scores.length) : null;
    const resourceCount = appEnvs.reduce((sum, env) => sum + (env.resources || []).length, 0);
    const issueCount = appEnvs.reduce((sum, env) => sum + (env.overview?.open_issues || []).length, 0);
    return { ...app, environments: appEnvs.length, score, resourceCount, issueCount };
  });
}

function renderApplicationHealth() {
  const rows = applicationHealthRows();
  const scored = rows.filter((row) => row.score !== null && row.score !== undefined);
  const score = scored.length ? Math.round(scored.reduce((sum, row) => sum + Number(row.score), 0) / scored.length) : null;
  const value = score ?? 0;
  return `
    <section class="panel dashboard-card-panel">
      <div class="panel-head ops-panel-head">
        <h2 class="panel-title">${state.lang === "zh" ? "应用健康度" : "Application Health"}</h2>
      </div>
      <div class="app-health-layout">
        <div class="health-gauge" style="--score:${value}%">
          <strong>${score ?? "-"}</strong>
          <span>${state.lang === "zh" ? "健康分" : "Health Score"}</span>
        </div>
        <div class="app-health-list">
          ${rows.length ? rows.map((row) => `
            <div class="app-health-row">
              <span><strong>${escapeHtml(row.name)}</strong><small>${escapeHtml(row.environments)} ${state.lang === "zh" ? "个环境" : "envs"} / ${escapeHtml(row.resourceCount)} ${state.lang === "zh" ? "资源" : "resources"}</small></span>
              <b class="${statusClass(row.score === null || row.score === undefined ? "unknown" : layerStatus(row.score))}">${escapeHtml(row.score ?? "-")}</b>
            </div>
          `).join("") : `<div class="empty">${t("environments.noData")}</div>`}
        </div>
      </div>
      <div class="dashboard-panel-footer">
        <button class="btn ghost" data-action="nav" data-view="environments">${state.lang === "zh" ? "查看应用环境" : "View environments"} ${icon("trend")}</button>
      </div>
    </section>
  `;
}

function layerStatus(score) {
  if (score === null || score === undefined) return "unknown";
  if (score >= 90) return "healthy";
  if (score >= 70) return "warning";
  return "critical";
}

function resourceTypeDistributionParts() {
  const categories = [
    { key: "server", label: state.lang === "zh" ? "服务器" : "Servers", color: "var(--brand)", tone: "brand", types: ["host", "linux", "server"] },
    { key: "db", label: state.lang === "zh" ? "数据库" : "Databases", color: "var(--brand-2)", tone: "blue", types: ["pgsql", "postgresql", "mysql"] },
    { key: "middleware", label: state.lang === "zh" ? "中间件" : "Middleware", color: "#ff9b24", tone: "warn", types: ["redis", "nginx", "middleware"] },
    { key: "app", label: state.lang === "zh" ? "应用/容器" : "Apps", color: "var(--violet)", tone: "violet", types: ["container", "compose"] },
    { key: "other", label: state.lang === "zh" ? "其他" : "Other", color: "var(--muted)", tone: "muted", types: [] },
  ];
  const counts = Object.fromEntries(categories.map((category) => [category.key, 0]));
  (state.data.resources || []).forEach((resource) => {
    const category = categories.find((item) => item.types.includes(resource.type)) || categories[categories.length - 1];
    counts[category.key] += 1;
  });
  return categories.map((category) => ({ ...category, value: counts[category.key] }));
}

function renderResourceTypeDistribution() {
  const parts = resourceTypeDistributionParts();
  const total = parts.reduce((sum, part) => sum + part.value, 0);
  return donutPanel({
    title: state.lang === "zh" ? "资产类型分布" : "Asset Type Distribution",
    total,
    centerLabel: state.lang === "zh" ? "总资产" : "Assets",
    parts,
    footerLabel: state.lang === "zh" ? "查看资产" : "View assets",
    action: { action: "nav", view: "environments" },
  });
}

function taskStatusParts() {
  const tasks = state.data.tasks || [];
  const total = Math.max(tasks.length, 1);
  return [
    { key: "finished", label: statusText("finished"), value: tasks.filter((task) => task.status === "finished").length, color: "var(--brand)", tone: "brand" },
    { key: "failed", label: statusText("failed"), value: tasks.filter((task) => task.status === "failed").length, color: "var(--bad)", tone: "bad" },
    { key: "running", label: statusText("running"), value: tasks.filter((task) => ["queued", "running"].includes(task.status)).length, color: "var(--brand-2)", tone: "blue" },
    { key: "pending", label: state.lang === "zh" ? "未执行" : "Not started", value: tasks.filter((task) => ["pending"].includes(task.status)).length, color: "var(--muted)", tone: "muted" },
  ].map((part) => ({ ...part, ratio: percent(part.value, total) }));
}

function renderTaskStatusStats() {
  const parts = taskStatusParts();
  return `
    <section class="panel dashboard-card-panel">
      <div class="panel-head ops-panel-head">
        <h2 class="panel-title">${state.lang === "zh" ? "巡检任务统计" : "Inspection Task Stats"}</h2>
      </div>
      <div class="task-status-list">
        ${parts.map((part) => `
          <div class="task-status-row">
            <span>${escapeHtml(part.label)}</span>
            <strong>${escapeHtml(part.value)}</strong>
            <i><b style="width:${part.ratio}%; background:${part.color}"></b></i>
            <em>${escapeHtml(part.ratio)}%</em>
          </div>
        `).join("")}
      </div>
      <div class="dashboard-panel-footer">
        <button class="btn ghost" data-action="nav" data-view="tasks">${state.lang === "zh" ? "查看巡检" : "View inspections"} ${icon("trend")}</button>
      </div>
    </section>
  `;
}

function renderLineChart({ title, data = [], primaryKey, primaryLabel, secondaryKey, secondaryLabel, mode = "line" }) {
  const width = 680;
  const height = 240;
  const padX = 38;
  const padTop = 22;
  const padBottom = 34;
  const plotWidth = width - padX * 2;
  const plotHeight = height - padTop - padBottom;
  const maxValue = Math.max(1, ...data.flatMap((item) => [item[primaryKey] || 0, item[secondaryKey] || 0]));
  const point = (index, value) => {
    const x = padX + (data.length <= 1 ? 0 : (index / (data.length - 1)) * plotWidth);
    const y = padTop + plotHeight - ((value || 0) / maxValue) * plotHeight;
    return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
  };
  const primaryPoints = data.map((item, index) => point(index, item[primaryKey] || 0));
  const secondaryPoints = data.map((item, index) => point(index, item[secondaryKey] || 0));
  const pointString = (points) => points.map((item) => `${item.x},${item.y}`).join(" ");
  const areaPoints = primaryPoints.length
    ? `${padX},${padTop + plotHeight} ${pointString(primaryPoints)} ${padX + plotWidth},${padTop + plotHeight}`
    : "";
  const bars = data.map((item, index) => {
    const barWidth = Math.max(18, plotWidth / Math.max(data.length, 1) * 0.42);
    const x = point(index, item[primaryKey] || 0).x - barWidth / 2;
    const y = point(index, item[primaryKey] || 0).y;
    const h = padTop + plotHeight - y;
    return `<rect class="ops-chart-bar" x="${Number(x.toFixed(2))}" y="${Number(y.toFixed(2))}" width="${Number(barWidth.toFixed(2))}" height="${Number(h.toFixed(2))}" rx="5"><title>${escapeHtml(item.label)} ${escapeHtml(primaryLabel)} ${item[primaryKey] || 0}</title></rect>`;
  }).join("");
  return `
    <div class="ops-chart-body">
      <svg class="ops-line-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(title)}">
        <g class="ops-chart-grid">
          <line x1="${padX}" y1="${padTop}" x2="${padX + plotWidth}" y2="${padTop}"></line>
          <line x1="${padX}" y1="${padTop + plotHeight / 2}" x2="${padX + plotWidth}" y2="${padTop + plotHeight / 2}"></line>
          <line x1="${padX}" y1="${padTop + plotHeight}" x2="${padX + plotWidth}" y2="${padTop + plotHeight}"></line>
        </g>
        ${mode === "mixed" ? bars : areaPoints ? `<polygon class="ops-trend-area" points="${areaPoints}"></polygon>` : ""}
        <polyline class="ops-trend-line primary" points="${pointString(primaryPoints)}"></polyline>
        <polyline class="ops-trend-line secondary" points="${pointString(secondaryPoints)}"></polyline>
        ${primaryPoints.map((item, index) => `<circle class="ops-trend-dot primary" cx="${item.x}" cy="${item.y}" r="4"><title>${escapeHtml(data[index].label)} ${escapeHtml(primaryLabel)} ${data[index][primaryKey] || 0}</title></circle>`).join("")}
        ${secondaryPoints.map((item, index) => `<circle class="ops-trend-dot secondary" cx="${item.x}" cy="${item.y}" r="3.5"><title>${escapeHtml(data[index].label)} ${escapeHtml(secondaryLabel)} ${data[index][secondaryKey] || 0}</title></circle>`).join("")}
        ${data.map((item, index) => {
          const labelPoint = point(index, 0);
          return `<text class="ops-chart-label" x="${labelPoint.x}" y="${height - 8}" text-anchor="middle">${escapeHtml(item.label)}</text>`;
        }).join("")}
      </svg>
      <div class="ops-trend-legend">
        <span><i class="legend-line primary"></i>${escapeHtml(primaryLabel)}</span>
        <span><i class="legend-line secondary"></i>${escapeHtml(secondaryLabel)}</span>
      </div>
    </div>
  `;
}

function renderTaskTrend(weeklyTasks = []) {
  const totalTasks = sumBy(weeklyTasks, "tasks");
  const cronTasks = sumBy(weeklyTasks, "cron");
  const manualTasks = sumBy(weeklyTasks, "manual");
  return `
    <section class="panel ops-panel">
      <div class="panel-head ops-panel-head">
        <div>
          <h2 class="panel-title">${t("dashboard.taskTrend")}</h2>
          <div class="panel-subtitle">${t("dashboard.taskTrendDesc")}</div>
        </div>
        <div class="segmented-mini"><span class="active">近7天</span><span>近30天</span></div>
      </div>
      ${renderLineChart({
        title: t("dashboard.taskTrend"),
        data: weeklyTasks,
        primaryKey: "tasks",
        primaryLabel: t("dashboard.taskCount"),
        secondaryKey: "cron",
        secondaryLabel: t("dashboard.cronTasks"),
      })}
      <div class="ops-chart-summary">
        ${miniMetric(t("dashboard.taskCount"), totalTasks, "brand")}
        ${miniMetric(t("dashboard.cronTasks"), cronTasks, "warn")}
        ${miniMetric(t("dashboard.manualTasks"), manualTasks, "brand")}
      </div>
    </section>
  `;
}

function renderReportTrend(weeklyReports = []) {
  const totalReports = sumBy(weeklyReports, "reports");
  const totalAbnormal = sumBy(weeklyReports, "abnormal");
  return `
    <section class="panel ops-panel">
      <div class="panel-head ops-panel-head">
        <div>
          <h2 class="panel-title">${t("dashboard.reportTrend")}</h2>
          <div class="panel-subtitle">${t("dashboard.reportTrendDesc")}</div>
        </div>
        <span class="status pending">近7天</span>
      </div>
      ${renderLineChart({
        title: t("dashboard.reportTrend"),
        data: weeklyReports,
        primaryKey: "reports",
        primaryLabel: t("dashboard.reportCount"),
        secondaryKey: "abnormal",
        secondaryLabel: t("dashboard.abnormalItems"),
        mode: "mixed",
      })}
      <div class="ops-chart-summary two">
        ${miniMetric("近7天报告数", `${totalReports} 份`, "brand")}
        ${miniMetric("近7天异常发现数", `${totalAbnormal} 个`, "bad")}
      </div>
    </section>
  `;
}

function miniMetric(label, value, tone = "brand") {
  return `
    <div class="mini-metric ${tone}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function donutGradient(parts) {
  const total = parts.reduce((sum, item) => sum + Number(item.value || 0), 0);
  if (!total) return "conic-gradient(var(--line) 0 100%)";
  let cursor = 0;
  const stops = parts
    .filter((item) => Number(item.value || 0) > 0)
    .map((item) => {
      const start = cursor;
      cursor += percent(item.value, total);
      return `${item.color} ${start}% ${Math.min(100, cursor)}%`;
    });
  return `conic-gradient(${stops.join(", ")}, var(--line) ${Math.min(100, cursor)}% 100%)`;
}

function overviewDonut(title, total, parts) {
  const gradient = donutGradient(parts);
  return `
    <div class="ops-overview-donut">
      <div class="ops-donut compact" style="--donut:${gradient}">
        <div class="ops-donut-center">
          <strong>${escapeHtml(total)}</strong>
          <span>${t("dashboard.totalTasks")}</span>
        </div>
      </div>
      <div class="ops-overview-legend">
        <h3>${escapeHtml(title)}</h3>
        <div class="ops-overview-list">
          ${parts.map((part) => overviewLegend(part.label, part.value, part.tone, `${percent(part.value, total)}%`)).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderOpsOverview(cards, taskMix) {
  const taskParts = [
    { label: statusText("finished"), value: (state.data.tasks || []).filter((task) => task.status === "finished").length, color: "var(--brand)", tone: "brand" },
    { label: statusText("running"), value: (state.data.tasks || []).filter((task) => ["queued", "running"].includes(task.status)).length, color: "var(--brand-2)", tone: "blue" },
    { label: statusText("failed"), value: (state.data.tasks || []).filter((task) => task.status === "failed").length, color: "var(--bad)", tone: "bad" },
  ];
  const taskTotal = taskParts.reduce((sum, part) => sum + part.value, 0);
  return `
    <section class="panel ops-panel">
      <div class="panel-head"><h2 class="panel-title">${t("dashboard.opsOverview")}</h2></div>
      <div class="ops-overview-block">
        ${overviewDonut(t("tasks.inspectionTasks"), taskTotal, taskParts)}
      </div>
      <div class="resource-coverage-row">
        ${coverageItem("server", t("cards.managedResources"), cards.managed_resources || 0)}
        ${coverageItem("dashboard", t("dashboard.online"), `${cards.online_rate || 0}%`)}
        ${coverageItem("alert", t("dashboard.abnormal"), `${cards.abnormal_rate || 0}%`, "bad")}
      </div>
      <div class="risk-card">
        <span>${icon("shield")}</span>
        <div>
          <strong>${t("dashboard.openIssueCount")} ${cards.open_issues || 0}</strong>
          <small>${t("dashboard.riskHint")}</small>
        </div>
        <button class="btn small" data-action="nav" data-view="problem-center">${t("dashboard.viewIssues")}</button>
      </div>
    </section>
  `;
}

function overviewLegend(label, value, tone, ratio) {
  return `
    <div class="ops-legend-row">
      <span><i class="${tone}"></i>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(ratio)}</small>
    </div>
  `;
}

function coverageItem(iconName, label, value, tone = "brand") {
  return `
    <div class="coverage-item ${tone}">
      ${icon(iconName)}
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function renderImportantIssues() {
  const issues = state.data.issues.filter((issue) => issue.status === "open").slice(0, 3);
  return `
    <section class="panel ops-panel issue-focus-panel">
      <div class="panel-head ops-panel-head">
        <h2 class="panel-title">${t("dashboard.importantIssues")}</h2>
        <button class="btn ghost small" data-action="nav" data-view="problem-center">${t("dashboard.viewAll")}</button>
      </div>
      <div class="issue-focus-list">
        ${issues.length ? issues.map((issue) => `
          <button class="issue-focus-item" data-action="nav" data-view="problem-center">
            <span class="severity-dot ${escapeHtml(issue.severity || "high")}"></span>
            <strong>${escapeHtml(issue.summary)}</strong>
            <small>${escapeHtml(issue.severity || "-")} / ${escapeHtml(issue.assignee || "Unassigned")}</small>
            <em>${formatDate(issue.created_at)}</em>
          </button>
        `).join("") : `<div class="empty">${t("dashboard.noIssues")}</div>`}
      </div>
    </section>
  `;
}

function dashboardMetricValue(cards, key, fallback = 0) {
  return cards?.[key] ?? fallback;
}

function dashboardOpenIssues() {
  return (state.data.issues || []).filter((issue) => issue.status !== "resolved");
}

function dashboardRepairRate(cards) {
  const issues = state.data.issues || [];
  const total = dashboardMetricValue(cards, "total_issues", issues.length);
  const resolved = dashboardMetricValue(cards, "resolved_issues", issues.filter((issue) => issue.status === "resolved").length);
  return total ? Math.round((resolved / total) * 100) : 0;
}

function dashboardMetricCard({ label, value, iconName, tone = "brand", sub = "当前统计" }) {
  return `
    <article class="dashboard-v2-kpi ${tone}">
      <span class="dashboard-v2-kpi-icon">${icon(iconName)}</span>
      <div class="dashboard-v2-kpi-main">
        <strong>${escapeHtml(label)}</strong>
        <b>${escapeHtml(value)}</b>
        <small>${escapeHtml(sub)}</small>
      </div>
    </article>
  `;
}

function renderDashboardKpis(cards) {
  const issues = state.data.issues || [];
  const openIssues = dashboardOpenIssues();
  const severeIssues = dashboardMetricValue(cards, "severe_issues", openIssues.filter((issue) => ["critical", "high"].includes(issue.severity)).length);
  const taskCount = dashboardMetricValue(cards, "total_tasks", (state.data.tasks || []).length);
  const resourceCount = dashboardMetricValue(cards, "managed_resources", (state.data.resources || []).length);
  const issueCount = dashboardMetricValue(cards, "total_issues", issues.length);
  const repairRate = dashboardRepairRate(cards);
  return `
    <div class="dashboard-v2-kpis">
      ${dashboardMetricCard({
        label: state.lang === "zh" ? "总资产数" : "Total Assets",
        value: resourceCount,
        iconName: "server",
        sub: state.lang === "zh" ? "资源列表实体资产" : "Resource list entities",
      })}
      ${dashboardMetricCard({
        label: state.lang === "zh" ? "巡检任务" : "Inspection Tasks",
        value: taskCount,
        iconName: "checklist",
        tone: "blue",
        sub: state.lang === "zh" ? "累计巡检任务" : "Total inspections",
      })}
      ${dashboardMetricCard({
        label: state.lang === "zh" ? "发现问题数" : "Issues Found",
        value: issueCount,
        iconName: "alert",
        tone: "warn",
        sub: state.lang === "zh" ? "全部异常问题" : "All issues",
      })}
      ${dashboardMetricCard({
        label: state.lang === "zh" ? "高危问题数" : "High-risk Issues",
        value: severeIssues,
        iconName: "shield",
        tone: "bad",
        sub: state.lang === "zh" ? "严重 / 高危" : "Critical / high",
      })}
      ${dashboardMetricCard({
        label: state.lang === "zh" ? "修复率" : "Repair Rate",
        value: `${repairRate}%`,
        iconName: "trend",
        tone: "blue-strong",
        sub: state.lang === "zh" ? "已闭环占比" : "Resolved ratio",
      })}
    </div>
  `;
}

function dashboardIssueTrendRows() {
  return daysBack(7).map((day) => {
    const dayIssues = (state.data.issues || []).filter((issue) => String(issue.created_at || "").slice(0, 10) === day.key);
    return {
      label: day.label,
      critical: dayIssues.filter((issue) => ["critical"].includes(issue.severity)).length,
      important: dayIssues.filter((issue) => ["high", "medium"].includes(issue.severity)).length,
      normal: dayIssues.filter((issue) => !["critical", "high", "medium"].includes(issue.severity)).length,
    };
  });
}

function renderDashboardIssueTrend() {
  const series = [
    { key: "critical", label: state.lang === "zh" ? "严重" : "Critical", color: "#ff4d4f" },
    { key: "important", label: state.lang === "zh" ? "重要" : "Important", color: "#ff8a1d" },
    { key: "normal", label: state.lang === "zh" ? "一般" : "Normal", color: "#2f7df6" },
  ];
  return `
    <section class="panel dashboard-v2-panel dashboard-v2-wide">
      <div class="panel-head dashboard-v2-panel-head">
        <h2 class="panel-title">${state.lang === "zh" ? "异常趋势" : "Issue Trend"}</h2>
        <div class="dashboard-v2-legend">
          ${series.map((line) => `<span><i style="background:${line.color}"></i>${escapeHtml(line.label)}</span>`).join("")}
        </div>
      </div>
      <div class="dashboard-v2-chart-note">${state.lang === "zh" ? "数量（个）" : "Count"}</div>
      ${renderMultiLineChart({ title: state.lang === "zh" ? "异常趋势" : "Issue Trend", data: dashboardIssueTrendRows(), series })}
    </section>
  `;
}

function issueTypeFromSummary(issue) {
  const text = `${issue.summary || ""} ${issue.description || ""} ${issue.resource_type || ""}`.toLowerCase();
  if (/ssh|sudo|权限|弱口令|暴露|waf|跨域|安全|baseline|password|permission/.test(text)) return "security";
  if (/配置|策略|参数|config|policy|version|补丁/.test(text)) return "config";
  if (/cpu|内存|磁盘|inode|load|性能|响应|慢|io|latency|timeout/.test(text)) return "performance";
  return "availability";
}

function dashboardIssueTypeLabel(key) {
  const labels = {
    performance: state.lang === "zh" ? "性能问题" : "Performance",
    config: state.lang === "zh" ? "配置问题" : "Configuration",
    availability: state.lang === "zh" ? "服务可用性" : "Availability",
    security: state.lang === "zh" ? "安全问题" : "Security",
  };
  return labels[key] || key || "-";
}

function dashboardIssueTypeParts() {
  const definitions = [
    { key: "performance", label: state.lang === "zh" ? "性能异常" : "Performance", color: "#2f7df6", tone: "blue" },
    { key: "config", label: state.lang === "zh" ? "配置异常" : "Configuration", color: "#ff8a1d", tone: "warn" },
    { key: "availability", label: state.lang === "zh" ? "可用性异常" : "Availability", color: "#35bda7", tone: "brand" },
    { key: "security", label: state.lang === "zh" ? "安全异常" : "Security", color: "#ff4d4f", tone: "bad" },
  ];
  const counts = Object.fromEntries(definitions.map((item) => [item.key, 0]));
  (state.data.issues || []).forEach((issue) => {
    counts[issueTypeFromSummary(issue)] += 1;
  });
  return definitions.map((item) => ({ ...item, value: counts[item.key] }));
}

function renderDashboardIssueDistribution() {
  const parts = dashboardIssueTypeParts();
  const total = parts.reduce((sum, part) => sum + part.value, 0);
  return `
    <section class="panel dashboard-v2-panel">
      <div class="panel-head dashboard-v2-panel-head">
        <h2 class="panel-title">${state.lang === "zh" ? "异常分布" : "Issue Distribution"} <small>${state.lang === "zh" ? "（按类型）" : "(by type)"}</small></h2>
      </div>
      <div class="dashboard-v2-donut-layout">
        <div class="dashboard-v2-donut" style="--donut:${donutGradient(parts)}">
          <div>
            <span>${state.lang === "zh" ? "总数" : "Total"}</span>
            <strong>${escapeHtml(total)}</strong>
          </div>
        </div>
        <div class="dashboard-v2-type-list">
          ${parts.map((part) => `
            <div>
              <span><i style="background:${part.color}"></i>${escapeHtml(part.label)}</span>
              <strong>${escapeHtml(part.value)} (${escapeHtml(percent(part.value, total))}%)</strong>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function dashboardSeverityLabel(issue) {
  const meta = severityMeta(issue.severity);
  return `<span class="dashboard-severity-pill ${escapeHtml(meta.tone)}">${escapeHtml(meta.label)}</span>`;
}

function renderDashboardTopIssues() {
  const weights = { critical: 4, high: 3, medium: 2, low: 1 };
  const issues = [...(state.data.issues || [])]
    .sort((a, b) => (weights[b.severity] || 0) - (weights[a.severity] || 0) || new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 5);
  return `
    <section class="panel dashboard-v2-panel">
      <div class="panel-head dashboard-v2-panel-head">
        <h2 class="panel-title">${state.lang === "zh" ? "重点异常 Top 5" : "Top 5 Key Issues"}</h2>
      </div>
      <div class="dashboard-v2-table-wrap">
        <table class="dashboard-v2-table">
          <thead>
            <tr>
              <th>${state.lang === "zh" ? "严重程度" : "Severity"}</th>
              <th>${state.lang === "zh" ? "异常名称" : "Issue"}</th>
              <th>${state.lang === "zh" ? "资源" : "Resource"}</th>
              <th>${state.lang === "zh" ? "首次发现时间" : "First seen"}</th>
              <th>${state.lang === "zh" ? "状态" : "Status"}</th>
            </tr>
          </thead>
          <tbody>
            ${issues.length ? issues.map((issue) => `
              <tr>
                <td>${dashboardSeverityLabel(issue)}</td>
                <td>${escapeHtml(issue.summary || "-")}</td>
                <td>${escapeHtml(issue.resource_name || issue.resource_ip || issue.environment_name || "-")}</td>
                <td>${escapeHtml(formatDate(issue.created_at))}</td>
                <td><span class="dashboard-dot-status ${issue.status === "resolved" ? "resolved" : "open"}">${escapeHtml(statusText(issue.status || "open"))}</span></td>
              </tr>
            `).join("") : `<tr><td colspan="5"><div class="empty">${state.lang === "zh" ? "暂无重点异常" : "No key issues"}</div></td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function dashboardAiConclusionLines(cards) {
  const issues = state.data.issues || [];
  const openIssues = dashboardOpenIssues();
  const highIssues = openIssues.filter((issue) => ["critical", "high"].includes(issue.severity)).length;
  const parts = dashboardIssueTypeParts().sort((a, b) => b.value - a.value);
  if (!issues.length) {
    return state.lang === "zh"
      ? ["当前暂无异常问题，巡检风险处于低位。", "建议持续完善资源接入与巡检任务覆盖范围。", "接入监控与日志数据后，可生成更可信的趋势分析。"]
      : ["No issues have been found yet.", "Continue improving resource coverage and inspection tasks.", "Monitoring and log integrations will make trend analysis more reliable."];
  }
  const dominant = parts.find((part) => part.value > 0);
  return state.lang === "zh"
    ? [
      `本次统计共发现 ${dashboardMetricValue(cards, "total_issues", issues.length)} 个问题，当前待处理 ${openIssues.length} 个。`,
      `高危问题 ${highIssues} 个，建议优先处理影响业务可用性的异常。`,
      dominant ? `主要风险集中在${dominant.label}，占全部问题的 ${percent(dominant.value, issues.length)}%。` : "问题类型分布暂不明显，需要更多巡检数据支撑判断。",
      `修复率为 ${dashboardRepairRate(cards)}%，可继续推进问题闭环。`,
    ]
    : [
      `${dashboardMetricValue(cards, "total_issues", issues.length)} issues found, ${openIssues.length} still open.`,
      `${highIssues} high-risk issues should be handled first.`,
      dominant ? `Most issues are ${dominant.label}, accounting for ${percent(dominant.value, issues.length)}%.` : "Issue distribution is not yet clear.",
      `Repair rate is ${dashboardRepairRate(cards)}%.`,
    ];
}

function renderDashboardAiConclusion(cards) {
  return `
    <section class="panel dashboard-v2-panel">
      <div class="panel-head dashboard-v2-panel-head">
        <h2 class="panel-title"><span class="dashboard-ai-badge">AI</span>${state.lang === "zh" ? "AI 巡检结论" : "AI Inspection Summary"}</h2>
      </div>
      <div class="dashboard-ai-conclusion">
        ${dashboardAiConclusionLines(cards).map((line) => `
          <div>
            <span>${icon("shield")}</span>
            <p>${escapeHtml(line)}</p>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderDashboard() {
  const cards = state.data.dashboard?.cards || {};
  return `
    <section class="dashboard-v2">
      ${renderDashboardKpis(cards)}
      <div class="dashboard-v2-main-grid">
        ${renderDashboardIssueTrend()}
        ${renderDashboardIssueDistribution()}
      </div>
      <div class="dashboard-v2-bottom-grid">
        ${renderDashboardTopIssues()}
        ${renderDashboardAiConclusion(cards)}
      </div>
      <div class="dashboard-v2-footer">
        <span>${state.lang === "zh" ? "数据更新于" : "Updated at"} ${escapeHtml(new Date().toLocaleString())}</span>
        <span>© 2026 OpsRadar. ${state.lang === "zh" ? "保留所有权利。" : "All rights reserved."}</span>
      </div>
    </section>
  `;
}

function auditItem(item) {
  return `
    <div class="audit-item">
      <strong>${escapeHtml(item.action)} · ${escapeHtml(item.target)}</strong>
      <small>${escapeHtml(item.actor)} / ${formatDate(item.created_at)}<br>${escapeHtml(item.detail)}</small>
    </div>
  `;
}

function healthStatusText(score) {
  if (score === null || score === undefined) return t("environments.unknown");
  if (score >= 90) return state.lang === "zh" ? "健康" : "Healthy";
  if (score >= 70) return state.lang === "zh" ? "预警" : "Warning";
  return state.lang === "zh" ? "严重" : "Critical";
}

function environmentStatusOptions() {
  return [
    ["all", state.lang === "zh" ? "全部状态" : "All status"],
    ["active", statusText("active")],
    ["review", statusText("review")],
    ["disabled", statusText("disabled")],
  ];
}

function environmentMetricCounts(env) {
  const bindings = env.resources || [];
  const envResourceIds = new Set(bindings.map((binding) => binding.resource_id || binding.resource?.id).filter(Boolean));
  const managedResources = bindings.filter((binding) => {
    const resource = binding.resource || {};
    return !(resource.extra_params || {}).parent_resource_id;
  });
  const services = (state.data.discovered_services || []).filter((service) =>
    service.environment_id === env.id || envResourceIds.has(service.service_resource_id)
  );
  const overview = env.overview || {};
  return {
    resources: managedResources.length,
    services: services.length,
    issues: (overview.open_issues || []).length,
    latestTask: overview.latest_task || null,
    latestStartedTask: overview.latest_started_task || null,
  };
}

function environmentStatusBadge(status) {
  const tone = status === "active" ? "success" : status === "disabled" ? "offline" : "pending";
  return `<span class="env-status-badge ${tone}">${status === "active" ? t("label.enabled") : status === "disabled" ? t("label.disabled") : statusText(status)}</span>`;
}

function environmentHealthBar(score) {
  const value = Number.isFinite(Number(score)) ? Math.max(0, Math.min(100, Number(score))) : 0;
  const tone = value >= 90 ? "healthy" : value >= 70 ? "warning" : value > 0 ? "critical" : "unknown";
  return `
    <div class="env-health-row">
      <span>${state.lang === "zh" ? "健康度" : "Health"}</span>
      <div class="env-health-track"><i class="${tone}" style="width:${value}%"></i></div>
      <strong>${score ?? "-"}${score === null || score === undefined ? "" : "%"}</strong>
    </div>
  `;
}

function environmentActionButton(env, action, label) {
  return `<button class="btn small" data-action="${action}" data-id="${escapeHtml(env.id)}">${escapeHtml(label)}</button>`;
}

function renderEnvironmentCard(env) {
  const overview = env.overview || {};
  const score = overview.health_score;
  const counts = environmentMetricCounts(env);
  const latestTaskTime = counts.latestStartedTask?.started_at ? formatDate(counts.latestStartedTask.started_at) : "-";
  const app = applications().find((item) => item.id === env.application_id || item.name === env.application_name);
  return `
    <article class="environment-card">
      <div class="environment-card-head">
        <div>
          <h3>${escapeHtml(displayApplicationName(env.application_name))} / ${escapeHtml(env.name)}</h3>
          <p>${escapeHtml(env.env_type || "-")} · ${escapeHtml(env.owner || "SRE")} · ${escapeHtml(env.description || env.name || "-")}</p>
        </div>
        ${environmentStatusBadge(env.status)}
      </div>
      <div class="env-stat-grid">
        <div class="env-stat">${icon("apps")}<span>${state.lang === "zh" ? "资源" : "Resources"}</span><strong>${counts.resources}</strong></div>
        <div class="env-stat">${icon("server")}<span>${state.lang === "zh" ? "服务" : "Services"}</span><strong>${counts.services}</strong></div>
        <div class="env-stat ${counts.issues ? "warn" : ""}">${icon("alert")}<span>${state.lang === "zh" ? "异常" : "Issues"}</span><strong>${counts.issues}</strong></div>
        <div class="env-stat latest">${icon("calendar")}<span>${state.lang === "zh" ? "最近巡检" : "Latest"}</span><strong>${escapeHtml(latestTaskTime)}</strong></div>
      </div>
      ${environmentHealthBar(score)}
      <div class="env-card-actions split">
        <div class="env-primary-actions">
          ${environmentActionButton(env, "env-view-resources", state.lang === "zh" ? "查看资源" : "View resources")}
          ${environmentActionButton(env, "env-view-services", state.lang === "zh" ? "查看服务" : "View services")}
          ${environmentActionButton(env, "bind-environment-rules", state.lang === "zh" ? "规则策略" : "Rule policy")}
          ${environmentActionButton(env, "env-create-task", state.lang === "zh" ? "创建巡检" : "Create task")}
        </div>
        <div class="env-secondary-actions">
          ${app ? `<button class="btn small" data-action="edit-application" data-id="${escapeHtml(app.id)}">${t("action.edit")}</button>` : ""}
          ${app ? `<button class="btn danger small" type="button" data-action="delete-application" data-id="${escapeHtml(app.id)}">${state.lang === "zh" ? "删除" : "Delete"}</button>` : ""}
        </div>
      </div>
    </article>
  `;
}

function renderEnvironmentApplications() {
  const status = state.environmentStatusFilter || "all";
  const scoped = environments().filter((env) => status === "all" || env.status === status);
  const envs = filterRows("environment-apps", scoped, ["name", "application_name", "env_type", "owner", "status", "description"]);
  const pageInfo = paginate("environment-apps", envs);
  const toolbar = `
    <select class="filter-select" data-env-status-filter>
      ${environmentStatusOptions().map(([value, label]) => `<option value="${escapeHtml(value)}" ${status === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}
    </select>
    <button class="btn primary small" data-action="add-application">${t("environments.addEnvironment")}</button>
  `;
  return `
    <div class="module-pane env-module env-card-module">
      ${tableToolbar("environment-apps", "", "", envs.length, toolbar)}
      <div class="environment-grid">
        ${pageInfo.items.map(renderEnvironmentCard).join("") || `<div class="empty center-empty">${t("environments.noData")}</div>`}
      </div>
      ${pagination("environment-apps", pageInfo)}
    </div>
  `;
}

function renderEnvironments() {
  if (!["applications", "resources"].includes(state.tabs.environments)) {
    state.tabs.environments = "applications";
  }
  return `
    <section class="panel page-panel env-page">
      <div class="panel-head tab-head">
        ${subnav("environments", [
          ["applications", t("environments.applications"), environments().length],
          ["resources", t("environments.resources"), state.data.resources.length],
        ])}
      </div>
      ${state.tabs.environments === "applications" ? renderEnvironmentApplications() : ""}
      ${state.tabs.environments === "resources" ? renderResourceListPanel() : ""}
    </section>
  `;
}

function resourceCell(res, key) {
  const effectiveStatus = state.testingResources.has(res.id) ? "testing" : res.status;
  const map = {
    name: `<td><strong>${escapeHtml(res.name)}</strong></td>`,
    type: `<td>${escapeHtml(resourceTypeLabel(res.type))}</td>`,
    environments: `<td>${escapeHtml((res.environment_names || []).join(" / ") || "-")}</td>`,
    address: `<td class="mono">${escapeHtml(res.ip)}:${res.port}</td>`,
    credential: `<td><span class="status ${res.credential_configured ? "success" : "pending"}">${res.credential_configured ? t("resources.credentialConfigured") : t("resources.credentialMissing")}</span><div class="muted">${escapeHtml(res.username || "-")} · ${res.credential_type === "key" ? t("resources.key") : t("resources.password")}</div></td>`,
    status: `<td><span class="status ${statusClass(effectiveStatus)}">${statusText(effectiveStatus)}</span></td>`,
    system: `<td>${escapeHtml(res.os || "-")}</td>`,
    metrics: `<td>CPU ${escapeHtml(res.cpu || "-")} / MEM ${escapeHtml(res.memory || "-")} / DISK ${res.disk_usage ?? "-"}% / LOAD ${escapeHtml(res.load_avg || "-")}</td>`,
    created: `<td>${formatDate(res.created_at)}</td>`,
  };
  return map[key] || "";
}

function resourceTestButton(res) {
  const testing = state.testingResources.has(res.id);
  return `<button class="btn small ${testing ? "testing-button" : ""}" data-action="test-resource" data-id="${res.id}" ${testing ? "disabled" : ""}>${testing ? `<span class="tiny-spinner"></span>${t("resources.testing")}` : t("resources.test")}</button>`;
}

function resourceServices(resourceId) {
  return (state.data.discovered_services || []).filter((service) => service.resource_id === resourceId);
}

function serviceResource(service) {
  return (state.data.resources || []).find((resource) => resource.id === service?.service_resource_id);
}

function inspectionItemName(itemId) {
  const item = (state.data.inspection_items || []).find((entry) => entry.id === itemId);
  return item?.name || itemId;
}

function ruleSetMatchesResource(ruleSet, resource) {
  if (!ruleSet || !resource) return false;
  const resourceTypes = new Set((ruleSet.resource_types || []).map(String).filter(Boolean));
  const serviceTypes = new Set((ruleSet.service_types || []).map(String).filter(Boolean));
  const extra = resource.extra_params || {};
  const serviceKind = String(extra.service_kind || resource.service_kind || "");
  const typeMatched = !resourceTypes.size || resourceTypes.has(String(resource.type || ""));
  const serviceMatched = !serviceTypes.size || serviceTypes.has(serviceKind);
  if (!typeMatched || !serviceMatched) return false;
  const haystack = [
    resource.name,
    resource.type,
    resource.ip,
    resource.port,
    serviceKind,
    extra.container_name,
    extra.compose_project,
    extra.compose_service,
    extra.systemd_unit,
    extra.image,
  ].filter(Boolean).join(" ").toLowerCase();
  return !(ruleSet.exclude_keywords || []).some((keyword) => haystack.includes(String(keyword).toLowerCase()));
}

function autoRuleIdsForTaskDraft(draft) {
  const environmentId = draft.environment_id || "";
  if (!environmentId) return new Set();
  const env = environments().find((item) => item.id === environmentId);
  const envRuleIds = new Set(env?.rule_set_ids || []);
  if (!envRuleIds.size) return new Set();
  const ruleSets = (state.data.rule_sets || []).filter((ruleSet) => envRuleIds.has(ruleSet.id) && ruleSet.enabled !== false);
  const resources = new Map();
  const addResource = (resource) => {
    if (resource?.id) resources.set(resource.id, resource);
  };
  const scope = draft.inspection_scope || "environment";
  if (scope === "environment") {
    (env?.resources || []).map((binding) => binding.resource).forEach(addResource);
  }
  (draft.resource_ids || []).forEach((id) => addResource((state.data.resources || []).find((resource) => resource.id === id)));
  (draft.service_ids || []).forEach((id) => {
    const service = (state.data.discovered_services || []).find((item) => item.id === id);
    addResource(serviceResource(service));
  });
  const ids = new Set();
  resources.forEach((resource) => {
    ruleSets.forEach((ruleSet) => {
      if (ruleSetMatchesResource(ruleSet, resource)) {
        (ruleSet.item_ids || ruleSet.items || []).forEach((itemId) => ids.add(itemId));
      }
    });
  });
  return ids;
}

function resourceServiceButton(res) {
  const count = resourceServices(res.id).length;
  const expanded = state.expandedResources.has(res.id);
  const discovering = state.discoveringResources.has(res.id);
  return `
    <button class="service-toggle-button ${expanded ? "active" : ""}" data-action="toggle-resource-services" data-id="${escapeHtml(res.id)}" ${discovering ? "disabled" : ""}>
      ${icon("apps")}
      <span>${t("resources.serviceCount")}</span>
      <b>${escapeHtml(count)}</b>
      <i>${expanded ? "⌃" : "⌄"}</i>
    </button>
  `;
}

function resourceBulkTestButton(total) {
  const count = selectedCount("resources");
  const testing = state.testingResources.size > 0;
  const label = count ? `${t("resources.testSelected")} (${count})` : `${t("resources.testOnline")} (${total})`;
  return `<button class="btn small ${testing ? "testing-button" : ""}" data-action="test-selected-resources" ${testing || !total ? "disabled" : ""}>${testing ? `<span class="tiny-spinner"></span>${t("resources.testing")}` : label}</button>`;
}

function isDiscoverableHost(res) {
  return ["host", "linux", "server"].includes(res.type) && res.status === "online";
}

function resourceBulkDiscoverButton(resources) {
  const selected = [...selectionSet("resources")];
  const selectedResources = selected.length ? resources.filter((item) => selected.includes(item.id)) : [];
  const targets = selected.length ? selectedResources.filter(isDiscoverableHost) : resources.filter(isDiscoverableHost);
  const discovering = state.discoveringResources.size > 0;
  const label = selected.length ? `${t("resources.discoverSelected")} (${targets.length})` : `${t("resources.discoverOnline")} (${targets.length})`;
  return `<button class="btn small ${discovering ? "testing-button" : ""}" data-action="discover-selected-services" ${discovering || !targets.length ? "disabled" : ""}>${discovering ? `<span class="tiny-spinner"></span>${t("resources.discovering")}` : label}</button>`;
}

function columnPicker() {
  const selected = new Set(visibleResourceColumns().map(([key]) => key));
  return `
    <details class="column-picker">
      <summary class="btn small">${t("resources.columns")}</summary>
      <div class="column-menu">
        ${RESOURCE_COLUMNS.map(([key, label]) => `
          <label><input type="checkbox" data-kind="column-toggle" data-column="${key}" ${selected.has(key) ? "checked" : ""}> ${t(label)}</label>
        `).join("")}
      </div>
    </details>
  `;
}

function issueColumnPicker() {
  const selected = new Set(visibleIssueColumns().map(([key]) => key));
  return `
    <details class="column-picker">
      <summary class="btn small">${t("resources.columns")}</summary>
      <div class="column-menu wide">
        ${ISSUE_COLUMNS.map(([key, label]) => `
          <label><input type="checkbox" data-kind="issue-column-toggle" data-column="${key}" ${selected.has(key) ? "checked" : ""}> ${t(label)}</label>
        `).join("")}
      </div>
    </details>
  `;
}

function renderResourceListPanel() {
  const rows = state.data.resources
    .filter((res) => !(res.extra_params || {}).parent_resource_id)
    .map((res) => ({ ...res, environment_label: (res.environment_names || []).join(" / ") }));
  const filtered = filterRows("resources", rows, ["name", "type", "environment_label", "ip", "port", "os", "cpu", "memory", "status", "username"])
    .filter((res) => {
      const matchesEnvironment = state.resourceFilters.environment === "all" || (res.environment_names || []).includes(state.resourceFilters.environment);
      const matchesType = state.resourceFilters.type === "all" || res.type === state.resourceFilters.type;
      const matchesStatus = state.resourceFilters.status === "all" || res.status === state.resourceFilters.status;
      return matchesEnvironment && matchesType && matchesStatus;
    });
  const pageInfo = paginate("resources", filtered);
  const resourceActions = {
    filterPanel: resourceFilterPanel(rows),
    html: `
    <button class="btn primary small" data-action="add-resource">${t("action.addResource")}</button>
    ${columnPicker()}
    ${resourceBulkTestButton(filtered.length)}
    ${resourceBulkDiscoverButton(filtered)}
    ${bulkDeleteButton("resources")}
  `};
  const columns = visibleResourceColumns();
  return `
    <div class="module-pane">
      ${tableToolbar("resources", "", "", filtered.length, resourceActions)}
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th class="select-col">${selectAllCell("resources", pageInfo.items)}</th>${columns.map(([, label]) => `<th>${t(label)}</th>`).join("")}<th>${t("table.action")}</th></tr></thead>
          <tbody>
            ${pageInfo.items.map((res) => `
              <tr>
                <td class="select-col">${checkboxCell("resources", res.id)}</td>
                ${columns.map(([key]) => resourceCell(res, key)).join("")}
                <td class="toolbar">
                  <button class="btn small" data-action="edit-resource" data-id="${res.id}">${t("action.edit")}</button>
                  ${resourceTestButton(res)}
                  ${["host", "linux", "server"].includes(res.type) ? resourceServiceButton(res) : ""}
                </td>
              </tr>
              ${state.expandedResources.has(res.id) ? renderResourceServiceRow(res, columns.length + 2) : ""}
            `).join("") || `<tr><td colspan="${columns.length + 2}"><div class="empty">${t("search.empty")}</div></td></tr>`}
          </tbody>
        </table>
      </div>
      ${pagination("resources", pageInfo)}
    </div>
  `;
}

function renderResourceServiceRow(resource, colspan) {
  const services = resourceServices(resource.id);
  const discovering = state.discoveringResources.has(resource.id);
  return `
    <tr class="resource-service-row">
      <td colspan="${colspan}">
        <div class="resource-service-panel">
          <div class="service-panel-head">
            <div>
              <strong>${state.lang === "zh" ? "发现服务列表" : "Discovered services"}</strong>
              <p>${state.lang === "zh" ? "展示该主机上的 Docker 容器、Docker Compose 服务和 Systemd 服务，系统会按类型自动绑定基础巡检规则集。" : "Docker containers, Docker Compose services and Systemd units on this host. OpsRadar auto binds baseline rule sets by service type."}</p>
            </div>
            <button class="btn primary small ${discovering ? "testing-button" : ""}" data-action="discover-resource-services" data-id="${escapeHtml(resource.id)}" ${resource.status !== "online" || discovering ? "disabled" : ""}>
              ${discovering ? `<span class="tiny-spinner"></span>${t("resources.discovering")}` : t("resources.discoverServices")}
            </button>
          </div>
          ${services.length ? `
            <div class="discovered-service-list">
              ${services.map((service) => renderDiscoveredServiceCard(service)).join("")}
            </div>
          ` : `<div class="empty compact-empty">${resource.status === "online" ? (state.lang === "zh" ? "还没有发现服务，点击右侧“发现服务”开始扫描。" : "No services discovered yet. Click Discover services to scan.") : (state.lang === "zh" ? "只有在线的 Linux 主机可以进行服务发现。" : "Only online Linux hosts can run service discovery.")}</div>`}
        </div>
      </td>
    </tr>
  `;
}

function renderDiscoveredServiceCard(service) {
  return `
    <article class="discovered-service-card">
      <div class="service-kind ${escapeHtml(service.discovery_type)}">${serviceTypeLabel(service.discovery_type)}</div>
      <div class="service-main">
        <strong>${escapeHtml(service.name)}</strong>
        <small>${escapeHtml([service.image, service.systemd_unit, service.port ? `${service.port}/${service.protocol || "tcp"}` : ""].filter(Boolean).join(" · ") || service.identity)}</small>
      </div>
      <div class="service-card-actions">
        <button class="btn micro danger" type="button" data-action="delete-discovered-service" data-id="${escapeHtml(service.id)}">${state.lang === "zh" ? "删除" : "Delete"}</button>
      </div>
    </article>
  `;
}

function serviceTypeLabel(type) {
  const labels = {
    docker_container: state.lang === "zh" ? "Docker 容器" : "Docker container",
    docker_compose: state.lang === "zh" ? "Compose 服务" : "Compose service",
    systemd: state.lang === "zh" ? "Systemd 服务" : "Systemd service",
  };
  return labels[type] || type || "-";
}

function taskOwner(userId) {
  const found = state.data.users.find((user) => user.id === userId);
  return found?.display_name || state.user?.display_name || "Admin";
}

function taskProgress(task) {
  if (task.status === "finished" || task.status === "failed" || task.status === "cancelled") return 100;
  if (task.status === "running") return 60;
  if (task.status === "queued") return 20;
  return 0;
}

function taskRows() {
  const taskItems = (state.data.tasks || []).map((task) => {
    return {
      ...task,
      source: "task",
      bulk_id: task.id,
      owner: taskOwner(task.created_by),
      schedule: task.started_at || task.created_at,
      period: "",
      target: task.environment_name ? `${displayApplicationName(task.application_name)} / ${task.environment_name}` : `资源结果 ${task.summary?.total || 0}`,
      progress: taskProgress(task),
      sortTime: task.started_at || task.created_at,
    };
  });
  const planItems = (state.data.cron_plans || []).map((plan) => ({
    id: plan.id,
    bulk_id: `plan:${plan.id}`,
    name: plan.name,
    source: "plan",
    owner: taskOwner(plan.created_by),
    status: plan.enabled ? "pending" : "disabled",
    schedule: plan.next_run_at,
    period: plan.cron_expr,
    target: plan.environment_id ? environmentName(plan.environment_id) : `${(plan.resource_ids || []).length} 个资源 / ${(plan.item_ids || []).length} 个巡检项`,
    progress: 0,
    summary: { total: (plan.item_ids || []).length, success: 0, fail: 0, exception: 0 },
    created_at: plan.created_at,
    sortTime: plan.next_run_at || plan.created_at,
  }));
  return [...taskItems, ...planItems].sort((a, b) => new Date(b.sortTime || 0) - new Date(a.sortTime || 0));
}

function filteredTaskRows() {
  const query = normalizeQuery(state.filters.tasks);
  return taskRows().filter((task) => {
    const matchesQuery = !query || rowText(task, ["name", "id", "target", "owner", "status"]).includes(query);
    const matchesStatus = state.taskFilters.status === "all" || task.status === state.taskFilters.status;
    const matchesOwner = state.taskFilters.owner === "all" || task.owner === state.taskFilters.owner;
    return matchesQuery && matchesStatus && matchesOwner;
  });
}

function taskFilterSelect(name, label, options) {
  const open = state.filterSubmenus.tasks === name;
  return `
    <div class="filter-menu-item task-filter ${open ? "open" : ""}">
      <button type="button" class="filter-menu-head" data-action="toggle-filter-submenu" data-scope="tasks" data-name="${escapeHtml(name)}">
        <span>${escapeHtml(label)}</span>
        ${icon("chevron-right")}
      </button>
      <div class="filter-menu-options">
        ${options.map(([value, text]) => `
          <button type="button" class="${state.taskFilters[name] === value ? "active" : ""}" data-action="set-task-filter" data-name="${escapeHtml(name)}" data-value="${escapeHtml(value)}">
            ${escapeHtml(text)}
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function issueFilterSelect(name, label, options) {
  const open = state.filterSubmenus.issues === name;
  return `
    <div class="filter-menu-item issue-filter ${open ? "open" : ""}">
      <button type="button" class="filter-menu-head" data-action="toggle-filter-submenu" data-scope="issues" data-name="${escapeHtml(name)}">
        <span>${escapeHtml(label)}</span>
        ${icon("chevron-right")}
      </button>
      <div class="filter-menu-options">
        ${options.map(([value, text]) => `
          <button type="button" class="${state.issueFilters[name] === value ? "active" : ""}" data-action="set-issue-filter" data-name="${escapeHtml(name)}" data-value="${escapeHtml(value)}">
            ${escapeHtml(text)}
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function resourceFilterSelect(name, label, options) {
  const open = state.filterSubmenus.resources === name;
  return `
    <div class="filter-menu-item resource-filter ${open ? "open" : ""}">
      <button type="button" class="filter-menu-head" data-action="toggle-filter-submenu" data-scope="resources" data-name="${escapeHtml(name)}">
        <span>${escapeHtml(label)}</span>
        ${icon("chevron-right")}
      </button>
      <div class="filter-menu-options">
        ${options.map(([value, text]) => `
          <button type="button" class="${state.resourceFilters[name] === value ? "active" : ""}" data-action="set-resource-filter" data-name="${escapeHtml(name)}" data-value="${escapeHtml(value)}">
            ${escapeHtml(text)}
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function reportFilterSelect(name, label, options) {
  const open = state.filterSubmenus.reports === name;
  return `
    <div class="filter-menu-item report-filter ${open ? "open" : ""}">
      <button type="button" class="filter-menu-head" data-action="toggle-filter-submenu" data-scope="reports" data-name="${escapeHtml(name)}">
        <span>${escapeHtml(label)}</span>
        ${icon("chevron-right")}
      </button>
      <div class="filter-menu-options">
        ${options.map(([value, text]) => `
          <button type="button" class="${state.reportFilters[name] === value ? "active" : ""}" data-action="set-report-filter" data-name="${escapeHtml(name)}" data-value="${escapeHtml(value)}">
            ${escapeHtml(text)}
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function resourceFilterPanel(rows) {
  const environmentsList = [...new Set(rows.flatMap((resource) => resource.environment_names || []).filter(Boolean))].sort();
  const types = [...new Set(rows.map((resource) => resource.type).filter(Boolean))].sort();
  const statuses = [...new Set(rows.map((resource) => resource.status).filter(Boolean))].sort();
  return `
    <div class="resource-filter-panel ${filterPanelOpen("resources") ? "open" : "collapsed"}">
      ${resourceFilterSelect("environment", state.lang === "zh" ? "所属环境" : "Environment", [["all", state.lang === "zh" ? "全部" : "All"], ...environmentsList.map((value) => [value, value])])}
      ${resourceFilterSelect("type", state.lang === "zh" ? "资源类型" : "Resource Type", [["all", state.lang === "zh" ? "全部" : "All"], ...types.map((value) => [value, resourceTypeLabel(value)])])}
      ${resourceFilterSelect("status", state.lang === "zh" ? "状态" : "Status", [["all", state.lang === "zh" ? "全部" : "All"], ...statuses.map((value) => [value, statusText(value)])])}
    </div>
  `;
}

function reportFilterPanel(rows) {
  const environmentsList = [...new Set(rows.map((report) => report.environment_name).filter(Boolean))].sort();
  const statuses = [...new Set(rows.map((report) => report.status).filter(Boolean))].sort();
  return `
    <div class="report-filter-panel ${filterPanelOpen("reports") ? "open" : "collapsed"}">
      ${reportFilterSelect("environment", state.lang === "zh" ? "所属环境" : "Environment", [["all", state.lang === "zh" ? "全部" : "All"], ...environmentsList.map((value) => [value, value])])}
      ${reportFilterSelect("status", state.lang === "zh" ? "状态" : "Status", [["all", state.lang === "zh" ? "全部" : "All"], ...statuses.map((value) => [value, statusText(value)])])}
    </div>
  `;
}

function taskProgressBar(progress) {
  return `
    <div class="progress-cell">
      <span>${escapeHtml(progress)}%</span>
      <i class="progress-track"><b style="width:${Math.max(0, Math.min(100, progress))}%"></b></i>
    </div>
  `;
}

function canStartTask(task) {
  return task.source === "task" && ["pending", "failed"].includes(task.status);
}

function canRerunTask(task) {
  return task.source === "task" && ["finished", "failed", "cancelled"].includes(task.status);
}

function taskActionButtons(task) {
  const id = escapeHtml(rowBulkId(task));
  const taskId = escapeHtml(task.id);
  const reportAvailable = task.source === "task" && ["finished", "failed"].includes(task.status);
  return `
    <div class="row-actions task-actions">
      ${canStartTask(task) ? `<button class="btn primary small" data-action="start-task" data-id="${taskId}">${icon("play")} ${t("tasks.start")}</button>` : ""}
      ${canRerunTask(task) ? `<button class="btn primary small" data-action="rerun-task" data-id="${taskId}">${icon("play")} ${t("tasks.rerun")}</button>` : ""}
      <button class="btn small" data-action="edit-task" data-id="${id}">${t("action.edit")}</button>
      <button class="btn ghost small log-action" data-action="task-execution-log" data-id="${taskId}">${icon("audit")} ${t("tasks.logs")}</button>
      ${reportAvailable ? `<button class="btn ghost small" data-action="view-task-report" data-id="${taskId}">${icon("reports")} ${t("tasks.viewReport")}</button>` : ""}
    </div>
  `;
}

function renderTaskList() {
  const rows = taskRows();
  const filtered = filteredTaskRows();
  const pageInfo = paginate("tasks", filtered, pageSize("tasks"));
  const owners = [...new Set(rows.map((task) => task.owner).filter(Boolean))];
  const filterOpen = filterPanelOpen("tasks");
  return `
    <section class="task-center-shell">
      <section class="panel task-main-panel">
        <div class="task-filter-bar">
          <div class="search-filter-anchor">
            <label class="table-search search-right-icon search-with-toggle task-search">
              <button class="filter-toggle-inline ${filterOpen ? "active" : ""}" type="button" data-action="toggle-filter-panel" data-scope="tasks" aria-label="${state.lang === "zh" ? "展开或收起筛选" : "Toggle filters"}">${icon(filterOpen ? "chevron-down" : "chevron-right")}</button>
              <input value="${escapeHtml(state.filters.tasks || "")}" data-filter-scope="tasks" placeholder="${t("tasks.searchPlaceholder")}">
              ${icon("search")}
            </label>
            <div class="task-filter-panel ${filterOpen ? "open" : "collapsed"}">
              ${taskFilterSelect("status", t("table.status"), [["all", t("tasks.all")], ["pending", statusText("pending")], ["queued", statusText("queued")], ["running", statusText("running")], ["finished", statusText("finished")], ["failed", statusText("failed")]])}
              ${taskFilterSelect("owner", t("tasks.owner"), [["all", t("tasks.all")], ...owners.map((owner) => [owner, owner])])}
            </div>
          </div>
          <button class="btn small" data-action="reset-task-filters">${t("tasks.reset")}</button>
          ${bulkDeleteButton("tasks")}
          <button class="btn primary small" data-action="run-task">${icon("play")} ${t("tasks.new")}</button>
        </div>
        <div class="table-wrap">
          <table class="table task-table">
            <thead><tr><th class="select-col">${selectAllCell("tasks", pageInfo.items)}</th><th>${t("table.task")}</th><th>${t("tasks.owner")}</th><th>${t("tasks.schedule")}</th><th>${t("tasks.progress")}</th><th>${t("table.status")}</th><th>${t("table.action")}</th></tr></thead>
            <tbody>
              ${pageInfo.items.map((task) => `
                <tr>
                  <td class="select-col">${checkboxCell("tasks", rowBulkId(task))}</td>
                  <td><strong>${escapeHtml(task.name)}</strong><div class="muted">${escapeHtml(task.target || "")}</div></td>
                  <td>${escapeHtml(task.owner)}</td>
                  <td>${formatDate(task.schedule)}</td>
                  <td>${taskProgressBar(task.progress)}</td>
                  <td><span class="status ${statusClass(task.status)}">${statusText(task.status)}</span></td>
                  <td>
                    ${taskActionButtons(task)}
                  </td>
                </tr>
              `).join("") || `<tr><td colspan="7"><div class="empty">${t("search.empty")}</div></td></tr>`}
            </tbody>
          </table>
        </div>
        ${pagination("tasks", pageInfo)}
      </section>
    </section>
  `;
}

function renderSchedulePolicies() {
  const rows = state.data.cron_plans || [];
  const filtered = filterRows("task-schedules", rows, ["name", "cron_expr"]);
  const pageInfo = paginate("task-schedules", filtered);
  return `
    <div class="module-pane">
      ${tableToolbar("task-schedules", "", "", filtered.length, `<button class="btn primary small" data-action="run-task">${t("tasks.new")}</button>`)}
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>${t("table.name")}</th><th>${t("tasks.schedule")}</th><th>${t("table.status")}</th><th>${t("table.action")}</th></tr></thead>
          <tbody>
            ${pageInfo.items.map((plan) => `
              <tr>
                <td><strong>${escapeHtml(plan.name)}</strong><div class="muted mono">${escapeHtml(plan.id)}</div></td>
                <td class="mono">${escapeHtml(plan.cron_expr || "-")}</td>
                <td><span class="status ${plan.enabled ? "success" : "disabled"}">${plan.enabled ? t("label.enabled") : t("label.disabled")}</span></td>
                <td><button class="btn small" data-action="edit-task" data-id="plan:${escapeHtml(plan.id)}">${t("action.edit")}</button></td>
              </tr>
            `).join("") || `<tr><td colspan="4"><div class="empty">${t("search.empty")}</div></td></tr>`}
          </tbody>
        </table>
      </div>
      ${pagination("task-schedules", pageInfo)}
    </div>
  `;
}

function renderFixTasks() {
  return `
    <div class="module-pane">
      <div class="empty center-empty">
        <strong>${t("tasks.fixTasks")}</strong>
        <span>${state.lang === "zh" ? "修复任务将由问题里的修复建议和工单闭环生成，当前暂无记录。" : "Remediation tasks will be generated from issue suggestions and tickets. No records yet."}</span>
      </div>
    </div>
  `;
}

function renderTasks() {
  if (!["tasks", "templates", "schedules", "records", "fixes"].includes(state.tabs.tasks)) {
    state.tabs.tasks = "tasks";
  }
  const panels = {
    tasks: renderTaskList,
    templates: renderTemplates,
    schedules: renderSchedulePolicies,
    records: renderExecutionLogs,
    fixes: renderFixTasks,
  };
  return `
    <section class="panel page-panel">
      <div class="panel-head tab-head">
        ${subnav("tasks", [
          ["tasks", t("tasks.inspectionTasks"), (state.data.tasks || []).length],
          ["templates", t("tasks.templates"), (state.data.inspection_items || []).length],
          ["schedules", t("tasks.schedules"), (state.data.cron_plans || []).length],
          ["records", t("tasks.executionRecords"), (state.data.task_logs || []).length],
          ["fixes", t("tasks.fixTasks"), 0],
        ])}
      </div>
      ${(panels[state.tabs.tasks] || panels.tasks)()}
    </section>
  `;
}

function summaryText(summary = {}) {
  return state.lang === "zh"
    ? `成功 ${summary.success || 0} / 失败 ${summary.fail || 0} / 异常 ${summary.exception || 0} / 跳过 ${summary.skipped || 0} / 总计 ${summary.total || 0}`
    : `S ${summary.success || 0} / F ${summary.fail || 0} / E ${summary.exception || 0} / Skip ${summary.skipped || 0} / T ${summary.total || 0}`;
}


function renderReports() {
  return `
    <section class="page-panel bare-page-panel">
      ${renderReportHistory()}
    </section>
  `;
}

function renderReportHistory() {
  const reports = (state.data.inspection_reports || []).map((report) => ({
    ...report,
    id: report.task_id || report.id,
    name: report.task_name || report.summary?.task_name || report.id,
    status: report.task_status || report.status,
    finished_at: report.finished_at || report.created_at,
  }));
  const filtered = filterRows("reports", reports, ["name", "status", "id", "application_name", "environment_name", "summary"])
    .filter((report) => {
      const matchesEnvironment = state.reportFilters.environment === "all" || report.environment_name === state.reportFilters.environment;
      const matchesStatus = state.reportFilters.status === "all" || report.status === state.reportFilters.status;
      return matchesEnvironment && matchesStatus;
    });
  const pageInfo = paginate("reports", filtered);
  const mergeControls = {
    filterPanel: reportFilterPanel(reports),
    html: `
    <select class="select compact-select" id="merge-format"><option value="html">HTML</option><option value="docx">DOCX</option><option value="pdf">PDF</option></select>
    <button class="btn primary small" data-action="export-merged">${t("reports.merge")}</button>
  `};
  return `
    <div class="module-pane">
      ${tableToolbar("reports", "", "", filtered.length, {
        filterPanel: mergeControls.filterPanel,
        html: `${mergeControls.html}${bulkDeleteButton("reports")}`,
      })}
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th class="select-col">${selectAllCell("reports", pageInfo.items)}</th><th>${t("table.report")}</th><th>${t("table.status")}</th><th>${t("table.summary")}</th><th>${t("table.finished")}</th><th>${t("table.downloads")}</th></tr></thead>
          <tbody>
            ${pageInfo.items.map((task) => `
              <tr>
                <td class="select-col">${checkboxCell("reports", task.id)}</td>
                <td><strong>${escapeHtml(task.name)}</strong><div class="muted">${escapeHtml(task.environment_name ? `${displayApplicationName(task.application_name)} / ${task.environment_name}` : statusText(task.status))}</div></td>
                <td><span class="status ${statusClass(task.status)}">${statusText(task.status)}</span></td>
                <td>${summaryText(task.summary)}</td>
                <td>${formatDate(task.finished_at)}</td>
                <td class="toolbar">
                  <button class="btn small" data-action="export-report" data-id="${task.id}" data-format="html">HTML</button>
                  <button class="btn small" data-action="export-report" data-id="${task.id}" data-format="docx">DOCX</button>
                  <button class="btn small" data-action="export-report" data-id="${task.id}" data-format="pdf">PDF</button>
                  <button class="btn danger small" data-action="delete-report" data-id="${task.id}">${icon("trash")} ${state.lang === "zh" ? "删除" : "Delete"}</button>
                </td>
              </tr>
            `).join("") || `<tr><td colspan="6"><div class="empty">${t("search.empty")}</div></td></tr>`}
          </tbody>
        </table>
      </div>
      ${pagination("reports", pageInfo)}
    </div>
  `;
}

function issueTaskName(issue) {
  return issue.task_name || "-";
}

function issueEnvironmentName(issue) {
  return issue.environment_name || "-";
}

function issueAnalysisStatus(issue) {
  if (issue.insight) return state.lang === "zh" ? "已分析" : "Analyzed";
  const analyzing = (state.data.ai_analysis_results || []).some((row) => row.scope === "issue" && row.target_id === issue.id);
  return analyzing ? (state.lang === "zh" ? "分析中" : "Analyzing") : (state.lang === "zh" ? "未分析" : "Not analyzed");
}

function issueStatusLabel(issue) {
  if (issue.status === "resolved") return state.lang === "zh" ? "已修复" : "Resolved";
  if (issue.status === "in_progress") return state.lang === "zh" ? "处理中" : "Processing";
  if (issue.status === "ignored") return state.lang === "zh" ? "已忽略" : "Ignored";
  return state.lang === "zh" ? "待处理" : "Pending";
}

function issueProblemTypeLabel(issue) {
  return dashboardIssueTypeLabel(issueTypeFromSummary(issue));
}

function issueKpiCard(title, value, delta, iconName, tone = "") {
  const deltaValue = Number(delta || 0);
  const deltaText = deltaValue >= 0 ? `+${deltaValue}` : String(deltaValue);
  return `
    <article class="problem-kpi-card ${escapeHtml(tone)}">
      <div>
        <span>${escapeHtml(title)}</span>
        <strong>${escapeHtml(value)}</strong>
        <small>${state.lang === "zh" ? "较上周" : "vs last week"} <b class="${deltaValue >= 0 ? "up" : "down"}">${escapeHtml(deltaText)}</b></small>
      </div>
      <i>${icon(iconName)}</i>
    </article>
  `;
}

function issueCell(issue, key) {
  const map = {
    issue: `<td>
      <strong>${escapeHtml(issue.summary)}</strong>
      <div class="muted mono">${escapeHtml(issue.id)}</div>
      ${issue.insight ? `<div class="issue-insight-mini"><b>${escapeHtml(issue.insight.risk_level || issue.severity || "medium")}</b>${escapeHtml(issue.insight.recommendation || issue.insight.probable_cause || "")}</div>` : ""}
    </td>`,
    application: `<td>${escapeHtml(displayApplicationName(issue.application_name))}</td>`,
    environment: `<td>${escapeHtml(issue.environment_name || "-")}</td>`,
    resourceName: `<td>${escapeHtml(issue.resource_name || "-")}</td>`,
    resourceIp: `<td class="mono">${escapeHtml(issue.resource_ip || "-")}</td>`,
    resourceType: `<td>${escapeHtml(resourceTypeLabel(issue.resource_type || "-"))}</td>`,
    severity: `<td>${escapeHtml(issue.severity || "-")}</td>`,
    status: `<td><span class="status ${statusClass(issue.status)}">${statusText(issue.status)}</span></td>`,
    assignee: `<td>${escapeHtml(issue.assignee || "-")}</td>`,
    created: `<td>${formatDate(issue.created_at)}</td>`,
  };
  return map[key] || "";
}

function renderIssuesPanel() {
  const rows = state.data.issues || [];
  const tasks = [...new Set(rows.map((issue) => issueTaskName(issue)).filter((value) => value && value !== "-"))].sort();
  const environmentsList = [...new Set(rows.map((issue) => issueEnvironmentName(issue)).filter((value) => value && value !== "-"))].sort();
  const resourceTypes = [...new Set(rows.map((issue) => issue.resource_type).filter(Boolean))].sort();
  const query = normalizeQuery(state.filters.issues);
  const filtered = rows.filter((issue) => {
    const matchesQuery = !query || rowText(issue, ["summary", "severity", "status", "assignee", "id", "application_name", "environment_name", "resource_name", "resource_ip", "resource_type", "task_name"]).includes(query);
    const matchesTask = state.issueFilters.task === "all" || issueTaskName(issue) === state.issueFilters.task;
    const matchesEnvironment = state.issueFilters.environment === "all" || issueEnvironmentName(issue) === state.issueFilters.environment;
    const matchesSeverity = state.issueFilters.severity === "all" || issue.severity === state.issueFilters.severity;
    const matchesStatus = state.issueFilters.status === "all" || issue.status === state.issueFilters.status;
    const matchesType = state.issueFilters.resourceType === "all" || issue.resource_type === state.issueFilters.resourceType;
    return matchesQuery && matchesTask && matchesEnvironment && matchesSeverity && matchesStatus && matchesType;
  });
  const pageInfo = paginate("issues", filtered);
  const highCount = rows.filter((issue) => ["critical", "high"].includes(issue.severity)).length;
  const pendingCount = rows.filter((issue) => !["resolved", "ignored"].includes(issue.status)).length;
  const analyzedCount = rows.filter((issue) => issue.insight).length;
  const resolvedCount = rows.filter((issue) => issue.status === "resolved").length;
  const filterOpen = filterPanelOpen("issues");
  return `
    <div class="problem-board">
      <div class="problem-filter-bar">
        <div class="search-filter-anchor">
          <label class="table-search search-right-icon search-with-toggle problem-search">
            <button class="filter-toggle-inline ${filterOpen ? "active" : ""}" type="button" data-action="toggle-filter-panel" data-scope="issues" aria-label="${state.lang === "zh" ? "展开或收起筛选" : "Toggle filters"}">${icon(filterOpen ? "chevron-down" : "chevron-right")}</button>
            <input value="${escapeHtml(state.filters.issues || "")}" data-filter-scope="issues" placeholder="${state.lang === "zh" ? "搜索问题名称、资源、IP..." : "Search issue, resource, IP..."}">
            ${icon("search")}
          </label>
          <div class="problem-filter-panel ${filterOpen ? "open" : "collapsed"}">
            ${issueFilterSelect("task", state.lang === "zh" ? "所属任务" : "Task", [["all", state.lang === "zh" ? "全部" : "All"], ...tasks.map((value) => [value, value])])}
            ${issueFilterSelect("environment", state.lang === "zh" ? "所属环境" : "Environment", [["all", state.lang === "zh" ? "全部" : "All"], ...environmentsList.map((value) => [value, value])])}
            ${issueFilterSelect("severity", state.lang === "zh" ? "问题等级" : "Severity", [["all", state.lang === "zh" ? "全部" : "All"], ["critical", severityMeta("critical").label], ["high", severityMeta("high").label], ["medium", severityMeta("medium").label], ["low", severityMeta("low").label]])}
            ${issueFilterSelect("status", state.lang === "zh" ? "处理状态" : "Status", [["all", state.lang === "zh" ? "全部" : "All"], ["open", issueStatusLabel({ status: "open" })], ["in_progress", issueStatusLabel({ status: "in_progress" })], ["resolved", issueStatusLabel({ status: "resolved" })], ["ignored", issueStatusLabel({ status: "ignored" })]])}
            ${issueFilterSelect("resourceType", state.lang === "zh" ? "问题类型" : "Issue Type", [["all", state.lang === "zh" ? "全部" : "All"], ...resourceTypes.map((type) => [type, resourceTypeLabel(type)])])}
          </div>
        </div>
        <button class="btn small" data-action="reset-issue-filters">${state.lang === "zh" ? "重置" : "Reset"}</button>
        ${bulkResolveIssuesButton()}
        ${bulkDeleteButton("issues")}
      </div>
      <div class="table-wrap problem-table-wrap">
        <table class="table problem-table">
          <thead><tr><th class="select-col">${selectAllCell("issues", pageInfo.items)}</th><th>${state.lang === "zh" ? "问题名称" : "Issue"}</th><th>${state.lang === "zh" ? "严重等级" : "Severity"}</th><th>${state.lang === "zh" ? "所属任务" : "Task"}</th><th>${state.lang === "zh" ? "所属环境" : "Environment"}</th><th>${state.lang === "zh" ? "资源名称 / IP" : "Resource / IP"}</th><th>${state.lang === "zh" ? "问题类型" : "Type"}</th><th>${state.lang === "zh" ? "AI 分析状态" : "AI Status"}</th><th>${state.lang === "zh" ? "处理状态" : "Status"}</th><th>${state.lang === "zh" ? "发现时间" : "Found At"}</th><th>${t("table.action")}</th></tr></thead>
          <tbody>
            ${pageInfo.items.map((issue) => `
              <tr>
                <td class="select-col">${checkboxCell("issues", issue.id)}</td>
                <td><strong>${escapeHtml(issue.summary || "-")}</strong></td>
                <td>${dashboardSeverityLabel(issue)}</td>
                <td>${escapeHtml(issueTaskName(issue))}</td>
                <td>${escapeHtml(issueEnvironmentName(issue))}</td>
                <td><strong>${escapeHtml(issue.resource_name || "-")}</strong><div class="muted mono">${escapeHtml(issue.resource_ip || "-")}</div></td>
                <td>${escapeHtml(issueProblemTypeLabel(issue))}</td>
                <td><span class="status ${issue.insight ? "success" : "pending"}">${escapeHtml(issueAnalysisStatus(issue))}</span></td>
                <td><span class="status ${statusClass(issue.status)}">${escapeHtml(issueStatusLabel(issue))}</span></td>
                <td>${formatDate(issue.created_at)}</td>
                <td><button class="btn ghost small link-like" data-action="open-issue-detail" data-id="${issue.id}">${state.lang === "zh" ? "详情" : "Details"}</button></td>
              </tr>
            `).join("") || `<tr><td colspan="11"><div class="empty">${t("search.empty")}</div></td></tr>`}
          </tbody>
        </table>
      </div>
      ${pagination("issues", pageInfo)}
    </div>
  `;
}

function renderAiRootCausePanel() {
  const rows = state.data.ai_analysis_results || [];
  const issueRows = rows.filter((row) => row.scope === "issue");
  const pageInfo = paginate("problem-ai-root", filterRows("problem-ai-root", issueRows, ["conclusion", "probable_cause", "impact", "recommendation", "target_id"]));
  return `
    <div class="module-pane">
      ${tableToolbar("problem-ai-root", "", "", pageInfo.total, "", false)}
      <div class="audit-list compact-list">
        ${pageInfo.items.map((item) => `
          <div class="audit-item">
            <strong>${escapeHtml(item.conclusion || "-")}</strong>
            <small>${escapeHtml(item.probable_cause || t("ai.notConfigured"))}<br>${escapeHtml(item.recommendation || "")}</small>
            ${(item.evidence || []).length ? `<div class="chip-row evidence-row">${item.evidence.map((entry) => `<span class="mini-chip">${escapeHtml(entry.tool_name || entry.tool_id || "-")}</span>`).join("")}</div>` : ""}
          </div>
        `).join("") || `<div class="empty center-empty"><strong>${t("problem.aiRootCause")}</strong><span>${t("ai.notConfigured")}</span></div>`}
      </div>
      ${pagination("problem-ai-root", pageInfo)}
    </div>
  `;
}

function renderProblemEmpty(scope, title) {
  return `
    <div class="module-pane">
      <div class="empty center-empty">
        <strong>${escapeHtml(title)}</strong>
        <span>${state.lang === "zh" ? "当前暂无数据。后续会由巡检结果、规则引擎和 AI 分析链路自动沉淀。" : "No records yet. This will be populated by inspection results, rules and AI analysis."}</span>
      </div>
    </div>
  `;
}

function renderIssueDetail(issue) {
  const meta = severityMeta(issue.severity);
  const tabs = [
    ["overview", state.lang === "zh" ? "问题概览" : "Overview"],
    ["analysis", state.lang === "zh" ? "AI 根因分析" : "AI Root Cause"],
    ["evidence", state.lang === "zh" ? "证据链" : "Evidence"],
    ["suggestion", state.lang === "zh" ? "修复建议" : "Suggestion"],
    ["fix", state.lang === "zh" ? "修复任务" : "Fix Task"],
    ["history", state.lang === "zh" ? "处理记录" : "History"],
  ];
  const tab = tabs.some(([key]) => key === state.issueDetailTab) ? state.issueDetailTab : "overview";
  const insight = issue.insight || {};
  const detailBody = {
    overview: renderIssueOverview(issue),
    analysis: renderIssueAnalysis(issue, insight),
    evidence: renderIssueEvidence(issue, insight),
    suggestion: renderIssueSuggestion(issue, insight),
    fix: renderIssueFixTask(issue),
    history: renderIssueHistory(issue),
  }[tab];
  return `
    <div class="problem-detail">
      <div class="problem-detail-head">
        <div>
          <div class="problem-detail-title">
            <span class="severity-badge ${escapeHtml(meta.tone)}">${escapeHtml(meta.label)}</span>
            <h2>${escapeHtml(issue.summary || "-")}</h2>
          </div>
          <div class="problem-detail-meta">
            <span>${state.lang === "zh" ? "所属任务" : "Task"}：${escapeHtml(issueTaskName(issue))}</span>
            <i></i>
            <span>${state.lang === "zh" ? "所属环境" : "Environment"}：${escapeHtml(issueEnvironmentName(issue))}</span>
            <i></i>
            <span>${state.lang === "zh" ? "发现时间" : "Found"}：${formatDate(issue.created_at)}</span>
            <i></i>
            <span>${state.lang === "zh" ? "问题类型" : "Type"}：${escapeHtml(issueProblemTypeLabel(issue))}</span>
          </div>
        </div>
        <div class="problem-detail-actions">
          <button class="btn primary small" data-action="issue-status" data-id="${issue.id}" data-status="resolved">${state.lang === "zh" ? "标记已修复" : "Mark resolved"}</button>
          <button class="btn small" data-action="run-issue-diagnosis" data-id="${issue.id}">${state.lang === "zh" ? "重新诊断" : "Diagnose"}</button>
          ${issue.report_id || issue.report_name ? `<button class="btn small" data-action="issue-view-report" data-id="${issue.id}">${state.lang === "zh" ? "查看报告" : "View report"}</button>` : ""}
          ${issue.task_name ? `<button class="btn small" data-action="issue-view-task" data-id="${issue.id}">${state.lang === "zh" ? "查看任务" : "View task"}</button>` : ""}
          <button class="btn small" data-action="back-issue-list">${state.lang === "zh" ? "返回列表" : "Back"}</button>
        </div>
      </div>
      <div class="problem-detail-tabs">
        ${tabs.map(([key, label]) => `<button class="${tab === key ? "active" : ""}" data-action="issue-detail-tab" data-tab="${key}">${escapeHtml(label)}</button>`).join("")}
      </div>
      ${detailBody}
    </div>
  `;
}

function renderIssueOverview(issue) {
  const evidence = issue.inspection_evidence || {};
  const item = evidence.item || {};
  const resource = evidence.resource || {};
  const output = [evidence.output, evidence.error_message].filter(Boolean).join("\n\n");
  return `
    <div class="problem-detail-grid">
      <section class="problem-detail-card wide">
        <h3>${state.lang === "zh" ? "告警判断依据" : "Alert Evidence"}</h3>
        <div class="issue-evidence-summary">
          <div>
            <span>${state.lang === "zh" ? "当前情况" : "Current"}</span>
            <strong>${escapeHtml(evidence.current_state || issue.description || issue.summary || "-")}</strong>
          </div>
          <div>
            <span>${state.lang === "zh" ? "告警阈值" : "Threshold"}</span>
            <strong>${escapeHtml(evidence.expected || "-")}</strong>
          </div>
          <div>
            <span>${state.lang === "zh" ? "执行耗时" : "Cost"}</span>
            <strong>${escapeHtml(evidence.execution_time_ms != null ? `${evidence.execution_time_ms}ms` : "-")}</strong>
          </div>
        </div>
        <dl class="detail-dl issue-command-dl">
          <dt>${state.lang === "zh" ? "巡检项" : "Check"}</dt><dd>${escapeHtml(item.name || issue.item_id || "-")}</dd>
          <dt>${state.lang === "zh" ? "执行命令" : "Command"}</dt><dd class="mono">${escapeHtml(evidence.command || item.command || "-")}</dd>
          <dt>${state.lang === "zh" ? "判定规则" : "Rule"}</dt><dd>${escapeHtml(evidence.judgement || "-")}</dd>
        </dl>
        ${output ? `<pre class="issue-output-box">${escapeHtml(output)}</pre>` : ""}
      </section>
      <section class="problem-detail-card">
        <h3>${state.lang === "zh" ? "基本信息" : "Basic Info"}</h3>
        <dl class="detail-dl">
          <dt>${state.lang === "zh" ? "资源名称" : "Resource"}</dt><dd>${escapeHtml(resource.name || issue.resource_name || "-")}</dd>
          <dt>IP</dt><dd>${escapeHtml(resource.ip || issue.resource_ip || "-")}</dd>
          <dt>${state.lang === "zh" ? "资源类型" : "Type"}</dt><dd>${escapeHtml(resourceTypeLabel(resource.type || issue.resource_type || "-"))}</dd>
          <dt>${state.lang === "zh" ? "当前状态" : "Status"}</dt><dd>${escapeHtml(issueStatusLabel(issue))}</dd>
        </dl>
      </section>
      <section class="problem-detail-card">
        <h3>${state.lang === "zh" ? "指标趋势（最近 7 天）" : "Metric Trend (7 days)"}</h3>
        ${renderIssueMiniTrend(issue)}
      </section>
      <section class="problem-detail-card">
        <h3>${state.lang === "zh" ? "处理信息" : "Handling"}</h3>
        <dl class="detail-dl">
          <dt>${state.lang === "zh" ? "处理状态" : "Status"}</dt><dd><span class="status ${statusClass(issue.status)}">${escapeHtml(issueStatusLabel(issue))}</span></dd>
          <dt>${state.lang === "zh" ? "指派人员" : "Assignee"}</dt><dd>${escapeHtml(issue.assignee || "-")}</dd>
          <dt>${state.lang === "zh" ? "优先级" : "Priority"}</dt><dd>${escapeHtml(severityMeta(issue.severity).label)}</dd>
          <dt>${state.lang === "zh" ? "最后更新" : "Updated"}</dt><dd>${formatDate(issue.updated_at || issue.created_at)}</dd>
        </dl>
      </section>
    </div>
  `;
}

function renderIssueMiniTrend(issue) {
  const points = issue.metric_points || issue.trend_points || [];
  if (!points.length) {
    return `<div class="empty compact-empty">${state.lang === "zh" ? "暂无真实历史趋势数据。接入 Prometheus / VictoriaMetrics 后可展示该指标最近 7 天变化。" : "No real trend data. Connect Prometheus / VictoriaMetrics to show 7-day metric history."}</div>`;
  }
  const labels = points.map((point) => String(point.label || "").slice(0, 5));
  const polyline = points.map((point, index) => `${index * 52},${110 - Number(point.value || 0)}`).join(" ");
  return `
    <div class="issue-mini-chart">
      <svg viewBox="0 0 320 130" role="img" aria-label="trend">
        <polyline points="${polyline}" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
        ${points.map((point, index) => `<circle cx="${index * 52}" cy="${110 - Number(point.value || 0)}" r="4" fill="#ef4444"></circle>`).join("")}
      </svg>
      <div class="issue-mini-axis">${labels.map((label) => `<span>${escapeHtml(label)}</span>`).join("")}</div>
    </div>
  `;
}

function renderIssueAnalysis(issue, insight) {
  const evidence = issue.inspection_evidence || {};
  return `
    <div class="problem-detail-grid single">
      <section class="problem-detail-card">
        <h3>${state.lang === "zh" ? "为什么触发告警" : "Why Alerted"}</h3>
        <p>${escapeHtml(evidence.current_state || "未获取到巡检输出。")}</p>
        <p>${escapeHtml(evidence.judgement || "")}</p>
      </section>
      <section class="problem-detail-card">
        <h3>${state.lang === "zh" ? "可能原因" : "Probable Cause"}</h3>
        <p>${escapeHtml(insight.probable_cause || (state.lang === "zh" ? "暂无 AI 根因分析，请点击重新诊断生成。" : "No AI root cause yet. Run diagnosis to generate one."))}</p>
      </section>
      <section class="problem-detail-card">
        <h3>${state.lang === "zh" ? "影响范围" : "Impact"}</h3>
        <p>${escapeHtml(insight.impact || "-")}</p>
      </section>
    </div>
  `;
}

function renderIssueEvidence(issue, insight) {
  const evidence = insight.evidence || [];
  const snapshot = issue.evidence_snapshot || {};
  const resourceSnapshot = snapshot.resource || {};
  const itemSnapshot = snapshot.item || {};
  const rawEvidence = [snapshot.output, snapshot.error_message].filter(Boolean).join("\n\n");
  return `
    <section class="problem-detail-card">
      <h3>${state.lang === "zh" ? "诊断工具证据" : "Diagnostic Evidence"}</h3>
      ${Object.keys(snapshot).length ? `
        <div class="evidence-snapshot">
          <dl class="detail-dl">
            <dt>${state.lang === "zh" ? "触发规则" : "Rule"}</dt><dd>${escapeHtml(itemSnapshot.name || issue.item_id || "-")}</dd>
            <dt>${state.lang === "zh" ? "来源资产" : "Asset"}</dt><dd>${escapeHtml(resourceSnapshot.name || issue.resource_name || "-")} ${resourceSnapshot.ip || issue.resource_ip ? `(${escapeHtml(resourceSnapshot.ip || issue.resource_ip)})` : ""}</dd>
            <dt>${state.lang === "zh" ? "来源报告" : "Report"}</dt><dd>${escapeHtml(issue.report_name || issue.report_id || "-")}</dd>
          </dl>
          ${rawEvidence ? `<pre>${escapeHtml(rawEvidence)}</pre>` : ""}
        </div>
      ` : ""}
      <div class="evidence-list">
        ${evidence.length ? evidence.map((item) => `
          <article>
            <strong>${escapeHtml(item.tool_name || item.tool_id || "-")}</strong>
            <p>${escapeHtml(item.summary || item.output || "-")}</p>
          </article>
        `).join("") : `<div class="empty compact-empty">${state.lang === "zh" ? "暂无证据链。重新诊断后会展示 Diagnose Tools 输出摘要。" : "No evidence yet. Diagnose again to show tool outputs."}</div>`}
      </div>
    </section>
  `;
}

function renderIssueSuggestion(issue, insight) {
  const steps = issue.repair_steps || insight.steps || insight.action_steps || [];
  return `
    <section class="problem-detail-card">
      <h3>${state.lang === "zh" ? "修复建议" : "Remediation"}</h3>
      <p>${escapeHtml(issue.repair_recommendation || insight.recommendation || "-")}</p>
      ${steps.length ? `<ol class="step-list">${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>` : ""}
      <h3>${state.lang === "zh" ? "修复后验证" : "Verification"}</h3>
      <p>${escapeHtml(insight.verification || "-")}</p>
    </section>
  `;
}

function renderIssueFixTask(issue) {
  const tasks = (state.data.repair_tasks || []).filter((task) => task.issue_id === issue.id);
  return `
    <section class="problem-detail-card">
      <h3>${state.lang === "zh" ? "修复任务" : "Fix Task"}</h3>
      <p>${state.lang === "zh" ? "可基于根因分析与修复建议生成修复任务，后续用于负责人跟进、验证和闭环。" : "Create remediation tasks from analysis and suggestions for owner follow-up, verification and closure."}</p>
      <div class="row-actions">
        <button class="btn primary small" data-action="create-repair-task" data-id="${issue.id}">${state.lang === "zh" ? "创建修复任务" : "Create fix task"}</button>
        <button class="btn small" data-action="issue-status" data-id="${issue.id}" data-status="in_progress">${state.lang === "zh" ? "开始处理" : "Start processing"}</button>
      </div>
      <div class="repair-task-list">
        ${tasks.map((task) => `
          <div class="repair-task-card">
            <strong>${escapeHtml(task.title || "-")}</strong>
            <span class="status ${statusClass(task.status)}">${escapeHtml(statusText(task.status || "pending"))}</span>
            <small>${escapeHtml(task.assignee || "-")} · ${formatDate(task.created_at)}</small>
          </div>
        `).join("") || `<div class="empty compact">${state.lang === "zh" ? "暂无修复任务" : "No fix tasks yet"}</div>`}
      </div>
    </section>
  `;
}

function renderIssueHistory(issue) {
  return `
    <section class="problem-detail-card">
      <h3>${state.lang === "zh" ? "处理记录" : "History"}</h3>
      <div class="timeline-list">
        <span>${formatDate(issue.created_at)} · ${state.lang === "zh" ? "问题已创建" : "Issue created"}</span>
        ${issue.updated_at ? `<span>${formatDate(issue.updated_at)} · ${state.lang === "zh" ? "状态已更新" : "Status updated"}</span>` : ""}
        ${issue.resolution_note ? `<span>${escapeHtml(issue.resolution_note)}</span>` : ""}
      </div>
    </section>
  `;
}

function renderProblemCenter() {
  const detailIssue = state.issueDetailId ? (state.data.issues || []).find((issue) => issue.id === state.issueDetailId) : null;
  if (detailIssue) {
    return `<section class="panel page-panel problem-page-panel">${renderIssueDetail(detailIssue)}</section>`;
  }
  if (!["issues", "ai-root", "risks", "suggestions", "tickets"].includes(state.tabs.problems)) {
    state.tabs.problems = "issues";
  }
  return `
    <section class="panel page-panel problem-page-panel">
      ${renderIssuesPanel()}
    </section>
  `;
}

function templateMetricGroup(title, items, tone = "") {
  return `
    <div class="template-group ${tone}">
      <h3>${escapeHtml(title)}</h3>
      <div class="template-chip-grid">
        ${items.map((item) => `<span class="template-chip">${escapeHtml(item)}</span>`).join("")}
      </div>
    </div>
  `;
}

function templateCategoryLabel(category) {
  const labels = {
    zh: {
      os: "OS 指标",
      postgresql: "PostgreSQL 指标",
      mysql: "MySQL 指标",
      redis: "Redis 指标",
      container: "容器指标",
      middleware: "中间件指标",
      host: "OS 指标",
      database: "数据库指标",
      network: "网络指标",
      security: "安全基线",
    },
    en: {
      os: "OS Metrics",
      postgresql: "PostgreSQL Metrics",
      mysql: "MySQL Metrics",
      redis: "Redis Metrics",
      container: "Container Metrics",
      middleware: "Middleware Metrics",
      host: "OS Metrics",
      database: "Database Metrics",
      network: "Network Metrics",
      security: "Security Baseline",
    },
  };
  return labels[state.lang]?.[category] || labels.en[category] || category || "-";
}

function templateItemKind(item) {
  const description = item.description || "";
  if (description.includes("CIS")) return "cis";
  if (description.startsWith("安全基线")) return "security";
  if (description.startsWith("合规检查")) return "compliance";
  if (description.startsWith("自定义巡检")) return "custom";
  return "standard";
}

function templateKindLabel(kind) {
  const labels = {
    zh: {
      all: "全部类型",
      standard: "基础巡检",
      cis: "CIS 安全基线",
      security: "安全基线",
      compliance: "合规检查",
      custom: "自定义巡检",
    },
    en: {
      all: "All Types",
      standard: "Standard Metrics",
      cis: "CIS Security Baseline",
      security: "Security Baseline",
      compliance: "Compliance",
      custom: "Custom",
    },
  };
  return labels[state.lang]?.[kind] || labels.en[kind] || kind;
}

function resourceTypeForTemplateCategory(category) {
  return {
    os: "host",
    container: "container",
    postgresql: "pgsql",
    mysql: "mysql",
    redis: "redis",
    middleware: "middleware",
  }[category] || "host";
}

function ruleSetTargetLabel(ruleSet) {
  const types = (ruleSet.resource_types || []).length ? (ruleSet.resource_types || []).join(", ") : "-";
  const services = (ruleSet.service_types || []).length ? (ruleSet.service_types || []).join(", ") : "";
  if (ruleSet.target_kind === "service") {
    return state.lang === "zh" ? `服务：${services || types}` : `Service: ${services || types}`;
  }
  return state.lang === "zh" ? `资源：${types}` : `Resource: ${types}`;
}

function renderTemplates() {
  state.tabs.templates = state.tabs.templates || "builtin";
  if (!["category", "builtin", "custom", "rules"].includes(state.tabs.templates)) state.tabs.templates = "category";
  const customCount = state.data.inspection_items.filter((item) => !item.is_builtin).length;
  return `
    <div class="template-module">
      <div class="panel-head tab-head">
        ${subnav("templates", [
          ["category", t("templates.category")],
          ["builtin", t("templates.builtin"), state.data.inspection_items.filter((item) => item.is_builtin).length],
          ["custom", t("templates.custom"), customCount],
          ["rules", t("templates.rules")],
        ])}
      </div>
      ${state.tabs.templates === "category" ? renderTemplateCategories() : ""}
      ${state.tabs.templates === "builtin" ? renderBuiltinTemplates() : ""}
      ${state.tabs.templates === "custom" ? renderCustomTemplates() : ""}
      ${state.tabs.templates === "rules" ? renderTemplateRules() : ""}
    </div>
  `;
}

function renderTemplateCategories() {
  const rows = state.data.rule_sets || [];
  const filtered = filterRows("rule-sets", rows, ["name", "description", "target_kind", "resource_types", "service_types"]);
  const pageInfo = paginate("rule-sets", filtered);
  const createButton = hasPermission("templates:create")
    ? `<button class="btn primary small" data-action="add-rule-set">${state.lang === "zh" ? "新增规则集" : "Add rule set"}</button>`
    : "";
  return `
    <div class="module-pane">
      ${tableToolbar("rule-sets", "", "", filtered.length, createButton, false)}
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>${state.lang === "zh" ? "规则集名称" : "Rule Set"}</th>
              <th>${state.lang === "zh" ? "适用对象" : "Target"}</th>
              <th>${state.lang === "zh" ? "适用条件" : "Conditions"}</th>
              <th>${state.lang === "zh" ? "规则项" : "Items"}</th>
              <th>${t("table.status")}</th>
              <th>${t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            ${pageInfo.items.map((ruleSet) => {
              const itemIds = ruleSet.item_ids || ruleSet.items || [];
              const target = ruleSetTargetLabel(ruleSet);
              const condition = [
                (ruleSet.resource_types || []).length ? `${state.lang === "zh" ? "资源" : "Resources"}: ${ruleSet.resource_types.join(", ")}` : "",
                (ruleSet.service_types || []).length ? `${state.lang === "zh" ? "服务" : "Services"}: ${ruleSet.service_types.join(", ")}` : "",
                (ruleSet.exclude_keywords || []).length ? `${state.lang === "zh" ? "排除" : "Exclude"}: ${ruleSet.exclude_keywords.join(", ")}` : "",
              ].filter(Boolean).join(" · ") || (state.lang === "zh" ? "全部匹配" : "Match all");
              return `
                <tr>
                  <td><strong>${escapeHtml(ruleSet.name)}</strong><div class="muted">${escapeHtml(ruleSet.description || "")}</div></td>
                  <td>${escapeHtml(target)}</td>
                  <td>${escapeHtml(condition)}</td>
                  <td><span class="status pending">${itemIds.length}</span><div class="muted">${escapeHtml(itemIds.slice(0, 3).map(inspectionItemName).join(" / ") || "-")}${itemIds.length > 3 ? " ..." : ""}</div></td>
                  <td><span class="status ${ruleSet.enabled === false ? "pending" : "success"}">${ruleSet.enabled === false ? (state.lang === "zh" ? "停用" : "Disabled") : (state.lang === "zh" ? "启用" : "Enabled")}</span></td>
                  <td>${hasPermission("templates:update") ? `<button class="btn small" data-action="edit-rule-set" data-id="${escapeHtml(ruleSet.id)}">${t("action.edit")}</button>` : ""}</td>
                </tr>
              `;
            }).join("") || `<tr><td colspan="6"><div class="empty">${t("search.empty")}</div></td></tr>`}
          </tbody>
        </table>
      </div>
      ${pagination("rule-sets", pageInfo)}
    </div>
  `;
}

function templateRepositoryFilters(scope, rows) {
  const categoryValue = state.filters[`${scope}:category`] || "all";
  const kindValue = state.filters[`${scope}:kind`] || "all";
  const categories = ["all", "os", "postgresql", "mysql", "redis", "container", "middleware"];
  const kinds = ["all", "standard", "cis", "security", "compliance", "custom"];
  return `
    <div class="template-filter-bar">
      <label class="filter-select template-filter">
        <span>${t("table.category")}</span>
        <select class="select compact-select" data-template-filter-key="category" data-template-filter-scope="${scope}">
          ${categories.map((category) => `<option value="${category}" ${categoryValue === category ? "selected" : ""}>${category === "all" ? (state.lang === "zh" ? "全部分类" : "All Categories") : templateCategoryLabel(category)}</option>`).join("")}
        </select>
      </label>
      <label class="filter-select template-filter">
        <span>${state.lang === "zh" ? "检查类型" : "Check Type"}</span>
        <select class="select compact-select" data-template-filter-key="kind" data-template-filter-scope="${scope}">
          ${kinds.map((kind) => `<option value="${kind}" ${kindValue === kind ? "selected" : ""}>${templateKindLabel(kind)}</option>`).join("")}
        </select>
      </label>
    </div>
  `;
}

function filterTemplateRepository(scope, rows) {
  const categoryValue = state.filters[`${scope}:category`] || "all";
  const kindValue = state.filters[`${scope}:kind`] || "all";
  return rows.filter((item) => {
    const categoryMatch = categoryValue === "all" || item.category === categoryValue;
    const kindMatch = kindValue === "all" || templateItemKind(item) === kindValue;
    return categoryMatch && kindMatch;
  });
}

function renderBuiltinTemplates() {
  const rows = filterTemplateRepository("templates-builtin", state.data.inspection_items.filter((item) => item.is_builtin));
  const filtered = filterRows("templates-builtin", rows, ["name", "category", "command_template", "description", "expected_result_pattern"]);
  const pageInfo = paginate("templates-builtin", filtered);
  return renderTemplateTable("templates-builtin", pageInfo, filtered.length, false, templateRepositoryFilters("templates-builtin", rows));
}

function renderCustomTemplates() {
  const rows = filterTemplateRepository("templates-custom", state.data.inspection_items.filter((item) => !item.is_builtin));
  const filtered = filterRows("templates-custom", rows, ["name", "category", "command_template", "description", "expected_result_pattern"]);
  const pageInfo = paginate("templates-custom", filtered);
  return renderTemplateTable("templates-custom", pageInfo, filtered.length, true, templateRepositoryFilters("templates-custom", rows));
}

function renderTemplateTable(scope, pageInfo, total, allowCreate, filters = "") {
  const createButton = allowCreate && hasPermission("templates:create")
    ? `<button class="btn primary small" data-action="add-inspection-item">${state.lang === "zh" ? "新增自定义" : "Add custom"}</button>`
    : "";
  return `
    <div class="module-pane">
      ${tableToolbar(scope, "", "", total, `${filters}${createButton}`, false)}
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>${t("table.name")}</th><th>${t("table.category")}</th><th>${state.lang === "zh" ? "检查类型" : "Check Type"}</th><th>${t("table.command")}</th><th>${t("table.result")}</th><th>${t("table.source")}</th></tr></thead>
          <tbody>
            ${pageInfo.items.map((item) => `<tr><td><strong>${escapeHtml(item.name)}</strong><div class="muted">${escapeHtml(item.description || "")}</div></td><td>${escapeHtml(templateCategoryLabel(item.category))}</td><td><span class="status ${templateItemKind(item) === "cis" ? "review" : templateItemKind(item) === "standard" ? "success" : "pending"}">${escapeHtml(templateKindLabel(templateItemKind(item)))}</span></td><td class="mono">${escapeHtml(item.command_template)}</td><td>${escapeHtml(item.expected_result_pattern || "-")}</td><td><span class="status ${item.is_builtin ? "success" : "pending"}">${item.is_builtin ? t("label.builtin") : t("label.custom")}</span></td></tr>`).join("") || `<tr><td colspan="6"><div class="empty">${t("search.empty")}</div></td></tr>`}
          </tbody>
        </table>
      </div>
      ${pagination(scope, pageInfo)}
    </div>
  `;
}

function renderTemplateRules() {
  return `
    <div class="module-pane">
      <div class="operation-strip"><div><h3>${t("templates.rules")}</h3><p>${t("templates.parameterized")}</p></div></div>
      <div class="template-rule-grid">
        ${["阈值判断：CPU > 90%", "关键字匹配：PermitRootLogin no", "差值对比：慢查询增量 < 100", "JSON 解析：status == ok", "健康分：S = Σ wi × pi", "结果脱敏：凭据、Token、手机号掩码"].map((item) => `<div class="audit-item"><strong>${escapeHtml(item)}</strong><small>${t("templates.rules")}</small></div>`).join("")}
      </div>
    </div>
  `;
}

function renderTemplateBindings() {
  const envs = environments();
  return `
    <div class="module-pane">
      ${tableToolbar("template-bindings", "", "", envs.length, "", false)}
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>${t("table.environmentBinding")}</th><th>${t("table.owner")}</th><th>${t("templates.builtin")}</th><th>${t("templates.custom")}</th></tr></thead>
          <tbody>
            ${envs.map((env) => `<tr><td><strong>${escapeHtml(displayApplicationName(env.application_name))} / ${escapeHtml(env.name)}</strong><div class="muted mono">${escapeHtml(env.id)}</div></td><td>${escapeHtml(env.owner || "-")}</td><td>基础巡检 + 安全基线</td><td>${env.env_type === "prod" ? "PROD 强化脚本" : "-"}</td></tr>`).join("") || `<tr><td colspan="4"><div class="empty">${t("search.empty")}</div></td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderAiConfigList(scope, rows, columns, emptyTitle, extra = "") {
  const filtered = filterRows(scope, rows, columns.map((column) => column.key));
  const pageInfo = paginate(scope, filtered);
  return `
    <div class="module-pane">
      ${tableToolbar(scope, "", "", filtered.length, extra, false)}
      <div class="table-wrap">
        <table class="table">
          <thead><tr>${columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}</tr></thead>
          <tbody>
            ${pageInfo.items.map((row) => `
              <tr>${columns.map((column) => `<td>${column.render ? column.render(row) : escapeHtml(row[column.key] || "-")}</td>`).join("")}</tr>
            `).join("") || `<tr><td colspan="${columns.length}"><div class="empty center-empty"><strong>${escapeHtml(emptyTitle)}</strong><span>${t("ai.notConfigured")}</span></div></td></tr>`}
          </tbody>
        </table>
      </div>
      ${pagination(scope, pageInfo)}
    </div>
  `;
}

function renderAiModels() {
  return renderAiConfigList("ai-models", state.data.ai_models || [], [
    { key: "name", label: t("table.name"), render: (row) => `<strong>${escapeHtml(row.name)}</strong><div class="muted mono">${escapeHtml(row.model_name || "-")}</div>` },
    { key: "provider", label: t("ai.modelProvider") },
    { key: "base_url", label: "Base URL", render: (row) => `<span class="mono">${escapeHtml(row.base_url || "-")}</span>` },
    { key: "enabled", label: t("table.status"), render: (row) => `<span class="status ${row.enabled ? "success" : "disabled"}">${row.enabled ? t("label.enabled") : t("label.disabled")}</span>` },
    { key: "action", label: t("table.action"), render: (row) => `
      <div class="row-actions">
        <button class="btn small" data-action="test-ai-model" data-id="${escapeHtml(row.id)}">${t("action.test")}</button>
        <button class="btn small" data-action="edit-ai-model" data-id="${escapeHtml(row.id)}">${t("action.edit")}</button>
        <button class="btn danger small" data-action="delete-ai-model" data-id="${escapeHtml(row.id)}">${t("action.delete")}</button>
      </div>
    ` },
  ], t("ai.models"), `<button class="btn primary small" data-action="add-ai-model">${t("modal.addAiModel")}</button>`);
}

function renderAiDatasources() {
  return renderAiConfigList("ai-datasources", state.data.ai_datasources || [], [
    { key: "name", label: t("table.name"), render: (row) => `<strong>${escapeHtml(row.name)}</strong><div class="muted mono">${escapeHtml(row.endpoint || "-")}</div>` },
    { key: "type", label: t("ai.datasourceType") },
    { key: "default_range", label: state.lang === "zh" ? "默认范围" : "Default Range" },
    { key: "enabled", label: t("table.status"), render: (row) => `<span class="status ${row.enabled ? "success" : "disabled"}">${row.enabled ? t("label.enabled") : t("label.disabled")}</span>` },
    { key: "action", label: t("table.action"), render: (row) => `<button class="btn small" data-action="edit-ai-datasource" data-id="${escapeHtml(row.id)}">${t("action.edit")}</button>` },
  ], t("ai.datasources"), `<button class="btn primary small" data-action="add-ai-datasource">${t("modal.addAiDatasource")}</button>`);
}

function renderAiDiagnostics() {
  const registry = state.data.diagnostic_tools || {};
  const rows = registry.items || [];
  return renderAiConfigList("ai-diagnostics", rows, [
    { key: "name", label: t("table.name"), render: (row) => `<strong>${escapeHtml(row.name)}</strong><div class="muted">${escapeHtml(row.description || "")}</div>` },
    { key: "category", label: t("table.category"), render: (row) => escapeHtml(diagnoseCategoryLabel(row.category, registry.categories || [])) },
    { key: "resource_types", label: t("table.resourceType"), render: (row) => `<div class="chip-row">${(row.resource_types || []).map((type) => `<span class="mini-chip">${escapeHtml(resourceTypeLabel(type))}</span>`).join("") || "-"}</div>` },
    { key: "parameters", label: state.lang === "zh" ? "参数说明" : "Parameters", render: (row) => `<span class="mono">${escapeHtml(row.parameters || "-")}</span>` },
    { key: "enabled", label: t("table.status"), render: (row) => `<span class="status ${row.enabled ? "success" : "disabled"}">${row.enabled ? t("label.enabled") : t("label.disabled")}</span><div class="muted">${escapeHtml(row.last_status || "idle")}</div>` },
  ], t("ai.diagnoseTools"));
}

function diagnoseCategoryLabel(key, categories) {
  const item = (categories || []).find((category) => category.key === key);
  return item?.name || key || "-";
}

function renderAiKnowledge() {
  const rows = state.data.analysis_rules || [];
  return renderAiConfigList("ai-knowledge", rows, [
    { key: "name", label: t("table.name"), render: (row) => `<strong>${escapeHtml(row.name)}</strong><div class="muted">${escapeHtml(row.probable_cause || "")}</div>` },
    { key: "layer", label: t("form.layer") },
    { key: "risk_level", label: t("table.severity") },
    { key: "enabled", label: t("table.status"), render: (row) => `<span class="status ${row.enabled ? "success" : "disabled"}">${row.enabled ? t("label.enabled") : t("label.disabled")}</span>` },
    { key: "action", label: t("table.action"), render: (row) => `
      <div class="row-actions">
        <button class="btn small" data-action="edit-analysis-rule" data-id="${escapeHtml(row.id)}">${t("action.edit")}</button>
        <button class="btn danger small" data-action="delete-analysis-rule" data-id="${escapeHtml(row.id)}">${t("action.delete")}</button>
      </div>
    ` },
  ], t("ai.knowledge"), `<button class="btn primary small" data-action="add-analysis-rule">${t("modal.addKnowledge")}</button>`);
}

function renderAiAssistant() {
  const settings = state.data.ai_assistant_settings || {};
  const assistantState = state.aiAssistant;
  const messages = assistantState.messages.length
    ? assistantState.messages
    : [{ role: "assistant", content: assistantWelcomeMessage(settings), time: currentTimeLabel() }];
  const userMessages = assistantState.messages.filter((message) => message.role === "user");
  const lastMessage = assistantState.messages[assistantState.messages.length - 1];
  const sessionTitle = assistantState.title || userMessages[0]?.content?.slice(0, 28) || (state.lang === "zh" ? "当前会话" : "Current session");
  const hasSession = Boolean(assistantState.sessionId || assistantState.messages.length);
  const sessionGroups = groupAiSessions(assistantState.sessions || []);
  return `
    <div class="ai-assistant-workbench" style="--ai-session-width:${Math.max(150, Math.min(360, assistantState.sidebarWidth || 176))}px">
      <aside class="ai-session-sidebar">
        <div class="ai-side-head">
          <h3>${state.lang === "zh" ? "会话列表" : "Sessions"}</h3>
          <button class="btn small" data-action="clear-ai-chat" data-chat-scope="page">+ ${state.lang === "zh" ? "新建会话" : "New"}</button>
        </div>
        <label class="table-search ai-session-search">
          ${icon("search")}
          <input placeholder="${state.lang === "zh" ? "搜索会话标题" : "Search sessions"}">
        </label>
        <div class="ai-session-list">
          ${renderAiSessionGroups(sessionGroups, hasSession, sessionTitle, lastMessage)}
        </div>
        <div class="ai-session-resizer" title="${state.lang === "zh" ? "拖动调整会话列表宽度" : "Drag to resize sessions"}"></div>
      </aside>

      <section class="ai-chat-main">
        <div class="ai-main-head">
          <div class="ai-main-title">
            <div class="ai-chat-avatar">${aiBotIcon()}</div>
            <div>
              <h2>${escapeHtml(settings.name || "OpsRadar AI 助手")}</h2>
            </div>
            <span class="status success">${escapeHtml(t("ai.online").split("·")[1]?.trim() || t("ai.assistantEnabled"))}</span>
          </div>
          <div class="row-actions">
            <button class="btn small" data-action="clear-ai-chat" data-chat-scope="page">${state.lang === "zh" ? "清空对话" : "Clear"}</button>
            <button class="btn small" data-action="edit-ai-assistant">${state.lang === "zh" ? "设置" : "Settings"}</button>
          </div>
        </div>
        <div class="ai-conversation-panel">
          ${messages.map((message) => aiChatMessageHtml(message, "page")).join("")}
          ${assistantState.typing ? aiTypingHtml() : ""}
        </div>
        <div class="ai-page-composer">
          <textarea id="ai-page-chat-input" rows="1" placeholder="${escapeHtml(t("ai.placeholder"))}"></textarea>
          <div class="ai-composer-tools">
            <button class="btn primary" type="button" data-action="send-ai-chat" data-chat-scope="page">${icon("send")}</button>
          </div>
        </div>
      </section>

    </div>
  `;
}

function groupAiSessions(sessions) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfToday.getDate() - 1);
  const startOfThreeDays = new Date(startOfToday);
  startOfThreeDays.setDate(startOfToday.getDate() - 2);
  const groups = [
    { key: "today", label: state.lang === "zh" ? "今天" : "Today", items: [] },
    { key: "yesterday", label: state.lang === "zh" ? "昨天" : "Yesterday", items: [] },
    { key: "recent", label: state.lang === "zh" ? "近三天" : "Last 3 days", items: [] },
  ];
  sessions.forEach((session) => {
    const date = new Date(session.updated_at || session.created_at || Date.now());
    if (date >= startOfToday) groups[0].items.push(session);
    else if (date >= startOfYesterday) groups[1].items.push(session);
    else if (date >= startOfThreeDays) groups[2].items.push(session);
  });
  return groups.filter((group) => group.items.length);
}

function renderAiSessionGroups(groups, hasCurrentDraft, currentTitle, lastMessage) {
  const currentDraft = hasCurrentDraft && !state.aiAssistant.sessionId
    ? `<div class="ai-session-group"><div class="ai-session-date">${state.lang === "zh" ? "当前" : "Current"}</div>${aiSessionCardHtml({ id: "", title: currentTitle, last_message: lastMessage }, true)}</div>`
    : "";
  const history = groups.map((group) => `
    <div class="ai-session-group">
      <div class="ai-session-date">${escapeHtml(group.label)}</div>
      ${group.items.map((session) => aiSessionCardHtml(session, session.id === state.aiAssistant.sessionId)).join("")}
    </div>
  `).join("");
  return currentDraft || history
    ? `${currentDraft}${history}`
    : `<div class="empty center-empty"><strong>${state.lang === "zh" ? "暂无会话" : "No sessions"}</strong><span>${state.lang === "zh" ? "最近三天的会话会展示在这里" : "Recent 3-day sessions appear here"}</span></div>`;
}

function aiSessionCardHtml(session, active = false) {
  const last = session.last_message || {};
  const subtitle = last.content || (state.lang === "zh" ? "多轮对话会保留在当前会话中" : "Multi-turn messages stay in this session");
  const title = escapeHtml(session.title || t("ai.assistant"));
  return `
    <div class="ai-session-item ${active ? "active" : ""}">
      <button type="button" class="ai-session-card" ${session.id ? `data-action="load-ai-session" data-id="${escapeHtml(session.id)}"` : ""}>
        <span class="ai-session-icon">${icon("trend")}</span>
        <strong>${title}</strong>
        <small>${escapeHtml(subtitle)}</small>
        <time>${escapeHtml(formatSessionTime(session.updated_at || last.created_at || session.created_at))}</time>
      </button>
      ${session.id ? `<button type="button" class="ai-session-delete" data-action="delete-ai-session" data-id="${escapeHtml(session.id)}" title="${state.lang === "zh" ? "删除会话" : "Delete session"}" aria-label="${state.lang === "zh" ? `删除会话：${title}` : `Delete session: ${title}`}">${icon("trash")}</button>` : ""}
    </div>
  `;
}

function formatSessionTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString(state.lang === "zh" ? "zh-CN" : "en-US", { hour: "2-digit", minute: "2-digit" });
}

function renderAiCenter() {
  if (!["models", "datasources", "diagnostics", "knowledge", "assistant"].includes(state.tabs.ai)) {
    state.tabs.ai = "assistant";
    localStorage.setItem("opsradar_tab_ai", state.tabs.ai);
  }
  const panels = {
    models: renderAiModels,
    datasources: renderAiDatasources,
    diagnostics: renderAiDiagnostics,
    knowledge: renderAiKnowledge,
    assistant: renderAiAssistant,
  };
  return `
    <section class="panel page-panel ai-center-page">
      <div class="panel-head tab-head">
        ${subnav("ai", [
          ["assistant", t("ai.assistant")],
          ["models", t("ai.models"), (state.data.ai_models || []).length],
          ["datasources", t("ai.datasources"), (state.data.ai_datasources || []).length],
          ["diagnostics", t("ai.diagnostics"), (state.data.diagnostic_tools?.items || []).length],
          ["knowledge", t("ai.knowledge"), (state.data.analysis_rules || []).length],
        ])}
      </div>
      ${(panels[state.tabs.ai] || panels.models)()}
    </section>
  `;
}

function renderUsersPanel() {
  const filtered = filterRows("users", state.data.users, ["display_name", "username", "email", "role"]);
  const pageInfo = paginate("users", filtered);
  return `
    <div class="module-pane">
      ${tableToolbar("users", "", "", filtered.length, `<button class="btn primary small" data-action="add-user">${icon("users")} ${state.lang === "zh" ? "创建用户" : "Create user"}</button>`)}
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th class="select-col">${selectAllCell("users", pageInfo.items)}</th><th>${t("table.name")}</th><th>${t("table.email")}</th><th>${t("table.role")}</th><th>${t("table.status")}</th><th>${t("table.lastLogin")}</th><th>${t("table.action")}</th></tr></thead>
          <tbody>
            ${pageInfo.items.map((user) => `
              <tr>
                <td class="select-col">${checkboxCell("users", user.id)}</td>
                <td><strong>${escapeHtml(user.display_name)}</strong><div class="muted mono">${escapeHtml(user.username)}</div></td>
                <td>${escapeHtml(user.email)}</td>
                <td>${escapeHtml(roleDisplayName(user.role))}</td>
                <td><span class="status ${user.is_active ? "active" : "disabled"}">${user.is_active ? t("form.active") : t("form.inactive")}</span></td>
                <td>${formatDate(user.last_login_at)}</td>
                <td><button class="btn small" data-action="edit-user" data-id="${user.id}">${t("action.edit")}</button></td>
              </tr>
            `).join("") || `<tr><td colspan="7"><div class="empty">${t("search.empty")}</div></td></tr>`}
          </tbody>
        </table>
      </div>
      ${pagination("users", pageInfo)}
    </div>
  `;
}

function renderRolesPanel() {
  const filtered = filterRows("roles", state.data.roles, ["name", "description"]);
  const pageInfo = paginate("roles", filtered);
  return `
    <div class="module-pane">
      ${tableToolbar("roles", "", "", filtered.length, `<button class="btn primary small" data-action="add-role">${icon("users")} ${state.lang === "zh" ? "创建角色" : "Create role"}</button>`)}
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>${t("table.role")}</th><th>${t("table.description")}</th><th>${t("table.permissions")}</th><th>${t("table.action")}</th></tr></thead>
          <tbody>
            ${pageInfo.items.map((role) => `
              <tr>
                <td><strong>${escapeHtml(roleDisplayName(role.name))}</strong><div class="muted mono">${escapeHtml(role.name)}</div>${role.system ? `<span class="mini-chip">${state.lang === "zh" ? "系统角色" : "System"}</span>` : ""}</td>
                <td>${escapeHtml(role.description)}</td>
                <td>${role.permissions?.includes("*") ? "*" : escapeHtml((role.permissions || []).slice(0, 8).join(", "))}${(role.permissions || []).length > 8 ? "..." : ""}</td>
                <td>
                  ${role.system
                    ? `<button class="btn small" disabled>${state.lang === "zh" ? "不可编辑" : "Read only"}</button>`
                    : `<button class="btn small" data-action="edit-role" data-id="${role.id}">${t("action.edit")}</button>`}
                </td>
              </tr>
            `).join("") || `<tr><td colspan="4"><div class="empty">${t("search.empty")}</div></td></tr>`}
          </tbody>
        </table>
      </div>
      ${pagination("roles", pageInfo)}
    </div>
  `;
}

function renderAuditRows(scope, rows) {
  const filtered = filterRows(scope, rows, ["actor", "action", "target", "detail", "result"]);
  const pageInfo = paginate(scope, filtered);
  return `
    <div class="module-pane">
      ${tableToolbar(scope, "", "", filtered.length, "", false)}
      <div class="table-wrap">
        <table class="table audit-table">
          <thead><tr><th>${t("table.created")}</th><th>${t("table.actor")}</th><th>${t("table.action")}</th><th>${t("table.target")}</th><th>${t("table.result")}</th><th>${t("table.detail")}</th></tr></thead>
          <tbody>
            ${pageInfo.items.map((audit) => `
              <tr>
                <td>${formatDate(audit.created_at)}</td>
                <td><strong>${escapeHtml(audit.actor)}</strong></td>
                <td><span class="audit-action">${escapeHtml(audit.action)}</span></td>
                <td>${escapeHtml(audit.target)}</td>
                <td><span class="status ${statusClass(audit.result)}">${escapeHtml(audit.result || "success")}</span></td>
                <td class="audit-detail">${escapeHtml(audit.detail)}</td>
              </tr>
            `).join("") || `<tr><td colspan="6"><div class="empty">${t("search.empty")}</div></td></tr>`}
          </tbody>
        </table>
      </div>
      ${pagination(scope, pageInfo)}
    </div>
  `;
}

function permissionAreaLabel(area) {
  const labels = {
    dashboard: state.lang === "zh" ? "概览" : "Overview",
    resources: state.lang === "zh" ? "资源" : "Resources",
    applications: state.lang === "zh" ? "应用" : "Applications",
    environments: state.lang === "zh" ? "应用环境" : "Environments",
    templates: state.lang === "zh" ? "巡检模板" : "Templates",
    tasks: state.lang === "zh" ? "巡检任务" : "Tasks",
    reports: state.lang === "zh" ? "报告" : "Reports",
    issues: state.lang === "zh" ? "问题" : "Issues",
    audit: state.lang === "zh" ? "审计" : "Audit",
    settings: state.lang === "zh" ? "设置" : "Settings",
    users: state.lang === "zh" ? "用户" : "Users",
    roles: state.lang === "zh" ? "角色与权限" : "Roles",
    analysis_rules: state.lang === "zh" ? "知识库" : "Knowledge Base",
    ai_models: state.lang === "zh" ? "模型对接" : "AI Models",
    ai_datasources: state.lang === "zh" ? "数据源集成" : "Data Sources",
    ai_diagnostics: state.lang === "zh" ? "智能诊断" : "Diagnostics",
    ai_analysis: state.lang === "zh" ? "AI 分析" : "AI Analysis",
    ai_knowledge: state.lang === "zh" ? "AI 知识库" : "AI Knowledge",
    ai_assistant: state.lang === "zh" ? "AI 助手" : "AI Assistant",
  };
  return labels[area] || area;
}

function roleDisplayName(roleName) {
  const map = {
    admin: state.lang === "zh" ? "系统管理员" : "System Administrator",
    operator: state.lang === "zh" ? "操作员" : "Operator",
    user: state.lang === "zh" ? "用户" : "User",
  };
  return map[roleName] || roleName || "-";
}

function roleOptions() {
  return (state.data.roles || []).map((role) => [role.name, roleDisplayName(role.name)]);
}

function permissionActionLabel(action) {
  const labels = {
    read: state.lang === "zh" ? "查看" : "Read",
    create: state.lang === "zh" ? "创建" : "Create",
    update: state.lang === "zh" ? "编辑" : "Update",
    delete: state.lang === "zh" ? "删除" : "Delete",
    export: state.lang === "zh" ? "导出" : "Export",
    cancel: state.lang === "zh" ? "取消" : "Cancel",
  };
  return labels[action] || action;
}

function permissionGroups() {
  const permissions = state.data.permissions || [];
  const groups = new Map();
  permissions.forEach((permission) => {
    const [area, action] = String(permission).split(":");
    if (!area || !action) return;
    if (!groups.has(area)) groups.set(area, []);
    groups.get(area).push({ permission, action });
  });
  return [...groups.entries()]
    .sort(([left], [right]) => permissionAreaLabel(left).localeCompare(permissionAreaLabel(right), state.lang === "zh" ? "zh-CN" : "en"))
    .map(([area, items]) => [area, items.sort((a, b) => {
      const order = ["read", "create", "update", "delete", "export", "cancel"];
      return order.indexOf(a.action) - order.indexOf(b.action);
    })]);
}

function rolePermissionTree(role, readonly = false) {
  const selected = new Set(role.permissions || []);
  const all = selected.has("*");
  return `
    <div class="field wide">
      <label>${fieldLabel(t("table.permissions"), true)}</label>
      <div class="permission-tree ${readonly ? "readonly" : ""}">
        ${permissionGroups().map(([area, items]) => {
          const areaSelected = all || items.every((item) => selected.has(item.permission) || selected.has(`${area}:*`));
          return `
            <section class="permission-group">
              <label class="permission-group-head">
                <input type="checkbox" data-permission-area="${escapeHtml(area)}" ${areaSelected ? "checked" : ""} ${readonly ? "disabled" : ""}>
                <strong>${escapeHtml(permissionAreaLabel(area))}</strong>
              </label>
              <div class="permission-items">
                ${items.map((item) => `
                  <label>
                    <input type="checkbox" name="permissions" value="${escapeHtml(item.permission)}" data-permission-item data-area="${escapeHtml(area)}" data-action="${escapeHtml(item.action)}" ${all || selected.has(item.permission) || selected.has(`${area}:*`) ? "checked" : ""} ${readonly ? "disabled" : ""}>
                    <span>${escapeHtml(permissionActionLabel(item.action))}</span>
                  </label>
                `).join("")}
              </div>
            </section>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderExecutionLogs() {
  const rows = (state.data.task_logs || []).map((log) => ({
    ...log,
    actor: "Worker",
    action: log.level,
    target: log.task_name || log.task_id,
    result: log.task_status || log.level,
    detail: log.message,
  }));
  const filtered = filterRows("audit-execution", rows, ["task_id", "task_name", "level", "message", "task_status"]);
  const pageInfo = paginate("audit-execution", filtered);
  return `
    <div class="module-pane">
      ${tableToolbar("audit-execution", "", "", filtered.length, "", false)}
      <div class="table-wrap">
        <table class="table audit-table">
          <thead><tr><th>${t("table.created")}</th><th>${t("table.task")}</th><th>${t("audit.level")}</th><th>${t("table.status")}</th><th>${t("audit.message")}</th></tr></thead>
          <tbody>
            ${pageInfo.items.map((log) => `
              <tr>
                <td>${formatDate(log.created_at)}</td>
                <td><strong>${escapeHtml(log.task_name || "-")}</strong><div class="muted mono">${escapeHtml(log.task_id)}</div></td>
                <td><span class="audit-action">${escapeHtml(String(log.level || "").toUpperCase())}</span></td>
                <td><span class="status ${statusClass(log.task_status || log.level)}">${escapeHtml(log.task_status || log.level || "-")}</span></td>
                <td class="audit-detail">${escapeHtml(log.message)}</td>
              </tr>
            `).join("") || `<tr><td colspan="5"><div class="empty">${t("search.empty")}</div></td></tr>`}
          </tbody>
        </table>
      </div>
      ${pagination("audit-execution", pageInfo)}
    </div>
  `;
}

function renderAudit() {
  state.tabs.audit = state.tabs.audit || "login";
  const loginRows = state.data.audits.filter((item) => item.action === "login");
  const operationRows = state.data.audits.filter((item) => item.action !== "login");
  const panels = {
    login: () => renderAuditRows("audit-login", loginRows),
    operation: () => renderAuditRows("audit-operation", operationRows),
    execution: renderExecutionLogs,
  };
  return `
    <section class="panel page-panel">
      <div class="panel-head tab-head">
        ${subnav("audit", [
          ["login", t("audit.login"), loginRows.length],
          ["operation", t("audit.operation"), operationRows.length],
          ["execution", t("audit.execution"), (state.data.task_logs || []).length],
        ])}
      </div>
      ${(panels[state.tabs.audit] || panels.login)()}
    </section>
  `;
}

function renderNotificationsPanel() {
  const filtered = filterRows("notifications", state.data.notifications, ["name", "type"]);
  const pageInfo = paginate("notifications", filtered);
  return `
    <div class="module-pane">
      ${tableToolbar("notifications", "", "", filtered.length, "", false)}
      <div class="audit-list compact-list">
        ${pageInfo.items.map((channel) => `<div class="audit-item"><strong>${escapeHtml(channel.name)}</strong><small>${escapeHtml(channel.type.toUpperCase())} / ${channel.enabled ? t("label.enabled") : t("label.disabled")}</small></div>`).join("") || `<div class="empty">${t("search.empty")}</div>`}
      </div>
      ${pagination("notifications", pageInfo)}
    </div>
  `;
}

function renderResourceTypesPanel() {
  const filtered = filterRows("resource-types", resourceTypes(), ["key", "name", "description", "default_port"]);
  const pageInfo = paginate("resource-types", filtered);
  return `
    <div class="module-pane">
      ${tableToolbar("resource-types", "", "", filtered.length, `<button class="btn primary small" data-action="add-resource-type">${t("action.addResourceType")}</button>`)}
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th class="select-col">${selectAllCell("resource-types", pageInfo.items)}</th><th>${t("table.resourceType")}</th><th>${t("form.defaultPort")}</th><th>${t("table.description")}</th><th>${t("table.status")}</th><th>${t("table.action")}</th></tr></thead>
          <tbody>
            ${pageInfo.items.map((item) => `
              <tr>
                <td class="select-col">${checkboxCell("resource-types", item.id)}</td>
                <td><strong>${escapeHtml(item.name)}</strong><div class="muted mono">${escapeHtml(item.key)}</div></td>
                <td class="mono">${escapeHtml(item.default_port)}</td>
                <td>${escapeHtml(item.description || "-")}</td>
                <td><span class="status ${item.enabled ? "success" : "disabled"}">${item.enabled ? t("label.enabled") : t("label.disabled")}</span></td>
                <td><button class="btn small" data-action="edit-resource-type" data-id="${item.id}">${t("action.edit")}</button></td>
              </tr>
            `).join("") || `<tr><td colspan="6"><div class="empty">${t("search.empty")}</div></td></tr>`}
          </tbody>
        </table>
      </div>
      ${pagination("resource-types", pageInfo)}
    </div>
  `;
}

function renderSiteSettingsPanel() {
  const site = siteSettings();
  return `
    <div class="module-pane">
      <form class="site-settings-form" id="site-settings-form">
        <div class="site-preview">
          ${logoMark("small")}
          <div>
            <strong>${escapeHtml(site.site_name)}</strong>
            <span>${escapeHtml(site.site_subtitle)}</span>
          </div>
        </div>
        <div class="form-grid compact-form">
          ${fieldInput(t("form.siteName"), "site_name", site.site_name, "text", "required")}
          ${fieldInput(t("form.siteSubtitle"), "site_subtitle", site.site_subtitle, "text", "required")}
          ${fieldInput(t("form.iconText"), "icon_text", site.icon_text, "text", "required maxlength=\"8\"")}
          ${fieldInput(t("form.iconColor"), "icon_color", site.icon_color, "color", "required")}
          <div class="field wide">
            <label for="site-icon-image">${t("form.iconImage")}</label>
            <input class="input" id="site-icon-image" type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp">
            <input type="hidden" name="icon_image" value="${escapeHtml(site.icon_image || "")}">
            <div class="field-help">${t("form.iconImageHelp")}</div>
            <div class="toolbar">
              <button class="btn small" type="button" data-action="clear-site-icon">${t("action.clearIcon")}</button>
            </div>
          </div>
        </div>
        <div class="modal-actions embedded">
          <button class="btn primary" type="submit">${t("action.save")}</button>
        </div>
      </form>
    </div>
  `;
}

function renderSettings() {
  if (!state.tabs.settings || ["audit", "inspection"].includes(state.tabs.settings)) {
    state.tabs.settings = "site";
    localStorage.setItem("opsradar_tab_settings", state.tabs.settings);
  }
  const panels = {
    site: renderSiteSettingsPanel,
    resourceTypes: renderResourceTypesPanel,
    notifications: renderNotificationsPanel,
    users: renderUsersPanel,
    roles: renderRolesPanel,
  };
  return `
    <section class="panel page-panel">
      <div class="panel-head tab-head">
        ${subnav("settings", [
          ["site", t("settings.site")],
          ["resourceTypes", t("settings.resourceTypes"), resourceTypes().length],
          ["notifications", t("settings.notifications")],
          ["users", t("settings.users"), state.data.users.length],
          ["roles", t("roles.title"), state.data.roles.length],
        ])}
      </div>
      ${(panels[state.tabs.settings] || panels.site)()}
    </section>
  `;
}

function simpleTable(title, headers, rows) {
  return `
    <section class="panel">
      <div class="panel-head"><div><h2 class="panel-title">${escapeHtml(title)}</h2><div class="panel-subtitle">${t("settings.adminRecords")}</div></div></div>
      <div class="table-wrap">
        <table class="table">
          <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
          <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
      </div>
    </section>
  `;
}

function fieldHelpTip(help = "") {
  if (!help) return "";
  return `<span class="field-help-tip" tabindex="0" aria-label="${escapeHtml(help)}" data-tip="${escapeHtml(help)}">?</span>`;
}

function fieldLabel(label, required = false, help = "") {
  return `<span class="label-text">${escapeHtml(label)}${required ? `<span class="required-mark">*</span>` : ""}${fieldHelpTip(help)}</span>`;
}

function isRequiredAttr(attrs = "") {
  return /\brequired\b/.test(String(attrs));
}

function fieldInput(label, name, value = "", type = "text", attrs = "", help = "") {
  return `
    <div class="field">
      <label for="modal-${name}">${fieldLabel(label, isRequiredAttr(attrs), help)}</label>
      <input class="input" id="modal-${name}" name="${name}" type="${type}" value="${escapeHtml(value)}" ${attrs}>
    </div>
  `;
}

function fieldTextarea(label, name, value = "", attrs = "", help = "") {
  return `
    <div class="field wide">
      <label for="modal-${name}">${fieldLabel(label, isRequiredAttr(attrs), help)}</label>
      <textarea class="textarea" id="modal-${name}" name="${name}" ${attrs}>${escapeHtml(value)}</textarea>
    </div>
  `;
}

function fieldSelect(label, name, value, options, attrs = "", help = "") {
  return `
    <div class="field">
      <label for="modal-${name}">${fieldLabel(label, isRequiredAttr(attrs), help)}</label>
      <select class="select" id="modal-${name}" name="${name}" ${attrs}>
        ${options.map((option) => {
          const optionValue = Array.isArray(option) ? option[0] : option;
          const optionLabel = Array.isArray(option) ? option[1] : option;
          return `<option value="${escapeHtml(optionValue)}" ${String(optionValue) === String(value ?? "") ? "selected" : ""}>${escapeHtml(optionLabel)}</option>`;
        }).join("")}
      </select>
    </div>
  `;
}

function aiModelPicker(value = "") {
  const label = state.lang === "zh" ? "模型名称" : "Model Name";
  return `
    <div class="field wide ai-model-picker">
      <label for="modal-model_name">${fieldLabel(label, false, t("ai.modelFetchHint"))}</label>
      <div class="inline-field-action">
        <input class="input" id="modal-model_name" name="model_name" type="text" value="${escapeHtml(value)}" autocomplete="off">
        <button class="btn" type="button" data-action="discover-ai-models">${t("ai.fetchModels")}</button>
      </div>
      <div class="ai-model-options" id="ai-model-options" hidden></div>
      <div class="field-note ai-model-status" id="ai-model-discovery-note" aria-live="polite">${escapeHtml(t("ai.modelFetchHint"))}</div>
    </div>
  `;
}

function fieldRadioGroup(label, name, value, options, required = false) {
  return `
    <div class="field task-radio-field">
      <label>${fieldLabel(label, required)}</label>
      <div class="choice-row">
        ${options.map(([optionValue, optionLabel]) => `
          <label class="choice-pill">
            <input type="radio" name="${name}" value="${escapeHtml(optionValue)}" ${String(optionValue) === String(value) ? "checked" : ""}>
            <span>${escapeHtml(optionLabel)}</span>
          </label>
        `).join("")}
      </div>
    </div>
  `;
}

function fieldCheckboxGroup(label, name, options, emptyText = "", required = false) {
  return `
    <div class="field wide">
      ${label ? `<label>${fieldLabel(label, required)}</label>` : ""}
      <div class="check-card-grid">
        ${options.length ? options.map((option) => `
          <label class="check-card">
            <input type="checkbox" name="${name}" value="${escapeHtml(option.value)}" ${option.checked ? "checked" : ""}>
            <span>
              <strong>${escapeHtml(option.label)}</strong>
              ${option.meta ? `<small>${escapeHtml(option.meta)}</small>` : ""}
            </span>
          </label>
        `).join("") : `<div class="empty compact-empty">${escapeHtml(emptyText)}</div>`}
      </div>
    </div>
  `;
}

function fieldResourceCheckboxGroup(label, name, options, emptyText = "", required = false) {
  return `
    <div class="field wide resource-picker-field">
      ${label ? `<label>${fieldLabel(label, required)}</label>` : ""}
      <label class="table-search resource-picker-search">
        ${icon("search")}
        <input data-resource-picker-filter="${name}" placeholder="${state.lang === "zh" ? "搜索资源名称、IP、类型、状态..." : "Search resource name, IP, type, status..."}">
      </label>
      <div class="resource-picker-meta">${state.lang === "zh" ? `共 ${options.length} 个资源，可搜索后勾选` : `${options.length} resources, search to select`}</div>
      <div class="check-card-grid resource-picker-grid">
        ${options.length ? options.map((option) => `
          <label class="check-card" data-resource-option="${escapeHtml([option.label, option.meta].join(" ").toLowerCase())}">
            <input type="checkbox" name="${name}" value="${escapeHtml(option.value)}" ${option.checked ? "checked" : ""}>
            <span>
              <strong>${escapeHtml(option.label)}</strong>
              ${option.meta ? `<small>${escapeHtml(option.meta)}</small>` : ""}
            </span>
          </label>
        `).join("") : `<div class="empty compact-empty">${escapeHtml(emptyText)}</div>`}
      </div>
    </div>
  `;
}

function fieldEnvironmentCardGroup(label, name, options, emptyText = "", required = false) {
  return `
    <div class="field wide resource-picker-field scope-panel scope-environment-panel">
      ${label ? `<label>${fieldLabel(label, required)}</label>` : ""}
      <label class="table-search resource-picker-search">
        ${icon("search")}
        <input data-resource-picker-filter="${name}" placeholder="${state.lang === "zh" ? "搜索应用、环境、负责人..." : "Search application, environment, owner..."}">
      </label>
      <div class="resource-picker-meta">${state.lang === "zh" ? `共 ${options.length} 个应用环境，可搜索后选择` : `${options.length} environments, search to select`}</div>
      <div class="check-card-grid resource-picker-grid">
        ${options.length ? options.map((option) => `
          <label class="check-card" data-resource-option="${escapeHtml([option.label, option.meta].join(" ").toLowerCase())}">
            <input type="radio" name="${name}" value="${escapeHtml(option.value)}" ${option.checked ? "checked" : ""}>
            <span>
              <strong>${escapeHtml(option.label)}</strong>
              ${option.meta ? `<small>${escapeHtml(option.meta)}</small>` : ""}
            </span>
          </label>
        `).join("") : `<div class="empty compact-empty">${escapeHtml(emptyText)}</div>`}
      </div>
    </div>
  `;
}

function fieldServiceCheckboxGroup(label, name, options, emptyText = "", required = false) {
  return `
    <div class="field wide resource-picker-field scope-panel scope-service-panel">
      ${label ? `<label>${fieldLabel(label, required)}</label>` : ""}
      <label class="table-search resource-picker-search">
        ${icon("search")}
        <input data-resource-picker-filter="${name}" placeholder="${state.lang === "zh" ? "搜索服务名称、容器、端口、所属资产..." : "Search service, container, port, host..."}">
      </label>
      <div class="resource-picker-meta">${state.lang === "zh" ? `共 ${options.length} 个服务，可搜索后勾选` : `${options.length} services, search to select`}</div>
      <div class="check-card-grid resource-picker-grid">
        ${options.length ? options.map((option) => `
          <label class="check-card" data-resource-option="${escapeHtml([option.label, option.meta].join(" ").toLowerCase())}">
            <input type="checkbox" name="${name}" value="${escapeHtml(option.value)}" ${option.checked ? "checked" : ""}>
            <span>
              <strong>${escapeHtml(option.label)}</strong>
              ${option.meta ? `<small>${escapeHtml(option.meta)}</small>` : ""}
            </span>
          </label>
        `).join("") : `<div class="empty compact-empty">${escapeHtml(emptyText)}</div>`}
      </div>
    </div>
  `;
}

function fieldGroupedCheckboxGroup(label, name, options, emptyText = "", required = false) {
  const order = ["os", "postgresql", "mysql", "redis", "container", "middleware"];
  const grouped = order
    .map((category) => ({
      category,
      label: templateCategoryLabel(category),
      items: options.filter((option) => option.category === category),
    }))
    .filter((group) => group.items.length);
  return `
    <div class="field wide">
      ${label ? `<label>${fieldLabel(label, required)}</label>` : ""}
      ${grouped.length ? `
        <div class="check-category-stack">
          ${grouped.map((group) => `
            <details class="check-category-block" ${group.items.some((item) => item.checked) ? "open" : ""}>
              <summary class="check-category-head">
                <span class="check-category-title">
                  <strong>${escapeHtml(group.label)}</strong>
                  <small>${group.items.length}</small>
                </span>
                <button class="btn micro" type="button" data-action="toggle-check-group" data-name="${escapeHtml(name)}" data-values="${escapeHtml(group.items.map((item) => item.value).join("|"))}">${group.items.every((item) => item.checked) ? t("action.clearSelection") : t("action.selectAll")}</button>
              </summary>
              <div class="check-card-grid compact">
                ${group.items.map((option) => `
                  <label class="check-card">
                    <input type="checkbox" name="${name}" value="${escapeHtml(option.value)}" ${option.checked ? "checked" : ""}>
                    <span>
                      <strong>${escapeHtml(option.label)}</strong>
                      ${option.meta ? `<small>${escapeHtml(option.meta)}</small>` : ""}
                    </span>
                  </label>
                `).join("")}
              </div>
            </details>
          `).join("")}
        </div>
      ` : `<div class="empty compact-empty">${escapeHtml(emptyText)}</div>`}
    </div>
  `;
}

function collectTaskCreateDraft(form) {
  const formData = new FormData(form);
  const values = Object.fromEntries(formData.entries());
  return {
    ...values,
    resource_ids: formData.getAll("resource_ids"),
    service_ids: formData.getAll("service_ids"),
    item_ids: formData.getAll("item_ids"),
    notify_channels: formData.getAll("notify_channels"),
    reminder_rules: formData.getAll("reminder_rules"),
  };
}

function applyBoundRulesToTaskForm(form, { replace = false } = {}) {
  if (!form || form.dataset.type !== "task-create") return;
  const draft = collectTaskCreateDraft(form);
  const boxes = [...form.querySelectorAll('input[name="item_ids"]')];
  if (!replace && boxes.some((box) => box.checked)) {
    state.taskCreateDraft = draft;
    return;
  }
  const ruleIds = autoRuleIdsForTaskDraft(draft);
  if (!ruleIds.size) return;
  boxes.forEach((box) => {
    box.checked = ruleIds.has(box.value);
  });
  state.taskCreateDraft = collectTaskCreateDraft(form);
}

function fieldInlineChecks(label, name, options) {
  return `
    <div class="field wide">
      <label>${label}</label>
      <div class="inline-check-row">
        ${options.map((option) => `
          <label class="inline-check">
            <input type="checkbox" name="${name}" value="${escapeHtml(option.value)}" ${option.checked ? "checked" : ""}>
            <span>${escapeHtml(option.label)}</span>
          </label>
        `).join("")}
      </div>
    </div>
  `;
}

function fieldSwitchGroup(label, name, options) {
  return `
    <div class="field wide">
      <label>${label}</label>
      <div class="switch-list">
        ${options.map((option) => `
          <label class="switch-row">
            <input type="checkbox" name="${name}" value="${escapeHtml(option.value)}" ${option.checked ? "checked" : ""}>
            <span></span>
            <strong>${escapeHtml(option.label)}</strong>
          </label>
        `).join("")}
      </div>
    </div>
  `;
}

function formSection(title, body) {
  return `<section class="task-form-section"><h3>${escapeHtml(title)}</h3><div class="task-form-grid">${body}</div></section>`;
}

function renderModal() {
  if (!state.modal) return "";
  const { type, id } = state.modal;
  if (type === "alert") return renderAlertModal(state.modal);
  if (type === "delete-confirm") return renderDeleteConfirmModal(state.modal);
  const config = modalConfig(type, id);
  if (!config) return "";
  return `
    <div class="modal-backdrop">
      <section class="modal-panel ${config.panelClass || ""}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-head">
          <div>
            <h2 class="panel-title" id="modal-title">${escapeHtml(config.title)}</h2>
            <div class="panel-subtitle">${escapeHtml(config.subtitle)}</div>
          </div>
          <button class="icon-button" data-action="close-modal" title="${t("action.cancel")}">×</button>
        </div>
        <form id="edit-form" data-type="${type}" data-id="${id}">
          <div class="form-grid ${config.formClass || ""}">${config.body}</div>
          <div class="modal-error" id="modal-error"></div>
          <div class="modal-actions">
            <button class="btn" type="button" data-action="close-modal">${t("action.cancel")}</button>
            ${config.extraActions || ""}
            <button class="btn primary" type="submit">${escapeHtml(config.submitLabel || t("action.save"))}</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderAlertModal(modal) {
  const tone = modal.tone || (modal.icon === "checklist" ? "success" : "danger");
  return `
    <div class="modal-backdrop alert-backdrop ${tone === "success" ? "success" : "danger"}">
      <section class="modal-panel alert-modal" role="alertdialog" aria-modal="true" aria-labelledby="alert-modal-title">
        <div class="alert-modal-icon">${icon(modal.icon || "alert")}</div>
        <div class="alert-modal-copy">
          <h2 id="alert-modal-title">${escapeHtml(modal.title || t("alert.loginTitle"))}</h2>
          <p>${escapeHtml(modal.message || "")}</p>
        </div>
        <div class="modal-actions alert-actions">
          ${(modal.actions || []).map((action) => `
            <button class="btn ${action.tone === "primary" || action.tone === "success" ? "primary" : ""}" type="button" data-action="${escapeHtml(action.action)}">${escapeHtml(action.label)}</button>
          `).join("") || `<button class="btn primary" type="button" data-action="close-modal">${t("action.ok")}</button>`}
        </div>
      </section>
    </div>
  `;
}

function deleteScopeLabel(scope) {
  const map = {
    resources: t("environments.resources"),
    "resource-types": t("settings.resourceTypes"),
    users: t("settings.users"),
    roles: t("roles.title"),
    tasks: t("nav.tasks"),
    reports: t("nav.reports"),
    issues: t("reports.issues"),
    environments: t("nav.environments"),
    applications: t("environments.applications"),
    "discovered-services": state.lang === "zh" ? "发现服务" : "Discovered services",
    "analysis-rules": t("ai.knowledge"),
    "ai-chat-sessions": state.lang === "zh" ? "AI 会话" : "AI Sessions",
  };
  return map[scope] || scope;
}

function renderDeleteConfirmModal(modal) {
  const count = modal.ids?.length || 0;
  return `
    <div class="modal-backdrop delete-backdrop">
      <section class="modal-panel delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
        <div class="delete-modal-icon">${icon("trash")}</div>
        <div class="delete-modal-copy">
          <h2 id="delete-modal-title">${t("confirm.deleteTitle")}</h2>
          <p>${t("confirm.deleteSubtitle")}</p>
        </div>
        <div class="delete-modal-meta">
          <span><small>${t("confirm.deleteScope")}</small><strong>${escapeHtml(deleteScopeLabel(modal.scope))}</strong></span>
          <span><small>${t("confirm.deleteCount")}</small><strong>${escapeHtml(count)}</strong></span>
        </div>
        <div class="delete-modal-warning">${formatTemplate(t("confirm.deleteSelected"), { count })}</div>
        <div class="modal-actions delete-actions">
          <button class="btn" type="button" data-action="close-modal">${t("action.cancel")}</button>
          <button class="btn danger solid" type="button" data-action="confirm-delete">${icon("trash")} ${t("action.confirmDelete")}</button>
        </div>
      </section>
    </div>
  `;
}

function taskWizardSteps() {
  return [
    [1, state.lang === "zh" ? "基本信息" : "Basic"],
    [2, state.lang === "zh" ? "巡检范围" : "Scope"],
    [3, state.lang === "zh" ? "执行配置" : "Execution"],
    [4, state.lang === "zh" ? "巡检指标" : "Metrics"],
  ];
}

function taskWizardHeader() {
  return `
    <div class="task-wizard-steps">
      ${taskWizardSteps().map(([step, label]) => `
        <button class="task-wizard-step ${state.taskCreateStep === step ? "active" : ""}" type="button" data-action="task-step" data-step="${step}">
          <small>${state.lang === "zh" ? `第 ${step} 步` : `Step ${step}`}</small>
          <strong>${escapeHtml(label)}</strong>
        </button>
      `).join("")}
    </div>
  `;
}

function taskWizardPane(step, title, body) {
  return `<div class="task-wizard-pane ${state.taskCreateStep === step ? "active" : ""}" data-step="${step}">${formSection(title, body)}</div>`;
}

function modalConfig(type, id) {
  if (type === "task-create") {
    const isNew = id === "new";
    const editingPlan = !isNew && String(id).startsWith("plan:");
    const task = isNew ? null : editingPlan ? state.data.cron_plans.find((item) => item.id === String(id).slice(5)) : state.data.tasks.find((item) => item.id === id);
    const config = task?.config || task?.notification_config || {};
    const defaults = isNew ? (state.taskCreateDefaults || {}) : {};
    const draft = state.taskCreateDraft || {};
    const selectedEnvironmentId = draft.environment_id || task?.environment_id || config.environment_id || defaults.environment_id || "";
    const selectedResourceIds = new Set(draft.resource_ids || task?.resource_ids || defaults.resource_ids || []);
    const selectedServiceIds = new Set(draft.service_ids || config.service_ids || defaults.service_ids || []);
    const executionMode = editingPlan ? "periodic" : draft.execution_mode || config.execution_mode || "once";
    const inspectionScope = draft.inspection_scope || defaults.inspection_scope || config.inspection_scope || (task?.environment_id ? "environment" : "asset");
    const autoItemIds = autoRuleIdsForTaskDraft({ ...draft, environment_id: selectedEnvironmentId, inspection_scope: inspectionScope, resource_ids: [...selectedResourceIds], service_ids: [...selectedServiceIds] });
    const selectedItemIds = new Set((draft.item_ids && draft.item_ids.length ? draft.item_ids : task?.item_ids || defaults.item_ids || [...autoItemIds]));
    const selectedNotify = new Set(draft.notify_channels || config.notify_channels || []);
    const selectedReminders = new Set(draft.reminder_rules || config.reminder_rules || []);
    const selectedTaskTags = draft.task_tags ?? (Array.isArray(config.task_tags) ? config.task_tags.join("，") : "");
    const environmentCardOptions = environments().map((env) => ({
      value: env.id,
      label: `${displayApplicationName(env.application_name)} / ${env.name}`,
      meta: `${env.env_type || "-"} / ${env.owner || "SRE"} / ${state.lang === "zh" ? "资源" : "resources"} ${(env.resources || []).length}`,
        checked: selectedEnvironmentId === env.id,
    }));
    const resourceOptions = (state.data.resources || [])
      .filter((resource) => !(resource.extra_params || {}).parent_resource_id)
      .map((resource) => ({
        value: resource.id,
        label: resource.name,
        meta: `${resourceTypeLabel(resource.type)} / ${resource.ip}:${resource.port} / ${statusText(resource.status)}`,
        checked: selectedResourceIds.has(resource.id),
      }));
    const serviceOptions = (state.data.discovered_services || [])
      .filter((service) => service.service_resource_id)
      .map((service) => ({
        value: service.id,
        label: service.name,
        meta: `${serviceTypeLabel(service.discovery_type)} / ${service.ip}:${service.port || "-"} / ${statusText(service.status)}`,
        checked: selectedServiceIds.has(service.id),
      }));
    const itemOptions = (state.data.inspection_items || [])
      .filter((item) => item.enabled !== false)
      .map((item) => ({
        value: item.id,
        label: item.name,
        category: item.category,
        meta: item.command_type,
        checked: selectedItemIds.has(item.id),
      }));
    const userOptions = (state.data.users || []).map((user) => [user.id, user.display_name || user.username]);
    return {
      title: isNew ? t("modal.createTask") : t("modal.editTask"),
      subtitle: "",
      panelClass: "task-create-modal",
      formClass: "task-create-form",
      submitLabel: isNew ? t("tasks.new") : t("action.save"),
      body: [
        taskWizardHeader(),
        taskWizardPane(1, t("form.basicInfo"), [
          fieldInput(t("form.taskName"), "name", draft.name ?? task?.name ?? defaults.name ?? "", "text", "required"),
          fieldInput(t("form.taskTags"), "task_tags", selectedTaskTags, "text", `placeholder="${state.lang === "zh" ? "如：生产环境、核心系统、数据库，逗号分隔" : "e.g. production, core, database"}"`),
          fieldTextarea(t("form.taskDescription"), "description", draft.description ?? task?.description ?? config.description ?? "", `placeholder="${state.lang === "zh" ? "填写任务背景、检查目标或注意事项" : "Task background, target or notes"}"`),
        ].join("")),
        taskWizardPane(2, state.lang === "zh" ? "巡检范围" : "Inspection Scope", [
          fieldRadioGroup(state.lang === "zh" ? "巡检范围" : "Scope", "inspection_scope", inspectionScope, [
            ["environment", state.lang === "zh" ? "按环境" : "By environment"],
            ["asset", state.lang === "zh" ? "按资产" : "By asset"],
            ["service", state.lang === "zh" ? "按服务" : "By service"],
          ], true),
          fieldEnvironmentCardGroup(state.lang === "zh" ? "应用环境" : "Application Environment", "environment_id", environmentCardOptions, state.lang === "zh" ? "暂无应用环境，请先在资源中心创建应用环境。" : "No application environments. Create one in Resource Center first.", true),
          `<div class="scope-panel scope-asset-panel">${fieldResourceCheckboxGroup(t("form.targetResources"), "resource_ids", resourceOptions, t("form.noResources"), true)}</div>`,
          fieldServiceCheckboxGroup(state.lang === "zh" ? "目标服务" : "Target services", "service_ids", serviceOptions, state.lang === "zh" ? "暂无可选服务。服务会从资源列表中主机展开区域的 Docker / Compose / Systemd 发现结果里展示。" : "No services available. Services will appear from host-level Docker / Compose / Systemd discovery.", true),
        ].join("")),
        taskWizardPane(3, t("form.executionConfig"), [
          fieldRadioGroup(t("form.executionMode"), "execution_mode", executionMode, [["once", t("form.once")], ["periodic", t("form.periodic")]], true),
          `<div class="periodic-only">${[
            fieldRadioGroup(t("form.scheduleRule"), "schedule_rule", draft.schedule_rule || config.schedule_rule || "daily", [["daily", t("form.daily")], ["weekly", t("form.weekly")], ["monthly", t("form.monthly")]], true),
            fieldInput(t("form.scheduleTime"), "schedule_time", draft.schedule_time || config.schedule_time || "09:00", "time", "required"),
            fieldInput(t("form.effectiveStart"), "effective_start", draft.effective_start ?? config.effective_start ?? "", "date"),
            fieldInput(t("form.effectiveEnd"), "effective_end", draft.effective_end ?? config.effective_end ?? "", "date"),
            fieldSelect(t("form.deadlinePolicy"), "deadline_policy", draft.deadline_policy || config.deadline_policy || "1h", [["1h", state.lang === "zh" ? "1 小时内" : "Within 1 hour"], ["4h", state.lang === "zh" ? "4 小时内" : "Within 4 hours"], ["24h", state.lang === "zh" ? "24 小时内" : "Within 24 hours"]], "required"),
            fieldSelect(t("form.retryPolicy"), "retry_policy", draft.retry_policy || config.retry_policy || "retry_once", [["none", state.lang === "zh" ? "不重试" : "No retry"], ["retry_once", state.lang === "zh" ? "自动重试 1 次" : "Retry once"], ["retry_twice", state.lang === "zh" ? "自动重试 2 次" : "Retry twice"]], "required"),
          ].join("")}</div>`,
          fieldSelect(t("form.owner"), "owner_id", draft.owner_id || task?.created_by || config.owner_id || state.user?.id || "", userOptions.length ? userOptions : [[state.user?.id || "", state.user?.display_name || "Admin"]], "required").replace('class="field"', 'class="field wide"'),
          fieldInlineChecks(t("form.notifyChannels"), "notify_channels", [
            { value: "site", label: state.lang === "zh" ? "站内通知" : "In-app", checked: selectedNotify.has("site") },
            { value: "email", label: state.lang === "zh" ? "邮件" : "Email", checked: selectedNotify.has("email") },
            { value: "sms", label: state.lang === "zh" ? "短信" : "SMS", checked: selectedNotify.has("sms") },
          ]),
          fieldSwitchGroup(t("form.reminderRules"), "reminder_rules", [
            { value: "before_15m", label: state.lang === "zh" ? "任务开始前 15 分钟提醒" : "15 minutes before start", checked: selectedReminders.has("before_15m") },
            { value: "on_exception", label: state.lang === "zh" ? "任务异常时立即通知" : "Notify on exception", checked: selectedReminders.has("on_exception") },
            { value: "auto_assign_overdue", label: state.lang === "zh" ? "逾期自动催办" : "Auto remind when overdue", checked: selectedReminders.has("auto_assign_overdue") },
          ]),
        ].join("")),
        taskWizardPane(4, state.lang === "zh" ? "巡检指标" : "Inspection Metrics", [
          `<div class="field wide"><div class="modal-hint">${state.lang === "zh" ? "按环境创建时可留空，系统会根据应用环境绑定的规则集、资产类型和服务发现标签自动匹配；也可以在这里手动勾选覆盖本次任务。" : "For environment-scoped tasks, leave this empty to auto-match environment rule sets by resource type and service discovery tags. You can also select items manually for this task."}</div></div>`,
          fieldGroupedCheckboxGroup("", "item_ids", itemOptions, t("form.noInspectionItems"), false),
          fieldTextarea(t("form.note"), "note", draft.note ?? config.note ?? "", `maxlength="300" placeholder="${state.lang === "zh" ? "请输入备注信息，如任务背景、注意事项等" : "Optional note"}"`),
        ].join("")),
      ].join(""),
      extraActions: `
        <button class="btn" type="button" data-action="task-step" data-step="${Math.max(1, state.taskCreateStep - 1)}" ${state.taskCreateStep <= 1 ? "disabled" : ""}>${t("action.prev")}</button>
        <button class="btn" type="button" data-action="task-step" data-step="${Math.min(4, state.taskCreateStep + 1)}" ${state.taskCreateStep >= 4 ? "disabled" : ""}>${t("action.next")}</button>
      `,
    };
  }
  if (type === "environment-rules") {
    const env = environments().find((item) => item.id === id);
    if (!env) return null;
    const selected = new Set(env.rule_set_ids || []);
    const ruleOptions = (state.data.rule_sets || [])
      .filter((ruleSet) => ruleSet.enabled !== false)
      .map((ruleSet) => ({
        value: ruleSet.id,
        label: ruleSet.name,
        meta: `${ruleSetTargetLabel(ruleSet)} / ${(ruleSet.item_ids || ruleSet.items || []).length} 项`,
        checked: selected.has(ruleSet.id),
      }));
    return {
      title: state.lang === "zh" ? "绑定规则策略" : "Bind Rule Policy",
      subtitle: environmentName(id),
      submitLabel: t("action.save"),
      body: [
        `<div class="field wide"><div class="modal-hint">${state.lang === "zh" ? "规则集绑定到应用环境。创建巡检任务时，系统会按资产类型、服务发现类型和排除条件自动匹配，只有命中的规则才会执行。" : "Rule sets are bound to the application environment. Tasks automatically match them by resource type, discovered service type and exclusions."}</div></div>`,
        fieldCheckboxGroup(state.lang === "zh" ? "规则集" : "Rule sets", "rule_set_ids", ruleOptions, state.lang === "zh" ? "暂无规则集，请先在巡检模板中维护规则集。" : "No rule sets available.", true),
      ].join(""),
    };
  }
  if (type === "rule-set") {
    const isNew = id === "new";
    const ruleSet = isNew ? {
      name: "",
      description: "",
      target_kind: "resource",
      resource_types: [],
      service_types: [],
      conditions: {},
      exclude_keywords: [],
      item_ids: [],
      enabled: true,
    } : (state.data.rule_sets || []).find((item) => item.id === id);
    if (!ruleSet) return null;
    const selected = new Set(ruleSet.item_ids || ruleSet.items || []);
    const itemOptions = (state.data.inspection_items || [])
      .filter((item) => item.enabled !== false)
      .map((item) => ({
        value: item.id,
        label: item.name,
        category: item.category,
        meta: `${templateCategoryLabel(item.category)} / ${item.command_type}`,
        checked: selected.has(item.id),
      }));
    return {
      title: isNew ? (state.lang === "zh" ? "新增规则集" : "Add Rule Set") : (state.lang === "zh" ? "编辑规则集" : "Edit Rule Set"),
      subtitle: state.lang === "zh" ? "规则集会绑定到应用环境，执行时自动匹配资产和服务。" : "Rule sets bind to application environments and auto-match resources/services at runtime.",
      submitLabel: t("action.save"),
      body: [
        fieldInput(state.lang === "zh" ? "规则集名称" : "Rule set name", "name", ruleSet.name || "", "text", "required"),
        fieldSelect(state.lang === "zh" ? "适用对象" : "Target kind", "target_kind", ruleSet.target_kind || "resource", [["resource", state.lang === "zh" ? "资产" : "Resource"], ["service", state.lang === "zh" ? "发现服务" : "Discovered service"], ["all", state.lang === "zh" ? "全部" : "All"]], "required"),
        fieldInput(state.lang === "zh" ? "资源类型" : "Resource types", "resource_types", (ruleSet.resource_types || []).join(","), "text", `placeholder="host,mysql,redis,container"`),
        fieldInput(state.lang === "zh" ? "服务发现类型" : "Service discovery types", "service_types", (ruleSet.service_types || []).join(","), "text", `placeholder="docker_container,docker_compose,systemd"`),
        fieldInput(state.lang === "zh" ? "排除关键字" : "Exclude keywords", "exclude_keywords", (ruleSet.exclude_keywords || []).join(","), "text", `placeholder="${state.lang === "zh" ? "如：debug,temp；逗号分隔" : "e.g. debug,temp; comma separated"}"`),
        fieldTextarea(state.lang === "zh" ? "描述" : "Description", "description", ruleSet.description || ""),
        fieldInlineChecks(state.lang === "zh" ? "状态" : "Status", "enabled", [{ value: "true", label: state.lang === "zh" ? "启用" : "Enabled", checked: ruleSet.enabled !== false }]),
        fieldGroupedCheckboxGroup(state.lang === "zh" ? "包含规则项" : "Inspection items", "item_ids", itemOptions, t("form.noInspectionItems"), false),
      ].join(""),
    };
  }
  if (type === "service-discovery") {
    const resource = (state.data.resources || []).find((item) => item.id === id);
    if (!resource) return null;
    const typeChecks = [
      { value: "docker_container", label: "Docker 容器", checked: true },
      { value: "docker_compose", label: "Docker Compose", checked: true },
      { value: "systemd", label: "Systemd 服务", checked: false },
    ];
    return {
      title: state.lang === "zh" ? "服务发现配置" : "Service Discovery",
      subtitle: resource.name,
      submitLabel: state.lang === "zh" ? "启动" : "Start",
      body: [
        `<div class="field wide"><div class="modal-hint">${state.lang === "zh" ? "先限定发现范围，避免把系统基础服务和临时端口全部纳入。发现后可继续删除不需要纳管的服务。" : "Limit discovery scope first to avoid importing system noise and temporary ports. You can delete unneeded services after discovery."}</div></div>`,
        fieldInlineChecks(state.lang === "zh" ? "发现类型" : "Discovery types", "discovery_types", typeChecks),
        fieldInput(state.lang === "zh" ? "仅包含关键字" : "Include keywords", "include_keywords", "", "text", `placeholder="${state.lang === "zh" ? "如：nginx,redis,jumpserver；为空表示不过滤" : "e.g. nginx,redis,jumpserver; empty means all"}"`),
        fieldInput(state.lang === "zh" ? "排除关键字" : "Exclude keywords", "exclude_keywords", "systemd-,dbus,session,user@", "text", `placeholder="${state.lang === "zh" ? "如：dbus,session,user@；逗号分隔" : "e.g. dbus,session,user@; comma separated"}"`),
      ].join(""),
    };
  }
  if (type === "application") {
    const isNew = id === "new";
    const defaults = isNew ? (state.applicationCreateDefaults || {}) : {};
    const app = isNew ? { name: defaults.name || "", owner: defaults.owner || "SRE", description: defaults.description || "", status: defaults.status || "active", env_type: defaults.env_type || "prod" } : applications().find((item) => item.id === id);
    if (!app) return null;
    const primaryEnv = isNew ? null : environments().find((env) => env.application_id === app.id || env.application_name === app.name);
    const envType = primaryEnv?.env_type || app.env_type || "prod";
    const owner = primaryEnv?.owner || app.owner || "SRE";
    const status = primaryEnv?.status || app.status || "active";
    const description = primaryEnv?.description || app.description || "";
    return {
      title: isNew ? t("environments.addEnvironment") : (state.lang === "zh" ? "编辑应用" : "Edit application"),
      subtitle: t("environments.applications"),
      submitLabel: isNew ? t("action.create") : t("action.save"),
      body: [
        fieldInput(state.lang === "zh" ? "应用名称" : "Application name", "name", isNew ? app.name : displayApplicationName(app.name), "text", "required"),
        fieldSelect(t("form.environmentType"), "env_type", envType, [["prod", "Production"], ["staging", "Staging"], ["test", "Test"], ["dev", "Dev"]], "required"),
        fieldInput(t("table.owner"), "owner", owner, "text", "required"),
        fieldSelect(t("form.status"), "status", status, [["active", statusText("active")], ["review", statusText("review")], ["disabled", statusText("disabled")]], "required"),
        fieldTextarea(t("table.description"), "description", description),
      ].join(""),
    };
  }
  if (type === "environment") {
    const isNew = id === "new";
    const firstAppId = applications()[0]?.id || "";
    const env = isNew
      ? { application_id: firstAppId, name: "", env_type: "prod", owner: "SRE", description: "", status: "active" }
      : environments().find((item) => item.id === id);
    if (!env) return null;
    return {
      title: isNew ? (state.lang === "zh" ? "新建环境" : "New Environment") : (state.lang === "zh" ? "编辑环境" : "Edit Environment"),
      subtitle: t("environments.applications"),
      submitLabel: isNew ? t("action.create") : t("action.save"),
      body: [
        fieldSelect(state.lang === "zh" ? "所属应用" : "Application", "application_id", env.application_id || firstAppId, applicationOptions(), "required"),
        fieldInput(state.lang === "zh" ? "环境名称" : "Environment name", "name", env.name || "", "text", "required"),
        fieldSelect(t("form.environmentType"), "env_type", env.env_type || "prod", [["prod", "Production"], ["staging", "Staging"], ["test", "Test"], ["dev", "Dev"]], "required"),
        fieldInput(t("table.owner"), "owner", env.owner || "SRE", "text", "required"),
        fieldSelect(t("form.status"), "status", env.status || "active", [["active", statusText("active")], ["review", statusText("review")], ["disabled", statusText("disabled")]], "required"),
        fieldTextarea(t("table.description"), "description", env.description || ""),
      ].join(""),
    };
  }
  if (type === "inspection-item") {
    const categoryOptions = ["os", "postgresql", "mysql", "redis", "container", "middleware"].map((category) => [category, templateCategoryLabel(category)]);
    return {
      title: t("modal.addInspectionItem"),
      subtitle: t("templates.custom"),
      submitLabel: t("action.create"),
      body: [
        fieldInput(t("table.name"), "name", "", "text", "required"),
        fieldSelect(t("table.category"), "category", "os", categoryOptions, "required"),
        fieldSelect(t("form.commandType"), "command_type", "shell", [["shell", "Shell"], ["sql", "SQL"]], "required"),
        fieldTextarea(t("table.command"), "command_template", "", `required placeholder="${state.lang === "zh" ? "输入 Shell / SQL 巡检脚本或命令" : "Enter shell / SQL check command"}"`),
        fieldInput(t("form.expectedPattern"), "expected_result_pattern", "", "text", `placeholder="${state.lang === "zh" ? "例如：empty、<80、regex:xxx" : "e.g. empty, <80, regex:xxx"}"`),
        fieldTextarea(t("table.description"), "description", "", `placeholder="${state.lang === "zh" ? "说明该巡检项的用途、异常判定和适用场景" : "Describe purpose, judgement and scope"}"`),
      ].join(""),
    };
  }
  if (type === "ai-model") {
    const isNew = id === "new";
    const model = isNew
      ? { name: "", provider: "openai_compatible", base_url: "", model_name: "", enabled: true }
      : (state.data.ai_models || []).find((item) => item.id === id);
    if (!model) return null;
    const modelConfig = model.config || {};
    return {
      title: isNew ? t("modal.addAiModel") : t("modal.editAiModel"),
      subtitle: t("ai.models"),
      panelClass: "ai-model-modal",
      formClass: "single-column ai-model-form",
      extraActions: `<button class="btn" type="button" data-action="test-ai-model-form">${t("action.test")}</button>`,
      body: [
        fieldInput(t("table.name"), "name", model.name, "text", "required"),
        fieldSelect(t("ai.modelProvider"), "provider", model.provider || "openai_compatible", [["openai_compatible", "OpenAI-compatible"], ["deepseek", "DeepSeek"], ["qwen", "通义/Qwen"], ["private", "私有模型"]], "required"),
        fieldInput("Base URL", "base_url", model.base_url || "", "url"),
        fieldTextarea(t("ai.apiKey"), "api_key", "", `placeholder="${state.lang === "zh" ? "编辑时留空表示保留原 API Key" : "Leave empty to keep current API key"}"`),
        fieldSelect(state.lang === "zh" ? "TLS 证书校验" : "TLS Verification", "verify_ssl", String(modelConfig.verify_ssl !== false), [["true", state.lang === "zh" ? "开启（推荐）" : "Enabled (recommended)"], ["false", state.lang === "zh" ? "关闭（自签/内网证书）" : "Disabled (self-signed/internal)"]], "required", state.lang === "zh" ? "内网或自签模型网关证书报错时可关闭；公网生产环境建议保持开启。" : "Disable only for internal or self-signed endpoints. Keep enabled for public production endpoints."),
        aiModelPicker(model.model_name || ""),
        fieldSelect(t("form.status"), "enabled", String(model.enabled !== false), [["true", t("label.enabled")], ["false", t("label.disabled")]], "required"),
      ].join(""),
    };
  }
  if (type === "ai-datasource") {
    const isNew = id === "new";
    const datasource = isNew
      ? { name: "", type: "prometheus", endpoint: "", tenant: "", default_range: "1h", enabled: true }
      : (state.data.ai_datasources || []).find((item) => item.id === id);
    if (!datasource) return null;
    return {
      title: isNew ? t("modal.addAiDatasource") : t("modal.editAiDatasource"),
      subtitle: t("ai.datasources"),
      body: [
        fieldInput(t("table.name"), "name", datasource.name, "text", "required"),
        fieldSelect(t("ai.datasourceType"), "type", datasource.type || "prometheus", [["prometheus", "Prometheus"], ["victoriametrics", "VictoriaMetrics"], ["grafana", "Grafana"], ["victorialogs", "VictoriaLogs"]], "required"),
        fieldInput("Endpoint", "endpoint", datasource.endpoint || "", "url", "required"),
        fieldInput("Tenant", "tenant", datasource.tenant || "", "text"),
        fieldInput(t("ai.defaultRange"), "default_range", datasource.default_range || "1h", "text"),
        fieldTextarea(t("ai.token"), "token", "", `placeholder="${state.lang === "zh" ? "编辑时留空表示保留原 Token" : "Leave empty to keep current token"}"`),
        fieldSelect(t("form.status"), "enabled", String(datasource.enabled !== false), [["true", t("label.enabled")], ["false", t("label.disabled")]], "required"),
      ].join(""),
    };
  }
  if (type === "ai-assistant") {
    const settings = state.data.ai_assistant_settings || {};
    const modelOptions = [["", state.lang === "zh" ? "不指定" : "Not specified"]]
      .concat((state.data.ai_models || []).map((model) => [model.id, `${model.name}${model.model_name ? ` / ${model.model_name}` : ""}`]));
    return {
      title: t("modal.editAiAssistant"),
      subtitle: t("ai.assistant"),
      body: [
        fieldSelect(t("form.status"), "enabled", String(Boolean(settings.enabled)), [["true", t("label.enabled")], ["false", t("label.disabled")]], "required"),
        fieldSelect(state.lang === "zh" ? "对话模型" : "Chat Model", "model_id", settings.model_id || "", modelOptions),
        fieldInput(t("table.name"), "name", settings.name || "OpsRadar AI", "text", "required"),
        fieldTextarea(state.lang === "zh" ? "欢迎语" : "Welcome Message", "welcome_message", settings.welcome_message || defaultAiWelcomeMessage(), `placeholder="${state.lang === "zh" ? "可使用 [问题] 语法添加可点击示例问题" : "Use [question] syntax to add clickable examples"}"`),
      ].join(""),
    };
  }
  if (type === "analysis-rule") {
    const isNew = id === "new";
    const rule = isNew
      ? { name: "", layer: "", role: "", item_keyword: "", status: "", error_keyword: "", probable_cause: "", impact: "", recommendation: "", steps: [], verification: "", risk_level: "medium", enabled: true }
      : (state.data.analysis_rules || []).find((item) => item.id === id);
    if (!rule) return null;
    return {
      title: isNew ? t("modal.addKnowledge") : t("modal.editKnowledge"),
      subtitle: t("ai.knowledge"),
      formClass: "single-column",
      submitLabel: isNew ? t("action.create") : t("action.save"),
      body: [
        fieldInput(t("table.name"), "name", rule.name || "", "text", "required"),
        fieldSelect(t("form.layer"), "layer", rule.layer || "", [["", state.lang === "zh" ? "不限" : "Any"], ["os", "OS"], ["db", "Database"], ["middleware", "Middleware"], ["gateway", "Gateway"], ["container", "Container"], ["security", "Security"], ["service", "Service"]]),
        fieldInput(t("form.role"), "role", rule.role || "", "text", "", state.lang === "zh" ? "可选，例如 redis、nginx、postgresql-primary。" : "Optional, such as redis, nginx or postgresql-primary."),
        fieldInput(state.lang === "zh" ? "指标关键字" : "Metric keyword", "item_keyword", rule.item_keyword || "", "text"),
        fieldInput(state.lang === "zh" ? "错误关键字" : "Error keyword", "error_keyword", rule.error_keyword || "", "text"),
        fieldSelect(t("table.status"), "status", rule.status || "", [["", state.lang === "zh" ? "不限" : "Any"], ["fail", "fail"], ["exception", "exception"], ["success", "success"]]),
        fieldSelect(t("table.severity"), "risk_level", rule.risk_level || "medium", [["low", severityMeta("low").label], ["medium", severityMeta("medium").label], ["high", severityMeta("high").label], ["critical", severityMeta("critical").label]], "required"),
        fieldSelect(t("form.status"), "enabled", String(rule.enabled !== false), [["true", t("label.enabled")], ["false", t("label.disabled")]], "required"),
        fieldTextarea(state.lang === "zh" ? "可能原因" : "Probable cause", "probable_cause", rule.probable_cause || "", "required"),
        fieldTextarea(state.lang === "zh" ? "影响范围" : "Impact", "impact", rule.impact || ""),
        fieldTextarea(state.lang === "zh" ? "修复建议" : "Recommendation", "recommendation", rule.recommendation || "", "required"),
        fieldTextarea(state.lang === "zh" ? "人工执行步骤" : "steps", "steps", (rule.steps || []).join("\n"), `placeholder="${state.lang === "zh" ? "每行一个步骤" : "One step per line"}"`),
        fieldTextarea(state.lang === "zh" ? "验证方式" : "Verification", "verification", rule.verification || ""),
      ].join(""),
    };
  }
  if (type === "resource") {
    const isNew = id === "new";
    const defaults = isNew ? (state.resourceCreateDefaults || {}) : {};
    const firstType = defaults.type || resourceFormTypeOptions()[0]?.[0] || "host";
    const selectedType = resourceTypes().find((item) => item.key === firstType);
    const res = isNew
      ? {
          name: defaults.name || "",
          type: firstType,
          ip: defaults.ip || "",
          port: defaults.port || selectedType?.default_port || 22,
          username: defaults.username || "",
          credential_type: defaults.credential_type || "password",
          environment_bindings: defaults.environment_bindings || (defaults.environment_id ? [{ environment_id: defaults.environment_id }] : []),
          credential_configured: false,
        }
      : state.data.resources.find((item) => item.id === id);
    if (!res) return null;
    const selectedEnvIds = new Set((res.environment_bindings || []).map((binding) => binding.environment_id));
    const envOptions = environments().map((env) => ({
      value: env.id,
      label: `${displayApplicationName(env.application_name)} / ${env.name}`,
      meta: `${env.env_type || "-"} / ${env.owner || "SRE"}`,
      checked: selectedEnvIds.has(env.id),
    }));
    return {
      title: isNew ? t("modal.addResource") : t("modal.editResource"),
      subtitle: isNew ? t("resources.desc") : `${res.ip}:${res.port}`,
      body: [
        fieldInput(t("table.name"), "name", res.name, "text", "required"),
        fieldSelect(t("table.type"), "type", res.type, resourceFormTypeOptions(res.type), `required data-resource-type-select="true" data-previous-type="${escapeHtml(res.type || "")}"`),
        fieldInput("IP", "ip", res.ip, "text", "required"),
        fieldInput("Port", "port", res.port, "number", "required min=\"1\" max=\"65535\""),
        fieldInput("Username", "username", res.username, "text", "required"),
        fieldSelect(t("form.credentialType"), "credential_type", res.credential_type || "password", [["password", t("resources.password")], ["key", t("resources.key")]], "required"),
        fieldTextarea(t("form.credentialSecret"), "credential_secret", "", `placeholder="${isNew ? "" : t("form.credentialHelp")}"`),
        fieldCheckboxGroup(t("form.environment"), "environment_ids", envOptions, t("environments.noData")),
      ].join(""),
    };
  }
  if (type === "resource-type") {
    const isNew = id === "new";
    const item = isNew
      ? { key: "", name: "", default_port: 22, enabled: true, description: "" }
      : state.data.resource_types.find((entry) => entry.id === id);
    if (!item) return null;
    return {
      title: isNew ? t("modal.addResourceType") : t("modal.editResourceType"),
      subtitle: isNew ? t("settings.resourceTypes") : item.key,
      body: [
        fieldInput("Key", "key", item.key, "text", "required pattern=\"[a-zA-Z0-9_-]+\""),
        fieldInput(t("table.name"), "name", item.name, "text", "required"),
        fieldInput(t("form.defaultPort"), "default_port", item.default_port, "number", "required min=\"1\" max=\"65535\""),
        fieldSelect(t("form.status"), "enabled", String(item.enabled), [["true", t("label.enabled")], ["false", t("label.disabled")]], "required"),
        fieldTextarea(t("table.description"), "description", item.description || ""),
      ].join(""),
    };
  }
  if (type === "user") {
    const isNew = id === "new";
    const user = isNew ? { username: "", display_name: "", email: "", role: "user", is_active: true } : state.data.users.find((item) => item.id === id);
    if (!user) return null;
    return {
      title: isNew ? (state.lang === "zh" ? "创建用户" : "Create user") : t("modal.editUser"),
      subtitle: isNew ? (state.lang === "zh" ? "创建后可使用初始密码登录。" : "The user can sign in with the initial password.") : user.username,
      submitLabel: isNew ? t("action.create") : t("action.save"),
      body: [
        isNew ? fieldInput(state.lang === "zh" ? "用户名" : "Username", "username", user.username, "text", "required autocomplete=\"off\"") : "",
        fieldInput(t("table.name"), "display_name", user.display_name, "text", "required"),
        fieldInput(t("table.email"), "email", user.email, "email", "required"),
        isNew ? fieldInput(state.lang === "zh" ? "初始密码" : "Initial password", "password", "", "password", "required autocomplete=\"new-password\" minlength=\"8\"") : "",
        fieldSelect(t("table.role"), "role", user.role, roleOptions(), "required"),
        fieldSelect(t("form.status"), "is_active", String(user.is_active), [["true", t("form.active")], ["false", t("form.inactive")]], "required"),
      ].join(""),
    };
  }
  if (type === "role") {
    const isNew = id === "new";
    const role = isNew ? { name: "", description: "", permissions: [], system: false } : state.data.roles.find((item) => item.id === id);
    if (!role) return null;
    const readonly = Boolean(role.system);
    return {
      title: isNew ? (state.lang === "zh" ? "创建角色" : "Create role") : t("modal.editRole"),
      subtitle: readonly ? (state.lang === "zh" ? "系统角色不可编辑" : "System roles are read only") : (role.id || ""),
      submitLabel: isNew ? t("action.create") : t("action.save"),
      body: [
        fieldInput(t("table.role"), "name", role.name, "text", `required ${readonly ? "disabled" : ""}`),
        fieldTextarea(t("table.description"), "description", role.description, readonly ? "disabled" : ""),
        rolePermissionTree(role, readonly),
      ].join(""),
    };
  }
  return null;
}

function openModal(type, id) {
  if (type === "task-create") {
    state.taskCreateStep = 1;
    state.taskCreateDraft = null;
  }
  if (type !== "task-create") state.taskCreateDefaults = null;
  if (type !== "resource") state.resourceCreateDefaults = null;
  if (type !== "application") state.applicationCreateDefaults = null;
  state.modal = { type, id };
  render();
}

function closeModal() {
  if (state.modal?.type === "task-create") {
    state.taskCreateDefaults = null;
    state.taskCreateDraft = null;
  }
  if (state.modal?.type === "resource") state.resourceCreateDefaults = null;
  if (state.modal?.type === "application") state.applicationCreateDefaults = null;
  state.workflowCallback = null;
  state.workflowBatchAssets = [];
  state.modal = null;
  render();
}

async function discoverAiModels(button) {
  const form = button.closest("#edit-form");
  const note = form?.querySelector("#ai-model-discovery-note");
  const optionsBox = form?.querySelector("#ai-model-options");
  const modelInput = form?.querySelector('input[name="model_name"]');
  if (!form || !optionsBox || !modelInput) return;
  const values = Object.fromEntries(new FormData(form).entries());
  if (!values.base_url || !values.api_key) {
    const message = state.lang === "zh" ? "请先填写 Base URL 和 API Key" : "Enter Base URL and API Key first";
    if (note) note.textContent = message;
    optionsBox.hidden = true;
    return;
  }
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = state.lang === "zh" ? "获取中..." : "Fetching...";
  try {
    const result = await api("/api/ai/models/discover", {
      method: "POST",
      body: JSON.stringify({ base_url: values.base_url, api_key: values.api_key, verify_ssl: values.verify_ssl !== "false" }),
    });
    const models = result.items || [];
    optionsBox.innerHTML = models.map((model) => `
      <button class="ai-model-option" type="button" data-action="select-discovered-model" data-value="${escapeHtml(model)}">
        <span>${escapeHtml(model)}</span>
      </button>
    `).join("");
    optionsBox.hidden = !models.length;
    if (!modelInput.value && models.length) modelInput.value = models[0];
    const message = models.length
      ? (state.lang === "zh" ? `已获取 ${models.length} 个模型，可在模型名称中选择` : `Fetched ${models.length} models. Select one in Model Name.`)
      : (state.lang === "zh" ? "未获取到模型，请检查接口是否兼容 /models" : "No models returned. Check whether the endpoint supports /models.");
    if (note) note.textContent = message;
  } catch (err) {
    const message = friendlyError(err.message);
    if (note) note.textContent = message;
    optionsBox.hidden = true;
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

async function testAiModelFromForm(button) {
  const form = button.closest("#edit-form");
  const note = form?.querySelector("#ai-model-discovery-note");
  if (!form) return;
  const values = Object.fromEntries(new FormData(form).entries());
  if (!values.base_url || !values.api_key) {
    const message = state.lang === "zh" ? "请先填写 Base URL 和 API Key" : "Enter Base URL and API Key first";
    if (note) note.textContent = message;
    return;
  }
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = state.lang === "zh" ? "测试中..." : "Testing...";
  try {
    const result = await api("/api/ai/models/test", {
      method: "POST",
      body: JSON.stringify({ base_url: values.base_url, api_key: values.api_key, verify_ssl: values.verify_ssl !== "false" }),
    });
    const message = result.ok ? `${t("toast.testSuccess")}：${result.message}` : `${t("toast.testFailed")}：${result.message}`;
    if (note) note.textContent = message;
  } catch (err) {
    const message = `${t("toast.testFailed")}：${friendlyError(err.message)}`;
    if (note) note.textContent = message;
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

async function testAiModel(id) {
  try {
    const result = await api(`/api/ai/models/${encodeURIComponent(id)}/test`, { method: "POST" });
    state.modal = {
      type: "alert",
      icon: result.ok ? "checklist" : "alert",
      tone: result.ok ? "success" : "danger",
      title: result.ok ? t("toast.testSuccess") : t("toast.testFailed"),
      message: result.message,
    };
  } catch (err) {
    state.modal = {
      type: "alert",
      icon: "alert",
      title: t("toast.testFailed"),
      message: friendlyError(err.message),
    };
  }
  render();
}

function assistantStateFor(scope = "page") {
  return scope === "floating" ? state.floatingAssistant : state.aiAssistant;
}

function scrollAiChatToBottom(scope = "page") {
  const selector = scope === "floating" ? ".ai-chat-messages" : ".ai-conversation-panel";
  const scroll = () => {
    const messages = document.querySelector(selector);
    if (messages) messages.scrollTo({ top: messages.scrollHeight, behavior: "auto" });
  };
  requestAnimationFrame(() => {
    scroll();
    setTimeout(scroll, 0);
    setTimeout(scroll, 80);
  });
}

function toggleAiAssistant(open = null) {
  const assistant = state.floatingAssistant;
  assistant.open = open === null ? !assistant.open : Boolean(open);
  render();
  if (assistant.open) {
    requestAnimationFrame(() => {
      const input = document.getElementById("ai-chat-input");
      input?.focus();
      scrollAiChatToBottom("floating");
    });
  }
}

function clearAiChat(scope = "page") {
  const assistant = assistantStateFor(scope);
  assistant.sessionId = null;
  assistant.title = "";
  assistant.messages = [];
  assistant.typing = false;
  render();
}

async function loadAiChatSession(sessionId) {
  const payload = await api(`/api/ai/chat/sessions/${encodeURIComponent(sessionId)}/messages`);
  state.aiAssistant.sessionId = payload.session.id;
  state.aiAssistant.title = payload.session.title || "";
  state.aiAssistant.messages = (payload.messages || []).map((message) => ({
    role: message.role,
    content: message.content,
    time: formatSessionTime(message.created_at),
    meta: message.meta || {},
  }));
  state.aiAssistant.typing = false;
  render();
  scrollAiChatToBottom("page");
}

function aiScopeFromElement(element) {
  return element.closest(".ai-chat-window") ? "floating" : "page";
}

function appendWorkflowResponse(response, scope = "page") {
  const workflow = response.workflow || response;
  const actionResult = response.action_result || {};
  const message = actionResult.summary || response.message || workflow.last_error || (state.lang === "zh" ? "工作流已更新" : "Workflow updated");
  const assistant = assistantStateFor(scope);
  assistant.messages.push({
    role: "assistant",
    content: message,
    time: currentTimeLabel(),
    meta: { workflow },
  });
  render();
  scrollAiChatToBottom(scope);
}

async function runWorkflowAction(workflowId, actionName, params = {}, confirmed = false, scope = "page") {
  if (!workflowId || !actionName) return;
  const response = await api(`/api/ai/workflows/${encodeURIComponent(workflowId)}/actions/${encodeURIComponent(actionName)}`, {
    method: "POST",
    body: JSON.stringify({ params, confirmed }),
  });
  appendWorkflowResponse(response, scope);
  await loadBootstrap();
  render();
  scrollAiChatToBottom(scope);
}

async function sendWorkflowEvent(eventName, payload = {}) {
  const callback = state.workflowCallback;
  if (!callback?.workflow_id || !eventName) return;
  const response = await api(`/api/ai/workflows/${encodeURIComponent(callback.workflow_id)}/events`, {
    method: "POST",
    body: JSON.stringify({ event: eventName, payload }),
  });
  const scope = callback.scope || "page";
  appendWorkflowResponse({ workflow: response, message: state.lang === "zh" ? "我已收到补充信息，继续推进流程。" : "Workflow continued." }, scope);
  state.workflowCallback = null;
  scrollAiChatToBottom(scope);
}

async function sendAiChat(message, scope = "page") {
  const assistant = assistantStateFor(scope);
  const text = String(message || "").trim();
  if (!text || assistant.typing) return;
  if (scope === "floating") assistant.open = true;
  if (!assistant.title) assistant.title = text.slice(0, 28);
  assistant.messages.push({ role: "user", content: text, time: currentTimeLabel() });
  assistant.typing = true;
  render();
  scrollAiChatToBottom(scope);
  try {
    const response = await api("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        session_id: assistant.sessionId,
        message: text,
        context: { scope, view: state.view, tab: state.tabs[state.view] || null },
      }),
    });
    assistant.sessionId = response.session_id || assistant.sessionId;
    const toolHint = (response.tool_runs || []).length
      ? `\n\n${state.lang === "zh" ? "工具证据摘要" : "Tool evidence"}：${(response.tool_runs || []).map((tool) => tool.name).join("、")}`
      : "";
    assistant.messages.push({
      role: "assistant",
      content: `${response.message || t("ai.chatFallback")}${toolHint}`,
      time: currentTimeLabel(),
      meta: {
        workflow: response.workflow,
        status: response.status,
        data_context: response.data_context,
        issues: response.issues,
        summary: response.summary,
      },
    });
    if (scope === "page") await loadAiChatSessions();
  } catch (err) {
    assistant.messages.push({ role: "assistant", content: `${t("ai.sendFailed")}：${friendlyError(err.message)}`, time: currentTimeLabel() });
  } finally {
    assistant.typing = false;
    render();
    scrollAiChatToBottom(scope);
  }
}

function editPayloadFromForm(form) {
  const formData = new FormData(form);
  const values = Object.fromEntries(formData.entries());
  if (form.dataset.type === "task-create") {
    return {
      name: values.name,
      inspection_scope: values.inspection_scope || "environment",
      execution_mode: values.execution_mode || "once",
      description: values.description || "",
      task_tags: String(values.task_tags || "").split(/[，,]/).map((item) => item.trim()).filter(Boolean),
      environment_id: values.environment_id || null,
      resource_ids: formData.getAll("resource_ids"),
      service_ids: formData.getAll("service_ids"),
      item_ids: formData.getAll("item_ids"),
      owner_id: values.owner_id || state.user?.id || null,
      notify_channels: formData.getAll("notify_channels"),
      reminder_rules: formData.getAll("reminder_rules"),
      schedule_rule: values.schedule_rule || "daily",
      schedule_time: values.schedule_time || "09:00",
      effective_start: values.effective_start || null,
      effective_end: values.effective_end || null,
      deadline_policy: values.deadline_policy || "1h",
      retry_policy: values.retry_policy || "none",
      note: values.note || "",
    };
  }
  if (form.dataset.type === "resource") {
    const environmentBindings = formData.getAll("environment_ids").map((environmentId) => ({
      environment_id: environmentId,
      layer: defaultLayerForResourceType(values.type),
      weight: 10,
    }));
    return {
      name: values.name,
      type: values.type,
      ip: values.ip,
      port: Number(values.port),
      username: values.username || "",
      credential_type: values.credential_type || "password",
      credential_secret: values.credential_secret || undefined,
      environment_bindings: environmentBindings,
    };
  }
  if (form.dataset.type === "environment-rules") {
    return {
      rule_set_ids: formData.getAll("rule_set_ids"),
    };
  }
  if (form.dataset.type === "rule-set") {
    const splitList = (value) => String(value || "").split(/[，,]/).map((item) => item.trim()).filter(Boolean);
    return {
      name: values.name,
      description: values.description || "",
      target_kind: values.target_kind || "resource",
      resource_types: splitList(values.resource_types),
      service_types: splitList(values.service_types),
      conditions: {},
      exclude_keywords: splitList(values.exclude_keywords),
      item_ids: formData.getAll("item_ids"),
      enabled: formData.getAll("enabled").includes("true"),
    };
  }
  if (form.dataset.type === "service-discovery") {
    const splitKeywords = (value) => String(value || "").split(/[，,]/).map((item) => item.trim()).filter(Boolean);
    return {
      discovery_types: formData.getAll("discovery_types"),
      include_keywords: splitKeywords(values.include_keywords),
      exclude_keywords: splitKeywords(values.exclude_keywords),
    };
  }
  if (form.dataset.type === "application") {
    return {
      name: values.name,
      owner: values.owner || "SRE",
      description: values.description || "",
      status: values.status || "active",
      env_type: values.env_type || "prod",
    };
  }
  if (form.dataset.type === "environment") {
    return {
      application_id: values.application_id,
      name: values.name,
      env_type: values.env_type || "prod",
      owner: values.owner || "SRE",
      description: values.description || "",
      status: values.status || "active",
    };
  }
  if (form.dataset.type === "inspection-item") {
    return {
      name: values.name,
      category: values.category || "os",
      resource_type: resourceTypeForTemplateCategory(values.category || "os"),
      command_template: values.command_template,
      command_type: values.command_type || "shell",
      expected_result_pattern: values.expected_result_pattern || "custom",
      description: values.description || "自定义巡检：用户创建的业务巡检指标。",
    };
  }
  if (form.dataset.type === "ai-model") {
    return {
      name: values.name,
      provider: values.provider || "openai_compatible",
      base_url: values.base_url || "",
      model_name: values.model_name || "",
      api_key: values.api_key || null,
      config: { verify_ssl: values.verify_ssl !== "false" },
      enabled: values.enabled === "true",
    };
  }
  if (form.dataset.type === "ai-datasource") {
    return {
      name: values.name,
      type: values.type || "prometheus",
      endpoint: values.endpoint || "",
      tenant: values.tenant || "",
      default_range: values.default_range || "1h",
      token: values.token || null,
      label_mapping: {},
      config: {},
      enabled: values.enabled === "true",
    };
  }
  if (form.dataset.type === "ai-assistant") {
    const current = state.data.ai_assistant_settings || {};
    return {
      enabled: values.enabled === "true",
      model_id: values.model_id || null,
      name: values.name || "OpsRadar AI",
      welcome_message: values.welcome_message || "",
      quick_prompts: current.quick_prompts || [],
      prompt_templates: current.prompt_templates || [],
    };
  }
  if (form.dataset.type === "analysis-rule") {
    return {
      name: values.name,
      layer: values.layer || "",
      role: values.role || "",
      item_keyword: values.item_keyword || "",
      status: values.status || "",
      error_keyword: values.error_keyword || "",
      probable_cause: values.probable_cause || "",
      impact: values.impact || "",
      recommendation: values.recommendation || "",
      steps: (values.steps || "").split(/\n+/).map((item) => item.trim()).filter(Boolean),
      verification: values.verification || "",
      risk_level: values.risk_level || "medium",
      enabled: values.enabled === "true",
    };
  }
  if (form.dataset.type === "resource-type") {
    return {
      key: values.key,
      name: values.name,
      default_port: Number(values.default_port),
      enabled: values.enabled === "true",
      description: values.description || "",
    };
  }
  if (form.dataset.type === "user") {
    const payload = {
      display_name: values.display_name,
      email: values.email,
      role: values.role,
      is_active: values.is_active === "true",
    };
    if (form.dataset.id === "new") {
      payload.username = values.username;
      payload.password = values.password;
    }
    return payload;
  }
  if (form.dataset.type === "role") {
    return {
      name: values.name,
      description: values.description || "",
      permissions: formData.getAll("permissions"),
    };
  }
  return values;
}

function validateEditForm(form) {
  if (form.dataset.type === "service-discovery") {
    const formData = new FormData(form);
    if (formData.getAll("discovery_types").length === 0) {
      return state.lang === "zh" ? "请至少选择一种发现类型" : "Select at least one discovery type";
    }
    return "";
  }
  if (form.dataset.type !== "task-create") return "";
  const formData = new FormData(form);
  const values = Object.fromEntries(formData.entries());
  if (values.inspection_scope === "service" && formData.getAll("service_ids").length === 0) {
    return state.lang === "zh" ? "请选择至少一个发现服务" : "Select at least one discovered service";
  }
  if (values.inspection_scope === "environment" && !values.environment_id) {
    return state.lang === "zh" ? "请选择应用环境" : "Select an application environment";
  }
  if (values.inspection_scope === "asset" && formData.getAll("resource_ids").length === 0) {
    return t("toast.selectTaskResources");
  }
  if (formData.getAll("item_ids").length === 0 && values.inspection_scope !== "environment") {
    return t("toast.selectTaskItems");
  }
  return "";
}

function editEndpoint(type, id) {
  if (type === "task-create") {
    if (id === "new") return "/api/tasks";
    if (String(id).startsWith("plan:")) return `/api/cron-plans/${encodeURIComponent(String(id).slice(5))}`;
    return `/api/tasks/${encodeURIComponent(id)}`;
  }
  const map = {
    resource: id === "new" ? "/api/resources" : `/api/resources/${id}`,
    "environment-rules": `/api/environments/${id}/rule-sets`,
    "rule-set": id === "new" ? "/api/rule-sets" : `/api/rule-sets/${id}`,
    "service-discovery": `/api/resources/${id}/discover-services`,
    "inspection-item": "/api/inspection-items",
    "ai-model": id === "new" ? "/api/ai/models" : `/api/ai/models/${id}`,
    "ai-datasource": id === "new" ? "/api/ai/datasources" : `/api/ai/datasources/${id}`,
    "ai-assistant": "/api/ai/assistant/settings",
    "analysis-rule": id === "new" ? "/api/analysis-rules" : `/api/analysis-rules/${id}`,
    "resource-type": id === "new" ? "/api/settings/resource-types" : `/api/settings/resource-types/${id}`,
    application: id === "new" ? "/api/applications" : `/api/applications/${id}`,
    environment: id === "new" ? "/api/environments" : `/api/environments/${id}`,
    user: id === "new" ? "/api/users" : `/api/users/${id}`,
    role: id === "new" ? "/api/roles" : `/api/roles/${id}`,
  };
  return map[type];
}

async function login(username, password) {
  const payload = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  state.token = payload.access_token;
  state.user = payload.user;
  localStorage.setItem("opsradar_token", state.token);
  await loadBootstrap();
  render();
}

function logout(show = true) {
  localStorage.removeItem("opsradar_token");
  state.token = null;
  state.user = null;
  state.data = null;
  clearInterval(state.polling);
  if (show) toast(t("toast.signedOut"));
  render();
}

async function refreshData(message = t("toast.synchronized")) {
  await loadBootstrap();
  render();
  toast(message);
}

async function startServiceDiscovery(resourceId, payload) {
  state.modal = null;
  state.expandedResources.add(resourceId);
  state.discoveringResources.add(resourceId);
  render();
  toast(state.lang === "zh" ? "服务发现已启动，后台扫描中" : "Service discovery started in background");
  try {
    const result = await api(`/api/resources/${encodeURIComponent(resourceId)}/discover-services`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (result.resource) {
      const index = state.data.resources.findIndex((item) => item.id === resourceId);
      if (index >= 0) state.data.resources[index] = result.resource;
    }
    const existing = new Map((state.data.discovered_services || []).map((service) => [service.id, service]));
    (result.services || []).forEach((service) => existing.set(service.id, service));
    state.data.discovered_services = [...existing.values()];
    const discoveredCount = (result.services || []).length;
    if (state.workflowCallback?.type === "service-discovery") {
      await sendWorkflowEvent(state.workflowCallback.event || "services_discovered", {
        resource_id: resourceId,
        service_ids: (result.services || []).map((service) => service.id).filter(Boolean),
      });
    }
    toast(discoveredCount
      ? `${t("toast.servicesDiscovered")}：${discoveredCount}`
      : (state.lang === "zh" ? "服务发现完成，未发现符合条件的服务" : "Discovery finished. No matching services found."));
  } catch (err) {
    toast(friendlyError(err.message), "error");
  } finally {
    state.discoveringResources.delete(resourceId);
    render();
  }
}

function defaultServiceDiscoveryPayload() {
  return {
    discovery_types: ["docker_container", "docker_compose"],
    include_keywords: [],
    exclude_keywords: ["systemd-", "dbus", "session", "user@"],
  };
}

async function discoverResourceBatch(resources) {
  const targets = resources.filter(isDiscoverableHost);
  if (!targets.length) {
    toast(state.lang === "zh" ? "请选择在线 Linux 主机进行服务发现" : "Select online Linux hosts for service discovery", "error");
    return;
  }
  targets.forEach((item) => {
    state.discoveringResources.add(item.id);
    state.expandedResources.add(item.id);
  });
  render();
  toast(state.lang === "zh" ? `服务发现已启动：${targets.length} 台主机` : `Service discovery started for ${targets.length} host(s)`);
  let success = 0;
  let failed = 0;
  let discovered = 0;
  try {
    for (const item of targets) {
      try {
        const result = await api(`/api/resources/${encodeURIComponent(item.id)}/discover-services`, {
          method: "POST",
          body: JSON.stringify(defaultServiceDiscoveryPayload()),
        });
        if (result.resource) {
          const index = state.data.resources.findIndex((entry) => entry.id === item.id);
          if (index >= 0) state.data.resources[index] = result.resource;
        }
        const existing = new Map((state.data.discovered_services || []).map((service) => [service.id, service]));
        (result.services || []).forEach((service) => existing.set(service.id, service));
        state.data.discovered_services = [...existing.values()];
        discovered += (result.services || []).length;
        success += 1;
      } catch (err) {
        failed += 1;
      } finally {
        state.discoveringResources.delete(item.id);
        render();
      }
    }
    const message = state.lang === "zh"
      ? `服务发现完成：主机成功 ${success}，失败 ${failed}，发现服务 ${discovered}`
      : `Service discovery finished: ${success} host(s) succeeded, ${failed} failed, ${discovered} service(s) discovered`;
    toast(message, failed ? "error" : "success");
  } finally {
    targets.forEach((item) => state.discoveringResources.delete(item.id));
    render();
  }
}

function deleteEndpoint(scope, id) {
  if (scope === "tasks" && String(id).startsWith("plan:")) {
    return `/api/cron-plans/${encodeURIComponent(String(id).slice(5))}`;
  }
  const map = {
    resources: `/api/resources/${id}`,
    "resource-types": `/api/settings/resource-types/${id}`,
    users: `/api/users/${id}`,
    roles: `/api/roles/${id}`,
    tasks: `/api/tasks/${id}`,
    reports: `/api/reports/${id}`,
    issues: `/api/issues/${id}`,
    applications: `/api/applications/${id}`,
    "discovered-services": `/api/discovered-services/${id}`,
    environments: `/api/environments/${id}`,
    "ai-models": `/api/ai/models/${id}`,
    "analysis-rules": `/api/analysis-rules/${id}`,
    "ai-chat-sessions": `/api/ai/chat/sessions/${id}`,
  };
  return map[scope];
}

async function deleteSelected(scope) {
  const set = selectionSet(scope);
  const ids = [...set];
  if (!ids.length) {
    toast(t("toast.noSelection"), "error");
    return;
  }
  state.modal = { type: "delete-confirm", scope, ids };
  render();
}

async function performDeleteSelected() {
  const modal = state.modal;
  if (!modal || modal.type !== "delete-confirm") return;
  const { scope, ids = [] } = modal;
  if (scope === "issues") {
    await api("/api/issues/bulk/delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    });
    selectionSet(scope).clear();
    state.modal = null;
    await refreshData(t("toast.deleted"));
    return;
  }
  for (const id of ids) {
    const endpoint = deleteEndpoint(scope, id);
    if (endpoint) {
      await api(endpoint, { method: "DELETE" });
    }
  }
  selectionSet(scope).clear();
  state.modal = null;
  if (scope === "ai-chat-sessions") {
    if (ids.includes(state.aiAssistant.sessionId)) {
      Object.assign(state.aiAssistant, { sessionId: null, title: "", messages: [], typing: false });
    }
    if (ids.includes(state.floatingAssistant.sessionId)) {
      Object.assign(state.floatingAssistant, { sessionId: null, title: "", messages: [], typing: false });
    }
    await loadAiChatSessions();
    render();
    toast(t("toast.deleted"));
    return;
  }
  await refreshData(t("toast.deleted"));
}

async function testResourceBatch(resources) {
  if (!resources.length) {
    toast(t("toast.noSelection"), "error");
    return;
  }
  resources.forEach((item) => state.testingResources.add(item.id));
  render();
  let success = 0;
  let failed = 0;
  try {
    for (const item of resources) {
      try {
        const updated = await api(`/api/resources/${item.id}/test`, { method: "POST" });
        const index = state.data.resources.findIndex((entry) => entry.id === item.id);
        if (index >= 0) state.data.resources[index] = updated;
        success += 1;
      } catch (err) {
        failed += 1;
      } finally {
        state.testingResources.delete(item.id);
        render();
      }
    }
    const message = state.lang === "zh" ? `资源测试完成：成功 ${success}，失败 ${failed}` : `Resource test completed: ${success} succeeded, ${failed} failed`;
    toast(message, failed ? "error" : "success");
  } finally {
    resources.forEach((item) => state.testingResources.delete(item.id));
    render();
  }
}

async function runTask() {
  openModal("task-create", "new");
}

function toggleCheckGroup(button) {
  const values = new Set((button.dataset.values || "").split("|").filter(Boolean));
  const name = button.dataset.name;
  const form = button.closest("form");
  const boxes = [...(form?.querySelectorAll(`input[type="checkbox"][name="${CSS.escape(name)}"]`) || [])]
    .filter((box) => values.has(box.value));
  const allChecked = boxes.length > 0 && boxes.every((box) => box.checked);
  boxes.forEach((box) => {
    box.checked = !allChecked;
  });
  button.textContent = allChecked ? t("action.selectAll") : t("action.clearSelection");
  const details = button.closest("details");
  if (details) details.open = true;
}

async function exportReport(taskIds, format) {
  const ids = Array.isArray(taskIds) ? taskIds : [taskIds];
  const url = ids.length === 1
    ? `/api/reports/${encodeURIComponent(ids[0])}?fmt=${encodeURIComponent(format)}`
    : `/api/reports?${ids.map((id) => `task_ids=${encodeURIComponent(id)}`).join("&")}&fmt=${encodeURIComponent(format)}`;
  const response = await api(url, { raw: true, headers: {} });
  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") || "";
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const filename = match?.[1] || `opsradar-report.${format === "docs" ? "docx" : format}`;
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
  toast(`${format.toUpperCase()} ${t("toast.reportExported")}`);
}

document.addEventListener("submit", async (event) => {
  if (event.target.id === "site-settings-form") {
    event.preventDefault();
    const form = event.target;
    const values = Object.fromEntries(new FormData(form).entries());
    try {
      const payload = await api("/api/settings/site", {
        method: "PATCH",
        body: JSON.stringify({
          site_name: values.site_name,
          site_subtitle: values.site_subtitle,
          icon_text: values.icon_text,
          icon_color: values.icon_color,
          icon_image: values.icon_image || "",
        }),
      });
      persistSiteSettings(payload);
      await refreshData(t("toast.saved"));
    } catch (err) {
      toast(friendlyError(err.message), "error");
    }
    return;
  }

  if (event.target.id === "edit-form") {
    event.preventDefault();
    const form = event.target;
    const type = form.dataset.type;
    const id = form.dataset.id;
    const modalError = form.querySelector("#modal-error");
    if (modalError) modalError.textContent = "";
    const validationError = validateEditForm(form);
    if (validationError) {
      if (modalError) modalError.textContent = validationError;
      toast(validationError, "error");
      return;
    }
    if (type === "service-discovery") {
      await startServiceDiscovery(id, editPayloadFromForm(form));
      return;
    }
    try {
      const isCreate = id === "new" || String(id).startsWith("env:");
      const method = isCreate ? "POST" : "PATCH";
      const result = await api(editEndpoint(type, id), {
        method,
        body: JSON.stringify(editPayloadFromForm(form)),
      });
      const callback = state.workflowCallback;
      if (callback?.type === type) {
        if (type === "application") {
          await sendWorkflowEvent(callback.event || "environment_created", {
            application_id: result.id,
            application_name: result.name,
            name: result.name,
            env_type: form.elements.env_type?.value || callback.params?.env_type || "prod",
          });
        } else if (type === "resource") {
          state.workflowBatchAssets = state.workflowBatchAssets || [];
          state.workflowBatchAssets.push(result.id);
          state.workflowCallback = callback;
          state.resourceCreateDefaults = {
            ...(state.resourceCreateDefaults || {}),
            environment_id: callback.params?.environment_id || "",
          };
          state.modal = {
            type: "alert",
            icon: "checklist",
            tone: "success",
            title: state.lang === "zh" ? "资产已添加" : "Asset added",
            message: state.lang === "zh"
              ? `已添加 ${state.workflowBatchAssets.length} 个资产。一个应用环境通常需要多个资产，你可以继续添加，或完成后继续 AI 巡检流程。`
              : `${state.workflowBatchAssets.length} asset(s) added. Continue adding assets or finish to continue the AI workflow.`,
            actions: [
              { label: state.lang === "zh" ? "继续添加资产" : "Add another asset", action: "workflow-add-more-resource", tone: "primary" },
              { label: state.lang === "zh" ? "完成添加，继续流程" : "Finish and continue", action: "workflow-finish-resource-add", tone: "success" },
            ],
          };
          await loadBootstrap();
          render();
          return;
        } else if (type === "environment-rules") {
          await sendWorkflowEvent(callback.event || "rules_confirmed", {
            environment_id: id,
            rule_set_ids: result.rule_set_ids || editPayloadFromForm(form).rule_set_ids || [],
          });
        } else if (type === "task-create") {
          await sendWorkflowEvent(callback.event || "task_created", {
            task_id: result.task?.id,
            id: result.task?.id,
            mode: result.mode,
          });
        }
      }
      state.modal = null;
      if (type === "task-create") state.taskCreateDefaults = null;
      if (type === "resource") state.resourceCreateDefaults = null;
      if (type === "application") state.applicationCreateDefaults = null;
      await refreshData(t("toast.saved"));
    } catch (err) {
      const message = friendlyError(err.message);
      if (modalError) modalError.textContent = message;
      toast(message, "error");
    }
    return;
  }

  if (event.target.id !== "login-form") return;
  event.preventDefault();
  const error = document.getElementById("login-error");
  error.textContent = "";
  try {
    await login(event.target.username.value.trim(), event.target.password.value);
  } catch (err) {
    const message = friendlyError(err.message);
    error.textContent = message;
    state.modal = {
      type: "alert",
      icon: "alert",
      title: t("alert.loginTitle"),
      message: message.includes("Invalid username") ? t("alert.loginMessage") : message,
    };
    render();
  }
});

document.addEventListener("input", (event) => {
  const target = event.target;
  if (target.id === "global-search") {
    clearTimeout(runGlobalSearch.timer);
    const value = target.value;
    runGlobalSearch.timer = setTimeout(() => runGlobalSearch(value), 180);
    return;
  }
  if (target.dataset.filterScope) {
    clearTimeout(render.filterTimer);
    const scope = target.dataset.filterScope;
    const value = target.value;
    render.filterTimer = setTimeout(() => {
      state.filters[scope] = value;
      resetPage(scope);
      render();
    }, 180);
  }
  if (target.dataset.resourcePickerFilter) {
    const query = normalizeQuery(target.value);
    const field = target.closest(".resource-picker-field");
    field?.querySelectorAll("[data-resource-option]").forEach((node) => {
      const text = node.dataset.resourceOption || "";
      node.hidden = Boolean(query) && !text.includes(query);
    });
  }
  if (target.closest?.("#site-settings-form") && ["site_name", "site_subtitle", "icon_text", "icon_color"].includes(target.name)) {
    updateSitePreview(target.form);
  }
});

document.addEventListener("keydown", async (event) => {
  if ((event.target?.id === "ai-chat-input" || event.target?.id === "ai-page-chat-input") && event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    await sendAiChat(event.target.value, event.target.id === "ai-chat-input" ? "floating" : "page");
  }
});

document.addEventListener("change", (event) => {
  const target = event.target;
  if (target.dataset.permissionArea) {
    const group = target.closest(".permission-group");
    group?.querySelectorAll('input[data-permission-item]').forEach((box) => {
      box.checked = target.checked;
    });
    return;
  }
  if (target.dataset.permissionItem !== undefined) {
    const group = target.closest(".permission-group");
    const area = target.dataset.area;
    if (target.checked && target.dataset.action !== "read") {
      const readBox = group?.querySelector(`input[data-permission-item][value="${area}:read"]`);
      if (readBox) readBox.checked = true;
    }
    if (!target.checked && target.dataset.action === "read") {
      group?.querySelectorAll('input[data-permission-item]').forEach((box) => {
        box.checked = false;
      });
    }
    const boxes = [...(group?.querySelectorAll('input[data-permission-item]') || [])];
    const head = group?.querySelector('input[data-permission-area]');
    if (head) head.checked = boxes.length > 0 && boxes.every((box) => box.checked);
    return;
  }
  if (target.dataset.resourceTypeSelect) {
    const form = target.closest("form");
    const previousType = target.dataset.previousType || "";
    const previousPort = resourceTypeDefaultPort(previousType);
    const nextPort = resourceTypeDefaultPort(target.value);
    const portInput = form?.elements?.port;
    if (portInput && nextPort && (!portInput.value || Number(portInput.value) === previousPort)) {
      portInput.value = nextPort;
    }
    target.dataset.previousType = target.value;
    return;
  }
  if (target.name === "environment_id" && target.closest("#edit-form")?.dataset.type === "task-create") {
    const selected = target.value;
    const form = target.closest("form");
    const envResourceIds = new Set(environmentResourceBindings()
      .filter((binding) => binding.environment_id === selected)
      .map((binding) => binding.resource_id));
    form?.querySelectorAll('input[name="resource_ids"]').forEach((box) => {
      box.checked = Boolean(selected) && envResourceIds.has(box.value);
    });
    applyBoundRulesToTaskForm(form, { replace: true });
    return;
  }
  if (["resource_ids", "service_ids"].includes(target.name) && target.closest("#edit-form")?.dataset.type === "task-create") {
    applyBoundRulesToTaskForm(target.closest("form"), { replace: true });
    return;
  }
  if (["inspection_scope"].includes(target.name) && target.closest("#edit-form")?.dataset.type === "task-create") {
    applyBoundRulesToTaskForm(target.closest("form"), { replace: true });
    return;
  }
  if (target.dataset.templateFilterKey) {
    const scope = target.dataset.templateFilterScope;
    state.filters[`${scope}:${target.dataset.templateFilterKey}`] = target.value;
    resetPage(scope);
    render();
    return;
  }
  if (target.dataset.pageSize) {
    setPageSize(target.dataset.pageSize, target.value);
    render();
    return;
  }
  if (target.dataset.taskFilter) {
    state.taskFilters[target.dataset.taskFilter] = target.value;
    resetPage("tasks");
    render();
    return;
  }
  if (target.dataset.issueFilter) {
    state.issueFilters[target.dataset.issueFilter] = target.value;
    resetPage("issues");
    render();
    return;
  }
  if (target.dataset.envStatusFilter !== undefined) {
    state.environmentStatusFilter = target.value || "all";
    resetPage("environment-apps");
    render();
    return;
  }
  if (target.id === "site-icon-image") {
    const file = target.files?.[0];
    if (!file) return;
    if (file.size > 350000) {
      toast("Icon image is too large", "error");
      target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const form = document.getElementById("site-settings-form");
      const hidden = form?.querySelector('input[name="icon_image"]');
      if (hidden) hidden.value = String(reader.result || "");
      const preview = form?.querySelector(".logo-mark");
      if (preview) {
        preview.innerHTML = `<img src="${escapeHtml(String(reader.result || ""))}" alt="">`;
        preview.removeAttribute("style");
      }
    };
    reader.readAsDataURL(file);
    return;
  }
  if (target.dataset.kind === "bulk") {
    const set = selectionSet(target.dataset.scope);
    target.checked ? set.add(target.dataset.id) : set.delete(target.dataset.id);
    render();
    return;
  }
  if (target.dataset.kind === "bulk-all") {
    const set = selectionSet(target.dataset.scope);
    const ids = (target.dataset.ids || "").split("|").filter(Boolean);
    ids.forEach((id) => {
      target.checked ? set.add(id) : set.delete(id);
    });
    render();
    return;
  }
  if (target.dataset.kind === "column-toggle") {
    toggleResourceColumn(target.dataset.column, target.checked);
    render();
    return;
  }
  if (target.dataset.kind === "issue-column-toggle") {
    toggleIssueColumn(target.dataset.column, target.checked);
    render();
    return;
  }
  if (target.dataset.kind === "report") {
    target.checked ? state.selectedReports.add(target.dataset.id) : state.selectedReports.delete(target.dataset.id);
  }
});

document.addEventListener("click", async (event) => {
  if (event.target.classList?.contains("modal-backdrop")) {
    closeModal();
    return;
  }
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  try {
    if (action === "nav") {
      state.view = target.dataset.view;
      localStorage.setItem("opsradar_view", state.view);
      render();
    } else if (action === "tab") {
      state.tabs[target.dataset.scope] = target.dataset.tab;
      localStorage.setItem(`opsradar_tab_${target.dataset.scope}`, target.dataset.tab);
      render();
    } else if (action === "page") {
      state.pages[target.dataset.scope] = Number(target.dataset.page);
      render();
    } else if (action === "task-step") {
      const form = target.closest("form");
      if (form?.dataset.type === "task-create") {
        applyBoundRulesToTaskForm(form);
        state.taskCreateDraft = collectTaskCreateDraft(form);
      }
      state.taskCreateStep = Math.min(4, Math.max(1, Number(target.dataset.step || 1)));
      render();
    } else if (action === "delete-selected") {
      await deleteSelected(target.dataset.scope);
    } else if (action === "toggle-filter-panel") {
      toggleFilterPanel(target.dataset.scope);
      render();
    } else if (action === "toggle-filter-submenu") {
      toggleFilterSubmenu(target.dataset.scope, target.dataset.name);
      render();
    } else if (action === "set-task-filter") {
      state.taskFilters[target.dataset.name] = target.dataset.value;
      resetPage("tasks");
      render();
    } else if (action === "set-issue-filter") {
      state.issueFilters[target.dataset.name] = target.dataset.value;
      resetPage("issues");
      render();
    } else if (action === "set-resource-filter") {
      state.resourceFilters[target.dataset.name] = target.dataset.value;
      resetPage("resources");
      render();
    } else if (action === "set-report-filter") {
      state.reportFilters[target.dataset.name] = target.dataset.value;
      resetPage("reports");
      render();
    } else if (action === "confirm-delete") {
      await performDeleteSelected();
    } else if (action === "bulk-resolve-issues") {
      const ids = [...selectionSet("issues")];
      if (!ids.length) {
        toast(t("toast.noSelection"), "error");
        return;
      }
      await api("/api/issues/bulk/resolve", {
        method: "POST",
        body: JSON.stringify({ ids, status: "resolved", resolution_note: "Bulk marked as resolved from OpsRadar console" }),
      });
      selectionSet("issues").clear();
      await refreshData(t("toast.issueUpdated"));
    } else if (action === "search-result") {
      state.view = target.dataset.view || "dashboard";
      if (target.dataset.tab) {
        const scope = state.view === "reports" ? "reports" : state.view === "settings" ? "settings" : state.view === "tasks" ? "tasks" : state.view === "problem-center" ? "problems" : state.view;
        state.tabs[scope] = target.dataset.tab;
        localStorage.setItem(`opsradar_tab_${scope}`, target.dataset.tab);
      }
      state.globalSearch.open = false;
      localStorage.setItem("opsradar_view", state.view);
      render();
    } else if (action === "clear-site-icon") {
      const form = document.getElementById("site-settings-form");
      const hidden = form?.querySelector('input[name="icon_image"]');
      const file = form?.querySelector("#site-icon-image");
      if (hidden) hidden.value = "";
      if (file) file.value = "";
      updateSitePreview(form);
      toast(t("action.clearIcon"));
    } else if (action === "theme") {
      setTheme(state.theme === "light" ? "dark" : "light");
      render();
    } else if (action === "language") {
      setLanguage(state.lang === "zh" ? "en" : "zh");
      render();
      toast(t("toast.languageChanged"));
    } else if (action === "logout") {
      logout();
    } else if (action === "refresh") {
      await refreshData(t("toast.syncComplete"));
    } else if (action === "open-ai-assistant" || action === "toggle-ai-assistant") {
      if (state.floatingAssistant.suppressToggle) {
        state.floatingAssistant.suppressToggle = false;
        return;
      }
      toggleAiAssistant();
    } else if (action === "send-ai-chat") {
      const chatRoot = target.closest(".ai-chat-window, .ai-chat-main");
      await sendAiChat(chatRoot?.querySelector("textarea")?.value, target.dataset.chatScope || "page");
    } else if (action === "ai-quick-prompt") {
      await sendAiChat(target.dataset.prompt, target.dataset.chatScope || "page");
    } else if (action === "ai-analyze-issue") {
      await sendAiChat(aiAnalyzeIssuePrompt(target.dataset.id), target.dataset.chatScope || "page");
    } else if (action === "workflow-next-action") {
      const workflowId = target.dataset.workflowId || "";
      const uiAction = target.dataset.uiAction || "";
      const actionName = target.dataset.actionName || "";
      const eventName = target.dataset.eventName || "";
      const params = decodeWorkflowParams(target.dataset.params);
      const scope = aiScopeFromElement(target);
      if (uiAction === "run_workflow_action") {
        await runWorkflowAction(workflowId, actionName, params, target.dataset.confirm === "true", scope);
      } else if (uiAction === "open_application_modal") {
        state.workflowCallback = { workflow_id: workflowId, event: eventName || "environment_created", type: "application", params, scope };
        state.applicationCreateDefaults = {
          name: params.name || "",
          env_type: params.env_type || "prod",
        };
        openModal("application", "new");
      } else if (uiAction === "open_resource_modal") {
        state.workflowCallback = { workflow_id: workflowId, event: eventName || "asset_created", type: "resource", params, scope };
        state.resourceCreateDefaults = {
          type: "host",
          port: 22,
          environment_id: params.environment_id || "",
        };
        openModal("resource", "new");
      } else if (uiAction === "open_environment_rules_modal") {
        state.workflowCallback = { workflow_id: workflowId, event: eventName || "rules_confirmed", type: "environment-rules", params, scope };
        openModal("environment-rules", params.environment_id || params.id || "");
      } else if (uiAction === "open_task_modal") {
        state.workflowCallback = { workflow_id: workflowId, event: eventName || "task_created", type: "task-create", params, scope };
        state.taskCreateDefaults = {
          inspection_scope: params.environment_id ? "environment" : "asset",
          environment_id: params.environment_id || "",
          resource_ids: params.resource_ids || [],
          item_ids: [],
          name: params.name || "",
        };
        openModal("task-create", "new");
      } else if (uiAction === "navigate") {
        state.view = params.view || state.view;
        if (params.tab) state.tabs[state.view] = params.tab;
        localStorage.setItem("opsradar_view", state.view);
        render();
      } else if (uiAction === "select_environment") {
        state.workflowCallback = { workflow_id: workflowId, event: eventName || "environment_selected", type: "application", params, scope };
        state.view = "resources";
        state.tabs.environments = "applications";
        render();
      } else if (uiAction === "select_assets") {
        state.workflowCallback = { workflow_id: workflowId, event: eventName || "asset_selected", type: "resource", params, scope };
        state.view = "resources";
        state.tabs.environments = "resources";
        render();
      }
    } else if (action === "clear-ai-chat") {
      clearAiChat(target.dataset.chatScope || "page");
    } else if (action === "load-ai-session") {
      await loadAiChatSession(target.dataset.id);
    } else if (action === "delete-ai-session") {
      state.modal = { type: "delete-confirm", scope: "ai-chat-sessions", ids: [target.dataset.id] };
      render();
    } else if (action === "run-task") {
      await runTask();
    } else if (action === "add-application") {
      openModal("application", "new");
    } else if (action === "edit-application") {
      openModal("application", target.dataset.id);
    } else if (action === "delete-application") {
      state.modal = { type: "delete-confirm", scope: "applications", ids: [target.dataset.id] };
      render();
    } else if (action === "edit-environment") {
      openModal("environment", target.dataset.id);
    } else if (action === "delete-environment") {
      state.modal = { type: "delete-confirm", scope: "environments", ids: [target.dataset.id] };
      render();
    } else if (action === "env-view-resources") {
      const env = environments().find((item) => item.id === target.dataset.id);
      state.tabs.environments = "resources";
      state.filters.resources = env ? `${env.application_name || ""} ${env.name || ""}`.trim() : "";
      localStorage.setItem("opsradar_tab_environments", "resources");
      resetPage("resources");
      render();
    } else if (action === "env-view-services") {
      const env = environments().find((item) => item.id === target.dataset.id);
      const hostIds = new Set((env?.resources || [])
        .map((binding) => binding.resource)
        .filter((resource) => resource && ["host", "linux", "server"].includes(resource.type))
        .map((resource) => resource.id));
      hostIds.forEach((id) => state.expandedResources.add(id));
      state.tabs.environments = "resources";
      state.filters.resources = env ? `${env.application_name || ""} ${env.name || ""}`.trim() : "";
      localStorage.setItem("opsradar_tab_environments", "resources");
      resetPage("resources");
      render();
    } else if (action === "bind-environment-rules") {
      openModal("environment-rules", target.dataset.id);
    } else if (action === "env-create-task") {
      const env = environments().find((item) => item.id === target.dataset.id);
      const defaultName = env ? `${displayApplicationName(env.application_name)} / ${env.name} ${state.lang === "zh" ? "巡检" : "Inspection"}` : "";
      state.taskCreateDefaults = { inspection_scope: "environment", environment_id: target.dataset.id, name: defaultName };
      openModal("task-create", "new");
    } else if (action === "add-inspection-item") {
      openModal("inspection-item", "new");
    } else if (action === "add-rule-set") {
      openModal("rule-set", "new");
    } else if (action === "edit-rule-set") {
      openModal("rule-set", target.dataset.id);
    } else if (action === "add-ai-model") {
      openModal("ai-model", "new");
    } else if (action === "edit-ai-model") {
      openModal("ai-model", target.dataset.id);
    } else if (action === "discover-ai-models") {
      await discoverAiModels(target);
    } else if (action === "select-discovered-model") {
      const form = target.closest("#edit-form");
      const input = form?.querySelector('input[name="model_name"]');
      const optionsBox = form?.querySelector("#ai-model-options");
      if (input) input.value = target.dataset.value || "";
      if (optionsBox) optionsBox.hidden = true;
    } else if (action === "test-ai-model-form") {
      await testAiModelFromForm(target);
    } else if (action === "test-ai-model") {
      await testAiModel(target.dataset.id);
    } else if (action === "delete-ai-model") {
      state.modal = { type: "delete-confirm", scope: "ai-models", ids: [target.dataset.id] };
      render();
    } else if (action === "add-ai-datasource") {
      openModal("ai-datasource", "new");
    } else if (action === "edit-ai-datasource") {
      openModal("ai-datasource", target.dataset.id);
    } else if (action === "edit-ai-assistant") {
      openModal("ai-assistant", "default");
    } else if (action === "add-analysis-rule") {
      openModal("analysis-rule", "new");
    } else if (action === "edit-analysis-rule") {
      openModal("analysis-rule", target.dataset.id);
    } else if (action === "delete-analysis-rule") {
      state.modal = { type: "delete-confirm", scope: "analysis-rules", ids: [target.dataset.id] };
      render();
    } else if (action === "toggle-check-group") {
      event.preventDefault();
      event.stopPropagation();
      toggleCheckGroup(target);
    } else if (action === "task-execution-log") {
      state.view = "audit";
      state.tabs.audit = "execution";
      state.filters["audit-execution"] = target.dataset.id || "";
      resetPage("audit-execution");
      localStorage.setItem("opsradar_view", state.view);
      localStorage.setItem("opsradar_tab_audit", state.tabs.audit);
      render();
    } else if (action === "start-task") {
      await api(`/api/tasks/${encodeURIComponent(target.dataset.id)}/start`, { method: "POST" });
      await refreshData(t("toast.taskQueued"));
    } else if (action === "rerun-task") {
      await api(`/api/tasks/${encodeURIComponent(target.dataset.id)}/rerun`, { method: "POST" });
      await refreshData(state.lang === "zh" ? "任务已重新执行" : "Task re-execution started");
    } else if (action === "view-task-report") {
      const task = (state.data.tasks || []).find((item) => item.id === target.dataset.id);
      state.view = "reports";
      state.tabs.reports = "history";
      state.filters.reports = task?.name || "";
      resetPage("reports");
      localStorage.setItem("opsradar_view", state.view);
      localStorage.setItem("opsradar_tab_reports", state.tabs.reports);
      render();
    } else if (action === "edit-task") {
      openModal("task-create", target.dataset.id);
    } else if (action === "reset-task-filters") {
      state.taskFilters = { status: "all", owner: "all" };
      state.filters.tasks = "";
      resetPage("tasks");
      render();
    } else if (action === "reset-issue-filters") {
      state.issueFilters = { task: "all", environment: "all", severity: "all", status: "all", resourceType: "all" };
      state.filters.issues = "";
      resetPage("issues");
      render();
    } else if (action === "export-report") {
      await exportReport(target.dataset.id, target.dataset.format);
    } else if (action === "delete-report") {
      state.modal = { type: "delete-confirm", scope: "reports", ids: [target.dataset.id] };
      render();
    } else if (action === "export-merged") {
      if (!selectionSet("reports").size) {
        toast(t("toast.selectReport"), "error");
        return;
      }
      await exportReport([...selectionSet("reports")], document.getElementById("merge-format").value);
    } else if (action === "issue-status") {
      await api(`/api/issues/${target.dataset.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: target.dataset.status, resolution_note: "Updated from OpsRadar console" }),
      });
      await refreshData(t("toast.issueUpdated"));
    } else if (action === "open-issue-detail") {
      state.issueDetailId = target.dataset.id;
      state.issueDetailTab = "overview";
      render();
    } else if (action === "issue-view-report") {
      const issue = (state.data.issues || []).find((item) => item.id === target.dataset.id);
      state.view = "reports";
      state.tabs.reports = "history";
      state.filters.reports = issue?.report_name || issue?.task_name || "";
      resetPage("reports");
      localStorage.setItem("opsradar_view", state.view);
      localStorage.setItem("opsradar_tab_reports", state.tabs.reports);
      render();
    } else if (action === "issue-view-task") {
      const issue = (state.data.issues || []).find((item) => item.id === target.dataset.id);
      state.view = "tasks";
      state.tabs.tasks = "tasks";
      state.filters.tasks = issue?.task_name || "";
      resetPage("tasks");
      localStorage.setItem("opsradar_view", state.view);
      localStorage.setItem("opsradar_tab_tasks", state.tabs.tasks);
      render();
    } else if (action === "back-issue-list") {
      state.issueDetailId = null;
      render();
    } else if (action === "issue-detail-tab") {
      state.issueDetailTab = target.dataset.tab || "overview";
      render();
    } else if (action === "run-issue-diagnosis") {
      await api(`/api/ai/analyze/issue/${encodeURIComponent(target.dataset.id)}`, { method: "POST" });
      await refreshData(state.lang === "zh" ? "诊断已生成" : "Diagnosis generated");
    } else if (action === "create-repair-task") {
      const issue = (state.data.issues || []).find((item) => item.id === target.dataset.id);
      if (!issue) return;
      const insight = issue.insight || {};
      await api("/api/repair-tasks", {
        method: "POST",
        body: JSON.stringify({
          issue_id: issue.id,
          title: `${state.lang === "zh" ? "修复" : "Fix"}：${issue.summary || issue.id}`,
          status: "pending",
          assignee: issue.assignee || "Unassigned",
          suggested_steps: insight.steps || [],
          verification: insight.verification || "",
          created_by_ai: Boolean(insight.id),
        }),
      });
      state.issueDetailTab = "fix";
      await refreshData(state.lang === "zh" ? "修复任务已创建" : "Fix task created");
    } else if (action === "issue-to-knowledge") {
      await api(`/api/issues/${encodeURIComponent(target.dataset.id)}/knowledge`, { method: "POST" });
      await refreshData(t("toast.knowledgeCreated"));
    } else if (action === "test-resource") {
      const id = target.dataset.id;
      state.testingResources.add(id);
      render();
      try {
        const updated = await api(`/api/resources/${id}/test`, { method: "POST" });
        const index = state.data.resources.findIndex((item) => item.id === id);
        if (index >= 0) state.data.resources[index] = updated;
        state.testingResources.delete(id);
        render();
        toast(t("toast.resourceTested"));
      } catch (err) {
        state.testingResources.delete(id);
        render();
        throw err;
      }
    } else if (action === "test-selected-resources") {
      const selected = [...selectionSet("resources")];
      const rows = state.data.resources
        .filter((res) => !(res.extra_params || {}).parent_resource_id)
        .map((res) => ({ ...res, environment_label: (res.environment_names || []).join(" / ") }));
      const filtered = filterRows("resources", rows, ["name", "type", "environment_label", "ip", "port", "os", "cpu", "memory", "status", "username"]);
      const resources = selected.length
        ? rows.filter((item) => selected.includes(item.id))
        : filtered;
      await testResourceBatch(resources);
    } else if (action === "discover-selected-services") {
      const selected = [...selectionSet("resources")];
      const rows = state.data.resources
        .filter((res) => !(res.extra_params || {}).parent_resource_id)
        .map((res) => ({ ...res, environment_label: (res.environment_names || []).join(" / ") }));
      const filtered = filterRows("resources", rows, ["name", "type", "environment_label", "ip", "port", "os", "cpu", "memory", "status", "username"]);
      const resources = selected.length
        ? rows.filter((item) => selected.includes(item.id))
        : filtered;
      await discoverResourceBatch(resources);
    } else if (action === "toggle-resource-services") {
      const id = target.dataset.id;
      state.expandedResources.has(id) ? state.expandedResources.delete(id) : state.expandedResources.add(id);
      render();
    } else if (action === "discover-resource-services") {
      const id = target.dataset.id;
      state.expandedResources.add(id);
      openModal("service-discovery", id);
    } else if (action === "add-resource") {
      openModal("resource", "new");
    } else if (action === "workflow-add-more-resource") {
      const callback = state.workflowCallback;
      state.modal = null;
      state.resourceCreateDefaults = {
        ...(state.resourceCreateDefaults || {}),
        environment_id: callback?.params?.environment_id || "",
      };
      openModal("resource", "new");
    } else if (action === "workflow-finish-resource-add") {
      const ids = [...new Set(state.workflowBatchAssets || [])];
      const callback = state.workflowCallback;
      if (!callback?.workflow_id || !ids.length) {
        state.modal = null;
        state.workflowBatchAssets = [];
        render();
        return;
      }
      await sendWorkflowEvent(callback.event || "asset_created", {
        resource_ids: ids,
        environment_id: callback.params?.environment_id || "",
      });
      state.workflowBatchAssets = [];
      state.modal = null;
      await refreshData(t("toast.saved"));
    } else if (action === "edit-resource") {
      openModal("resource", target.dataset.id);
    } else if (action === "delete-discovered-service") {
      state.modal = { type: "delete-confirm", scope: "discovered-services", ids: [target.dataset.id] };
      render();
    } else if (action === "add-resource-type") {
      openModal("resource-type", "new");
    } else if (action === "edit-resource-type") {
      openModal("resource-type", target.dataset.id);
    } else if (action === "add-user") {
      openModal("user", "new");
    } else if (action === "edit-user") {
      openModal("user", target.dataset.id);
    } else if (action === "add-role") {
      openModal("role", "new");
    } else if (action === "edit-role") {
      openModal("role", target.dataset.id);
    } else if (action === "close-modal") {
      closeModal();
    }
  } catch (err) {
    toast(friendlyError(err.message), "error");
  }
});

let aiSessionResize = null;
let aiFloatDrag = null;

document.addEventListener("mousedown", (event) => {
  const floatHandle = event.target.closest("[data-ai-drag-handle]");
  if (floatHandle && !event.target.closest("textarea, input, button:not(.ai-assistant-launcher), .ai-chat-close")) {
    const launcher = document.querySelector(".ai-assistant-launcher");
    const rect = launcher?.getBoundingClientRect();
    const current = state.floatingAssistant.position || {
      x: rect?.left ?? window.innerWidth - 90,
      y: rect?.top ?? window.innerHeight - 90,
    };
    aiFloatDrag = {
      startX: event.clientX,
      startY: event.clientY,
      startLeft: Number(current.x) || 0,
      startTop: Number(current.y) || 0,
      moved: false,
    };
    document.body.classList.add("is-dragging-ai-float");
    event.preventDefault();
    return;
  }
  const handle = event.target.closest(".ai-session-resizer");
  if (!handle) return;
  const sidebar = handle.closest(".ai-session-sidebar");
  aiSessionResize = {
    startX: event.clientX,
    startWidth: sidebar?.getBoundingClientRect().width || state.aiAssistant.sidebarWidth || 176,
  };
  document.body.classList.add("is-resizing-ai-session");
  event.preventDefault();
});

document.addEventListener("mousemove", (event) => {
  if (aiFloatDrag) {
    const dx = event.clientX - aiFloatDrag.startX;
    const dy = event.clientY - aiFloatDrag.startY;
    if (Math.abs(dx) + Math.abs(dy) > 4) aiFloatDrag.moved = true;
    const next = {
      x: Math.max(16, Math.min(aiFloatDrag.startLeft + dx, window.innerWidth - 80)),
      y: Math.max(16, Math.min(aiFloatDrag.startTop + dy, window.innerHeight - 80)),
    };
    state.floatingAssistant.position = next;
    const styles = aiFloatingStyles();
    const launcher = document.querySelector(".ai-assistant-launcher");
    const chatWindow = document.querySelector(".ai-chat-window");
    if (launcher) launcher.style.cssText += styles.launcher;
    if (chatWindow) chatWindow.style.cssText += styles.window;
    event.preventDefault();
    return;
  }
  if (!aiSessionResize) return;
  const width = Math.max(150, Math.min(360, Math.round(aiSessionResize.startWidth + event.clientX - aiSessionResize.startX)));
  state.aiAssistant.sidebarWidth = width;
  localStorage.setItem("opsradar_ai_session_width", String(width));
  document.querySelector(".ai-assistant-workbench")?.style.setProperty("--ai-session-width", `${width}px`);
});

document.addEventListener("mouseup", () => {
  if (aiFloatDrag) {
    state.floatingAssistant.suppressToggle = aiFloatDrag.moved;
    localStorage.setItem("opsradar_ai_float_position", JSON.stringify(state.floatingAssistant.position));
    aiFloatDrag = null;
    document.body.classList.remove("is-dragging-ai-float");
    setTimeout(() => {
      state.floatingAssistant.suppressToggle = false;
    }, 120);
    return;
  }
  if (!aiSessionResize) return;
  aiSessionResize = null;
  document.body.classList.remove("is-resizing-ai-session");
});

async function boot() {
  setTheme(state.theme);
  setLanguage(state.lang);
  document.getElementById("app").innerHTML = `<div class="loading">${state.lang === "zh" ? "正在加载 OpsRadar..." : "Loading OpsRadar..."}</div>`;
  await loadPublicSiteSettings();
  if (!state.token) {
    renderLogin();
    return;
  }
  try {
    await loadBootstrap();
    render();
  } catch {
    logout(false);
  }
}

boot();
