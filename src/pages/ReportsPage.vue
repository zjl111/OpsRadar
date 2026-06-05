<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Merge, Trash2 } from '@lucide/vue';
import { reports as seedReports, statusTone, type ReportRecord } from '../data';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge.vue';
import RowActions from '../components/RowActions.vue';
import SearchFilter from '../components/SearchFilter.vue';

const keyword = ref('');
const format = ref('HTML');
const reports = ref<ReportRecord[]>(seedReports);
const filteredReports = computed(() => reports.value.filter((item) => [item.name, item.environment].join(' ').toLowerCase().includes(keyword.value.trim().toLowerCase())));

onMounted(async () => {
  reports.value = await api.reports();
});
</script>

<template>
  <section class="list-page">
    <div class="page-toolbar">
      <SearchFilter v-model="keyword" placeholder="搜索当前列表">
        <label class="select-field compact-select">导出格式
          <select v-model="format"><option>HTML</option><option>DOCX</option><option>PDF</option></select>
        </label>
      </SearchFilter>
      <div class="toolbar-actions">
        <button class="secondary-button" type="button"><Merge :size="18" />合并导出</button>
        <button class="danger-button" type="button"><Trash2 :size="18" />删除所选</button>
      </div>
    </div>

    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th>报告</th>
            <th>状态</th>
            <th>汇总</th>
            <th>完成时间</th>
            <th>下载</th>
            <th class="actions-column" aria-label="行操作"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredReports" :key="item.id">
            <td><input type="checkbox" /></td>
            <td><div class="two-line"><strong>{{ item.name }}</strong><span>环境：{{ item.environment }}</span></div></td>
            <td><StatusBadge :label="item.status" :tone="statusTone(item.status)" /></td>
            <td>
              <div class="summary-line">
                成功 {{ item.summary.success }} / 失败 {{ item.summary.failed }} / 异常 {{ item.summary.abnormal }} / 跳过 {{ item.summary.skipped }} / 总计 {{ item.summary.total }}
              </div>
            </td>
            <td>{{ item.completedAt }}</td>
            <td><div class="download-links"><button>HTML</button><button>DOCX</button><button>PDF</button></div></td>
            <td class="actions-cell"><RowActions :actions="['预览', '删除']" danger-action="删除" /></td>
          </tr>
        </tbody>
      </table>
      <div class="table-footer">
        <span>共 {{ reports.length }} 条</span>
        <div class="pager"><button>‹</button><button class="active">1</button><button>›</button></div>
      </div>
    </div>
  </section>
</template>
