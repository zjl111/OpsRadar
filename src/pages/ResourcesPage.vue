<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { AlertTriangle, CalendarDays, Database, Download, Grid2X2, HardDrive, Monitor, Network, Plus, Server, Boxes, SlidersHorizontal } from '@lucide/vue';
import { environmentRecords as seedEnvironments, resources as seedResources, statusTone, type EnvironmentRecord, type ResourceRecord, type ResourceType } from '../data';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge.vue';
import RowActions from '../components/RowActions.vue';
import SearchFilter from '../components/SearchFilter.vue';

const search = ref('');
const typeFilter = ref('全部');
const statusFilter = ref('全部');
const envFilter = ref('全部');
const activeTab = ref('全部');
const resources = ref<ResourceRecord[]>(seedResources);
const environmentRecords = ref<EnvironmentRecord[]>(seedEnvironments);

const resourceTypes: Array<'全部' | '应用环境列表' | ResourceType> = ['全部', '应用环境列表', '主机', '数据库', '中间件', '网络设备', 'Kubernetes'];
const typeIcons = { 主机: Monitor, 数据库: Database, 中间件: Network, 网络设备: Server, Kubernetes: Boxes };
const environments = computed(() => Array.from(new Set([...environmentRecords.value.map((item) => item.name), ...resources.value.map((item) => item.environment)])));

const filteredResources = computed(() => {
  return resources.value.filter((item) => {
    const keyword = search.value.trim().toLowerCase();
    const matchText = [item.name, item.ip, item.environment, ...item.tags].join(' ').toLowerCase().includes(keyword);
    const matchType = typeFilter.value === '全部' || item.type === typeFilter.value;
    const matchStatus = statusFilter.value === '全部' || item.status === statusFilter.value;
    const matchEnv = envFilter.value === '全部' || item.environment === envFilter.value;
    const matchTab = activeTab.value === '全部' || activeTab.value === '应用环境列表' || item.type === activeTab.value;
    return matchText && matchType && matchStatus && matchEnv && matchTab;
  });
});

function resetFilters() {
  search.value = '';
  typeFilter.value = '全部';
  statusFilter.value = '全部';
  envFilter.value = '全部';
}

onMounted(async () => {
  const [resourceData, environmentData] = await Promise.all([api.resources(), api.environments()]);
  resources.value = resourceData;
  environmentRecords.value = environmentData;
});
</script>

<template>
  <section class="list-page">
    <div class="tab-strip">
      <button v-for="tab in resourceTypes" :key="tab" type="button" :class="{ active: activeTab === tab }" @click="activeTab = tab">
        {{ tab }}
        <span>{{ tab === '全部' ? resources.length : tab === '应用环境列表' ? environmentRecords.length : resources.filter((item) => item.type === tab).length }}</span>
      </button>
    </div>

    <div class="page-toolbar">
      <SearchFilter v-model="search" placeholder="搜索资源名称、IP、标签或组...">
        <label class="select-field">资源类型
          <select v-model="typeFilter">
            <option>全部</option>
            <option>主机</option>
            <option>数据库</option>
            <option>中间件</option>
            <option>网络设备</option>
            <option>Kubernetes</option>
          </select>
        </label>
        <label class="select-field">状态
          <select v-model="statusFilter">
            <option>全部</option>
            <option>在线</option>
            <option>离线</option>
            <option>维护中</option>
            <option>异常</option>
          </select>
        </label>
        <label class="select-field">所属环境
          <select v-model="envFilter">
            <option>全部</option>
            <option v-for="env in environments" :key="env">{{ env }}</option>
          </select>
        </label>
        <button class="secondary-button" type="button" @click="resetFilters">
          <SlidersHorizontal :size="18" />
          重置
        </button>
      </SearchFilter>
      <div class="toolbar-actions">
        <button class="secondary-button" type="button"><Plus :size="18" />添加应用环境</button>
        <button class="primary-button" type="button"><Plus :size="18" />添加资源</button>
        <button class="secondary-button" type="button"><Download :size="18" />导入资源</button>
      </div>
    </div>

    <div v-if="activeTab === '应用环境列表'" class="environment-grid">
      <article v-for="env in environmentRecords" :key="env.id" class="env-card">
        <header class="env-card-head">
          <div>
            <h3>{{ env.name }}</h3>
            <p>{{ env.stage }} · {{ env.owner }} · {{ env.note }}</p>
          </div>
          <span class="env-state">{{ env.status }}</span>
        </header>

        <div class="env-metrics">
          <div>
            <Grid2X2 :size="17" />
            <span>资源</span>
            <strong>{{ env.resourceCount }}</strong>
          </div>
          <div>
            <HardDrive :size="17" />
            <span>服务</span>
            <strong>{{ env.serviceCount }}</strong>
          </div>
          <div>
            <AlertTriangle :size="17" />
            <span>异常</span>
            <strong>{{ env.issueCount }}</strong>
          </div>
          <div>
            <CalendarDays :size="17" />
            <span>最近巡检</span>
            <strong>{{ env.lastInspection }}</strong>
          </div>
        </div>

        <div class="env-health">
          <span>健康度</span>
          <div class="env-health-track"><i :style="{ width: `${env.health}%` }" /></div>
          <strong>{{ env.health ? `${env.health}%` : '-' }}</strong>
        </div>

        <footer class="env-card-actions">
          <button class="secondary-button" type="button">查看资源</button>
          <button class="secondary-button" type="button">查看服务</button>
          <button class="secondary-button" type="button">规则策略</button>
          <button class="secondary-button" type="button">创建巡检</button>
          <span />
          <button class="secondary-button" type="button">编辑</button>
          <button class="danger-button" type="button">删除</button>
        </footer>
      </article>
    </div>

    <div v-else class="table-card">
      <table>
        <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th>资源名称</th>
            <th>资源类型</th>
            <th>IP 地址</th>
            <th>所属应用环境</th>
            <th>状态</th>
            <th>标签</th>
            <th class="actions-column" aria-label="行操作"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredResources" :key="item.id">
            <td><input type="checkbox" /></td>
            <td>
              <div class="name-cell">
                <component :is="typeIcons[item.type]" :size="19" />
                <div><strong>{{ item.name }}</strong><span>{{ item.type }}</span></div>
              </div>
            </td>
            <td>{{ item.type }}</td>
            <td>{{ item.ip }}</td>
            <td><span class="env-pill">{{ item.environment }}</span></td>
            <td><StatusBadge :label="item.status" :tone="statusTone(item.status)" /></td>
            <td>
              <div class="tag-list"><span v-for="tag in item.tags" :key="tag">{{ tag }}</span></div>
            </td>
            <td class="actions-cell"><RowActions :actions="['详情', '编辑', '复制资源', '删除']" danger-action="删除" /></td>
          </tr>
        </tbody>
      </table>
      <div class="table-footer">
        <span>共 {{ filteredResources.length }} 条</span>
        <span>20 条/页</span>
        <div class="pager"><button>‹</button><button class="active">1</button><button>2</button><button>3</button><button>›</button></div>
      </div>
    </div>
  </section>
</template>
