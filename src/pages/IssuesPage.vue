<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { CalendarDays, SlidersHorizontal } from '@lucide/vue';
import { issues as seedIssues, severityTone, statusTone, type IssueRecord } from '../data';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge.vue';
import RowActions from '../components/RowActions.vue';
import SearchFilter from '../components/SearchFilter.vue';

const tabs = ['问题列表', '事件关联', '根因分析', '通知记录'];
const activeTab = ref('问题列表');
const keyword = ref('');
const status = ref('全部');
const severity = ref('全部');
const type = ref('全部');
const issues = ref<IssueRecord[]>(seedIssues);

const filteredIssues = computed(() => issues.value.filter((item) => {
  const text = [item.title, item.desc, item.resource].join(' ').toLowerCase();
  return text.includes(keyword.value.trim().toLowerCase())
    && (status.value === '全部' || item.status === status.value)
    && (severity.value === '全部' || item.severity === severity.value)
    && (type.value === '全部' || item.type === type.value);
}));

onMounted(async () => {
  issues.value = await api.issues();
});
</script>

<template>
  <section class="list-page">
    <div class="tab-strip compact">
      <button v-for="tab in tabs" :key="tab" :class="{ active: activeTab === tab }" type="button" @click="activeTab = tab">{{ tab }}</button>
    </div>

    <div class="page-toolbar">
      <SearchFilter v-model="keyword" placeholder="搜索问题标题、资源名称、IP 或描述...">
        <label class="select-field">状态
          <select v-model="status">
            <option>全部</option><option>未处理</option><option>处理中</option><option>待验证</option><option>已解决</option>
          </select>
        </label>
        <label class="select-field">严重级别
          <select v-model="severity">
            <option>全部</option><option>严重</option><option>高</option><option>中</option><option>低</option>
          </select>
        </label>
        <label class="select-field">问题类型
          <select v-model="type">
            <option>全部</option><option>性能问题</option><option>资源问题</option><option>可用性问题</option><option>网络问题</option><option>安全问题</option>
          </select>
        </label>
        <button class="secondary-button" type="button"><CalendarDays :size="18" />时间范围</button>
        <button class="secondary-button" type="button"><SlidersHorizontal :size="18" />更多筛选</button>
      </SearchFilter>
      <div class="toolbar-actions">
        <button class="secondary-button" type="button">批量操作</button>
        <button class="secondary-button" type="button">导出报表</button>
      </div>
    </div>

    <div class="table-card">
      <table class="issue-table">
        <colgroup>
          <col class="select-column" />
          <col class="issue-title-column" />
          <col class="severity-column" />
          <col class="issue-type-column" />
          <col class="resource-column" />
          <col class="status-column" />
          <col class="time-column" />
          <col class="time-column" />
          <col class="actions-column" />
        </colgroup>
        <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th>问题标题</th>
            <th>严重级别</th>
            <th>问题类型</th>
            <th>资源名称 / IP</th>
            <th>状态</th>
            <th>首次发生时间</th>
            <th>更新时间</th>
            <th class="actions-column" aria-label="行操作"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredIssues" :key="item.id">
            <td><input type="checkbox" /></td>
            <td><div class="two-line"><strong>{{ item.title }}</strong><span>{{ item.desc }}</span></div></td>
            <td><StatusBadge :label="item.severity" :tone="severityTone(item.severity)" /></td>
            <td>{{ item.type }}</td>
            <td>{{ item.resource }}</td>
            <td><StatusBadge :label="item.status" :tone="statusTone(item.status)" /></td>
            <td>{{ item.firstSeen }}</td>
            <td>{{ item.updatedAt }}</td>
            <td class="actions-cell"><RowActions :actions="['查看', '处理', '指派']" /></td>
          </tr>
        </tbody>
      </table>
      <div class="table-footer">
        <span>共 {{ filteredIssues.length }} 条</span>
        <span>20 条/页</span>
        <div class="pager"><button>‹</button><button class="active">1</button><button>2</button><button>3</button><button>›</button></div>
      </div>
    </div>
  </section>
</template>
