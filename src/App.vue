<script setup lang="ts">
import { computed, onMounted, onUnmounted, provide, ref, watchEffect } from 'vue';
import AppShell from './components/AppShell.vue';
import WorkbenchPage from './pages/WorkbenchPage.vue';
import ResourcesPage from './pages/ResourcesPage.vue';
import TasksPage from './pages/TasksPage.vue';
import IssuesPage from './pages/IssuesPage.vue';
import ReportsPage from './pages/ReportsPage.vue';
import AuditPage from './pages/AuditPage.vue';
import SettingsPage from './pages/SettingsPage.vue';

type PageKey = 'workbench' | 'resources' | 'tasks' | 'issues' | 'reports' | 'audit' | 'settings';
type ThemeMode = 'light' | 'dark';

const pageKeys: PageKey[] = ['workbench', 'resources', 'tasks', 'issues', 'reports', 'audit', 'settings'];
const initialHash = window.location.hash.replace('#', '') as PageKey;
const activePage = ref<PageKey>(pageKeys.includes(initialHash) ? initialHash : 'workbench');
const savedTheme = localStorage.getItem('opsradar-theme') as ThemeMode | null;
const theme = ref<ThemeMode>(savedTheme || 'light');

const pageComponent = computed(() => {
  const pages = {
    workbench: WorkbenchPage,
    resources: ResourcesPage,
    tasks: TasksPage,
    issues: IssuesPage,
    reports: ReportsPage,
    audit: AuditPage,
    settings: SettingsPage
  };
  return pages[activePage.value];
});

function changePage(key: string) {
  activePage.value = key as PageKey;
  window.location.hash = key;
}

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
}

function setTheme(nextTheme: ThemeMode) {
  theme.value = nextTheme;
}

provide('opsradar-theme', theme);
provide('opsradar-set-theme', setTheme);

watchEffect(() => {
  document.documentElement.dataset.theme = theme.value;
  localStorage.setItem('opsradar-theme', theme.value);
});

function syncPageFromHash() {
  const hash = window.location.hash.replace('#', '') as PageKey;
  if (pageKeys.includes(hash)) {
    activePage.value = hash;
  }
}

onMounted(() => window.addEventListener('hashchange', syncPageFromHash));
onUnmounted(() => window.removeEventListener('hashchange', syncPageFromHash));
</script>

<template>
  <AppShell :active-page="activePage" :theme="theme" @change-page="changePage" @toggle-theme="toggleTheme">
    <component :is="pageComponent" />
  </AppShell>
</template>
