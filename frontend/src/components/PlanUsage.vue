<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  totalMessages: number
  planLimit: number
}>()

const percentage = computed(() =>
  props.planLimit > 0
    ? Math.min(Math.round((props.totalMessages / props.planLimit) * 100), 100)
    : 0
)

const barColor = computed(() => {
  if (percentage.value >= 90) return 'bg-red-500'
  if (percentage.value >= 70) return 'bg-yellow-500'
  return 'bg-blue-500'
})
</script>

<template>
  <div class="card">
    <h2 class="card-title">Plan Usage</h2>
    <template v-if="planLimit > 0">
      <div class="flex justify-between text-sm text-gray-400 mb-2">
        <span>{{ totalMessages.toLocaleString() }} messages</span>
        <span>{{ percentage }}%</span>
      </div>
      <div class="progress-track">
        <div
          class="progress-bar transition-all duration-500"
          :class="barColor"
          :style="{ width: `${percentage}%` }"
        />
      </div>
      <p class="text-xs text-gray-500 mt-2">Limit: {{ planLimit.toLocaleString() }} messages</p>
    </template>
    <template v-else>
      <p class="text-sm text-gray-500">未設定上限（請編輯 config.json）</p>
      <p class="text-2xl font-bold mt-1">{{ totalMessages.toLocaleString() }}</p>
      <p class="text-xs text-gray-500">total messages</p>
    </template>
  </div>
</template>
