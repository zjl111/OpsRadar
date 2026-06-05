<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { BarChart3, Clock3, Database, FileText, RefreshCw, Send, Server, Sparkles, TrendingUp, TriangleAlert, Zap } from '@lucide/vue';
import { api, type AIDashboard } from '../api';

const insightMetrics = [
  { label: '风险识别', value: '3', icon: TriangleAlert, tone: 'danger' },
  { label: '潜在任务', value: '2', icon: Clock3, tone: 'primary' },
  { label: '趋势变化', value: '↑12%', icon: TrendingUp, tone: 'success' }
];

const aiRisks = [
  ['数据库连接数过高', 'db-mysql-01 / 10.0.1.20', '严重'],
  ['磁盘使用率超过 90%', 'web-server-01 / 10.0.1.12', '高'],
  ['网络延迟抖动偏高', 'core-switch-01 / 10.0.0.1', '中']
];

const nextActions = ref([
  {
    title: '优先排查数据库连接数异常',
    desc: '建议执行数据库专项巡检，检查连接池、慢查询和锁等待。',
    action: '开始巡检',
    icon: Database
  },
  {
    title: '分析 web-server-01 磁盘空间',
    desc: '磁盘使用率已超过 90%，建议识别大文件和日志增长。',
    action: '立即分析',
    icon: Server
  },
  {
    title: '生成今日巡检摘要',
    desc: '汇总今日任务、异常风险和资源状态，生成今日报告。',
    action: '生成摘要',
    icon: FileText
  }
]);

const dashboard = ref<AIDashboard | null>(null);
const prompt = ref('');
const chatMessages = ref([
  { role: 'user', sender: '你', text: '帮我创建一个数据库巡检任务，包含性能、连接数和慢查询检查。', time: '10:30' },
  { role: 'ai', sender: 'AI 助手', text: '好的，已为你创建数据库巡检任务，预计执行时间：今天 14:00。', time: '10:31' },
  { role: 'user', sender: '你', text: '查询一下核心业务系统的资源健康状况', time: '10:32' },
  { role: 'ai', sender: 'AI 助手', text: '核心业务系统整体运行正常，CPU 平均使用率 28%，内存使用率 62%，关键服务暂无异常。', time: '10:33' }
]);

const assistantModes = [
  { label: '智能分析', icon: Sparkles },
  { label: '风险预测', icon: BarChart3 },
  { label: '自动化建议', icon: Zap }
];

async function sendMessage() {
  const message = prompt.value.trim();
  if (!message) return;
  chatMessages.value.push({ role: 'user', sender: '你', text: message, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) });
  prompt.value = '';
  const reply = await api.aiChat(message);
  chatMessages.value.push({ role: 'ai', sender: 'AI 助手', text: reply.message, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) });
}

onMounted(async () => {
  dashboard.value = await api.aiDashboard();
  nextActions.value = dashboard.value.nextActions.map((item, index) => ({
    title: item.title,
    desc: item.desc,
    action: item.action,
    icon: index === 0 ? Database : index === 1 ? Server : FileText
  }));
});
</script>

<template>
  <section class="workbench-grid">
    <div class="workbench-main">
      <div class="assistant-panel">
        <div class="assistant-hero">
          <div class="bot-face">
            <img src="/opsradar-ai-bot-logo.png" alt="AI 助手" />
          </div>
          <div>
            <h2>AI 智能巡检助手 <span>Beta</span></h2>
            <p>我可以帮你执行巡检任务、分析异常、评估风险并提供优化建议。</p>
            <div class="assistant-modes">
              <button v-for="item in assistantModes" :key="item.label" type="button">
                <component :is="item.icon" :size="15" />
                {{ item.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="chat-list">
          <div v-for="message in chatMessages" :key="`${message.time}-${message.text}`" class="chat-message" :class="message.role">
            <span>{{ message.sender }}</span>
            {{ message.text }}
            <small>{{ message.time }}</small>
          </div>
        </div>

        <div class="assistant-composer">
          <textarea v-model="prompt" placeholder="请输入任务、问题或巡检需求..." @keydown.meta.enter.prevent="sendMessage" @keydown.ctrl.enter.prevent="sendMessage" />
          <div class="composer-toolbar">
            <div class="composer-actions">
              <button class="send-button" type="button" aria-label="发送" @click="sendMessage"><Send :size="20" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <aside class="workbench-side">
      <div class="side-card ai-insight-card">
        <div class="section-title">
          <h3><Sparkles :size="17" />AI 洞察</h3>
          <span class="section-meta">{{ dashboard?.insight.updatedAt || '今日 18:12 更新' }} <RefreshCw :size="14" /></span>
        </div>
        <p class="insight-summary">{{ dashboard?.insight.summary || '今日识别 3 个风险，2 个任务建议优先处理' }}</p>
        <p class="insight-desc">{{ dashboard?.insight.desc || '基于实时数据分析，为您提供智能洞察与建议。' }}</p>
        <div class="insight-metrics">
          <div v-for="item in insightMetrics" :key="item.label" class="insight-metric" :class="item.tone">
            <component :is="item.icon" :size="18" />
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </div>

      <div class="side-card">
        <div class="section-title">
          <h3><Sparkles :size="17" />AI 风险识别</h3>
          <button class="link-button" type="button">查看全部</button>
        </div>
        <div class="mini-list">
          <div v-for="item in (dashboard?.risks || aiRisks.map((risk) => ({ title: risk[0], resource: risk[1], level: risk[2], evidence: '' })))" :key="item.title" class="ai-risk-row">
            <TriangleAlert :size="18" />
            <div>
              <strong>{{ item.title }}</strong>
              <span>{{ item.resource }}</span>
            </div>
            <span class="mini-status" :class="item.level === '严重' || item.level === '高' ? 'danger' : 'warning'">等级：{{ item.level }}</span>
          </div>
        </div>
      </div>

      <div class="side-card">
        <div class="section-title">
          <h3><Sparkles :size="17" />AI 下一步</h3>
          <button class="link-button" type="button">查看全部</button>
        </div>
        <div class="ai-action-list">
          <div v-for="item in nextActions.slice(0, 2)" :key="item.title" class="ai-action-row">
            <component :is="item.icon" :size="18" />
            <div>
              <strong>{{ item.title }}</strong>
              <span>{{ item.desc }}</span>
            </div>
            <button class="secondary-button" type="button">{{ item.action }}</button>
          </div>
        </div>
      </div>
    </aside>
  </section>
</template>
