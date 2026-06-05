<script setup lang="ts">
import { computed, inject, onMounted, ref, type Ref } from 'vue';
import {
  Activity,
  AlertCircle,
  Bell,
  ChevronDown,
  Database,
  Gauge,
  Info,
  KeyRound,
  ListChecks,
  Monitor,
  RefreshCw,
  Save,
  Settings,
  UsersRound
} from '@lucide/vue';
import { workerAgents as seedWorkerAgents, type AgentStatus, type AgentTimelineState, type WorkerAgentRecord } from '../data';
import { api } from '../api';

const sections = [
  { key: '基础设置', desc: '系统名称、区域与显示偏好', icon: Settings },
  { key: '通知设置', desc: '告警渠道与通知策略', icon: Bell },
  { key: '用户与权限', desc: '默认角色、登录安全与审计', icon: UsersRound },
  { key: '系统集成', desc: 'AI、堡垒机与监控数据源', icon: KeyRound },
  { key: '数据保留', desc: '巡检、任务和日志保留周期', icon: Database },
  { key: 'Agent 状态', desc: '分布式 Worker Agent 在线状态、压力负载与最近运行情况', icon: Monitor },
  { key: '系统信息', desc: '版本、运行状态与服务节点', icon: Info },
] as const;

type SectionKey = typeof sections[number]['key'];

const activeTab = ref<SectionKey>('基础设置');
const activeSection = computed(() => sections.find((item) => item.key === activeTab.value) ?? sections[0]);
const themeMode = inject<Ref<'light' | 'dark'>>('opsradar-theme');
const setThemeMode = inject<(theme: 'light' | 'dark') => void>('opsradar-set-theme');
const agentFilter = ref<'全部节点' | '仅异常'>('全部节点');
const agentTimeRange = ref('最近 24h');
const workerAgents = ref<WorkerAgentRecord[]>(seedWorkerAgents);

const selectedTheme = computed(() => themeMode?.value === 'dark' ? '深色模式' : '浅色模式');
const visibleAgents = computed(() => agentFilter.value === '仅异常' ? workerAgents.value.filter((agent) => agent.status !== '在线') : workerAgents.value);
const onlineAgents = computed(() => workerAgents.value.filter((agent) => agent.status === '在线').length);
const abnormalAgents = computed(() => workerAgents.value.filter((agent) => agent.status === '异常').length);
const averageLoad = computed(() => Math.round(workerAgents.value.reduce((total, agent) => total + agent.cpu, 0) / workerAgents.value.length));
const runningTasks = computed(() => workerAgents.value.reduce((total, agent) => total + agent.currentTasks, 0));
const queueTasks = computed(() => workerAgents.value.reduce((total, agent) => total + agent.queue, 0));

function changeTheme(label: '浅色模式' | '深色模式') {
  setThemeMode?.(label === '深色模式' ? 'dark' : 'light');
}

function agentTone(status: AgentStatus) {
  if (status === '在线') return 'success';
  if (status === '压力高') return 'warning';
  return 'danger';
}

function usageTone(value: number) {
  if (value >= 80) return 'danger';
  if (value >= 65) return 'warning';
  return 'success';
}

function timelineLabel(state: AgentTimelineState) {
  if (state === 'normal') return '正常';
  if (state === 'warning') return '负载高';
  if (state === 'danger') return '异常';
  return '无数据';
}

onMounted(async () => {
  workerAgents.value = await api.workers();
});
</script>

<template>
  <section class="settings-page">
    <div class="tab-strip compact">
      <button
        v-for="item in sections"
        :key="item.key"
        :class="{ active: activeTab === item.key }"
        type="button"
        @click="activeTab = item.key"
      >
        {{ item.key }}
      </button>
    </div>

    <article class="settings-card settings-detail-card">
      <header class="settings-panel-head">
        <component :is="activeSection.icon" :size="22" />
        <div>
          <h3>{{ activeSection.key }}</h3>
          <p>{{ activeSection.desc }}</p>
        </div>
        <div v-if="activeTab === 'Agent 状态'" class="agent-toolbar">
          <div class="segmented agent-filter">
            <button :class="{ active: agentFilter === '全部节点' }" type="button" @click="agentFilter = '全部节点'">全部节点</button>
            <button :class="{ active: agentFilter === '仅异常' }" type="button" @click="agentFilter = '仅异常'">仅异常</button>
          </div>
          <button class="secondary-button agent-range-button" type="button">
            {{ agentTimeRange }}
            <ChevronDown :size="15" />
          </button>
          <button class="icon-button" type="button" aria-label="刷新 Agent 状态">
            <RefreshCw :size="17" />
          </button>
        </div>
      </header>

      <div v-if="activeTab === '基础设置'" class="settings-form">
        <label>系统名称<input value="OpsRadar" /></label>
        <label>时区<select><option>(UTC+08:00) 北京，上海，香港，重庆</option></select></label>
        <label>日期格式<select><option>YYYY-MM-DD</option><option>YYYY/MM/DD</option></select></label>
        <label>时间格式<select><option>24小时制</option><option>12小时制</option></select></label>
        <label>每页显示条数<select><option>20</option><option>50</option><option>100</option></select></label>
        <label>语言<select><option>中文（简体）</option><option>English</option></select></label>
        <div class="segmented">
          <button :class="{ active: selectedTheme === '浅色模式' }" type="button" @click="changeTheme('浅色模式')">浅色模式</button>
          <button :class="{ active: selectedTheme === '深色模式' }" type="button" @click="changeTheme('深色模式')">深色模式</button>
        </div>
      </div>

      <div v-else-if="activeTab === '通知设置'" class="settings-form">
        <div class="switch-row"><div><strong>邮件通知</strong><span>通过邮件接收系统通知</span></div><input type="checkbox" checked /></div>
        <div class="switch-row"><div><strong>企业微信通知</strong><span>通过企业微信接收巡检和问题通知</span></div><input type="checkbox" checked /></div>
        <div class="switch-row"><div><strong>钉钉通知</strong><span>通过钉钉机器人接收任务通知</span></div><input type="checkbox" checked /></div>
        <div class="switch-row"><div><strong>飞书通知</strong><span>通过飞书机器人接收系统事件</span></div><input type="checkbox" /></div>
        <label>通知频率限制<select><option>5 分钟内合并通知</option><option>实时通知</option><option>15 分钟摘要通知</option></select></label>
        <label>默认通知级别<select><option>高及以上</option><option>中及以上</option><option>全部问题</option></select></label>
      </div>

      <div v-else-if="activeTab === '用户与权限'" class="settings-form">
        <label>默认角色<select><option>运维操作员</option><option>只读用户</option><option>系统管理员</option></select></label>
        <label>会话超时时间<select><option>30 分钟</option><option>2 小时</option><option>8 小时</option></select></label>
        <label>密码复杂度<select><option>中等</option><option>高</option></select></label>
        <div class="switch-row"><div><strong>启用 RBAC</strong><span>基于角色控制模块权限</span></div><input type="checkbox" checked /></div>
        <div class="switch-row"><div><strong>登录审计</strong><span>记录所有登录成功与失败事件</span></div><input type="checkbox" checked /></div>
        <div class="switch-row"><div><strong>双因素认证</strong><span>开启后登录需二次验证</span></div><input type="checkbox" checked /></div>
      </div>

      <div v-else-if="activeTab === '系统集成'" class="settings-form">
        <label>AI Provider<select><option>OpenAI Compatible</option><option>DeepSeek</option><option>Qwen</option><option>Ollama</option></select></label>
        <label>模型名称<input value="opsradar-agent" /></label>
        <label>JumpServer 同步周期<select><option>每天 02:00</option><option>每 6 小时</option><option>手动同步</option></select></label>
        <label>监控数据源<select><option>Prometheus</option><option>VictoriaMetrics</option></select></label>
        <div class="switch-row"><div><strong>资源自动发现</strong><span>定时扫描新增资源并同步入库</span></div><input type="checkbox" checked /></div>
      </div>

      <div v-else-if="activeTab === '数据保留'" class="settings-form">
        <label>巡检记录保留<select><option>180 天</option><option>365 天</option></select></label>
        <label>任务执行记录保留<select><option>180 天</option><option>365 天</option></select></label>
        <label>操作日志保留<select><option>365 天</option><option>730 天</option></select></label>
        <label>审计日志保留<select><option>730 天</option><option>永久保留</option></select></label>
        <div class="switch-row"><div><strong>自动清理</strong><span>按策略清理过期数据</span></div><input type="checkbox" checked /></div>
      </div>

      <div v-else-if="activeTab === 'Agent 状态'" class="agent-status-view">
        <div class="agent-summary-grid">
          <article class="agent-summary-card success">
            <div class="agent-summary-icon"><Activity :size="28" /></div>
            <div><span>在线 Agent</span><strong>{{ onlineAgents }} / {{ workerAgents.length }}</strong><p>在线率 83.3%</p></div>
          </article>
          <article class="agent-summary-card danger">
            <div class="agent-summary-icon"><AlertCircle :size="28" /></div>
            <div><span>异常 Agent</span><strong>{{ abnormalAgents }}</strong><p>占比 16.7%</p></div>
          </article>
          <article class="agent-summary-card primary">
            <div class="agent-summary-icon"><Gauge :size="28" /></div>
            <div><span>平均负载</span><strong>{{ averageLoad }}%</strong><p>较昨日 <b>+8%</b></p></div>
          </article>
          <article class="agent-summary-card purple">
            <div class="agent-summary-icon"><ListChecks :size="28" /></div>
            <div><span>运行任务</span><strong>{{ runningTasks }}</strong><p>排队中 {{ queueTasks }}</p></div>
          </article>
        </div>

        <div class="agent-table-card">
          <table class="agent-table">
            <thead>
              <tr>
                <th>Agent 节点</th>
                <th>IP 地址</th>
                <th>状态</th>
                <th>CPU 使用率</th>
                <th>内存使用率</th>
                <th>当前任务</th>
                <th>任务队列</th>
                <th>运行状态（最近 24h）</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="agent in visibleAgents" :key="agent.id">
                <td><strong>{{ agent.name }}</strong></td>
                <td>{{ agent.ip }}</td>
                <td>
                  <span class="agent-status-pill" :class="agentTone(agent.status)">
                    <span></span>{{ agent.status }}
                  </span>
                </td>
                <td>
                  <div class="agent-usage" :class="usageTone(agent.cpu)">
                    <span>{{ agent.cpu }}%</span>
                    <i><b :style="{ width: `${agent.cpu}%` }"></b></i>
                  </div>
                </td>
                <td>
                  <div class="agent-usage" :class="usageTone(agent.memory)">
                    <span>{{ agent.memory }}%</span>
                    <i><b :style="{ width: `${agent.memory}%` }"></b></i>
                  </div>
                </td>
                <td>{{ agent.currentTasks }}</td>
                <td>{{ agent.queue }}</td>
                <td>
                  <div class="agent-timeline" :aria-label="`${agent.name} ${agentTimeRange} 运行状态`">
                    <span
                      v-for="(state, index) in agent.timeline"
                      :key="`${agent.id}-${index}`"
                      :class="state"
                      :title="timelineLabel(state)"
                    ></span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <footer class="agent-legend">
            <span><i class="normal"></i>正常</span>
            <span><i class="warning"></i>负载高</span>
            <span><i class="danger"></i>异常</span>
            <span><i class="empty"></i>无数据</span>
            <p>每个方块代表 30 分钟的状态，最近 24 小时从左到右。</p>
          </footer>
        </div>
      </div>

      <dl v-else class="info-list settings-info-list">
        <div><dt>版本</dt><dd>OpsRadar v1.0.0</dd></div>
        <div><dt>构建日期</dt><dd>2026-06-05</dd></div>
        <div><dt>API 状态</dt><dd>待接入</dd></div>
        <div><dt>Worker Agent</dt><dd>{{ onlineAgents }} 个在线节点</dd></div>
        <div><dt>当前工作区</dt><dd>ITDevOps / 生产环境</dd></div>
      </dl>

      <footer v-if="!['系统信息', 'Agent 状态'].includes(activeTab)" class="settings-actions">
        <button class="primary-button" type="button"><Save :size="18" />保存设置</button>
      </footer>
    </article>
  </section>
</template>
