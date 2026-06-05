<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { Component } from 'vue';
import {
  Bell,
  Bot,
  CalendarClock,
  ChevronDown,
  ChevronsLeft,
  CircleHelp,
  FileText,
  Globe2,
  Home,
  Layers3,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  TriangleAlert,
  ClipboardCheck
} from '@lucide/vue';

export interface NavItem {
  key: string;
  label: string;
  icon: Component;
}

const props = defineProps<{
  activePage: string;
  theme: 'light' | 'dark';
}>();

defineEmits<{
  'change-page': [key: string];
  'toggle-theme': [];
}>();

const navItems: NavItem[] = [
  { key: 'workbench', label: 'AI 工作台', icon: Home },
  { key: 'resources', label: '资源', icon: Layers3 },
  { key: 'tasks', label: '任务', icon: ClipboardCheck },
  { key: 'issues', label: '问题', icon: TriangleAlert },
  { key: 'reports', label: '报告', icon: FileText },
  { key: 'audit', label: '审计', icon: ShieldCheck },
  { key: 'settings', label: '设置', icon: Settings }
];

const now = ref(new Date());
let timer: number | undefined;

const currentDate = computed(() => new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  weekday: 'short'
}).format(now.value));

const currentTime = computed(() => new Intl.DateTimeFormat('zh-CN', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
}).format(now.value));

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timer) {
    window.clearInterval(timer);
  }
});
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">
          <Bot :size="26" />
        </div>
        <div>
          <strong>OpsRadar</strong>
          <span>AI智能巡检平台</span>
        </div>
      </div>

      <nav class="nav-list" aria-label="主导航">
        <button
          v-for="(item, index) in navItems"
          :key="item.key"
          class="nav-item"
          :class="{ active: props.activePage === item.key, separated: index === 1 }"
          type="button"
          @click="$emit('change-page', item.key)"
        >
          <component :is="item.icon" :size="21" />
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <button class="collapse-btn" type="button">
        <ChevronsLeft :size="18" />
        收起
      </button>
    </aside>

    <div class="workspace">
      <header class="topbar">
        <div class="current-time" aria-label="当前时间">
          <CalendarClock :size="17" />
          <strong>{{ currentTime }}</strong>
          <i />
          <span>{{ currentDate }}</span>
        </div>

        <div class="top-actions">
          <button class="icon-button topbar-button" type="button" aria-label="语言切换" title="语言切换">
            <Globe2 :size="18" />
          </button>
          <button class="icon-button topbar-button" type="button" aria-label="切换主题" title="切换主题" @click="$emit('toggle-theme')">
            <component :is="props.theme === 'light' ? Moon : Sun" :size="18" />
          </button>
          <button class="icon-button with-badge" type="button" aria-label="通知">
            <Bell :size="21" />
            <em>6</em>
          </button>
          <button class="icon-button" type="button" aria-label="帮助">
            <CircleHelp :size="21" />
          </button>
          <div class="user-menu">
            <strong>张金力</strong>
            <span>运维工程师</span>
            <ChevronDown :size="17" />
          </div>
        </div>
      </header>

      <main class="main-content">
        <slot />
      </main>
    </div>
  </div>
</template>
