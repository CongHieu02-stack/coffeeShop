<template>
  <div class="flex items-center justify-center p-2">
    <div class="animate-spin rounded-full h-2 w-2 border-b-1 border-coffee-600"></div>
    <span v-if="text" class="ml-3 text-gray-600">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text?: string
}>()
</script>
