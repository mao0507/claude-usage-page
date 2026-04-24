export interface DailyActivity {
  date: string
  messageCount: number
  sessionCount: number
  toolCallCount: number
}

export interface DailyModelTokens {
  date: string
  tokensByModel: Record<string, number>
}

export interface ModelUsage {
  inputTokens: number
  outputTokens: number
  cacheReadInputTokens: number
  cacheCreationInputTokens: number
  webSearchRequests: number
  costUSD: number
  contextWindow: number
  maxOutputTokens: number
}

export interface StatsCache {
  version: number
  lastComputedDate: string
  dailyActivity: DailyActivity[]
  dailyModelTokens: DailyModelTokens[]
  modelUsage: Record<string, ModelUsage>
  totalSessions: number
  totalMessages: number
  longestSession: number
  firstSessionDate: string
  hourCounts: Record<string, number>
  totalSpeculationTimeSavedMs: number
}
