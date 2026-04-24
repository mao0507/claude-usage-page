<script setup lang="ts">
import { computed } from 'vue'
import type { DailyActivity, DailyModelTokens } from '../types/stats'

const props = defineProps<{
  dailyActivity: DailyActivity[]
  dailyModelTokens: DailyModelTokens[]
  hourCounts: Record<string, number>
}>()

const today = new Date().toISOString().slice(0, 10)

const todayActivity = computed(() =>
  props.dailyActivity.find((d) => d.date === today)
)

const todayTokens = computed(() => {
  const entry = props.dailyModelTokens.find((d) => d.date === today)
  if (!entry) return 0
  return Object.values(entry.tokensByModel).reduce((s, v) => s + v, 0)
})

// hourCounts is total across all time; we use it for activity pattern display
const hours = computed(() => {
  const all: { hour: number; count: number }[] = []
  for (let h = 0; h < 24; h++) {
    all.push({ hour: h, count: parseInt(props.hourCounts[String(h)] ?? '0', 10) })
  }
  return all
})

const maxHourCount = computed(() =>
  Math.max(1, ...hours.value.map((h) => h.count))
)

function pad(n: number): string {
  return String(n).padStart(2, '0')
}
</script>

<template>
  <div class="card">
    <h2 class="card-title">今日詳情 <span class="text-xs text-gray-500 font-normal">{{ today }}</span></h2>
    <div v-if="!todayActivity" class="mt-3 text-sm text-gray-500 bg-gray-800 rounded-lg px-4 py-3">
      今日尚無記錄，Claude Code session 結束後將自動更新
    </div>
    <div v-else class="grid grid-cols-3 gap-4 mt-3">
      <div class="stat-box">
        <p class="stat-value">{{ todayActivity.messageCount.toLocaleString() }}</p>
        <p class="stat-label">Messages</p>
      </div>
      <div class="stat-box">
        <p class="stat-value">{{ todayActivity.sessionCount }}</p>
        <p class="stat-label">Sessions</p>
      </div>
      <div class="stat-box">
        <p class="stat-value">{{ todayTokens.toLocaleString() }}</p>
        <p class="stat-label">Tokens</p>
      </div>
    </div>

    <p class="text-xs text-gray-500 mt-4 mb-2">每小時活躍分布（歷史）</p>
    <div class="flex items-end gap-0.5 h-12">
      <template v-for="h in hours" :key="h.hour">
        <div
          class="flex-1 bg-blue-600 rounded-t opacity-80 hover:opacity-100 transition-opacity"
          :style="{ height: `${Math.round((h.count / maxHourCount) * 100)}%` }"
          :title="`${pad(h.hour)}:00 — ${h.count}`"
        />
      </template>
    </div>
    <div class="flex justify-between text-xs text-gray-600 mt-1">
      <span>0h</span>
      <span>6h</span>
      <span>12h</span>
      <span>18h</span>
      <span>23h</span>
    </div>
  </div>
</template>
