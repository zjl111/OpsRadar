<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { CalendarDays, Plus, RotateCcw, SlidersHorizontal } from '@lucide/vue';
import { environments, statusTone, tasks as seedTasks, type TaskRecord } from '../data';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge.vue';
import ProgressBar from '../components/ProgressBar.vue';
import RowActions from '../components/RowActions.vue';
import SearchFilter from '../components/SearchFilter.vue';

const activeTab = ref<'巡检任务' | '修复任务'>('巡检任务');
const keyword = ref('');
const status = ref('全部');
const env = ref('全部');
const taskType = ref('全部');
const tasks = ref<TaskRecord[]>(seedTasks);

const filteredTasks = computed(() => tasks.value.filter((item) => {
  const text = [item.name, item.desc, item.owner, item.environment].join(' ').toLowerCase();
  return item.type === activeTab.value
    && text.includes(keyword.value.trim().toLowerCase())
    && (status.value === '全部' || item.status === status.value)
    && (env.value === '全部' || item.environment === env.value)
    && (taskType.value === '全部' || item.type === taskType.value);
}));

function reset() {
  keyword.value = '';
  status.value = '全部';
  env.value = '全部';
  taskType.value = '全部';
}

async function refreshTasks() {
  tasks.value = await api.tasks();
}

onMounted(refreshTasks);
</script>

<template>
  <section class="list-page">
    <div class="tab-strip compact">
      <button :class="{ active: activeTab === '巡检任务' }" type="button" @click="activeTab = '巡检任务'">巡检任务</button>
      <button :class="{ active: activeTab === '修复任务' }" type="button" @click="activeTab = '修复任务'">修复任务</button>
    </div>

    <div class="page-toolbar">
      <SearchFilter v-model="keyword" placeholder="搜索任务名称、负责人、应用环境...">
        <label class="select-field">状态
          <select v-model="status">
            <option>全部</option><option>运行中</option><option>已完成</option><option>待执行</option><option>失败</option><option>待审批</option>
          </select>
        </label>
        <label class="select-field">所属应用环境
          <select v-model="env">
            <option>全部</option>
            <option v-for="item in environments" :key="item">{{ item }}</option>
          </select>
        </label>
        <label class="select-field">任务类型
          <select v-model="taskType">
            <option>全部</option><option>巡检任务</option><option>修复任务</option>
          </select>
        </label>
        <button class="secondary-button" type="button"><CalendarDays :size="18" />执行时间</button>
        <button class="secondary-button icon-text" type="button"><SlidersHorizontal :size="18" />筛选</button>
      </SearchFilter>
      <div class="toolbar-actions">
        <button class="secondary-button" type="button">批量操作</button>
        <button class="secondary-button" type="button" @click="reset"><RotateCcw :size="18" />重置</button>
        <button class="primary-button" type="button"><Plus :size="18" />创建任务</button>
      </div>
    </div>

    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th>任务名称</th>
            <th>任务类型</th>
            <th>所属应用环境</th>
            <th>负责人</th>
            <th>执行时间 / 计划时间</th>
            <th>状态</th>
            <th>进度</th>
            <th class="actions-column" aria-label="行操作"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredTasks" :key="item.id">
            <td><input type="checkbox" /></td>
            <td><div class="two-line"><strong>{{ item.name }}</strong><span>{{ item.desc }}</span></div></td>
            <td><span class="soft-pill">{{ item.type }}</span></td>
            <td><span class="env-pill">{{ item.environment }}</span></td>
            <td>{{ item.owner }}</td>
            <td><div class="two-line"><strong>{{ item.time }}</strong><span>{{ item.plan }}</span></div></td>
            <td><StatusBadge :label="item.status" :tone="statusTone(item.status)" /></td>
            <td><ProgressBar :value="item.progress" :status="item.status" /></td>
            <td class="actions-cell"><RowActions :actions="['详情', '执行', '编辑', '报告']" /></td>
          </tr>
        </tbody>
      </table>
      <div class="table-footer">
        <span>共 {{ activeTab === '巡检任务' ? 58 : 12 }} 条</span>
        <span>20 条/页</span>
        <div class="pager"><button>‹</button><button class="active">1</button><button>2</button><button>3</button><button>›</button></div>
      </div>
    </div>
  </section>
</template>
