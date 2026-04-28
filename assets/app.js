const NAV_ITEMS = [
  ["dashboard", "dashboard"],
  ["tasks", "tasks"],
  ["reports", "reports"],
  ["templates", "shield"],
  ["resources", "server"],
  ["audit", "audit"],
  ["settings", "settings"],
];

const I18N = {
  en: {
    "brand.subtitle": "Inspection Operations",
    "brand.loginSubtitle": "Automated Inspection Management Platform",
    "login.eyebrow": "Enterprise Inspection Console",
    "login.title": "Enterprise Inspection Console",
    "login.desc": "Unify resource groups, inspection tasks, report archives and issue closure in a calm administrative overview for daily operations.",
    "login.resourceGroups": "Resource Groups",
    "login.managedResources": "Managed Resources",
    "login.auditEvents": "Audit Events",
    "login.signIn": "Sign in",
    "login.access": "Access the OpsRadar administrative overview.",
    "login.username": "Username",
    "login.password": "Password",
    "login.submit": "Sign in to console",
    "login.remember": "Remember me",
    "login.forgot": "Forgot password?",
    "login.issueLoop": "Operations Overview",
    "login.issueLoopDesc": "Review tasks, resources and issue health at a glance",
    "login.taskOps": "Inspection Tasks",
    "login.taskOpsDesc": "Configure plans, execute and trace inspections",
    "login.reportHub": "Report Center",
    "login.reportHubDesc": "Archive reports and analyze inspection results",
    "nav.dashboard": "Overview",
    "nav.resources": "Resources",
    "nav.templates": "Inspection Templates",
    "nav.tasks": "Task Center",
    "nav.reports": "Reports",
    "nav.issues": "Issues",
    "nav.users": "User Management",
    "nav.roles": "Roles & Permissions",
    "nav.audit": "Audit Logs",
    "nav.settings": "Settings",
    "page.dashboard": "Overview",
    "page.resources": "Resource Inventory",
    "page.templates": "Inspection Templates",
    "page.tasks": "Task Center",
    "page.reports": "Inspection Reports",
    "page.issues": "Issue Management",
    "page.users": "User Management",
    "page.roles": "Roles & Permissions",
    "page.audit": "Audit Logs",
    "page.settings": "System Settings",
    "top.home": "Home",
    "top.notifications": "Notifications",
    "top.sync": "Sync Status",
    "top.light": "Light",
    "top.dark": "Dark",
    "top.darkMode": "Dark Mode",
    "top.lightMode": "Light Mode",
    "top.language": "Language",
    "top.logout": "Logout",
    "search.placeholder": "Search resources, groups, templates, tasks, reports...",
    "search.local": "Search current list...",
    "search.empty": "No matching records",
    "search.hint": "Global search",
    "cards.totalUsers": "Total Users",
    "cards.totalUsersFoot": "RBAC-enabled operators",
    "cards.loginsToday": "Logins Today",
    "cards.loginsTodayFoot": "Interactive and token sessions",
    "cards.auditEvents": "Audit Events",
    "cards.auditEventsFoot": "Recent control-plane events",
    "cards.resourceGroups": "Resource Groups",
    "cards.resourceGroupsFoot": "Projects and resource collections",
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
    "dashboard.taskTypes": "Task Types",
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
    "table.resourceGroup": "Resource Group",
    "table.tags": "Tags",
    "table.owner": "Owner",
    "table.status": "Status",
    "table.credential": "Credential",
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
    "resources.testOnline": "Test online resources",
    "resources.test": "Test",
    "resources.testing": "Testing",
    "resources.list": "Resource List",
    "resources.groups": "Resource Groups",
    "resources.columns": "Columns",
    "resources.batchAdd": "Batch add",
    "resources.batchHelp": "One resource per line: name,ip,type,port,username,credential_type,credential_secret,group_id",
    "resources.unGrouped": "Ungrouped",
    "resources.credentialConfigured": "Configured",
    "resources.credentialMissing": "Missing",
    "resources.password": "Password",
    "resources.key": "Key",
    "action.edit": "Edit",
    "action.addResource": "Add resource",
    "action.addResourceGroup": "Add resource group",
    "action.addResourceType": "Add resource type",
    "action.addTaskType": "Add task type",
    "action.deleteSelected": "Delete selected",
    "action.confirmDelete": "Confirm delete",
    "action.prev": "Previous",
    "action.next": "Next",
    "action.save": "Save changes",
    "action.create": "Create",
    "action.cancel": "Cancel",
    "action.selectAll": "Select all",
    "action.clearSelection": "Clear",
    "action.clearIcon": "Clear icon",
    "modal.addResource": "Add resource",
    "modal.batchAddResources": "Batch add resources",
    "modal.editResource": "Edit resource",
    "modal.addResourceGroup": "Add resource group",
    "modal.editResourceGroup": "Edit resource group",
    "modal.addResourceType": "Add resource type",
    "modal.editResourceType": "Edit resource type",
    "modal.addTaskType": "Add task type",
    "modal.editTaskType": "Edit task type",
    "modal.createTask": "Create Task",
    "modal.editTask": "Edit Task",
    "modal.addInspectionItem": "Add Custom Check",
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
    "form.resourceGroup": "Resource group",
    "form.targetResources": "Target resources",
    "form.noResources": "No resources available. Add resources first.",
    "form.noInspectionItems": "No inspection items available.",
    "form.expectedPattern": "Judgement rule",
    "form.commandType": "Command type",
    "tasks.logs": "Logs",
    "tasks.start": "Start",
    "tasks.viewReport": "Report",
    "reports.archive": "Report Archive",
    "reports.desc": "Single report export or multi-report merge in HTML, DOCX and PDF.",
    "reports.merge": "Merge export",
    "reports.history": "History Reports",
    "reports.issues": "Issue Management",
    "templates.category": "Template Categories",
    "templates.categoryDesc": "Group inspection templates by asset type and operations team.",
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
    "users.title": "Users",
    "roles.title": "Roles & Permissions",
    "audit.title": "Audit Logs",
    "audit.desc": "Control-plane activity and inspection operations.",
    "audit.login": "Login Logs",
    "audit.operation": "Operation Logs",
    "audit.execution": "Execution Logs",
    "audit.level": "Level",
    "audit.message": "Message",
    "settings.notifications": "Notification Channels",
    "settings.notificationsDesc": "Email, WeCom and Feishu gateway configuration.",
    "settings.resourceTypes": "Resource Types",
    "settings.taskTypes": "Task Types",
    "settings.site": "Website Settings",
    "settings.siteDesc": "Configure the product name, subtitle and brand icon.",
    "settings.users": "Users",
    "settings.audit": "Audit Logs",
    "settings.adminRecords": "Administrative records from the OpsRadar control plane.",
    "pagination.summary": "{start}-{end} of {total}",
    "confirm.deleteSelected": "Delete {count} selected record(s)? This cannot be undone.",
    "confirm.deleteTitle": "Delete selected records",
    "confirm.deleteSubtitle": "This action will remove the selected data from OpsRadar and cannot be undone.",
    "confirm.deleteScope": "Scope",
    "confirm.deleteCount": "Records",
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
    "toast.selectTaskResources": "Select a resource group or at least one target resource",
    "toast.selectTaskItems": "Select at least one inspection metric",
    "toast.missingPermission": "Missing permission",
    "toast.taskQueued": "Inspection task queued",
    "toast.selectReport": "Select at least one report",
    "toast.issueUpdated": "Issue updated",
    "toast.resourceTested": "Resource test completed",
    "toast.resourcesTested": "Selected resources tested",
    "toast.reportExported": "report exported",
    "toast.saved": "Changes saved",
  },
  zh: {
    "brand.subtitle": "巡检运营中心",
    "brand.loginSubtitle": "运维自动化巡检管理平台",
    "login.eyebrow": "企业级巡检控制台",
    "login.title": "企业级巡检控制台",
    "login.desc": "统一资源组、巡检任务、报告归档和异常闭环，以稳定克制的管理台体验支撑日常运维值守。",
    "login.resourceGroups": "资源组",
    "login.managedResources": "纳管资源",
    "login.auditEvents": "审计事件",
    "login.signIn": "登录",
    "login.access": "进入 OpsRadar 运维管理概览。",
    "login.username": "用户名",
    "login.password": "密码",
    "login.submit": "登录控制台",
    "login.remember": "记住我",
    "login.forgot": "忘记密码？",
    "login.issueLoop": "运营总览",
    "login.issueLoopDesc": "查看任务、资源与异常关键指标",
    "login.taskOps": "巡检任务",
    "login.taskOpsDesc": "配置计划、执行与跟踪",
    "login.reportHub": "报告中心",
    "login.reportHubDesc": "查看归档报告与结果分析",
    "nav.dashboard": "概览",
    "nav.resources": "资源列表",
    "nav.templates": "巡检模板",
    "nav.tasks": "任务中心",
    "nav.reports": "巡检报告",
    "nav.issues": "异常管理",
    "nav.users": "用户管理",
    "nav.roles": "角色与权限",
    "nav.audit": "审计日志",
    "nav.settings": "系统设置",
    "page.dashboard": "概览",
    "page.resources": "资源台账",
    "page.templates": "巡检模板",
    "page.tasks": "任务中心",
    "page.reports": "巡检报告",
    "page.issues": "异常管理",
    "page.users": "用户管理",
    "page.roles": "角色与权限",
    "page.audit": "审计日志",
    "page.settings": "系统设置",
    "top.home": "首页",
    "top.notifications": "通知",
    "top.sync": "同步状态",
    "top.light": "浅色",
    "top.dark": "深色",
    "top.darkMode": "深色模式",
    "top.lightMode": "浅色模式",
    "top.language": "语言",
    "top.logout": "退出登录",
    "search.placeholder": "搜索资源、资源组、模板、任务、报告...",
    "search.local": "搜索当前列表...",
    "search.empty": "没有匹配记录",
    "search.hint": "全局搜索",
    "cards.totalUsers": "用户总数",
    "cards.totalUsersFoot": "启用 RBAC 的运维人员",
    "cards.loginsToday": "今日登录",
    "cards.loginsTodayFoot": "交互登录与令牌会话",
    "cards.auditEvents": "审计事件",
    "cards.auditEventsFoot": "近期控制面事件",
    "cards.resourceGroups": "资源组",
    "cards.resourceGroupsFoot": "项目与资源集合",
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
    "dashboard.taskTypes": "任务类型",
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
    "table.resourceGroup": "资源组",
    "table.tags": "标签",
    "table.owner": "负责人",
    "table.status": "状态",
    "table.credential": "凭据",
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
    "resources.testOnline": "测试在线资源",
    "resources.test": "测试",
    "resources.testing": "测试中",
    "resources.list": "资源列表",
    "resources.groups": "资源组",
    "resources.columns": "列设置",
    "resources.batchAdd": "批量添加",
    "resources.batchHelp": "每行一个资源：名称,IP,类型,端口,账号,凭据类型,密码或私钥,资源组ID",
    "resources.unGrouped": "未分组",
    "resources.credentialConfigured": "已配置",
    "resources.credentialMissing": "未配置",
    "resources.password": "密码",
    "resources.key": "密钥",
    "action.edit": "编辑",
    "action.addResource": "添加资源",
    "action.addResourceGroup": "添加资源组",
    "action.addResourceType": "添加资源类型",
    "action.addTaskType": "添加任务类型",
    "action.deleteSelected": "删除所选",
    "action.confirmDelete": "确认删除",
    "action.prev": "上一页",
    "action.next": "下一页",
    "action.save": "保存修改",
    "action.create": "创建",
    "action.cancel": "取消",
    "action.selectAll": "全选",
    "action.clearSelection": "取消全选",
    "action.clearIcon": "清除图标",
    "modal.addResource": "添加资源",
    "modal.batchAddResources": "批量添加资源",
    "modal.editResource": "编辑资源",
    "modal.addResourceGroup": "添加资源组",
    "modal.editResourceGroup": "编辑资源组",
    "modal.addResourceType": "添加资源类型",
    "modal.editResourceType": "编辑资源类型",
    "modal.addTaskType": "添加任务类型",
    "modal.editTaskType": "编辑任务类型",
    "modal.createTask": "创建任务",
    "modal.editTask": "编辑任务",
    "modal.addInspectionItem": "新增自定义巡检项",
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
    "form.resourceGroup": "资源组",
    "form.targetResources": "目标资源",
    "form.noResources": "暂无可选资源，请先添加资源。",
    "form.noInspectionItems": "暂无可选巡检项。",
    "form.expectedPattern": "判定规则",
    "form.commandType": "命令类型",
    "tasks.logs": "日志",
    "tasks.start": "启动",
    "tasks.viewReport": "查看报告",
    "reports.archive": "报告归档",
    "reports.desc": "支持单份报告导出或多份合并导出，格式为 HTML、DOCX 与 PDF。",
    "reports.merge": "合并导出",
    "reports.history": "历史报告",
    "reports.issues": "异常管理",
    "templates.category": "模板分类管理",
    "templates.categoryDesc": "按主机、数据库、Web 资产等类型组织巡检模板。",
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
    "users.title": "用户",
    "roles.title": "角色与权限",
    "audit.title": "审计日志",
    "audit.desc": "控制面活动与巡检操作记录。",
    "audit.login": "登录日志",
    "audit.operation": "操作日志",
    "audit.execution": "执行日志",
    "audit.level": "级别",
    "audit.message": "消息",
    "settings.notifications": "通知通道",
    "settings.notificationsDesc": "邮件、企业微信与飞书网关配置。",
    "settings.resourceTypes": "资源类型",
    "settings.taskTypes": "任务类型",
    "settings.site": "网站设置",
    "settings.siteDesc": "配置网站名称、副标题和品牌图标。",
    "settings.users": "用户管理",
    "settings.audit": "审计日志",
    "settings.adminRecords": "来自 OpsRadar 控制面的管理记录。",
    "pagination.summary": "第 {start}-{end} 条 / 共 {total} 条",
    "confirm.deleteSelected": "确认删除选中的 {count} 条记录？此操作不可撤销。",
    "confirm.deleteTitle": "删除所选记录",
    "confirm.deleteSubtitle": "此操作会从 OpsRadar 中移除所选数据，删除后不可恢复。",
    "confirm.deleteScope": "删除范围",
    "confirm.deleteCount": "记录数量",
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
    "toast.selectTaskResources": "请选择资源组或至少一个目标资源",
    "toast.selectTaskItems": "请至少选择一个巡检指标",
    "toast.missingPermission": "缺少操作权限",
    "toast.taskQueued": "巡检任务已入队",
    "toast.selectReport": "请至少选择一份报告",
    "toast.issueUpdated": "异常已更新",
    "toast.resourceTested": "资源测试完成",
    "toast.resourcesTested": "已测试所选资源",
    "toast.reportExported": "报告已导出",
    "toast.saved": "修改已保存",
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
  testingResources: new Set(),
  taskFilters: {
    type: "all",
    status: "all",
    owner: "all",
  },
  tabs: {
    reports: localStorage.getItem("opsradar_tab_reports") || "history",
    audit: localStorage.getItem("opsradar_tab_audit") || "login",
    resources: localStorage.getItem("opsradar_tab_resources") || "list",
    templates: localStorage.getItem("opsradar_tab_templates") || "builtin",
    settings: localStorage.getItem("opsradar_tab_settings") || "site",
  },
  globalSearch: {
    query: "",
    results: [],
    open: false,
    seq: 0,
  },
  polling: null,
  modal: null,
};

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
  trash: "M3 6h18M8 6V4h8v2m-9 0 1 15h8l1-15M10 11v6m4-6v6",
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
    if (response.status === 401) {
      logout(false);
      throw new Error("Session expired");
    }
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
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
  if (raw.includes("Session expired")) return state.lang === "zh" ? "登录已过期，请重新登录" : "Session expired. Please sign in again.";
  return raw;
}

function statusClass(status) {
  if (["active", "online", "success", "finished", "resolved", "healthy"].includes(status)) return status;
  if (["running", "queued", "in_progress", "testing", "review", "fail", "warning"].includes(status)) return status;
  if (["offline", "exception", "open", "failed"].includes(status)) return status;
  if (["cancelled", "disabled"].includes(status)) return status;
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
      success: "Success",
      fail: "Failed",
      exception: "Exception",
      open: "Open",
      in_progress: "In Progress",
      resolved: "Resolved",
      ignored: "Ignored",
      disabled: "Disabled",
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
      success: "成功",
      fail: "失败",
      exception: "异常",
      open: "待处理",
      in_progress: "处理中",
      resolved: "已解决",
      ignored: "已忽略",
      disabled: "停用",
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

function taskTypes() {
  return state.data?.task_types || [];
}

function taskTypeLabel(key) {
  const aliases = { manual: "daily", cron: "periodic" };
  const lookupKey = aliases[key] || key;
  return taskTypes().find((item) => item.key === lookupKey)?.name || key;
}

function taskTypeOptions() {
  return taskTypes()
    .filter((item) => item.enabled)
    .map((item) => [item.key, taskTypeLabel(item.key)]);
}

function resourceGroups() {
  return state.data?.resource_groups || [];
}

function resourceGroupName(id) {
  return resourceGroups().find((group) => group.id === id)?.name || t("resources.unGrouped");
}

function resourceGroupOptions() {
  return [["", "-"], ...resourceGroups().map((group) => [group.id, group.name])];
}

const RESOURCE_COLUMNS = [
  ["name", "table.name"],
  ["type", "table.type"],
  ["group", "table.resourceGroup"],
  ["address", "table.address"],
  ["credential", "table.credential"],
  ["status", "table.status"],
  ["system", "table.system"],
  ["metrics", "table.metrics"],
  ["created", "table.created"],
];

function visibleResourceColumns() {
  const fallback = ["name", "type", "group", "address", "credential", "status"];
  const configured = Array.isArray(state.resourceColumns) && state.resourceColumns.length ? state.resourceColumns : fallback;
  return RESOURCE_COLUMNS.filter(([key]) => configured.includes(key));
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

function tableToolbar(scope, title, subtitle, total, extra = "", allowDelete = true) {
  const hasTitle = Boolean(title || subtitle);
  return `
    <div class="table-toolbar ${hasTitle ? "" : "compact"}">
      ${hasTitle ? `<div class="table-toolbar-title">
        <h2 class="panel-title">${escapeHtml(title)}</h2>
        <div class="panel-subtitle">${escapeHtml(subtitle)}</div>
      </div>` : ""}
      <div class="table-toolbar-actions">
        <label class="table-search">
          ${icon("search")}
          <input value="${escapeHtml(state.filters[scope] || "")}" data-filter-scope="${scope}" placeholder="${t("search.local")}">
        </label>
        ${extra}
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

function toast(message) {
  const node = document.getElementById("toast");
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove("show"), 2800);
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
    state.view = "reports";
    state.tabs.reports = "issues";
    localStorage.setItem("opsradar_view", state.view);
    localStorage.setItem("opsradar_tab_reports", state.tabs.reports);
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
            <div class="profile-meta">${escapeHtml(state.user.email)}<br>${escapeHtml(state.user.role)} · ${escapeHtml(state.user.system_version)}</div>
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
    ${renderModal()}
  `;
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
          <div class="visual-shield">${icon("shield")}</div>
        </div>
        <div class="login-features">
          <div class="login-feature">${icon("shield")}<div><strong>${t("login.issueLoop")}</strong><span>${t("login.issueLoopDesc")}</span></div></div>
          <div class="login-feature">${icon("checklist")}<div><strong>${t("login.taskOps")}</strong><span>${t("login.taskOpsDesc")}</span></div></div>
          <div class="login-feature">${icon("document")}<div><strong>${t("login.reportHub")}</strong><span>${t("login.reportHubDesc")}</span></div></div>
        </div>
      </section>
      <section class="login-panel-wrap">
        <form class="login-panel" id="login-form">
          <h2>${t("login.signIn")}</h2>
          <p>${t("login.access")}</p>
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
              <input class="input" id="password" name="password" type="password" autocomplete="current-password" value="OpsRadar@123">
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
  `;
}

function pageTitle() {
  return t(`page.${state.view}`) || t("page.dashboard");
}

function renderView() {
  switch (state.view) {
    case "resources":
      return renderResources();
    case "templates":
      return renderTemplates();
    case "tasks":
      return renderTasks();
    case "reports":
      return renderReports();
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
  const totalTasks = cards.total_tasks || 0;
  const runningTasks = cards.running_tasks || 0;
  const finishedTasks = cards.finished_tasks || 0;
  const resources = cards.managed_resources || 0;
  const online = cards.online_resources || Math.round((resources * Number(cards.online_rate || 0)) / 100);
  const abnormalReports = sumBy(weeklyReports, "abnormal") || cards.open_issues || 0;
  return `
    <div class="overview-kpi-grid">
      ${overviewKpiCard({
        label: t("dashboard.totalTasks"),
        value: totalTasks,
        iconName: "checklist",
        body: `
          <div class="overview-task-split">
            <span>${icon("play")}<em>${t("dashboard.runningTasks")}</em><strong>${escapeHtml(runningTasks)}</strong></span>
            <span>${icon("shield")}<em>${t("tasks.completed")}</em><strong>${escapeHtml(finishedTasks)}</strong></span>
          </div>
        `,
      })}
      ${overviewKpiCard({
        label: t("cards.managedResources"),
        value: resources,
        iconName: "server",
        body: `<div class="overview-kpi-note">${state.lang === "zh" ? "设备总量" : "Total devices"}</div>`,
        wave: true,
      })}
      ${overviewKpiCard({
        label: t("dashboard.online"),
        value: "",
        iconName: "trend",
        body: `
          ${overviewRateRing(cards.online_rate || 0)}
          <div class="overview-kpi-note">${formatTemplate(t("dashboard.onlineText"), { online, total: resources })}</div>
        `,
      })}
      ${overviewKpiCard({
        label: state.lang === "zh" ? "异常报告" : "Abnormal Reports",
        value: abnormalReports,
        iconName: "alert",
        tone: "bad",
        body: `<div class="overview-kpi-note">${t("dashboard.recentAbnormalReports")}</div>`,
        wave: true,
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
    <div class="task-type-overview">
      <div class="ops-donut compact" style="--donut:${gradient}">
        <div class="ops-donut-center">
          <strong>${escapeHtml(total)}</strong>
          <span>${t("dashboard.totalTasks")}</span>
        </div>
      </div>
      <div class="task-type-legend">
        <h3>${escapeHtml(title)}</h3>
        <div class="ops-overview-list">
          ${parts.map((part) => overviewLegend(part.label, part.value, part.tone, `${percent(part.value, total)}%`)).join("")}
        </div>
      </div>
    </div>
  `;
}

function dashboardTaskTypeParts() {
  const colors = ["var(--brand)", "var(--violet)", "var(--warn)", "var(--bad)", "var(--brand-2)"];
  const tones = ["brand", "violet", "warn", "bad", "blue"];
  const order = ["daily", "periodic", "compliance"];
  const counts = new Map(taskTypes().map((type) => [type.key, 0]));
  (state.data.tasks || []).forEach((task) => {
    const key = task.task_type === "manual" ? "daily" : task.task_type === "cron" ? "periodic" : task.task_type || "daily";
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...taskTypes()].sort((a, b) => {
    const left = order.includes(a.key) ? order.indexOf(a.key) : order.length;
    const right = order.includes(b.key) ? order.indexOf(b.key) : order.length;
    return left - right || a.name.localeCompare(b.name);
  }).map((type, index) => ({
    label: type.name,
    value: counts.get(type.key) || 0,
    color: colors[index % colors.length],
    tone: tones[index % tones.length],
  }));
}

function renderOpsOverview(cards, taskMix) {
  const taskTypeParts = dashboardTaskTypeParts();
  const taskTypeTotal = taskTypeParts.reduce((sum, part) => sum + part.value, 0);
  return `
    <section class="panel ops-panel">
      <div class="panel-head"><h2 class="panel-title">${t("dashboard.opsOverview")}</h2></div>
      <div class="ops-overview-block">
        ${overviewDonut(t("dashboard.taskTypes"), taskTypeTotal, taskTypeParts)}
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
        <button class="btn small" data-action="nav" data-view="reports">${t("dashboard.viewIssues")}</button>
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
        <button class="btn ghost small" data-action="nav" data-view="reports">${t("dashboard.viewAll")}</button>
      </div>
      <div class="issue-focus-list">
        ${issues.length ? issues.map((issue) => `
          <button class="issue-focus-item" data-action="nav" data-view="reports">
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

function renderDashboard() {
  const cards = state.data.dashboard.cards;
  const taskMix = state.data.dashboard.task_mix || {};
  const weeklyTasks = state.data.dashboard.weekly_tasks || [];
  const weeklyReports = state.data.dashboard.weekly_reports || [];
  return `
    <section class="section-grid">
      ${renderOverviewKpis(cards, weeklyReports)}
      <div class="ops-dashboard-grid">
        <div class="ops-main-stack">
          ${renderTaskTrend(weeklyTasks)}
          ${renderReportTrend(weeklyReports)}
        </div>
        <div class="ops-side-stack">
          ${renderOpsOverview(cards, taskMix)}
          ${renderImportantIssues()}
        </div>
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

function renderResources() {
  state.tabs.resources = state.tabs.resources || "list";
  return `
    <section class="panel page-panel">
      <div class="panel-head tab-head">
        ${subnav("resources", [
          ["list", t("resources.list"), state.data.resources.length],
          ["groups", t("resources.groups"), resourceGroups().length],
        ])}
      </div>
      ${state.tabs.resources === "groups" ? renderResourceGroupsPanel() : renderResourceListPanel()}
    </section>
  `;
}

function resourceCell(res, key) {
  const effectiveStatus = state.testingResources.has(res.id) ? "testing" : res.status;
  const map = {
    name: `<td><strong>${escapeHtml(res.name)}</strong><div class="muted mono">${escapeHtml(res.id)}</div></td>`,
    type: `<td>${escapeHtml(resourceTypeLabel(res.type))}</td>`,
    group: `<td>${escapeHtml(res.group_label || "-")}</td>`,
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

function renderResourceListPanel() {
  const rows = state.data.resources.map((res) => ({ ...res, group_label: res.group_name || resourceGroupName(res.group_id) }));
  const filtered = filterRows("resources", rows, ["name", "type", "group_label", "ip", "port", "os", "cpu", "memory", "status", "username"]);
  const pageInfo = paginate("resources", filtered);
  const resourceActions = `
    <button class="btn primary small" data-action="add-resource">${t("action.addResource")}</button>
    <button class="btn small" data-action="batch-add-resource">${t("resources.batchAdd")}</button>
    ${columnPicker()}
    <button class="btn small" data-action="test-online">${t("resources.testOnline")}</button>
  `;
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
                </td>
              </tr>
            `).join("") || `<tr><td colspan="${columns.length + 2}"><div class="empty">${t("search.empty")}</div></td></tr>`}
          </tbody>
        </table>
      </div>
      ${pagination("resources", pageInfo)}
    </div>
  `;
}

function renderResourceGroupsPanel() {
  const filtered = filterRows("resource-groups", resourceGroups(), ["name", "owner", "description", "status"]);
  const pageInfo = paginate("resource-groups", filtered);
  return `
    <div class="module-pane">
      ${tableToolbar("resource-groups", "", "", filtered.length, `<button class="btn primary small" data-action="add-resource-group">${t("action.addResourceGroup")}</button>`)}
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th class="select-col">${selectAllCell("resource-groups", pageInfo.items)}</th><th>${t("table.resourceGroup")}</th><th>${t("table.owner")}</th><th>${t("table.tags")}</th><th>${t("table.status")}</th><th>${t("table.action")}</th></tr></thead>
          <tbody>
            ${pageInfo.items.map((group) => `
              <tr>
                <td class="select-col">${checkboxCell("resource-groups", group.id)}</td>
                <td><strong>${escapeHtml(group.name)}</strong><div class="muted">${escapeHtml(group.description || "")}</div><div class="muted mono">${escapeHtml(group.id)}</div></td>
                <td>${escapeHtml(group.owner || "-")}</td>
                <td>${escapeHtml((group.tags || []).join(", ") || "-")}</td>
                <td><span class="status ${statusClass(group.status)}">${statusText(group.status)}</span></td>
                <td><button class="btn small" data-action="edit-resource-group" data-id="${group.id}">${t("action.edit")}</button></td>
              </tr>
            `).join("") || `<tr><td colspan="6"><div class="empty">${t("search.empty")}</div></td></tr>`}
          </tbody>
        </table>
      </div>
      ${pagination("resource-groups", pageInfo)}
    </div>
  `;
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
    const normalizedType = task.task_type === "manual" ? "daily" : task.task_type === "cron" ? "periodic" : task.task_type || "daily";
    return {
      ...task,
      source: "task",
      bulk_id: task.id,
      type: normalizedType,
      typeLabel: taskTypeLabel(normalizedType),
      owner: taskOwner(task.created_by),
      schedule: task.started_at || task.created_at,
      period: taskTypeLabel(normalizedType),
      target: task.group?.name || (task.group_id ? resourceGroupName(task.group_id) : `资源结果 ${task.summary?.total || 0}`),
      progress: taskProgress(task),
      sortTime: task.started_at || task.created_at,
    };
  });
  const planItems = (state.data.cron_plans || []).map((plan) => ({
    id: plan.id,
    bulk_id: `plan:${plan.id}`,
    name: plan.name,
    source: "plan",
    type: plan.task_type || "periodic",
    typeLabel: taskTypeLabel(plan.task_type || "periodic"),
    owner: taskOwner(plan.created_by),
    status: plan.enabled ? "pending" : "disabled",
    schedule: plan.next_run_at,
    period: plan.cron_expr,
    target: `${(plan.resource_ids || []).length} 个资源 / ${(plan.item_ids || []).length} 个巡检项`,
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
    const matchesQuery = !query || rowText(task, ["name", "id", "target", "owner", "status", "typeLabel"]).includes(query);
    const matchesType = state.taskFilters.type === "all" || task.type === state.taskFilters.type;
    const matchesStatus = state.taskFilters.status === "all" || task.status === state.taskFilters.status;
    const matchesOwner = state.taskFilters.owner === "all" || task.owner === state.taskFilters.owner;
    return matchesQuery && matchesType && matchesStatus && matchesOwner;
  });
}

function taskFilterSelect(name, label, options) {
  return `
    <label class="task-filter">
      <span>${escapeHtml(label)}</span>
      <select class="select compact-select" data-task-filter="${name}">
        ${options.map(([value, text]) => `<option value="${escapeHtml(value)}" ${state.taskFilters[name] === value ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
      </select>
    </label>
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

function taskActionButtons(task) {
  const id = escapeHtml(rowBulkId(task));
  const taskId = escapeHtml(task.id);
  const reportAvailable = task.source === "task" && ["finished", "failed"].includes(task.status);
  return `
    <div class="row-actions task-actions">
      ${canStartTask(task) ? `<button class="btn primary small" data-action="start-task" data-id="${taskId}">${icon("play")} ${t("tasks.start")}</button>` : ""}
      <button class="btn small" data-action="edit-task" data-id="${id}">${t("action.edit")}</button>
      <button class="btn ghost small log-action" data-action="task-execution-log" data-id="${taskId}">${icon("audit")} ${t("tasks.logs")}</button>
      ${reportAvailable ? `<button class="btn ghost small" data-action="view-task-report" data-id="${taskId}">${icon("reports")} ${t("tasks.viewReport")}</button>` : ""}
    </div>
  `;
}

function renderTasks() {
  const rows = taskRows();
  const filtered = filteredTaskRows();
  const pageInfo = paginate("tasks", filtered, pageSize("tasks"));
  const owners = [...new Set(rows.map((task) => task.owner).filter(Boolean))];
  return `
    <section class="task-center-shell">
      <section class="panel task-main-panel">
        <div class="task-filter-bar">
          ${taskFilterSelect("type", t("table.type"), [["all", t("tasks.all")], ...taskTypeOptions()])}
          ${taskFilterSelect("status", t("table.status"), [["all", t("tasks.all")], ["pending", statusText("pending")], ["queued", statusText("queued")], ["running", statusText("running")], ["finished", statusText("finished")], ["failed", statusText("failed")]])}
          ${taskFilterSelect("owner", t("tasks.owner"), [["all", t("tasks.all")], ...owners.map((owner) => [owner, owner])])}
          <label class="table-search task-search">
            ${icon("search")}
            <input value="${escapeHtml(state.filters.tasks || "")}" data-filter-scope="tasks" placeholder="${t("tasks.searchPlaceholder")}">
          </label>
          <button class="btn small" data-action="reset-task-filters">${t("tasks.reset")}</button>
          ${bulkDeleteButton("tasks")}
          <button class="btn primary small" data-action="run-task">${icon("play")} ${t("tasks.new")}</button>
        </div>
        <div class="table-wrap">
          <table class="table task-table">
            <thead><tr><th class="select-col">${selectAllCell("tasks", pageInfo.items)}</th><th>${t("table.task")}</th><th>${t("table.type")}</th><th>${t("tasks.owner")}</th><th>${t("tasks.schedule")}</th><th>${t("tasks.progress")}</th><th>${t("table.status")}</th><th>${t("table.action")}</th></tr></thead>
            <tbody>
              ${pageInfo.items.map((task) => `
                <tr>
                  <td class="select-col">${checkboxCell("tasks", rowBulkId(task))}</td>
                  <td><strong>${escapeHtml(task.name)}</strong><div class="muted mono">${escapeHtml(task.id)}</div></td>
                  <td><span class="type-pill">${escapeHtml(task.typeLabel)}</span></td>
                  <td>${escapeHtml(task.owner)}</td>
                  <td>${formatDate(task.schedule)}</td>
                  <td>${taskProgressBar(task.progress)}</td>
                  <td><span class="status ${statusClass(task.status)}">${statusText(task.status)}</span></td>
                  <td>
                    ${taskActionButtons(task)}
                  </td>
                </tr>
              `).join("") || `<tr><td colspan="8"><div class="empty">${t("search.empty")}</div></td></tr>`}
            </tbody>
          </table>
        </div>
        ${pagination("tasks", pageInfo)}
      </section>
    </section>
  `;
}

function summaryText(summary = {}) {
  return state.lang === "zh"
    ? `成功 ${summary.success || 0} / 失败 ${summary.fail || 0} / 异常 ${summary.exception || 0} / 总计 ${summary.total || 0}`
    : `S ${summary.success || 0} / F ${summary.fail || 0} / E ${summary.exception || 0} / T ${summary.total || 0}`;
}


function renderReports() {
  state.tabs.reports = state.tabs.reports || "history";
  const openIssues = state.data.issues.filter((issue) => issue.status === "open").length;
  return `
    <section class="panel page-panel">
      <div class="panel-head tab-head">
        ${subnav("reports", [["history", t("reports.history")], ["issues", t("reports.issues"), openIssues]])}
      </div>
      ${state.tabs.reports === "issues" ? renderIssuesPanel() : renderReportHistory()}
    </section>
  `;
}

function renderReportHistory() {
  const finished = state.data.tasks.filter((task) => ["finished", "failed"].includes(task.status));
  const filtered = filterRows("reports", finished, ["name", "task_type", "status", "id"]);
  const pageInfo = paginate("reports", filtered);
  const mergeControls = `
    <select class="select compact-select" id="merge-format"><option value="html">HTML</option><option value="docx">DOCX</option><option value="pdf">PDF</option></select>
    <button class="btn primary small" data-action="export-merged">${t("reports.merge")}</button>
  `;
  return `
    <div class="module-pane">
      ${tableToolbar("reports", "", "", filtered.length, mergeControls)}
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th class="select-col">${selectAllCell("reports", pageInfo.items)}</th><th>${t("table.report")}</th><th>${t("table.status")}</th><th>${t("table.summary")}</th><th>${t("table.finished")}</th><th>${t("table.downloads")}</th></tr></thead>
          <tbody>
            ${pageInfo.items.map((task) => `
              <tr>
                <td class="select-col">${checkboxCell("reports", task.id)}</td>
                <td><strong>${escapeHtml(task.name)}</strong><div class="muted mono">${escapeHtml(task.id)}</div></td>
                <td><span class="status ${statusClass(task.status)}">${statusText(task.status)}</span></td>
                <td>${summaryText(task.summary)}</td>
                <td>${formatDate(task.finished_at)}</td>
                <td class="toolbar">
                  <button class="btn small" data-action="export-report" data-id="${task.id}" data-format="html">HTML</button>
                  <button class="btn small" data-action="export-report" data-id="${task.id}" data-format="docx">DOCX</button>
                  <button class="btn small" data-action="export-report" data-id="${task.id}" data-format="pdf">PDF</button>
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

function renderIssuesPanel() {
  const filtered = filterRows("issues", state.data.issues, ["summary", "severity", "status", "assignee", "id"]);
  const pageInfo = paginate("issues", filtered);
  const openCount = state.data.issues.filter((issue) => issue.status === "open").length;
  const highCount = state.data.issues.filter((issue) => issue.severity === "high").length;
  const assignedCount = state.data.issues.filter((issue) => issue.assignee && issue.assignee !== "Unassigned").length;
  return `
    <div class="module-pane">
      <div class="issue-summary-strip">
        ${miniMetric(state.lang === "zh" ? "待处理" : "Open", `${openCount}`, "bad")}
        ${miniMetric(state.lang === "zh" ? "高危" : "High", `${highCount}`, "warn")}
        ${miniMetric(state.lang === "zh" ? "已分派" : "Assigned", `${assignedCount}`, "brand")}
      </div>
      ${tableToolbar("issues", "", "", filtered.length)}
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th class="select-col">${selectAllCell("issues", pageInfo.items)}</th><th>${t("table.issue")}</th><th>${t("table.severity")}</th><th>${t("table.status")}</th><th>${t("table.assignee")}</th><th>${t("table.created")}</th><th>${t("table.action")}</th></tr></thead>
          <tbody>
            ${pageInfo.items.map((issue) => `
              <tr>
                <td class="select-col">${checkboxCell("issues", issue.id)}</td>
                <td><strong>${escapeHtml(issue.summary)}</strong><div class="muted mono">${escapeHtml(issue.id)}</div></td>
                <td>${escapeHtml(issue.severity)}</td>
                <td><span class="status ${statusClass(issue.status)}">${statusText(issue.status)}</span></td>
                <td>${escapeHtml(issue.assignee)}</td>
                <td>${formatDate(issue.created_at)}</td>
                <td class="toolbar">
                  <button class="btn small" data-action="issue-status" data-id="${issue.id}" data-status="in_progress">${t("issues.process")}</button>
                  <button class="btn small" data-action="issue-status" data-id="${issue.id}" data-status="resolved">${t("issues.resolve")}</button>
                  <button class="btn small" data-action="issue-status" data-id="${issue.id}" data-status="ignored">${t("issues.ignore")}</button>
                </td>
              </tr>
            `).join("") || `<tr><td colspan="7"><div class="empty">${t("search.empty")}</div></td></tr>`}
          </tbody>
        </table>
      </div>
      ${pagination("issues", pageInfo)}
    </div>
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
    container: "host",
    postgresql: "pgsql",
    mysql: "mysql",
    redis: "redis",
    middleware: "middleware",
  }[category] || "host";
}

function renderTemplates() {
  state.tabs.templates = state.tabs.templates || "builtin";
  const customCount = state.data.inspection_items.filter((item) => !item.is_builtin).length;
  return `
    <section class="panel page-panel">
      <div class="panel-head tab-head">
        ${subnav("templates", [
          ["category", t("templates.category")],
          ["builtin", t("templates.builtin"), state.data.inspection_items.filter((item) => item.is_builtin).length],
          ["custom", t("templates.custom"), customCount],
          ["rules", t("templates.rules")],
          ["bindings", t("templates.bindings")],
        ])}
      </div>
      ${state.tabs.templates === "category" ? renderTemplateCategories() : ""}
      ${state.tabs.templates === "builtin" ? renderBuiltinTemplates() : ""}
      ${state.tabs.templates === "custom" ? renderCustomTemplates() : ""}
      ${state.tabs.templates === "rules" ? renderTemplateRules() : ""}
      ${state.tabs.templates === "bindings" ? renderTemplateBindings() : ""}
    </section>
  `;
}

function renderTemplateCategories() {
  const groups = [
    [templateCategoryLabel("os"), ["CPU 使用率", "内存占用", "磁盘空间 / inode", "系统负载", "网络延迟", "弱口令扫描", "SSH 暴露", "异常监听端口", "sudo 权限", "敏感文件权限", "ssh 登录日志", "ssh 账号安全", "密码策略", "auditd", "防火墙策略"], ""],
    [templateCategoryLabel("postgresql"), ["连接数占比", "慢查询", "主从同步延迟", "pg_hba 访问基线", "日志审计开启", "高危权限账户"], "database"],
    [templateCategoryLabel("mysql"), ["连接数占比", "慢查询", "死锁监测", "匿名访问禁用", "local_infile 禁用", "日志审计开启"], "database"],
    [templateCategoryLabel("redis"), ["内存占用", "连接数占比", "慢查询", "匿名访问禁用", "protected-mode"], "database"],
    [templateCategoryLabel("container"), ["Docker 存活", "K8s 存活", "特权容器", "镜像漏洞与来源", "Kubernetes RBAC", "K8s API 匿名访问"], "container"],
    [templateCategoryLabel("middleware"), ["SSL 有效期", "HTTP 状态码", "WAF 状态", "暗链检测", "跨域策略", "重定向跳转校验", "正则解析", "JSON 解析", "布尔判断"], "middleware"],
  ];
  const kindGroups = [
    [templateKindLabel("standard"), ["可用性", "性能状态", "容量水位", "连接压力", "响应时间", "服务存活"], ""],
    [templateKindLabel("cis"), ["主机 CIS", "Docker CIS", "Kubernetes CIS", "PostgreSQL CIS", "MySQL CIS", "Redis 安全基线"], "security"],
    [templateKindLabel("security"), ["弱口令", "SSH 暴露", "异常端口", "高危权限", "WAF", "暗链检测", "跨域策略"], "security"],
    [templateKindLabel("compliance"), ["日志留存", "账号审计", "补丁检查", "安全传输", "敏感路径", "权限最小化"], "custom"],
    [templateKindLabel("custom"), ["Shell 脚本", "Python 脚本", "SQL 脚本", "正则解析", "JSON 解析", "布尔判断"], "custom"],
  ];
  return `
    <div class="module-pane template-overview">
      <div class="template-section-label">${state.lang === "zh" ? "对象分类" : "Target Categories"}</div>
      ${groups.map(([title, items, tone]) => templateMetricGroup(title, items, tone)).join("")}
      <div class="template-section-label">${state.lang === "zh" ? "检查类型分类" : "Check Type Categories"}</div>
      ${kindGroups.map(([title, items, tone]) => templateMetricGroup(title, items, tone)).join("")}
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
      <label class="template-filter">
        <span>${t("table.category")}</span>
        <select class="select compact-select" data-template-filter-key="category" data-template-filter-scope="${scope}">
          ${categories.map((category) => `<option value="${category}" ${categoryValue === category ? "selected" : ""}>${category === "all" ? (state.lang === "zh" ? "全部分类" : "All Categories") : templateCategoryLabel(category)}</option>`).join("")}
        </select>
      </label>
      <label class="template-filter">
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
  const groups = resourceGroups();
  return `
    <div class="module-pane">
      ${tableToolbar("template-bindings", "", "", groups.length, "", false)}
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>${t("table.resourceGroup")}</th><th>${t("table.tags")}</th><th>${t("templates.builtin")}</th><th>${t("templates.custom")}</th></tr></thead>
          <tbody>
            ${groups.map((group) => `<tr><td><strong>${escapeHtml(group.name)}</strong><div class="muted mono">${escapeHtml(group.id)}</div></td><td>${escapeHtml((group.tags || []).join(", ") || "-")}</td><td>基础巡检 + 安全基线</td><td>${group.tags?.includes("PROD") ? "PROD 强化脚本" : "-"}</td></tr>`).join("") || `<tr><td colspan="4"><div class="empty">${t("search.empty")}</div></td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderUsersPanel() {
  const filtered = filterRows("users", state.data.users, ["display_name", "username", "email", "role"]);
  const pageInfo = paginate("users", filtered);
  return `
    <div class="module-pane">
      ${tableToolbar("users", "", "", filtered.length)}
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th class="select-col">${selectAllCell("users", pageInfo.items)}</th><th>${t("table.name")}</th><th>${t("table.email")}</th><th>${t("table.role")}</th><th>${t("table.status")}</th><th>${t("table.lastLogin")}</th><th>${t("table.action")}</th></tr></thead>
          <tbody>
            ${pageInfo.items.map((user) => `
              <tr>
                <td class="select-col">${checkboxCell("users", user.id)}</td>
                <td><strong>${escapeHtml(user.display_name)}</strong><div class="muted mono">${escapeHtml(user.username)}</div></td>
                <td>${escapeHtml(user.email)}</td>
                <td>${escapeHtml(user.role)}</td>
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
      ${tableToolbar("roles", "", "", filtered.length)}
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th class="select-col">${selectAllCell("roles", pageInfo.items)}</th><th>${t("table.role")}</th><th>${t("table.description")}</th><th>${t("table.permissions")}</th><th>${t("table.action")}</th></tr></thead>
          <tbody>
            ${pageInfo.items.map((role) => `
              <tr>
                <td class="select-col">${checkboxCell("roles", role.id)}</td>
                <td><strong>${escapeHtml(role.name)}</strong></td>
                <td>${escapeHtml(role.description)}</td>
                <td>${escapeHtml((role.permissions || []).join(", "))}</td>
                <td><button class="btn small" data-action="edit-role" data-id="${role.id}">${t("action.edit")}</button></td>
              </tr>
            `).join("") || `<tr><td colspan="5"><div class="empty">${t("search.empty")}</div></td></tr>`}
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

function renderTaskTypesPanel() {
  const filtered = filterRows("task-types", taskTypes(), ["key", "name", "description"]);
  const pageInfo = paginate("task-types", filtered);
  return `
    <div class="module-pane">
      ${tableToolbar("task-types", "", "", filtered.length, `<button class="btn primary small" data-action="add-task-type">${t("action.addTaskType")}</button>`)}
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th class="select-col">${selectAllCell("task-types", pageInfo.items)}</th><th>${t("table.type")}</th><th>${t("table.description")}</th><th>${t("table.status")}</th><th>${t("table.action")}</th></tr></thead>
          <tbody>
            ${pageInfo.items.map((item) => `
              <tr>
                <td class="select-col">${checkboxCell("task-types", item.id)}</td>
                <td><strong>${escapeHtml(item.name)}</strong><div class="muted mono">${escapeHtml(item.key)}</div></td>
                <td>${escapeHtml(item.description || "-")}</td>
                <td><span class="status ${item.enabled ? "success" : "disabled"}">${item.enabled ? t("label.enabled") : t("label.disabled")}</span></td>
                <td><button class="btn small" data-action="edit-task-type" data-id="${item.id}">${t("action.edit")}</button></td>
              </tr>
            `).join("") || `<tr><td colspan="5"><div class="empty">${t("search.empty")}</div></td></tr>`}
          </tbody>
        </table>
      </div>
      ${pagination("task-types", pageInfo)}
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
          <button class="btn primary" type="submit">${escapeHtml(config.submitLabel || t("action.save"))}</button>
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
    taskTypes: renderTaskTypesPanel,
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
          ["taskTypes", t("settings.taskTypes"), taskTypes().length],
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

function fieldLabel(label, required = false) {
  return `<span class="label-text">${escapeHtml(label)}${required ? `<span class="required-mark">*</span>` : ""}</span>`;
}

function isRequiredAttr(attrs = "") {
  return /\brequired\b/.test(String(attrs));
}

function fieldInput(label, name, value = "", type = "text", attrs = "") {
  return `
    <div class="field">
      <label for="modal-${name}">${fieldLabel(label, isRequiredAttr(attrs))}</label>
      <input class="input" id="modal-${name}" name="${name}" type="${type}" value="${escapeHtml(value)}" ${attrs}>
    </div>
  `;
}

function fieldTextarea(label, name, value = "", attrs = "") {
  return `
    <div class="field wide">
      <label for="modal-${name}">${fieldLabel(label, isRequiredAttr(attrs))}</label>
      <textarea class="textarea" id="modal-${name}" name="${name}" ${attrs}>${escapeHtml(value)}</textarea>
    </div>
  `;
}

function fieldSelect(label, name, value, options, attrs = "") {
  return `
    <div class="field">
      <label for="modal-${name}">${fieldLabel(label, isRequiredAttr(attrs))}</label>
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
            <button class="btn primary" type="submit">${escapeHtml(config.submitLabel || t("action.save"))}</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function deleteScopeLabel(scope) {
  const map = {
    resources: t("nav.resources"),
    "resource-groups": t("resources.groups"),
    "resource-types": t("settings.resourceTypes"),
    "task-types": t("settings.taskTypes"),
    users: t("settings.users"),
    roles: t("roles.title"),
    tasks: t("nav.tasks"),
    reports: t("nav.reports"),
    issues: t("reports.issues"),
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

function modalConfig(type, id) {
  if (type === "task-create") {
    const isNew = id === "new";
    const editingPlan = !isNew && String(id).startsWith("plan:");
    const task = isNew ? null : editingPlan ? state.data.cron_plans.find((item) => item.id === String(id).slice(5)) : state.data.tasks.find((item) => item.id === id);
    const config = task?.config || task?.notification_config || {};
    const selectedResourceIds = new Set(task?.resource_ids || []);
    const selectedItemIds = new Set(task?.item_ids || []);
    const selectedNotify = new Set(config.notify_channels || []);
    const selectedReminders = new Set(config.reminder_rules || []);
    const firstTaskType = task?.task_type || taskTypeOptions()[0]?.[0] || "daily";
    const executionMode = editingPlan ? "periodic" : config.execution_mode || "once";
    const resourceOptions = (state.data.resources || []).map((resource) => ({
      value: resource.id,
      label: resource.name,
      meta: `${resourceTypeLabel(resource.type)} / ${resource.ip}:${resource.port} / ${statusText(resource.status)}`,
      checked: selectedResourceIds.has(resource.id),
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
        formSection(t("form.basicInfo"), [
          fieldInput(t("form.taskName"), "name", task?.name || "", "text", "required"),
          fieldSelect(t("table.type"), "task_type", firstTaskType, taskTypeOptions(), "required"),
          fieldTextarea(t("form.taskDescription"), "description", task?.description || config.description || "", `placeholder="${state.lang === "zh" ? "填写任务背景、检查目标或注意事项" : "Task background, target or notes"}"`),
        ].join("")),
        formSection(t("form.executionConfig"), [
          fieldRadioGroup(t("form.executionMode"), "execution_mode", executionMode, [["once", t("form.once")], ["periodic", t("form.periodic")]], true),
          `<div class="periodic-only">${[
            fieldRadioGroup(t("form.scheduleRule"), "schedule_rule", config.schedule_rule || "daily", [["daily", t("form.daily")], ["weekly", t("form.weekly")], ["monthly", t("form.monthly")]], true),
            fieldInput(t("form.scheduleTime"), "schedule_time", config.schedule_time || "09:00", "time", "required"),
            fieldInput(t("form.effectiveStart"), "effective_start", config.effective_start || "", "date"),
            fieldInput(t("form.effectiveEnd"), "effective_end", config.effective_end || "", "date"),
            fieldSelect(t("form.deadlinePolicy"), "deadline_policy", config.deadline_policy || "1h", [["1h", state.lang === "zh" ? "1 小时内" : "Within 1 hour"], ["4h", state.lang === "zh" ? "4 小时内" : "Within 4 hours"], ["24h", state.lang === "zh" ? "24 小时内" : "Within 24 hours"]], "required"),
            fieldSelect(t("form.retryPolicy"), "retry_policy", config.retry_policy || "retry_once", [["none", state.lang === "zh" ? "不重试" : "No retry"], ["retry_once", state.lang === "zh" ? "自动重试 1 次" : "Retry once"], ["retry_twice", state.lang === "zh" ? "自动重试 2 次" : "Retry twice"]], "required"),
          ].join("")}</div>`,
        ].join("")),
        formSection(t("form.resourceSelection"), [
          fieldSelect(t("form.resourceGroup"), "group_id", task?.group_id || "", resourceGroupOptions()),
          fieldResourceCheckboxGroup(t("form.targetResources"), "resource_ids", resourceOptions, t("form.noResources"), true),
        ].join("")),
        formSection(t("form.ownerNotify"), [
          fieldSelect(t("form.owner"), "owner_id", task?.created_by || config.owner_id || state.user?.id || "", userOptions.length ? userOptions : [[state.user?.id || "", state.user?.display_name || "Admin"]], "required"),
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
        formSection(t("form.executionContent"), [
          fieldGroupedCheckboxGroup(t("form.executionContent"), "item_ids", itemOptions, t("form.noInspectionItems"), true),
          fieldTextarea(t("form.note"), "note", config.note || "", `maxlength="300" placeholder="${state.lang === "zh" ? "请输入备注信息，如任务背景、注意事项等" : "Optional note"}"`),
        ].join("")),
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
  if (type === "resource") {
    const isNew = id === "new";
    const firstType = resourceTypeOptions()[0]?.[0] || "host";
    const selectedType = resourceTypes().find((item) => item.key === firstType);
    const res = isNew
      ? {
          name: "",
          type: firstType,
          ip: "",
          port: selectedType?.default_port || 22,
          username: "",
          credential_type: "password",
          group_id: "",
          credential_configured: false,
        }
      : state.data.resources.find((item) => item.id === id);
    if (!res) return null;
    return {
      title: isNew ? t("modal.addResource") : t("modal.editResource"),
      subtitle: isNew ? t("resources.desc") : `${res.ip}:${res.port}`,
      body: [
        fieldInput(t("table.name"), "name", res.name, "text", "required"),
        fieldSelect(t("table.type"), "type", res.type, resourceTypeOptions(), "required"),
        fieldInput("IP", "ip", res.ip, "text", "required"),
        fieldInput("Port", "port", res.port, "number", "required min=\"1\" max=\"65535\""),
        fieldInput("Username", "username", res.username, "text", "required"),
        fieldSelect(t("form.credentialType"), "credential_type", res.credential_type || "password", [["password", t("resources.password")], ["key", t("resources.key")]], "required"),
        fieldTextarea(t("form.credentialSecret"), "credential_secret", "", `placeholder="${isNew ? "" : t("form.credentialHelp")}"`),
        fieldSelect(t("table.resourceGroup"), "group_id", res.group_id || "", resourceGroupOptions()),
      ].join(""),
    };
  }
  if (type === "resource-batch") {
    return {
      title: t("modal.batchAddResources"),
      subtitle: t("resources.batchHelp"),
      body: [
        fieldTextarea(t("resources.batchAdd"), "batch_text", "", `required placeholder="名称,IP,类型,端口,账号,凭据类型,凭据,资源组ID"`),
      ].join(""),
    };
  }
  if (type === "resource-group") {
    const isNew = id === "new";
    const group = isNew
      ? { name: "", owner: "SRE", description: "", status: "active", tags: [] }
      : state.data.resource_groups.find((item) => item.id === id);
    if (!group) return null;
    return {
      title: isNew ? t("modal.addResourceGroup") : t("modal.editResourceGroup"),
      subtitle: isNew ? t("resources.groups") : group.id,
      body: [
        fieldInput(t("table.name"), "name", group.name, "text", "required"),
        fieldInput(t("table.owner"), "owner", group.owner || "SRE", "text", "required"),
        fieldSelect(t("form.status"), "status", group.status || "active", [["active", statusText("active")], ["review", statusText("review")], ["disabled", statusText("disabled")]], "required"),
        fieldTextarea(t("table.tags"), "tags", (group.tags || []).join(","), `placeholder="PROD,MYSQL"`),
        fieldTextarea(t("table.description"), "description", group.description || ""),
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
  if (type === "task-type") {
    const isNew = id === "new";
    const item = isNew
      ? { key: "", name: "", enabled: true, description: "" }
      : taskTypes().find((entry) => entry.id === id);
    if (!item) return null;
    return {
      title: isNew ? t("modal.addTaskType") : t("modal.editTaskType"),
      subtitle: isNew ? t("settings.taskTypes") : item.key,
      body: [
        fieldInput("Key", "key", item.key, "text", "required pattern=\"[a-zA-Z0-9_-]+\""),
        fieldInput(t("table.name"), "name", item.name, "text", "required"),
        fieldSelect(t("form.status"), "enabled", String(item.enabled), [["true", t("label.enabled")], ["false", t("label.disabled")]], "required"),
        fieldTextarea(t("table.description"), "description", item.description || ""),
      ].join(""),
    };
  }
  if (type === "user") {
    const user = state.data.users.find((item) => item.id === id);
    if (!user) return null;
    return {
      title: t("modal.editUser"),
      subtitle: user.username,
      body: [
        fieldInput(t("table.name"), "display_name", user.display_name, "text", "required"),
        fieldInput(t("table.email"), "email", user.email, "email", "required"),
        fieldSelect(t("table.role"), "role", user.role, state.data.roles.map((role) => role.name), "required"),
        fieldSelect(t("form.status"), "is_active", String(user.is_active), [["true", t("form.active")], ["false", t("form.inactive")]], "required"),
      ].join(""),
    };
  }
  if (type === "role") {
    const role = state.data.roles.find((item) => item.id === id);
    if (!role) return null;
    return {
      title: t("modal.editRole"),
      subtitle: role.id,
      body: [
        fieldInput(t("table.role"), "name", role.name, "text", "required"),
        fieldTextarea(t("table.description"), "description", role.description),
        fieldTextarea(t("table.permissions"), "permissions", (role.permissions || []).join("\n"), `placeholder="${t("form.permissionsHelp")}"`),
      ].join(""),
    };
  }
  return null;
}

function openModal(type, id) {
  state.modal = { type, id };
  render();
}

function closeModal() {
  state.modal = null;
  render();
}

function editPayloadFromForm(form) {
  const formData = new FormData(form);
  const values = Object.fromEntries(formData.entries());
  if (form.dataset.type === "task-create") {
    return {
      name: values.name,
      task_type: values.task_type || "daily",
      execution_mode: values.execution_mode || "once",
      description: values.description || "",
      group_id: values.group_id || null,
      resource_ids: formData.getAll("resource_ids"),
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
    return {
      name: values.name,
      type: values.type,
      ip: values.ip,
      port: Number(values.port),
      username: values.username || "",
      credential_type: values.credential_type || "password",
      credential_secret: values.credential_secret || undefined,
      group_id: values.group_id || null,
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
  if (form.dataset.type === "resource-batch") {
    const resources = (values.batch_text || "")
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, ip, type, port, username, credential_type, credential_secret, group_id] = line.split(",").map((item) => item?.trim() || "");
        return {
          name,
          ip,
          type: type || "host",
          port: Number(port || 22),
          username,
          credential_type: credential_type === "key" ? "key" : "password",
          credential_secret,
          group_id: group_id || null,
        };
      });
    return { resources };
  }
  if (form.dataset.type === "resource-group") {
    return {
      name: values.name,
      owner: values.owner || "SRE",
      description: values.description || "",
      status: values.status || "active",
      tags: (values.tags || "").split(",").map((item) => item.trim()).filter(Boolean),
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
  if (form.dataset.type === "task-type") {
    return {
      key: values.key,
      name: values.name,
      enabled: values.enabled === "true",
      description: values.description || "",
    };
  }
  if (form.dataset.type === "user") {
    return {
      display_name: values.display_name,
      email: values.email,
      role: values.role,
      is_active: values.is_active === "true",
    };
  }
  if (form.dataset.type === "role") {
    return {
      name: values.name,
      description: values.description || "",
      permissions: (values.permissions || "")
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean),
    };
  }
  return values;
}

function validateEditForm(form) {
  if (form.dataset.type !== "task-create") return "";
  const formData = new FormData(form);
  const values = Object.fromEntries(formData.entries());
  if (!values.group_id && formData.getAll("resource_ids").length === 0) {
    return t("toast.selectTaskResources");
  }
  if (formData.getAll("item_ids").length === 0) {
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
    "inspection-item": "/api/inspection-items",
    "resource-batch": "/api/resources/batch",
    "resource-group": id === "new" ? "/api/resource-groups" : `/api/resource-groups/${id}`,
    "resource-type": id === "new" ? "/api/settings/resource-types" : `/api/settings/resource-types/${id}`,
    "task-type": id === "new" ? "/api/settings/task-types" : `/api/settings/task-types/${id}`,
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

function deleteEndpoint(scope, id) {
  if (scope === "tasks" && String(id).startsWith("plan:")) {
    return `/api/cron-plans/${encodeURIComponent(String(id).slice(5))}`;
  }
  const map = {
    resources: `/api/resources/${id}`,
    "resource-groups": `/api/resource-groups/${id}`,
    "resource-types": `/api/settings/resource-types/${id}`,
    "task-types": `/api/settings/task-types/${id}`,
    users: `/api/users/${id}`,
    roles: `/api/roles/${id}`,
    tasks: `/api/tasks/${id}`,
    reports: `/api/tasks/${id}`,
    issues: `/api/issues/${id}`,
  };
  return map[scope];
}

async function deleteSelected(scope) {
  const set = selectionSet(scope);
  const ids = [...set];
  if (!ids.length) {
    toast(t("toast.noSelection"));
    return;
  }
  state.modal = { type: "delete-confirm", scope, ids };
  render();
}

async function performDeleteSelected() {
  const modal = state.modal;
  if (!modal || modal.type !== "delete-confirm") return;
  const { scope, ids = [] } = modal;
  for (const id of ids) {
    const endpoint = deleteEndpoint(scope, id);
    if (endpoint) {
      await api(endpoint, { method: "DELETE" });
    }
  }
  selectionSet(scope).clear();
  state.modal = null;
  await refreshData(t("toast.deleted"));
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
      toast(err.message);
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
      toast(validationError);
      return;
    }
    try {
      await api(editEndpoint(type, id), {
        method: id === "new" ? "POST" : "PATCH",
        body: JSON.stringify(editPayloadFromForm(form)),
      });
      state.modal = null;
      await refreshData(t("toast.saved"));
    } catch (err) {
      const message = friendlyError(err.message);
      if (modalError) modalError.textContent = message;
      toast(message);
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
    error.textContent = err.message;
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

document.addEventListener("change", (event) => {
  const target = event.target;
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
  if (target.id === "site-icon-image") {
    const file = target.files?.[0];
    if (!file) return;
    if (file.size > 350000) {
      toast("Icon image is too large");
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
    } else if (action === "delete-selected") {
      await deleteSelected(target.dataset.scope);
    } else if (action === "confirm-delete") {
      await performDeleteSelected();
    } else if (action === "search-result") {
      state.view = target.dataset.view || "dashboard";
      if (target.dataset.tab) {
        const scope = state.view === "reports" ? "reports" : state.view === "settings" ? "settings" : state.view;
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
    } else if (action === "run-task") {
      await runTask();
    } else if (action === "add-inspection-item") {
      openModal("inspection-item", "new");
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
    } else if (action === "view-task-report") {
      state.view = "reports";
      state.tabs.reports = "history";
      state.filters.reports = target.dataset.id || "";
      resetPage("reports");
      localStorage.setItem("opsradar_view", state.view);
      localStorage.setItem("opsradar_tab_reports", state.tabs.reports);
      render();
    } else if (action === "edit-task") {
      openModal("task-create", target.dataset.id);
    } else if (action === "reset-task-filters") {
      state.taskFilters = { type: "all", status: "all", owner: "all" };
      state.filters.tasks = "";
      resetPage("tasks");
      render();
    } else if (action === "export-report") {
      await exportReport(target.dataset.id, target.dataset.format);
    } else if (action === "export-merged") {
      if (!selectionSet("reports").size) {
        toast(t("toast.selectReport"));
        return;
      }
      await exportReport([...selectionSet("reports")], document.getElementById("merge-format").value);
    } else if (action === "issue-status") {
      await api(`/api/issues/${target.dataset.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: target.dataset.status, resolution_note: "Updated from OpsRadar console" }),
      });
      await refreshData(t("toast.issueUpdated"));
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
    } else if (action === "test-online") {
      const online = state.data.resources.filter((item) => item.status === "online");
      online.slice(0, 4).forEach((item) => state.testingResources.add(item.id));
      render();
      try {
        for (const item of online.slice(0, 4)) {
          const updated = await api(`/api/resources/${item.id}/test`, { method: "POST" });
          const index = state.data.resources.findIndex((entry) => entry.id === item.id);
          if (index >= 0) state.data.resources[index] = updated;
          state.testingResources.delete(item.id);
          render();
        }
        toast(t("toast.resourcesTested"));
      } finally {
        online.slice(0, 4).forEach((item) => state.testingResources.delete(item.id));
        render();
      }
    } else if (action === "add-resource") {
      openModal("resource", "new");
    } else if (action === "batch-add-resource") {
      openModal("resource-batch", "new");
    } else if (action === "edit-resource") {
      openModal("resource", target.dataset.id);
    } else if (action === "add-resource-group") {
      openModal("resource-group", "new");
    } else if (action === "edit-resource-group") {
      openModal("resource-group", target.dataset.id);
    } else if (action === "add-resource-type") {
      openModal("resource-type", "new");
    } else if (action === "edit-resource-type") {
      openModal("resource-type", target.dataset.id);
    } else if (action === "add-task-type") {
      openModal("task-type", "new");
    } else if (action === "edit-task-type") {
      openModal("task-type", target.dataset.id);
    } else if (action === "edit-user") {
      openModal("user", target.dataset.id);
    } else if (action === "edit-role") {
      openModal("role", target.dataset.id);
    } else if (action === "close-modal") {
      closeModal();
    }
  } catch (err) {
    toast(err.message);
  }
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
