<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { api, clearToken, getToken, login, type Issue, type Report, type Resource, type Task, type User } from './api/client'

type Tab = 'home' | 'resources' | 'tasks' | 'issues' | 'reports' | 'audit' | 'settings'

const tabs: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'home', label: '首页', icon: '⌂' },
  { id: 'resources', label: '资源', icon: '▦' },
  { id: 'tasks', label: '任务', icon: '▶' },
  { id: 'issues', label: '问题', icon: '!' },
  { id: 'reports', label: '报告', icon: '▣' },
  { id: 'audit', label: '审计', icon: '◎' },
  { id: 'settings', label: '设置', icon: '⚙' }
]

const active = ref<Tab>('home')
const user = ref<User | null>(null)
const loginForm = ref({ username: 'admin', password: 'OpsRadar@123' })
const error = ref('')
const loading = ref(false)
const bootstrap = ref<any>({})
const workbench = ref<any>({})
const resources = ref<Resource[]>([])
const tasks = ref<Task[]>([])
const issues = ref<Issue[]>([])
const reports = ref<Report[]>([])
const auditLogs = ref<any[]>([])
const workers = ref<any[]>([])
const newResource = ref({ name: 'local redis', resource_type: 'redis', host: '127.0.0.1', port: 6379, protocol: 'redis' })
const importCsv = ref('name,resource_type,host,port,protocol,tags\nimport redis,redis,127.0.0.1,6379,redis,import')
const jumpserver = ref({ name: 'JumpServer', base_url: 'http://127.0.0.1:8081', token: '' })
const prompt = ref({ name: '问题分析', scene: 'issue_analysis', content: '基于巡检输出、任务日志和证据链分析根因，并给出修复与复测步骤。' })
const cronPlan = ref({ name: '每日默认巡检', interval_seconds: 86400 })
const operationMessage = ref('')

const stats = computed(() => bootstrap.value.stats || {})
const latestTasks = computed(() => tasks.value.slice(0, 6))
const openIssues = computed(() => issues.value.filter((item) => item.status !== 'closed'))

async function signIn() {
  error.value = ''
  loading.value = true
  try {
    user.value = await login(loginForm.value.username, loginForm.value.password)
    await refreshAll()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '登录失败'
  } finally {
    loading.value = false
  }
}

async function refreshAll() {
  const [boot, aiBoard, res, taskRes, issueRes, reportRes, auditRes, workerRes] = await Promise.all([
    api<any>('/api/bootstrap'),
    api<any>('/api/dashboard/ai-workbench'),
    api<{ items: Resource[] }>('/api/resources'),
    api<{ items: Task[] }>('/api/tasks'),
    api<{ items: Issue[] }>('/api/issues'),
    api<{ items: Report[] }>('/api/reports'),
    api<{ items: any[] }>('/api/audit-logs'),
    api<{ items: any[] }>('/api/workers')
  ])
  bootstrap.value = boot
  workbench.value = aiBoard
  resources.value = res.items || []
  tasks.value = taskRes.items || []
  issues.value = issueRes.items || []
  reports.value = reportRes.items || []
  auditLogs.value = auditRes.items || []
  workers.value = workerRes.items || []
}

async function createResource() {
  await api('/api/resources', {
    method: 'POST',
    body: JSON.stringify({ ...newResource.value, tags: ['manual'] })
  })
  await refreshAll()
}

async function importResources() {
  const result = await api<any>('/api/resources/import', {
    method: 'POST',
    body: JSON.stringify({ source: 'csv', csv: importCsv.value })
  })
  operationMessage.value = `导入完成：成功 ${result.success}，失败 ${result.failed}`
  await refreshAll()
}

async function createAndStartTask() {
  const created = await api<{ id: string }>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({ name: `手动巡检 ${new Date().toLocaleString()}`, rule_set_id: 'ruleset_default' })
  })
  await api(`/api/tasks/${created.id}/start`, { method: 'POST' })
  active.value = 'tasks'
  await refreshAll()
}

async function exportReport(taskId: string, format: 'html' | 'pdf' | 'docx') {
  const result = await api<{ download_url: string; file_name: string }>(`/api/reports/${taskId}/exports`, {
    method: 'POST',
    body: JSON.stringify({ format })
  })
  operationMessage.value = `导出完成：${result.file_name}`
  window.open(result.download_url, '_blank')
}

async function saveJumpServer() {
  const result = await api<{ id: string }>('/api/integrations/jumpserver/config', {
    method: 'POST',
    body: JSON.stringify(jumpserver.value)
  })
  operationMessage.value = `JumpServer 配置已保存：${result.id}`
}

async function savePrompt() {
  const result = await api<{ id: string; version: number }>('/api/ai/prompts', {
    method: 'POST',
    body: JSON.stringify(prompt.value)
  })
  operationMessage.value = `Prompt 已保存：v${result.version}`
}

async function createCronPlan() {
  const result = await api<{ id: string }>('/api/cron-plans', {
    method: 'POST',
    body: JSON.stringify({ ...cronPlan.value, rule_set_id: 'ruleset_default' })
  })
  operationMessage.value = `周期计划已创建：${result.id}`
}

function logout() {
  clearToken()
  user.value = null
}

onMounted(async () => {
  if (!getToken()) return
  try {
    user.value = (await api<{ user: User }>('/api/me')).user
    await refreshAll()
  } catch {
    clearToken()
  }
})
</script>

<template>
  <main v-if="!user" class="login-shell">
    <section class="login-panel">
      <img src="/logo.png" alt="OpsRadar" />
      <h1>OpsRadar</h1>
      <p>AI 智能巡检与问题闭环平台</p>
      <label>
        账号
        <input v-model="loginForm.username" autocomplete="username" />
      </label>
      <label>
        密码
        <input v-model="loginForm.password" type="password" autocomplete="current-password" @keydown.enter="signIn" />
      </label>
      <button :disabled="loading" @click="signIn">{{ loading ? '登录中' : '登录' }}</button>
      <span v-if="error" class="error">{{ error }}</span>
    </section>
  </main>

  <main v-else class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <img src="/logo.png" alt="OpsRadar" />
        <strong>OpsRadar</strong>
      </div>
      <button v-for="tab in tabs" :key="tab.id" :class="{ active: active === tab.id }" @click="active = tab.id">
        <span>{{ tab.icon }}</span>{{ tab.label }}
      </button>
      <div class="sidebar-footer">
        <span>{{ user.display_name || user.username }}</span>
        <button @click="logout">退出</button>
      </div>
    </aside>

    <section class="workspace">
      <header class="topbar">
        <div>
          <h1>{{ tabs.find((tab) => tab.id === active)?.label }}</h1>
          <p>PostgreSQL + Redis + Go Worker 控制面</p>
        </div>
        <div class="top-actions">
          <span v-if="operationMessage" class="notice">{{ operationMessage }}</span>
          <button @click="refreshAll">刷新</button>
          <button class="primary" @click="createAndStartTask">开始巡检</button>
        </div>
      </header>

      <section v-if="active === 'home'" class="grid home-grid">
        <article class="panel ai-panel">
          <h2>AI 智能巡检助手</h2>
          <p>{{ workbench.insight?.summary || '加载 AI 洞察中' }}</p>
          <div class="quick-actions">
            <button @click="createAndStartTask">开始巡检</button>
            <button @click="active = 'issues'">分析异常</button>
            <button @click="active = 'reports'">生成报告</button>
          </div>
        </article>
        <article class="panel stats-panel">
          <div><span>资源</span><strong>{{ stats.resources || 0 }}</strong></div>
          <div><span>任务</span><strong>{{ stats.tasks || 0 }}</strong></div>
          <div><span>问题</span><strong>{{ stats.issues || 0 }}</strong></div>
          <div><span>Worker</span><strong>{{ stats.workers || 0 }}</strong></div>
        </article>
        <article class="panel">
          <h2>AI 风险识别</h2>
          <ul class="list">
            <li v-for="risk in workbench.risks || []" :key="risk.title">
              <span>{{ risk.title }}</span><b :class="`level ${risk.level}`">{{ risk.level }}</b>
            </li>
          </ul>
        </article>
        <article class="panel">
          <h2>AI 下一步</h2>
          <ul class="list">
            <li v-for="action in workbench.next_actions || []" :key="action.action">
              <span>{{ action.title }}</span><small>{{ action.description }}</small>
            </li>
          </ul>
        </article>
      </section>

      <section v-if="active === 'resources'" class="content-stack">
        <article class="panel form-row">
          <input v-model="newResource.name" placeholder="资源名称" />
          <input v-model="newResource.resource_type" placeholder="类型" />
          <input v-model="newResource.host" placeholder="Host" />
          <input v-model.number="newResource.port" type="number" placeholder="端口" />
          <button class="primary" @click="createResource">纳管资源</button>
        </article>
        <article class="panel">
          <h2>批量导入</h2>
          <textarea v-model="importCsv" rows="5"></textarea>
          <div class="quick-actions">
            <button class="primary" @click="importResources">导入 CSV</button>
          </div>
        </article>
        <article class="panel">
          <h2>资源中心</h2>
          <table>
            <thead><tr><th>名称</th><th>类型</th><th>地址</th><th>状态</th></tr></thead>
            <tbody>
              <tr v-for="item in resources" :key="item.id">
                <td>{{ item.name }}</td><td>{{ item.resource_type }}</td><td>{{ item.host }}:{{ item.port }}</td><td>{{ item.status }}</td>
              </tr>
            </tbody>
          </table>
        </article>
      </section>

      <section v-if="active === 'tasks'" class="content-stack">
        <article class="panel">
          <h2>巡检任务</h2>
          <table>
            <thead><tr><th>任务</th><th>状态</th><th>成功</th><th>失败</th><th>创建时间</th></tr></thead>
            <tbody>
              <tr v-for="task in latestTasks" :key="task.id">
                <td>{{ task.name }}</td><td><b class="pill">{{ task.status }}</b></td><td>{{ task.summary?.success || 0 }}</td><td>{{ task.summary?.fail || 0 }}</td><td>{{ new Date(task.created_at).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </article>
      </section>

      <section v-if="active === 'issues'" class="content-stack">
        <article class="panel">
          <h2>问题闭环</h2>
          <ul class="issue-list">
            <li v-for="issue in openIssues" :key="issue.id">
              <b :class="`level ${issue.severity}`">{{ issue.severity }}</b>
              <span>{{ issue.title }}</span>
              <small>{{ issue.status }} · AI {{ issue.ai_status }}</small>
            </li>
          </ul>
        </article>
      </section>

      <section v-if="active === 'reports'" class="content-stack">
        <article class="panel">
          <h2>报告归档</h2>
          <table>
            <thead><tr><th>报告</th><th>健康分</th><th>状态</th><th>时间</th><th>导出</th></tr></thead>
            <tbody>
              <tr v-for="report in reports" :key="report.id">
                <td>{{ report.name }}</td><td>{{ report.health_score }}</td><td>{{ report.status }}</td><td>{{ new Date(report.created_at).toLocaleString() }}</td>
                <td class="row-actions">
                  <button @click="exportReport(report.task_id, 'html')">HTML</button>
                  <button @click="exportReport(report.task_id, 'pdf')">PDF</button>
                  <button @click="exportReport(report.task_id, 'docx')">DOCX</button>
                </td>
              </tr>
            </tbody>
          </table>
        </article>
      </section>

      <section v-if="active === 'audit'" class="content-stack">
        <article class="panel">
          <h2>审计日志</h2>
          <table>
            <thead><tr><th>动作</th><th>操作者</th><th>结果</th><th>时间</th></tr></thead>
            <tbody>
              <tr v-for="log in auditLogs.slice(0, 30)" :key="log.id">
                <td>{{ log.action }}</td><td>{{ log.actor_name }}</td><td>{{ log.result }}</td><td>{{ new Date(log.created_at).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </article>
      </section>

      <section v-if="active === 'settings'" class="grid">
        <article class="panel">
          <h2>Worker 节点</h2>
          <ul class="list">
            <li v-for="worker in workers" :key="worker.id">
              <span>{{ worker.name }}</span><b class="pill">{{ worker.status }}</b>
            </li>
          </ul>
        </article>
        <article class="panel">
          <h2>JumpServer</h2>
          <div class="settings-form">
            <input v-model="jumpserver.name" placeholder="名称" />
            <input v-model="jumpserver.base_url" placeholder="地址" />
            <input v-model="jumpserver.token" type="password" placeholder="Token" />
            <button class="primary" @click="saveJumpServer">保存配置</button>
          </div>
        </article>
        <article class="panel">
          <h2>Prompt 管理</h2>
          <div class="settings-form">
            <input v-model="prompt.name" placeholder="名称" />
            <input v-model="prompt.scene" placeholder="场景" />
            <textarea v-model="prompt.content" rows="5"></textarea>
            <button class="primary" @click="savePrompt">保存 Prompt</button>
          </div>
        </article>
        <article class="panel">
          <h2>周期计划</h2>
          <div class="settings-form">
            <input v-model="cronPlan.name" placeholder="计划名称" />
            <input v-model.number="cronPlan.interval_seconds" type="number" placeholder="间隔秒数" />
            <button class="primary" @click="createCronPlan">创建计划</button>
          </div>
        </article>
      </section>
    </section>
  </main>
</template>
