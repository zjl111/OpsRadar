<script setup lang="ts">
import { ref } from 'vue';
import { ChevronDown, Search } from '@lucide/vue';

defineProps<{
  modelValue: string;
  placeholder: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const open = ref(false);
</script>

<template>
  <div class="search-filter" :class="{ open }">
    <button class="search-filter-toggle" type="button" aria-label="展开筛选" @click="open = !open">
      <ChevronDown :size="16" />
    </button>
    <label class="search-filter-input">
      <Search :size="18" />
      <input :value="modelValue" :placeholder="placeholder" @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
    </label>
    <div v-if="open" class="search-filter-popover">
      <slot />
    </div>
  </div>
</template>
