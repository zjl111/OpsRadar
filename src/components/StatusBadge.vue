<script setup lang="ts">
defineProps<{
  label: string;
  tone?: 'success' | 'processing' | 'warning' | 'danger' | 'neutral';
}>();
</script>

<template>
  <span class="status-badge" :class="`tone-${tone || 'neutral'}`">
    <span class="status-dot" />
    {{ label }}
  </span>
</template>
