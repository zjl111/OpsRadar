# OpsRadar 技术文档

## 1. 文档目的

本文档面向 OpsRadar 的交付、研发、运维和二次开发人员，说明系统目标、运行架构、核心模块、数据模型、任务调度链路、安全设计、部署运维方式以及后续扩展边界。

OpsRadar 是一个运维自动化巡检管理平台。当前版本定位为生产级单机 Docker Compose 交付形态，采用 PostgreSQL、Redis、Celery worker、FastAPI 和 Nginx 组成运行栈。第一阶段真实巡检能力聚焦 Linux/Unix 主机 SSH 巡检，支持密码和私钥凭据、巡检模板、任务中心、报告导出、异常闭环、RBAC 权限和审计日志。

## 2. 技术栈

| 层级 | 技术 | 说明 |
| --- | --- | --- |
| 前端 | 原生 HTML/CSS/JavaScript | 单页管理台，由 API 容器托管静态资源 |
| API | FastAPI + Gunicorn + Uvicorn Worker | 提供认证、资源、任务、模板、报告、审计等接口 |
| 数据库 | PostgreSQL | 唯一持久化数据库，不支持 SQLite fallback |
| 缓存/队列 | Redis | Celery broker 和 result backend |
| 异步任务 | Celery worker | 执行巡检任务，写入任务结果、日志和异常 |
| 定时调度 | opsradar-beat | 扫描 CronPlan 并投递周期任务 |
| SSH 执行 | AsyncSSH | 第一阶段主机 Shell 巡检执行器 |
| 反向代理 | Nginx | TLS 终止、HTTP 跳转 HTTPS、反代 API |
| 数据迁移 | Alembic | 管理数据库 schema 迁移 |
| 报告导出 | HTML / DOCX / PDF | PDF 依赖 Chrome/Chromium 渲染 |

## 3. 总体架构

生产部署包含 6 个容器：

| 服务 | 职责 |
| --- | --- |
| `nginx` | 对外监听 80/443，TLS 终止，反向代理到 API |
| `opsradar-api` | FastAPI 服务，托管前端静态文件和后端 API |
| `opsradar-worker` | Celery worker，消费 Redis 队列并执行巡检 |
| `opsradar-beat` | 扫描启用的周期计划，到期后创建并投递任务 |
| `postgres` | 权威数据库，存储业务数据、任务结果、审计和配置 |
| `redis` | Celery broker/result backend，保存队列和任务状态 |

```mermaid
flowchart LR
  U["Browser"] --> N["Nginx HTTPS"]
  N --> A["opsradar-api<br/>FastAPI"]
  A --> P[("PostgreSQL")]
  A --> R[("Redis")]
  B["opsradar-beat"] --> P
  B --> R
  W["opsradar-worker<br/>Celery"] --> R
  W --> P
  W --> S["SSH Targets"]
  A --> V[("Report Volume")]
  W --> V
```

## 4. 目录结构

```text
OpsRadar/
├── assets/                  # 前端 app.js / styles.css
├── backend/
│   └── app/
│       ├── api/routes.py    # API 路由
│       ├── core/config.py   # 环境变量配置
│       ├── db/session.py    # SQLAlchemy engine/session
│       ├── models/          # SQLAlchemy 数据模型
│       ├── services/        # 巡检、加密、脱敏、报表、RBAC 等服务
│       ├── worker/          # Celery app 和任务入口
│       ├── beat.py          # 周期计划扫描器
│       ├── cli.py           # 管理命令
│       └── main.py          # FastAPI app 入口
├── deploy/
│   └── nginx.conf           # Nginx TLS 反向代理配置
├── docs/                    # 文档与截图
├── migrations/              # Alembic 迁移
├── reports/                 # 本地报告输出目录
├── scripts/                 # 本地运行、服务检查、冒烟脚本
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## 5. 核心业务模块

### 5.1 认证与用户

用户通过 `/api/auth/login` 登录，后端校验密码哈希后签发 JWT。前端将 token 存入 `localStorage`，后续请求通过 `Authorization: Bearer <token>` 调用 API。

关键点：

- 密码使用 `passlib` 哈希保存。
- 登录成功、登录失败均写入 `AuditLog`。
- 未登录访问受保护接口返回 `401`。
- 登录态过期时前端清理 token 并回到登录页。

### 5.2 RBAC 权限

角色和权限通过 `Role.permissions` 管理。权限点在 `backend/app/services/rbac.py` 中集中定义。

当前权限点包括：

```text
dashboard:read
resources:read/create/update/delete
applications:read/create/update/delete
environments:read/create/update/delete
templates:read/create/update/delete
tasks:read/create/cancel
reports:read/export
issues:read/update
audit:read
settings:read/update
users:read/update
roles:read/update
```

权限判断支持：

- 精确权限：`resources:create`
- 模块通配：`resources:*`
- 超级权限：`*`

### 5.3 应用环境与资源

OpsRadar 以应用环境为巡检中心。应用环境用于表达某个业务系统的运行环境，例如 `JumpServer / 生产环境`，并绑定支撑它运行的 OS、数据库、中间件、网关、存储、队列与容器服务资源。

资源字段：

| 字段 | 说明 |
| --- | --- |
| `name` | 资源名称 |
| `type` | 资源类型，如 host、postgresql、mysql、redis、container、compose |
| `ip` / `port` | 连接地址 |
| `username` | 登录账号 |
| `credential_type` | `password` 或 `key` |
| `status` | `untested`、`testing`、`online`、`offline` 等 |
| `extra_params` | 扩展参数，包含加密后的凭据，以及容器名、Compose 项目名、服务名等非敏感参数 |

当资源类型为 `container` 或 `compose` 时，OpsRadar 仍通过宿主机 SSH 登录执行巡检命令：

- `container`：使用 `container_name` 执行 `docker stats --no-stream`、`docker inspect` 等命令。
- `compose`：使用 `compose_project` 和 `compose_service` 执行 `docker compose ps`、`docker compose logs` 等命令。

API 返回资源时不会返回明文或密文凭据，只返回：

```json
{
  "credential_configured": true,
  "credential_type": "password"
}
```

### 5.4 应用环境中心巡检

应用环境是 OpsRadar 第一优先的巡检组织中心，用来表达“某个业务系统在某个环境中的完整运行单元”。例如：

- `JumpServer / 生产环境`
- `ITDevOps / 生产环境`

一个应用环境包含支撑该业务系统运行的 OS、数据库、中间件、负载均衡/网关、存储、队列、容器服务和安全基线资源。

核心对象：

| 对象 | 说明 |
| --- | --- |
| `Application` | 业务系统，如 JumpServer、ITDevOps |
| `AppEnvironment` | 应用环境，如生产、预发、测试 |
| `EnvironmentResource` | 环境与资源绑定，标记层级、角色和权重 |
| `AnalysisRule` | 根因分析和修复建议规则 |
| `IssueInsight` | 某个异常对应的原因、影响和人工处理建议 |

创建巡检任务时可以选择应用环境。若没有手工选择资源，后端会自动使用该环境绑定的资源创建任务结果，并在每个 `TaskResult.resource_snapshot` 中保存环境快照：

```json
{
  "application_id": "app_jumpserver",
  "environment_id": "env_jumpserver_prod",
  "environment_name": "生产环境",
  "environment_layer": "db",
  "environment_role": "postgresql"
}
```

环境健康评分按分层加权计算。默认权重为：

| 层级 | 权重 |
| --- | --- |
| OS | 20 |
| 数据库 | 20 |
| 中间件 | 15 |
| 网关/LB | 10 |
| 存储 | 5 |
| 队列 | 5 |
| 容器服务 | 20 |
| 安全基线 | 5 |

当巡检生成异常时，worker 会根据 `AnalysisRule` 匹配资源层级、角色、指标名称、状态和错误关键字，生成 `IssueInsight`，用于展示：

- 可能原因
- 影响范围
- 建议处理动作
- 人工执行步骤
- 修复后验证方式

第一阶段不接 AI，也不做自动修复。修复建议以“可沟通、可复制、可人工执行”的任务卡形式交付给运维人员。

### 5.5 巡检模板

巡检模板由 `InspectionItem` 表维护，分为内置指标和自定义指标。当前 UI 按分类展示：

- OS 指标
- PostgreSQL 指标
- MySQL 指标
- Redis 指标
- 容器指标
- 中间件指标

模板字段：

| 字段 | 说明 |
| --- | --- |
| `name` | 指标名称 |
| `category` | 指标分类 |
| `resource_type` | 兼容资源类型 |
| `command_type` | 当前支持 `shell`，SQL 为后续扩展 |
| `command_template` | 命令模板 |
| `expected_result_pattern` | 判定规则 |
| `is_builtin` | 是否内置 |
| `enabled` | 是否启用 |

当前真实执行范围：

- 支持主机资源 `type=host`
- 支持 `command_type=shell`
- SQL、HTTP、SSL 等模板可以维护元数据，但第一阶段不会伪造结果，执行时会明确标记为不支持执行器。

### 5.6 任务中心

任务分为一次性任务和周期任务：

- 一次性任务：创建后落库为 `Task`，初始状态为 `pending`，需要点击启动后进入队列。
- 周期任务：创建为 `CronPlan`，由 `opsradar-beat` 到期扫描并创建真实 `Task`。

任务状态：

| 状态 | 含义 |
| --- | --- |
| `pending` | 已创建，尚未启动 |
| `queued` | 已投递到 Celery 队列 |
| `running` | worker 正在执行 |
| `finished` | 执行完成 |
| `failed` | 投递或执行失败 |
| `cancelled` | 已取消或收到取消请求 |

### 5.6 巡检执行

执行层由 `ShellExecutor` 和 `JudgementEngine` 组成。

执行流程：

```mermaid
sequenceDiagram
  participant UI as Browser
  participant API as FastAPI
  participant DB as PostgreSQL
  participant MQ as Redis
  participant WK as Celery Worker
  participant SSH as Target Host

  UI->>API: 创建任务
  API->>DB: 写入 Task / TaskResult(pending)
  UI->>API: 启动任务
  API->>DB: Task.status=queued
  API->>MQ: 投递 run_inspection_task
  WK->>MQ: 消费任务
  WK->>DB: Task.status=running
  WK->>DB: 读取资源、模板、加密凭据
  WK->>SSH: AsyncSSH 连接并执行命令
  SSH-->>WK: stdout/stderr/exit_status
  WK->>WK: 脱敏 + 判定
  WK->>DB: 写 TaskResult / TaskLog / Issue
  WK->>DB: Task.status=finished/failed/cancelled
```

执行器能力：

- SSH 密码认证
- SSH 私钥认证
- 连接超时
- 命令超时
- stdout/stderr 采集
- 连接失败、认证失败、命令失败、超时失败分类
- 结果脱敏后入库

### 5.7 判定规则

`JudgementEngine` 当前支持：

| 规则 | 示例 | 行为 |
| --- | --- | --- |
| 空规则 | `""` | 命令退出码为 0 即成功 |
| 期望空输出 | `empty` | stdout 为空则成功 |
| 正则 | `regex:PermitRootLogin no` | stdout 命中正则则成功 |
| 阈值 | `< 90`、`>= 1` | 提取 stdout 中第一个数字进行比较 |
| 关键字 | `active` | stdout 包含关键字则成功 |

命令退出码非 0 时默认判定为 `fail`。

### 5.8 报告与异常

任务执行结果写入 `TaskResult`。当结果为 `fail` 或 `exception` 时，系统创建 `Issue` 用于异常闭环。

报告导出支持：

- HTML
- DOCX
- PDF

报告生成依赖持久化数据，不依赖前端模拟数据。PDF 导出需要 `OPSRADAR_CHROME_PATH` 指向可用 Chrome/Chromium。

### 5.9 审计日志

审计日志分为：

- 登录日志
- 操作日志
- 执行日志

写审计的典型场景：

- 登录成功 / 失败
- 创建、编辑、删除应用、环境或资源
- 创建任务、启动任务、取消任务
- worker 完成任务或执行异常
- 修改系统设置、用户、角色

## 6. 数据模型

核心表：

| 表 | 模型 | 说明 |
| --- | --- | --- |
| `users` | `User` | 用户账号 |
| `roles` | `Role` | 角色和权限 |
| `site_settings` | `SiteSetting` | 网站名称、图标等品牌配置 |
| `resources` | `Resource` | 纳管资源 |
| `resource_types` | `ResourceType` | 可配置资源类型 |
| `applications` | `Application` | 业务系统 |
| `app_environments` | `AppEnvironment` | 应用环境 |
| `environment_resources` | `EnvironmentResource` | 资源与应用环境的内部绑定关系 |
| `analysis_rules` | `AnalysisRule` | 根因分析规则 |
| `issue_insights` | `IssueInsight` | 异常分析和建议 |
| `inspection_items` | `InspectionItem` | 巡检指标/模板 |
| `cron_plans` | `CronPlan` | 周期任务计划 |
| `inspection_tasks` | `Task` | 巡检任务 |
| `task_results` | `TaskResult` | 单资源单指标执行结果 |
| `issues` | `Issue` | 异常结果 |
| `task_logs` | `TaskLog` | 任务执行日志 |
| `audit_logs` | `AuditLog` | 审计日志 |
| `notification_channels` | `NotificationChannel` | 通知通道配置 |

主要关系：

```mermaid
erDiagram
  RESOURCE_GROUP ||--o{ RESOURCE : contains
  RESOURCE_GROUP ||--o{ TASK : owns
  APPLICATION ||--o{ APP_ENVIRONMENT : owns
  APP_ENVIRONMENT ||--o{ ENVIRONMENT_RESOURCE : binds
  APP_ENVIRONMENT ||--o{ SERVICE_COMPONENT : contains
  RESOURCE ||--o{ ENVIRONMENT_RESOURCE : member
  RESOURCE ||--o{ SERVICE_COMPONENT : hosts
  USER ||--o{ TASK : creates
  APP_ENVIRONMENT ||--o{ TASK : scopes
  TASK ||--o{ TASK_RESULT : has
  TASK ||--o{ TASK_LOG : has
  RESOURCE ||--o{ TASK_RESULT : checked
  INSPECTION_ITEM ||--o{ TASK_RESULT : executes
  TASK_RESULT ||--o{ ISSUE : creates
  ISSUE ||--o{ ISSUE_INSIGHT : explains
  ANALYSIS_RULE ||--o{ ISSUE_INSIGHT : matches
  TASK ||--o{ ISSUE : has
  ROLE ||--o{ USER : assigned_by_name
```

## 7. 安全设计

### 7.1 凭据加密

资源密码或私钥不会明文保存。创建或更新资源时，API 接收明文凭据后立即使用 AES-GCM 加密，并保存到 `Resource.extra_params.credential_encrypted`。

加密结构：

```json
{
  "v": 1,
  "alg": "AES-256-GCM",
  "nonce": "...",
  "ciphertext": "..."
}
```

密钥来源：

```text
OPSRADAR_ENCRYPTION_KEY
```

生产环境如果未配置该变量，或仍使用占位值，服务启动会失败。

### 7.2 输出脱敏

巡检结果入库前会进行基础脱敏，覆盖：

- password / passwd / pwd
- token / secret / api key
- Authorization Bearer
- PEM private key

超长输出会截断，默认最大保存 20000 字符。

### 7.3 API 数据保护

- 资源查询不返回明文凭据。
- 资源查询不返回密文凭据。
- 任务快照不包含凭据。
- 写操作需要 RBAC 权限。
- Nginx 配置 HTTPS 入口和基础安全响应头。

## 8. 配置项

核心配置通过环境变量控制。

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `OPSRADAR_ENV` | `development` | 运行环境 |
| `OPSRADAR_SECRET_KEY` | `change-me-in-production` | JWT 签名密钥 |
| `OPSRADAR_ENCRYPTION_KEY` | 开发默认值 | AES-GCM 凭据加密密钥，生产必改 |
| `OPSRADAR_DATABASE_URL` | 本机 PostgreSQL | SQLAlchemy PostgreSQL URL |
| `OPSRADAR_REDIS_URL` | `redis://127.0.0.1:6379/0` | Redis 服务检查地址 |
| `OPSRADAR_CELERY_BROKER_URL` | Redis 0 库 | Celery broker |
| `OPSRADAR_CELERY_RESULT_BACKEND` | Redis 1 库 | Celery result backend |
| `OPSRADAR_API_WORKERS` | `2` | API worker 数量 |
| `OPSRADAR_WORKER_CONCURRENCY` | `2` | Celery worker 并发 |
| `OPSRADAR_SSH_CONNECT_TIMEOUT` | `10` | SSH 连接超时秒数 |
| `OPSRADAR_SSH_COMMAND_TIMEOUT` | `30` | 单条命令超时秒数 |
| `OPSRADAR_MAX_TASK_SECONDS` | `3600` | 单个 Celery 任务最大执行时间 |
| `OPSRADAR_PUBLIC_BASE_URL` | `http://127.0.0.1:4173` | 对外访问地址 |
| `OPSRADAR_CORS_ORIGINS` | public base URL | 允许跨域来源 |
| `OPSRADAR_REPORT_DIR` | `reports/` | 报告输出目录 |
| `OPSRADAR_CHROME_PATH` | macOS Chrome 路径 | PDF 渲染浏览器路径 |
| `OPSRADAR_ADMIN_USERNAME` | `admin` | 初始化管理员用户名 |
| `OPSRADAR_ADMIN_PASSWORD` | 由 `.env` 配置 | 初始化管理员密码，生产必须改为强密码 |

生产环境建议：

- `OPSRADAR_SECRET_KEY` 使用 32 字节以上随机字符串。
- `OPSRADAR_ENCRYPTION_KEY` 使用 32 字节以上随机字符串，并纳入密钥管理。
- 数据库、Redis、TLS 证书不要写死在代码中，只放 `.env` 或服务器密钥系统。

## 9. 部署说明

### 9.1 首次部署

准备配置：

```bash
cp .env.example .env
mkdir -p deploy/certs
```

放入 TLS 证书：

```text
deploy/certs/tls.crt
deploy/certs/tls.key
```

启动：

```bash
docker compose --env-file .env up -d --build
docker compose --env-file .env exec opsradar-api python3 -m backend.app.cli seed-builtin
docker compose --env-file .env exec opsradar-api python3 -m backend.app.cli init-admin
docker compose --env-file .env exec opsradar-api python3 -m backend.app.cli check
```

访问：

```text
https://<server-ip-or-domain>/
```

### 9.2 更新部署

```bash
git pull
docker compose --env-file .env up -d --build
docker compose --env-file .env exec opsradar-api python3 -m backend.app.cli check
```

如果只更新静态前端文件，也可以临时拷贝到容器内，但正式发布建议重新构建镜像，保证镜像和代码一致。

### 9.3 生产数据持久化

Compose volume：

| Volume | 说明 |
| --- | --- |
| `postgres_data` | PostgreSQL 数据 |
| `redis_data` | Redis AOF 数据 |
| `reports_data` | 报告文件 |

备份优先级：

1. PostgreSQL 数据库
2. 报告目录
3. `.env` 和 TLS 证书
4. 当前镜像版本或 Git commit

## 10. 本地开发

本地不使用 SQLite，需要先启动 PostgreSQL 和 Redis。

默认连接：

```text
PostgreSQL: postgresql+psycopg://postgres:postgres@127.0.0.1:5432/postgres
Redis: redis://127.0.0.1:6379/0
```

初始化：

```bash
python3 -m pip install -r requirements.txt
python3 -m backend.app.cli migrate
python3 -m backend.app.cli seed-builtin
python3 -m backend.app.cli init-admin
```

启动 API：

```bash
bash scripts/run_dev.sh
```

启动 worker：

```bash
bash scripts/run_worker.sh
```

访问：

```text
http://127.0.0.1:4173/
```

## 11. API 概览

主要接口：

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `POST` | `/api/auth/login` | 登录 |
| `GET` | `/api/me` | 当前用户 |
| `GET` | `/api/site` | 公开站点配置 |
| `GET` | `/api/bootstrap` | 后台初始化数据 |
| `GET` | `/api/dashboard` | 概览数据 |
| `GET` | `/api/search` | 全局搜索 |
| `POST/PATCH/DELETE` | `/api/applications` | 应用管理 |
| `POST/PATCH/DELETE` | `/api/environments` | 应用环境管理 |
| `POST` | `/api/resources` | 创建资源 |
| `POST` | `/api/resources/batch` | 批量创建资源 |
| `PATCH` | `/api/resources/{id}` | 编辑资源 |
| `DELETE` | `/api/resources/{id}` | 删除资源 |
| `POST` | `/api/resources/{id}/test` | 测试资源连通性 |
| `POST` | `/api/tasks` | 创建任务或周期计划 |
| `PATCH` | `/api/tasks/{id}` | 编辑一次性任务 |
| `PATCH` | `/api/cron-plans/{id}` | 编辑周期计划 |
| `POST` | `/api/tasks/{id}/start` | 启动任务 |
| `POST` | `/api/tasks/{id}/cancel` | 取消任务 |
| `GET` | `/api/tasks/{id}` | 任务详情 |
| `GET` | `/api/tasks/{id}/logs` | 任务日志 |
| `GET` | `/api/reports` | 报告列表 |
| `GET` | `/api/reports/{task_id}` | 导出报告 |
| `GET` | `/api/reports/{task_id}/preview` | 报告预览 |
| `POST` | `/api/inspection-items` | 创建自定义巡检项 |
| `PATCH` | `/api/issues/{id}` | 更新异常 |
| `DELETE` | `/api/issues/{id}` | 删除异常 |
| `PATCH` | `/api/settings/site` | 更新网站设置 |
| `POST/PATCH/DELETE` | `/api/settings/resource-types` | 资源类型配置 |
| `PATCH/DELETE` | `/api/users/{id}` | 用户管理 |
| `PATCH/DELETE` | `/api/roles/{id}` | 角色管理 |

## 12. 任务创建数据示例

一次性任务：

```json
{
  "name": "核心主机日常巡检",
  "execution_mode": "once",
  "inspection_scope": "environment",
  "description": "检查核心主机基础健康指标",
  "environment_id": "env_xxx",
  "resource_ids": ["res_xxx"],
  "item_ids": ["itm_os_cpu", "itm_os_memory"],
  "owner_id": "usr_xxx",
  "notify_channels": ["site", "email"],
  "reminder_rules": ["start_before_15m", "notify_on_exception"],
  "note": "业务高峰前执行"
}
```

周期任务：

```json
{
  "name": "生产主机每日巡检",
  "execution_mode": "periodic",
  "inspection_scope": "environment",
  "environment_id": "env_xxx",
  "resource_ids": ["res_xxx"],
  "item_ids": ["itm_os_cpu", "itm_os_load"],
  "schedule_rule": "daily",
  "schedule_time": "09:00",
  "deadline_policy": "1h",
  "retry_policy": "retry_once"
}
```

## 13. 运维检查

### 13.1 健康检查

```bash
docker compose --env-file .env ps
docker compose --env-file .env exec opsradar-api python3 -m backend.app.cli check
```

期望输出：

```text
opsradar check ok
```

### 13.2 日志查看

```bash
docker compose --env-file .env logs -f nginx
docker compose --env-file .env logs -f opsradar-api
docker compose --env-file .env logs -f opsradar-worker
docker compose --env-file .env logs -f opsradar-beat
```

### 13.3 常见问题

| 现象 | 排查方向 |
| --- | --- |
| 登录失败 | 检查管理员密码、浏览器是否缓存旧 JS、API 日志是否 401 |
| `config is not defined` | 前端 JS 运行时错误，强刷浏览器并确认线上 `assets/app.js` 为最新 |
| API 502 | API 容器未启动完成或 Nginx upstream 不可达 |
| `opsradar check` 失败 | 检查 PostgreSQL、Redis、加密 key |
| worker 不执行任务 | 检查 Redis、worker 日志、任务是否 `queued` |
| SSH 认证失败 | 检查资源账号、密码/私钥、端口、防火墙 |
| PDF 导出失败 | 检查 Chrome/Chromium 安装路径和容器内权限 |

## 14. 验证与测试

静态检查：

```bash
python3 -m compileall backend
node --check assets/app.js
rg -n "legacy-local-db|embedded-file-db|thread-check-disabled" backend scripts README.md docs deploy
```

服务检查：

```bash
python3 scripts/check_services.py
python3 scripts/smoke_test.py http://127.0.0.1:4173
```

生产冒烟：

```bash
docker compose --env-file .env up -d
docker compose --env-file .env exec opsradar-api python3 -m backend.app.cli check
```

手工验证：

1. 登录后台。
2. 创建应用和生产环境。
3. 在应用环境中添加主机、数据库或 Redis 资源并配置凭据。
4. 在资源列表中选择所属应用环境；Docker/Compose 服务按资源添加，并填写容器名或 Compose 服务名。
5. 点击资源测试，观察测试状态。
6. 创建应用环境巡检任务。
7. 点击启动任务。
8. 观察任务状态从 `queued` 到 `running` 再到 `finished`。
8. 查看执行日志。
9. 查看巡检报告。
10. 对异常项进行处理闭环。

## 15. 当前边界

当前版本已具备生产交付基础，但第一阶段能力边界如下：

- 真实执行器只覆盖 Linux/Unix 主机 SSH Shell。
- SQL、HTTP、SSL 等模板暂不真实执行。
- 通知通道目前以配置和任务元数据为主，正式外部网关需要按企业环境接入。
- 任务取消第一阶段主要在任务项之间检查取消请求；已经执行中的单条 SSH 命令不会被前端即时中断。
- 当前为单机 Docker Compose 部署，不包含 Kubernetes 高可用编排。

## 16. 后续扩展建议

优先级建议：

1. 增加 PostgreSQL/MySQL/Redis 原生执行器。
2. 增加 HTTP/SSL/Web 安全巡检执行器。
3. 通知通道接入邮件、企业微信、飞书。
4. 增加任务结果保留策略和归档策略。
5. 增加 Prometheus 指标和 Grafana 监控面板。
6. 引入对象存储保存报告。
7. 引入 Vault 或 KMS 管理资源凭据密钥。
8. 支持多 worker 横向扩展和队列隔离。
9. 支持 Kubernetes Helm 部署。
10. 增加自动化测试覆盖：API、RBAC、执行器、报告导出和前端关键流程。

## 17. 交付清单

生产交付至少包含：

- 源代码 Git commit 或镜像版本。
- `.env` 配置文件。
- TLS 证书和私钥。
- PostgreSQL volume 备份策略。
- Redis volume 备份策略。
- reports volume 备份策略。
- 初始化管理员账号。
- 运维手册和故障排查说明。
- 当前版本能力边界说明。
