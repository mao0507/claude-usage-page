<script setup lang="ts">
import { computed } from 'vue'
import type { ModelUsage } from '../types/stats'

const props = defineProps<{
  modelUsage: Record<string, ModelUsage>
}>()

interface ModelStat {
  name: string
  shortName: string
  tokens: number
  percentage: number
  color: string
}

const MODEL_COLORS: Record<string, string> = {
  opus: 'bg-purple-500',
  sonnet: 'bg-blue-500',
  haiku: 'bg-emerald-500',
}

function getColor(modelId: string): string {
  const lower = modelId.toLowerCase()
  for (const [key, color] of Object.entries(MODEL_COLORS)) {
    if (lower.includes(key)) return color
  }
  return 'bg-gray-500'
}

function shortName(modelId: string): string {
  const lower = modelId.toLowerCase()
  if (lower.includes('opus')) return 'Opus'
  if (lower.includes('sonnet')) return 'Sonnet'
  if (lower.includes('haiku')) return 'Haiku'
  return modelId
}

const modelStats = computed((): ModelStat[] => {
  const entries = Object.entries(props.modelUsage).map(([id, usage]) => ({
    name: id,
    shortName: shortName(id),
    tokens: usage.inputTokens + usage.outputTokens + usage.cacheReadInputTokens + usage.cacheCreationInputTokens,
  }))

  const total = entries.reduce((s, e) => s + e.tokens, 0) || 1

  return entries
    .map((e) => ({
      ...e,
      percentage: Math.round((e.tokens / total) * 100),
      color: getColor(e.name),
    }))
    .sort((a, b) => b.tokens - a.tokens)
})
</script>

<template>
  <div class="card">
    <h2 class="card-title">模型分布</h2>
    <div v-if="modelStats.length === 0" class="text-sm text-gray-500 mt-2">尚無資料</div>
    <div v-else class="space-y-3 mt-3">
      <div v-for="m in modelStats" :key="m.name">
        <div class="flex justify-between text-sm mb-1">
          <span class="text-gray-300">{{ m.shortName }}</span>
          <span class="text-gray-400">{{ m.tokens.toLocaleString() }} tokens · {{ m.percentage }}%</span>
        </div>
        <div class="progress-track">
          <div
            class="progress-bar"
            :class="m.color"
            :style="{ width: `${m.percentage}%` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
