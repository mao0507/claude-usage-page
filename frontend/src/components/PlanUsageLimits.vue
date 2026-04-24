<script setup lang="ts">
import { computed } from 'vue'
import type { PlanLimitsResponse, UsageBucket } from '../types/planLimits'

const props = defineProps<{
  planLimits: PlanLimitsResponse | null
}>()

const available = computed(() => props.planLimits?.available === true)
const data = computed(() => props.planLimits?.available === true ? props.planLimits : null)

function formatResetsAt(resets_at: string): string {
  const diff = new Date(resets_at).getTime() - Date.now()
  if (diff <= 0) return 'Resets soon'
  const totalMins = Math.floor(diff / 60_000)
  const hrs = Math.floor(totalMins / 60)
  const mins = totalMins % 60
  if (hrs > 0) return `Resets in ${hrs} hr ${mins} min`
  return `Resets in ${mins} min`
}

function formatResetDay(resets_at: string): string {
  return new Date(resets_at).toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' })
}

function barWidth(bucket: UsageBucket | null): string {
  if (!bucket) return '0%'
  return `${Math.min(bucket.utilization, 100)}%`
}

function barColor(utilization: number): string {
  if (utilization >= 90) return 'bg-red-500'
  if (utilization >= 70) return 'bg-yellow-500'
  return 'bg-blue-500'
}
</script>

<template>
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <h2 class="card-title mb-0">Plan usage limits</h2>
    </div>

    <!-- 未設定提示 -->
    <template v-if="!planLimits">
      <p class="text-sm text-gray-500">Loading...</p>
    </template>
    <template v-else-if="!available">
      <p class="text-sm text-gray-500">
        設定 <code class="text-gray-300">.env</code> 中的
        <code class="text-gray-300">CLAUDE_ORG_ID</code> 與
        <code class="text-gray-300">CLAUDE_SESSION_KEY</code> 以顯示 Plan 用量。
      </p>
    </template>

    <!-- 用量資料 -->
    <template v-else-if="data">
      <!-- Current session -->
      <div v-if="data.five_hour" class="mb-5">
        <p class="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Current session</p>
        <div class="flex justify-between text-sm text-gray-300 mb-1">
          <span class="text-xs text-gray-500">{{ formatResetsAt(data.five_hour.resets_at) }}</span>
          <span>{{ data.five_hour.utilization }}% used</span>
        </div>
        <div class="progress-track">
          <div
            class="progress-bar transition-all duration-500"
            :class="barColor(data.five_hour.utilization)"
            :style="{ width: barWidth(data.five_hour) }"
          />
        </div>
      </div>

      <hr class="border-gray-800 mb-5" />

      <!-- Weekly limits -->
      <div class="mb-5">
        <p class="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Weekly limits</p>

        <!-- All models -->
        <div v-if="data.seven_day" class="mb-4">
          <div class="flex justify-between text-sm text-gray-300 mb-1">
            <span>All models</span>
            <span>{{ data.seven_day.utilization }}% used</span>
          </div>
          <div class="progress-track">
            <div
              class="progress-bar transition-all duration-500"
              :class="barColor(data.seven_day.utilization)"
              :style="{ width: barWidth(data.seven_day) }"
            />
          </div>
          <p class="text-xs text-gray-600 mt-1">Resets {{ formatResetDay(data.seven_day.resets_at) }}</p>
        </div>

        <!-- Claude Design -->
        <div v-if="data.seven_day_omelette">
          <div class="flex justify-between text-sm text-gray-300 mb-1">
            <span>Claude Design</span>
            <span>{{ data.seven_day_omelette.utilization }}% used</span>
          </div>
          <div class="progress-track">
            <div
              class="progress-bar transition-all duration-500"
              :class="barColor(data.seven_day_omelette.utilization)"
              :style="{ width: barWidth(data.seven_day_omelette) }"
            />
          </div>
          <p class="text-xs text-gray-600 mt-1">Resets {{ formatResetDay(data.seven_day_omelette.resets_at) }}</p>
        </div>
      </div>

      <!-- Additional features -->
      <template v-if="data.extra_usage.is_enabled">
        <hr class="border-gray-800 mb-5" />
        <div>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Additional features</p>
          <div class="flex justify-between text-sm text-gray-300 mb-1">
            <span>Daily included routine runs</span>
            <span>{{ data.extra_usage.used_credits ?? 0 }} / {{ data.extra_usage.monthly_limit ?? 5 }}</span>
          </div>
          <div class="progress-track">
            <div
              class="progress-bar transition-all duration-500 bg-blue-500"
              :style="{
                width: data.extra_usage.monthly_limit
                  ? `${Math.min(((data.extra_usage.used_credits ?? 0) / data.extra_usage.monthly_limit) * 100, 100)}%`
                  : '0%'
              }"
            />
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
