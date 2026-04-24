import { ref, onUnmounted } from 'vue'
import type { PlanLimitsResponse } from '../types/planLimits'

export function usePlanLimits() {
  const planLimits = ref<PlanLimitsResponse | null>(null)

  async function fetchLimits() {
    try {
      const res = await fetch('/api/plan-limits')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      planLimits.value = await res.json() as PlanLimitsResponse
    } catch {
      // 保留上一次的值，靜默失敗
    }
  }

  fetchLimits()
  const timer = setInterval(fetchLimits, 60_000)

  onUnmounted(() => clearInterval(timer))

  return { planLimits }
}
