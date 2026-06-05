# OpsRadar v1 技术架构设计

更新时间：2026-06-04

适用项目：OpsRadar 基于 AI 的智能巡检平台

---

## 一、架构结论

OpsRadar v1 采用“中心控制面 + 分布式 Worker Agent”的架构：

```text
中心端：
  opsradar-web
  opsradar-api
  postgres
  redis

执行端：
  opsradar-worker-agent x N
```

核心原则：

- `opsradar-api` 负责控制面：接口、权限、资源、任务、调度、AI、报告、Worker 接入。
- `opsradar-worker-agent` 负责执行面：巡检、复测、一键修复、脚本执行、结果上报。
- Worker Agent 主动连接 API，不暴露端口，适配跨机房、跨网段和客户现场部署。
- PostgreSQL 作为事实来源，Redis 只做协调、锁、限流和临时状态。
- scheduler 暂不独立成容器，作为 `opsradar-api` 内部后台模块运行。

---

## 二、服务职责

| 服务 | 职责 |
|---|---|
| `opsradar-web` | Vue 前端控制台，承载首页、资源中心、巡检中心、问题中心、报告中心、AI 中心、系统管理 |
| `opsradar-api` | REST API、认证授权、Worker Gateway、任务调度、任务派发、AI Orchestrator、AI 对话、报告管理、审计日志 |
| `postgres` | 业务数据、资源数据、任务状态、巡检结果、问题、修复记录、报告记录、AI 会话、Prompt 版本、知识库元数据 |
| `redis` | 分布式锁、调度锁、限流、Worker 心跳缓存、在线状态缓存、临时上下文 |
| `opsradar-worker-agent` | 主动连接 API，接收任务，执行巡检/复测/修复，上报日志、进度和结果 |

---

## 三、API 内部模块

`opsradar-api` 是 v1 的控制中心，内部按模块隔离：

```text
opsradar-api
  ├─ REST API
  ├─ Auth / RBAC
  ├─ Resource Manager
  ├─ Inspection Manager
  ├─ Issue Manager
  ├─ Report Manager
  ├─ AI Center
  │   └─ AI Orchestrator
  ├─ Scheduler
  ├─ Dispatcher
  ├─ Worker Gateway
  └─ Audit Log
```

### 3.1 Scheduler

周期性计划预计规模：

```text
最多约 100 条周期计划
每条约 20 个资产
单轮约 2000 个 target_run
```

该规模下 scheduler 压力很小，v1 直接内置在 `opsradar-api` 中。

职责：

- 每 10-30 秒扫描到期计划。
- 创建 `inspection_job` 和 `target_run`。
- 更新计划的 `next_run_at`。
- 通知 Dispatcher 有新任务可派发。

约束：

- API 多副本时必须使用 Redis 分布式锁，避免重复调度。
- 周期任务创建必须有幂等约束，例如 `plan_id + scheduled_at` 唯一。

### 3.2 Dispatcher

Dispatcher 负责把待执行任务分配给合适的 Worker Agent。

调度维度：

- Worker 在线状态
- region / zone
- tags
- capabilities
- 当前并发
- 任务优先级
- 单资产互斥锁

### 3.3 Worker Gateway

Worker Gateway 负责 Worker Agent 接入。

推荐通信方式：

```text
gRPC 双向流
```

优先级：

```text
gRPC Stream > WebSocket > HTTP 长轮询
```

Worker Agent 不暴露端口，只主动连接 `opsradar-api`。

---

## 四、Worker Agent 设计

Worker Agent 是执行器，不是普通后台任务容器。它可以部署在任意能访问控制中心的服务器上。

启动流程：

```text
读取配置
  -> 连接 opsradar-api
  -> 注册节点
  -> 上报心跳
  -> 等待任务
  -> 执行任务
  -> 上报进度/日志/结果
```

示例配置：

```yaml
worker:
  id: auto
  name: worker-shanghai-01
  region: shanghai
  zone: az-1
  tags:
    - linux
    - mysql
    - k8s
  capabilities:
    - ssh
    - http
    - sql
    - k8s
    - script
    - ansible
  concurrency: 100
  work_dir: /var/lib/opsradar-worker

control_plane:
  endpoint: opsradar.example.com:443
  tls: true
  token: ${OPSRADAR_WORKER_TOKEN}
  heartbeat_interval: 10s
  reconnect_backoff: 2s
```

执行器建议抽象：

```text
SSH Executor
HTTP Executor
SQL Executor
K8s Executor
Script Executor
Ansible Runner Executor
AI Executor
Report Executor
```

### 4.1 Ansible Runner 执行后端

Ansible Runner 不替代 Worker Agent。Worker Agent 仍然是 OpsRadar 的执行控制进程，负责任务接收、并发控制、凭据注入、超时取消、日志采集、结果解析、审计和状态回写；Ansible Runner 只是 Worker 内部的可选执行后端，用于复用 playbook、role、module、inventory、facts 和 collections 能力。

推荐容器结构：

```text
opsradar-worker-agent
  -> Worker Agent 主程序
     -> 接收 inspection / retest / repair 任务
     -> 选择执行器
     -> 控制并发、超时、取消和重试
     -> 解密凭据并生成临时执行上下文
     -> 收集日志、事件和返回码
     -> 回写 step_run / issue / report / audit_log
  -> ansible-runner
     -> 执行 playbook / role / module / ad-hoc 命令
```

执行器选择建议：

| 场景 | 默认执行器 |
|---|---|
| SSH 单条命令巡检 | SSH Executor |
| SQL 查询巡检 | SQL Executor |
| HTTP/API 健康检查 | HTTP Executor |
| Prometheus / VictoriaMetrics 查询 | HTTP Executor |
| VictoriaLogs 查询 | HTTP Executor |
| 简单 OS 指标巡检 | SSH Executor |
| 已有 Ansible playbook / role | Ansible Runner Executor |
| 多步骤批量修复 | Ansible Runner Executor |
| 需要 facts、inventory、vars、collections 的复杂任务 | Ansible Runner Executor |

Ansible Runner 运行约束：

- 每次执行由 Worker 生成独立临时 `private_data_dir`。
- inventory 只包含本次任务允许访问的目标资源。
- 凭据由 Worker 临时注入，执行结束后清理。
- Runner event stream 必须转换为 OpsRadar 的任务日志和步骤结果。
- artifacts 只保存必要摘要，敏感输出必须脱敏。
- Runner 进程必须受 Worker 的并发、超时和取消控制。

v1 可以把 Ansible Runner 内置在 `opsradar-worker-agent` 镜像里，减少部署组件。后续如果 Runner 任务明显消耗 CPU/内存，或需要更强安全隔离，再拆成独立 `ansible-runner-service`。

---

## 五、任务模型

巡检、复测、一键修复统一建模为异步任务。

核心模型：

```text
inspection_job
  一次巡检任务

target_run
  单个资产的一次执行记录

step_run
  单个规则/步骤的执行记录

issue
  异常问题

repair_task
  修复任务

retest_task
  复测任务
```

推荐粒度：

```text
一个周期计划 -> 一个 inspection_job
一个资产 -> 一个 target_run
一个规则 -> 一个 step_run
```

每条周期计划约 20 个资产，不需要在 v1 做 batch 拆分。后续单任务资产数量明显增大时，再引入 `inspection_batch`。

---

## 六、状态机

任务状态：

```text
PENDING
ASSIGNED
RUNNING
SUCCESS
FAILED
PARTIAL
TIMEOUT
CANCELLED
```

问题状态：

```text
OPEN
CONFIRMED
FIXING
RETESTING
FIXED
CLOSED
IGNORED
```

任务派发状态流：

```text
PENDING
  -> ASSIGNED
  -> RUNNING
  -> SUCCESS / FAILED / TIMEOUT / CANCELLED
```

Worker 离线后的恢复流：

```text
ASSIGNED/RUNNING + lease 过期
  -> PENDING 或 RETRYING
```

---

## 七、可靠性机制

### 7.1 Worker 心跳

Worker Agent 定时向 API 上报：

- worker id
- 当前状态
- 当前运行任务数
- 版本
- region / zone / tags / capabilities
- 最近错误信息

API 根据 `last_heartbeat_at` 判断 Worker 是否在线。

### 7.2 Task Lease

任务派发后必须设置租约：

```text
assigned_worker_id = worker_id
lease_expires_at = now + lease_ttl
```

Worker 执行期间定期续租。如果 Worker 掉线或不续租，API 将任务重新置为可派发状态。

### 7.3 幂等约束

周期任务必须避免重复生成：

```text
plan_id + scheduled_at 唯一
```

任务执行上报也要有幂等键：

```text
task_run_id + target_id + step_id
```

### 7.4 单资产互斥

同一资产同一时间不允许执行冲突动作。

建议互斥级别：

```text
巡检：同一资产允许有限并发，默认 1
复测：同一资产默认 1
修复：同一资产强制 1
```

### 7.5 失败重试

失败重试要区分错误类型：

| 类型 | 策略 |
|---|---|
| 网络抖动 | 可重试，指数退避 |
| SSH 认证失败 | 不自动重试或低频重试 |
| 脚本执行失败 | 按规则配置决定 |
| Worker 离线 | lease 过期后重新派发 |
| 人工取消 | 不重试 |

### 7.6 断点续跑

Worker 每完成一个 `target_run` 或 `step_run` 就上报结果。

中途断线时：

- 已完成的 `target_run` 保留结果。
- 未完成或 lease 过期的 `target_run` 重新派发。
- 不从整个 `inspection_job` 重新开始。

---

## 八、核心流程

### 8.1 手动巡检

```text
用户创建手动任务
  -> API 写入 inspection_job / target_run
  -> Dispatcher 选择 Worker
  -> Worker 执行巡检
  -> Worker 上报 step_run
  -> API 聚合结果
  -> 生成 issue / report
```

### 8.2 周期巡检

```text
Scheduler 扫描到期计划
  -> 创建 inspection_job / target_run
  -> 更新 next_run_at
  -> Dispatcher 派发任务
  -> Worker 执行并上报结果
```

### 8.3 复测

```text
用户点击复测
  -> API 根据 issue 关联资产和规则生成 retest_task
  -> Dispatcher 派发给 Worker
  -> Worker 执行同一组检查
  -> 通过则关闭问题
  -> 不通过则保持 OPEN 并追加复测记录
```

### 8.4 一键修复

```text
用户确认修复
  -> API 创建 repair_task
  -> Worker 执行修复动作
  -> Worker 上报完整日志
  -> 自动触发复测
  -> 修复成功关闭问题
  -> 修复失败保留失败原因和审计记录
```

一键修复约束：

- 默认需要人工确认。
- 高风险动作必须审批。
- 支持参数预览。
- 支持执行前快照。
- 支持失败停止后续批次。
- 全链路写审计日志。

---

## 九、AI 能力架构

AI 能力不要直接写死在巡检、报告、修复等业务逻辑中。v1 建议在 `opsradar-api` 内部增加独立的 AI Orchestrator 层，由它统一负责上下文组装、RAG 检索、模型调用、Prompt 选择、结果结构化和任务衔接。

v1 中 AI Center 仍放在 `opsradar-api` 内部，先不独立成服务；但代码边界要按后续可拆分服务设计。

### 9.1 AI Orchestrator 流程

典型分析链路：

```text
用户问题 / 巡检异常 / 告警事件
  -> 上下文组装
  -> RAG 检索：资源、任务日志、历史报告、知识库、监控指标
  -> LLM 分析
  -> 生成综合诊断、根因分析、问题证据链、修复建议、修复步骤
  -> 人工确认 / 自动创建修复任务
```

AI Orchestrator 只做分析、编排和建议生成，不直接操作资产。涉及变更的动作必须转换为 `repair_task` 或工作流节点，再经过权限、审批、审计和 Worker Agent 执行。

### 9.2 AI Center 功能

| 功能 | 技术建议 |
|---|---|
| 模型配置 | 建立 OpenAI-compatible Provider 表，支持 endpoint、model、api_key 引用、超时、限流、默认参数、启停状态 |
| 模型对接 | 统一封装 Chat Completions / Embeddings / Rerank 能力，适配 OpenAI、Azure OpenAI、DeepSeek、Qwen、Ollama、vLLM 私有模型 |
| 数据源配置 | 支持 JDBC / API / 文件 / 日志源，统一维护连接信息、鉴权方式、采集范围和脱敏策略 |
| 对话助手 | 支持流式 SSE / WebSocket，保留会话、引用来源、工具调用记录和用户反馈 |
| 知识库 / RAG | v1 可用 PostgreSQL + pgvector 起步，数据量和并发上来后再引入 Milvus |
| 工作流编排 | LiteFlow 起步，用于诊断链路、报告生成链路、修复建议链路；复杂审批和长事务后再换 Flowable |
| Prompt 管理 | Prompt 存数据库并保留版本，支持变量模板、灰度启用、回滚和效果标注 |

### 9.3 数据源集成

AI 诊断需要从业务数据、监控数据、日志数据和知识库中组合证据。建议把数据源接入做成独立配置，而不是散落在各个分析逻辑中。

优先支持的数据源：

- OpsRadar 内部数据：资源、巡检模板、巡检任务、`target_run`、`step_run`、问题、修复记录、历史巡检报告。
- 日志源：VictoriaLogs、文件日志、API 日志源。
- 监控与指标：Prometheus、VictoriaMetrics。
- 可视化与看板：Grafana，用于跳转引用、面板链接和查询上下文。
- 外部业务库：JDBC 数据源，例如 MySQL、PostgreSQL、Oracle。
- 知识库：运维手册、故障 SOP、变更规范、历史复盘、厂商文档。

数据源接入要求：

- 所有外部数据源必须有连接测试、权限校验和查询超时。
- 查询结果进入 AI 上下文前必须做字段脱敏和长度裁剪。
- AI 输出必须保留引用来源，例如日志时间范围、指标查询语句、巡检步骤、知识库文档片段。
- 诊断结果要能回溯到证据链，避免只给结论不给依据。

AI 工作台首页右侧侧栏由 AI Orchestrator 聚合生成，不直接展示普通业务概览。侧栏数据建议拆分为 `ai_insight`、`ai_risk_items`、`ai_next_actions` 三类结构：

- `ai_insight`：包含更新时间、摘要、说明，以及风险识别、潜在任务、趋势变化三个指标。
- `ai_risk_items`：包含风险标题、资源名称/IP、风险等级和可追溯证据引用。
- `ai_next_actions`：包含建议标题、建议说明、动作按钮文案和后续可触发的 Action 类型。

### 9.4 智能诊断能力

智能诊断面向巡检异常、告警事件和用户自然语言问题。

核心输出：

- AI 生成综合诊断：用于巡检报告首页或问题详情页，概括本次巡检健康状况和主要风险。
- AI 根因分析：结合巡检结果、日志、指标、历史报告和知识库，给出可能根因及置信度。
- 问题证据链：列出支撑判断的指标异常、日志片段、巡检步骤失败、历史相似问题和知识库依据。
- 修复建议：给出建议动作、影响范围、风险等级、前置检查和回滚方式。
- 修复步骤：生成可人工执行的步骤，或转换为待审批的 `repair_task`。
- 修复任务等待：AI 生成建议后进入人工确认或审批状态，不自动越权执行。

巡检报告生成时，报告中心应调用 AI Orchestrator 生成综合诊断、根因分析、证据链和修复建议，并把 AI 输出与原始巡检结果分开存储，便于后续重新生成或模型效果评估。

### 9.5 RAG 与知识库

知识库建议按空间和文档版本管理：

```text
knowledge_space
  -> document
  -> chunk
  -> embedding
  -> citation
```

检索策略：

- 先按租户、资源类型、业务系统、标签、时间范围做过滤。
- 再做向量检索和关键词检索的混合召回。
- 对召回结果做 rerank，并控制进入 Prompt 的 token 数。
- 输出结果必须带 citation，前端展示可点击来源。

v1 数据量不大时，使用 PostgreSQL + pgvector 可以减少组件数量。知识库规模、召回并发或向量维度明显增长后，再迁移到 Milvus。

### 9.6 Prompt 与模型治理

Prompt 不建议写死在代码中，必须入库管理：

```text
prompt_template
  code
  name
  scenario
  version
  content
  variables
  enabled
  created_by
  created_at
```

治理要求：

- Prompt 支持按场景区分：对话问答、巡检报告、根因分析、修复建议、证据链生成。
- 模型参数支持按场景配置，例如 temperature、max_tokens、timeout、stream。
- Provider 调用要记录请求摘要、响应摘要、token 用量、耗时、错误码和关联业务对象。
- 敏感信息不得明文进入 Prompt 日志。
- 重要 AI 结论需要保留模型、Prompt 版本和上下文引用，方便复盘。

### 9.7 任务与权限边界

AI 与任务系统的边界必须明确：

- AI 可以创建“建议”，不能直接执行“修复”。
- AI 可以生成 `repair_task` 草稿，但状态应为待确认或待审批。
- 自动任务只允许执行白名单、低风险、可回滚动作。
- 高风险修复必须人工确认，并写入审计日志。
- AI 生成的脚本或命令默认不直接执行，必须经过策略校验、参数预览和权限判断。
- 修复完成后必须触发复测，并把复测结果回写到问题和报告中。

---

## 十、部署形态

### 10.1 开发环境

```text
opsradar-web x1
opsradar-api x1
postgres x1
redis x1
opsradar-worker-agent x1
```

### 10.2 生产起步

```text
opsradar-web x1
opsradar-api x2
postgres x1
redis x1
opsradar-worker-agent xN
```

Worker Agent 按区域或网络边界部署：

```text
上海机房 worker-agent x 3
北京机房 worker-agent x 3
深圳机房 worker-agent x 3
```

中心端固定容器少，执行能力通过 Worker Agent 横向扩展。

---

## 十一、技术选型

| 层级 | 选型 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Element Plus |
| 后端 | Go |
| HTTP API | Gin 或 Chi |
| Worker 通信 | gRPC 双向流 |
| Worker 原生执行器 | Go SSH / SQL / HTTP / K8s Executor |
| Ansible 执行后端 | Worker 镜像内置 Ansible Runner，作为可选执行器 |
| 数据库 | PostgreSQL |
| 向量检索 | PostgreSQL + pgvector 起步，后续按规模迁移 Milvus |
| 缓存/协调 | Redis |
| AI 接入 | OpenAI-compatible Provider 抽象 |
| AI 流式输出 | SSE 起步，需要双向交互时使用 WebSocket |
| AI 编排 | AI Orchestrator 内置在 API，工作流用 LiteFlow 起步 |
| Prompt 管理 | 数据库存版本，支持变量模板、灰度、回滚 |
| 数据源集成 | JDBC / API / 文件 / 日志源，优先接入 VictoriaLogs、Grafana、Prometheus、VictoriaMetrics |
| 报告 | HTML 模板，PDF/DOCX 由 Worker 生成 |
| 部署 | Docker Compose 起步，后续按需要迁移 Kubernetes |

---

## 十二、后续拆分条件

v1 暂不引入独立 scheduler、OpenSearch、MinIO、独立 AI Worker、独立 Report Worker、独立 Ansible Runner Service、Milvus、Flowable。

出现以下情况再拆：

| 能力 | 拆分条件 |
|---|---|
| 独立 scheduler | 周期计划达到数万条，或调度策略变成复杂错峰/资源池策略 |
| OpenSearch | 任务日志、巡检明细、报告全文检索在 PostgreSQL 上明显变慢 |
| MinIO | 报告、附件、脚本包文件量明显增长，本地卷不再适合 |
| 独立 AI Worker | AI 分析拖慢 API，或模型调用需要独立限流和隔离 |
| 独立 Report Worker | PDF/DOCX 生成明显消耗 CPU/内存，影响普通巡检执行 |
| 独立 Ansible Runner Service | Ansible playbook/role 执行明显消耗 CPU/内存，或需要与普通 Worker 做安全隔离、独立扩容 |
| Milvus | 知识库 chunk 数量、向量召回并发或多租户隔离需求超过 pgvector 舒适区 |
| Flowable | 修复审批、跨团队协作、人工节点、长事务状态流明显复杂化 |
| Kubernetes | Worker Agent 和 API 多副本运维成本超过 Docker Compose 能力边界 |

---

## 十三、最终结论

OpsRadar v1 架构确定为：

```text
opsradar-web
opsradar-api
postgres
redis
opsradar-worker-agent
```

其中 `opsradar-api` 内置 scheduler、dispatcher、worker gateway、AI Center 和 AI Orchestrator；`opsradar-worker-agent` 作为可分布式部署的执行代理，主动连接 API，通过 gRPC 双向流接收任务并上报结果。Worker Agent 内置原生执行器，并可调用 Ansible Runner 作为受控执行后端，用于复用复杂 playbook、role、module 和批量修复能力。

该架构可以用较少中心容器完成 v1 交付，同时保留向 4w+ 服务器规模扩展的路径。
