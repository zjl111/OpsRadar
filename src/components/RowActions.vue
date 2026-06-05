<script setup lang="ts">
import { ChevronRight } from '@lucide/vue';

defineProps<{
  primary?: string;
  secondary?: string;
  actions: string[];
  dangerAction?: string;
}>();
</script>

<template>
  <div class="row-actions">
    <details class="row-action-menu">
      <summary aria-label="更多操作">
        <span>操作</span>
        <ChevronRight :size="15" />
      </summary>
      <div class="row-action-popover">
        <button
          v-for="action in actions"
          :key="action"
          type="button"
          :class="{ danger: action === dangerAction }"
        >
          {{ action }}
        </button>
      </div>
    </details>
  </div>
</template>
