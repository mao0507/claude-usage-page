<script setup lang="ts">
import { computed } from 'vue'
import { CalendarHeatmap } from 'vue3-calendar-heatmap'
import 'vue3-calendar-heatmap/dist/style.css'
import type { DailyModelTokens } from '../types/stats'

const props = defineProps<{
  dailyModelTokens: DailyModelTokens[]
}>()

// Build heatmap values: last 90 days, token sum across all models
const values = computed(() => {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 90)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  return props.dailyModelTokens
    .filter((d) => d.date >= cutoffStr)
    .map((d) => ({
      date: d.date,
      count: Object.values(d.tokensByModel).reduce((s, v) => s + v, 0),
    }))
})

const endDate = computed(() => new Date().toISOString().slice(0, 10))
</script>

<template>
  <div class="card">
    <h2 class="card-title">Token 使用熱力圖 <span class="text-xs text-gray-500 font-normal">（近 90 天）</span></h2>
    <div class="mt-4 overflow-x-auto">
      <CalendarHeatmap
        :values="values"
        :end-date="endDate"
        :range-color="['#1e293b', '#1e40af', '#2563eb', '#3b82f6', '#93c5fd']"
        tooltip-unit="tokens"
        :round="2"
      />
    </div>
  </div>
</template>
