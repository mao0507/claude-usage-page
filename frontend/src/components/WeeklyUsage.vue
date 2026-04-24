<script setup lang="ts">
import { computed } from 'vue'
import type { DailyActivity } from '../types/stats'

const props = defineProps<{
  dailyActivity: DailyActivity[]
  weeklyLimit: number
}>()

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

const weeklyMessages = computed(() => {
  const monday = getMonday(new Date())
  const mondayStr = monday.toISOString().slice(0, 10)
  return props.dailyActivity
    .filter((d) => d.date >= mondayStr)
    .reduce((sum, d) => sum + d.messageCount, 0)
})

const nextMonday = computed(() => {
  const d = getMonday(new Date())
  d.setDate(d.getDate() + 7)
  return d.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })
})

const percentage = computed(() =>
  props.weeklyLimit > 0
    ? Math.min(Math.round((weeklyMessages.value / props.weeklyLimit) * 100), 100)
    : 0
)

const barColor = computed(() => {
  if (percentage.value >= 90) return 'bg-red-500'
  if (percentage.value >= 70) return 'bg-yellow-500'
  return 'bg-emerald-500'
})
</script>

<template>
  <div class="card">
    <h2 class="card-title">Weekly Usage</h2>
    <template v-if="weeklyLimit > 0">
      <div class="flex justify-between text-sm text-gray-400 mb-2">
        <span>{{ weeklyMessages.toLocaleString() }} messages</span>
        <span>{{ percentage }}%</span>
      </div>
      <div class="progress-track">
        <div
          class="progress-bar transition-all duration-500"
          :class="barColor"
          :style="{ width: `${percentage}%` }"
        />
      </div>
      <p class="text-xs text-gray-500 mt-2">
        Limit: {{ weeklyLimit.toLocaleString() }} · 下週重置: {{ nextMonday }}
      </p>
    </template>
    <template v-else>
      <p class="text-sm text-gray-500">未設定週上限（請編輯 config.json）</p>
      <p class="text-2xl font-bold mt-1">{{ weeklyMessages.toLocaleString() }}</p>
      <p class="text-xs text-gray-500">messages this week</p>
    </template>
  </div>
</template>
