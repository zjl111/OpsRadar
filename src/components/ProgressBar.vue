<script setup lang="ts">
defineProps<{
  value: number;
  status?: string;
}>();
</script>

<template>
  <div class="progress-wrap">
    <span>{{ value }}%</span>
    <div class="progress-track">
      <div class="progress-fill" :class="{ failed: status === '失败' }" :style="{ width: `${value}%` }" />
    </div>
  </div>
</template>
