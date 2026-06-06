# OpsRadar

OpsRadar 是一个 Go + Vue 的 AI 智能巡检与问题闭环平台。v1 按设计文档落地“中心控制面 + 分布式 Worker Agent”架构，覆盖资源纳管、任务创建/启动、Worker 心跳与拉取、Redis/HTTP/SQL/SSH/Ansible 基础巡检、步骤结果回写、问题生成、修复闭环、HTML/PDF/DOCX 报告、AI 工作台数据和审计日志。

## 架构

- `opsradar-api`：Go 控制面，提供 REST API、JWT/RBAC、资源、环境、规则集、任务、问题、报告、审计、AI 工作台和 Worker Gateway。
- `opsradar-worker-agent`：Go 执行面，主动连接 API，定时心跳，轮询任务，执行基础巡检、受控修复和 Ansible Runner playbook，并回写结果。
- `opsradar-web`：Vue 3 + TypeScript + Vite 控制台。
- PostgreSQL：事实数据源。
- Redis：协调、Worker 心跳和临时状态。

## 本地依赖

默认使用本机已经运行的 PostgreSQL 与 Redis：

- PostgreSQL：`postgres://postgres:postgres@127.0.0.1:5432/opsradar?sslmode=disable`
- Redis：`127.0.0.1:6379`

创建数据库：

```bash
cp .env.example .env
bash scripts/create_local_db.sh
```

## 本地启动

```bash
go run ./opsradar-api/cmd/api
go run ./opsradar-worker-agent/cmd/worker
cd opsradar-web && npm install && npm run dev
```

默认登录：

- 用户名：`admin`
- 密码：`OpsRadar@123`

生产环境需要分别配置 `OPSRADAR_JWT_SECRET` 和 `OPSRADAR_ENCRYPTION_KEY`：前者用于登录令牌签名，后者用于资源凭据、集成 Token、数据源密钥和 AI API Key 的 AES-GCM 加密。开发环境未设置 `OPSRADAR_ENCRYPTION_KEY` 时会回退到 `OPSRADAR_JWT_SECRET`，便于兼容已有本地数据。

## Docker Compose

Compose 默认连接宿主机 PostgreSQL 与 Redis，不重复拉起数据库容器：

```bash
cp .env.example .env
bash scripts/create_local_db.sh
docker compose up --build
```

访问：

- Web 控制台：`http://127.0.0.1:5173`
- API 健康检查：`http://127.0.0.1:8080/api/health`
