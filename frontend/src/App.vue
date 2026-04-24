<script setup lang="ts">
import { useStatsStream } from './composables/useStatsStream'
import { usePlanLimits } from './composables/usePlanLimits'
import PlanUsageLimits from './components/PlanUsageLimits.vue'
import PlanUsage from './components/PlanUsage.vue'
import WeeklyUsage from './components/WeeklyUsage.vue'
import UsageHeatmap from './components/UsageHeatmap.vue'
import TodayDetail from './components/TodayDetail.vue'
import ModelBreakdown from './components/ModelBreakdown.vue'

const { stats, connected } = useStatsStream()
const { planLimits } = usePlanLimits()
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-gray-100">
    <!-- Header -->
    <header class="border-b border-gray-800 px-6 py-4">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <div>
          <h1 class="text-lg font-semibold text-white">Claude Usage Monitor</h1>
          <p class="text-xs text-gray-500 mt-0.5">Personal dashboard · local data only</p>
        </div>
        <div class="flex items-center gap-2">
          <span
            class="w-2 h-2 rounded-full"
            :class="connected ? 'bg-emerald-500' : 'bg-gray-600'"
          />
          <span class="text-xs text-gray-500">
            {{ connected ? 'Live' : 'Connecting...' }}
          </span>
        </div>
      </div>
    </header>

    <!-- Loading state -->
    <div v-if="!stats" class="flex items-center justify-center h-64 text-gray-600">
      Loading stats...
    </div>

    <!-- Dashboard -->
    <main v-else class="max-w-6xl mx-auto px-6 py-6 space-y-6">
      <!-- Row 0: Today detail + Model breakdown -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TodayDetail
          :daily-activity="stats.dailyActivity"
          :daily-model-tokens="stats.dailyModelTokens"
          :hour-counts="stats.hourCounts"
        />
        <ModelBreakdown :model-usage="stats.modelUsage" />
      </div>

      <!-- Row 1: Heatmap full width -->
      <UsageHeatmap :daily-model-tokens="stats.dailyModelTokens" />

      <!-- Row 2: Plan usage limits (from claude.ai) — hidden -->
      <div >
        <PlanUsageLimits :plan-limits="planLimits" />
      </div>

      <!-- Row 3: Plan + Weekly usage — hidden -->
      <div style="display: none;">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PlanUsage
            :total-messages="stats.totalMessages"
            :plan-limit="stats.planLimit"
          />
          <WeeklyUsage
            :daily-activity="stats.dailyActivity"
            :weekly-limit="stats.weeklyLimit"
          />
        </div>
      </div>
    </main>
  </div>
</template>
