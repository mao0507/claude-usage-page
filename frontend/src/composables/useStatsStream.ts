import { ref, onUnmounted } from 'vue'
import type { StatsResponse } from '../types/stats'

export function useStatsStream() {
  const stats = ref<StatsResponse | null>(null)
  const connected = ref(false)
  const error = ref<string | null>(null)

  let es: EventSource | null = null
  let retryTimer: ReturnType<typeof setTimeout> | null = null

  async function fetchInitial() {
    try {
      const res = await fetch('/api/stats')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      stats.value = await res.json() as StatsResponse
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    }
  }

  function connect() {
    if (es) return

    es = new EventSource('/api/stream')

    es.onopen = () => {
      connected.value = true
      error.value = null
    }

    es.onmessage = (event: MessageEvent) => {
      try {
        stats.value = JSON.parse(event.data as string) as StatsResponse
      } catch {
        // ignore malformed messages
      }
    }

    es.onerror = () => {
      connected.value = false
      es?.close()
      es = null
      // auto-reconnect after 3 seconds
      retryTimer = setTimeout(() => {
        connect()
      }, 3000)
    }
  }

  function disconnect() {
    if (retryTimer) {
      clearTimeout(retryTimer)
      retryTimer = null
    }
    if (es) {
      es.close()
      es = null
    }
    connected.value = false
  }

  // Start: fetch once then open SSE
  fetchInitial().then(() => connect())

  onUnmounted(() => {
    disconnect()
  })

  return { stats, connected, error }
}
