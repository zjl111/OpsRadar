<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { CalendarDays, Download, Trash2 } from '@lucide/vue';
import { audits as seedAudits, statusTone, type AuditRecord } from '../data';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge.vue';
import RowActions from '../components/RowActions.vue';
import SearchFilter from '../components/SearchFilter.vue';

const tabs = ['登录日志', '操作日志', '任务执行日志'];
const activeTab = ref('登录日志');
const keyword = ref('');
const status = ref('全部');
const type = ref('全部');
const audits = ref<AuditRecord[]>(seedAudits);

const filteredAudits = computed(() => audits.value.filter((item) => {
  const text = [item.user, item.content, item.ip].join(' ').toLowerCase();
  return item.type === activeTab.value
    && text.includes(keyword.value.trim().toLowerCase())
    && (status.value === '全部' || item.status === status.value)
    && (type.value === '全部' || item.type === type.value);
}));

onMounted(async () => {
  audits.value = await api.audits();
});
</script>

<template>
  <section class="list-page">
    <div class="tab-strip compact">
      <button v-for="tab in tabs" :key="tab" :class="{ active: activeTab === tab }" type="button" @click="activeTab = tab">{{ tab }}</button>
    </div>

    <div class="page-toolbar">
      <SearchFilter v-model="keyword" placeholder="搜索用户名、IP、操作内容...">
        <label class="select-field">状态
          <select v-model="status">
            <option>全部</option><option>成功</option><option>失败</option><option>执行中</option><option>已完成</option>
          </select>
        </label>
        <label class="select-field">操作类型
          <select v-model="type">
            <option>全部</option><option>登录日志</option><option>操作日志</option><option>任务执行日志</option>
          </select>
        </label>
        <button class="secondary-button" type="button"><CalendarDays :size="18" />时间范围</button>
      </SearchFilter>
      <div class="toolbar-actions">
        <button class="secondary-button" type="button"><Download :size="18" />导出日志</button>
        <button class="danger-button" type="button"><Trash2 :size="18" />删除所选</button>
      </div>
    </div>

    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th>用户/操作者</th>
            <th>日志类型</th>
            <th>操作内容</th>
            <th>来源 IP</th>
            <th>状态</th>
            <th>时间</th>
            <th class="actions-column" aria-label="行操作"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredAudits" :key="item.id">
            <td><input type="checkbox" /></td>
            <td>{{ item.user }}</td>
            <td>{{ item.type }}</td>
            <td>{{ item.content }}</td>
            <td>{{ item.ip }}</td>
            <td><StatusBadge :label="item.status" :tone="statusTone(item.status)" /></td>
            <td>{{ item.time }}</td>
            <td class="actions-cell"><RowActions :actions="['查看', '详情', '复制 IP']" /></td>
          </tr>
        </tbody>
      </table>
      <div class="table-footer">
        <span>共 {{ filteredAudits.length }} 条</span>
        <span>10 条/页</span>
        <div class="pager"><button disabled>‹</button><button class="active">1</button><button disabled>›</button></div>
      </div>
    </div>
  </section>
</template>
