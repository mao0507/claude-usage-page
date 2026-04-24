import fs from 'fs'
import path from 'path'
import os from 'os'
import chokidar from 'chokidar'
import type { StatsCache, DailyActivity, DailyModelTokens } from '../types/stats.js'
import type { AppConfig } from '../types/config.js'

const STATS_PATH = path.join(os.homedir(), '.claude', 'stats-cache.json')
const PROJECTS_PATH = path.join(os.homedir(), '.claude', 'projects')
const CONFIG_PATH = path.join(process.cwd(), '..', 'config.json')

const DEFAULT_STATS: StatsCache = {
  version: 0,
  lastComputedDate: '',
  dailyActivity: [],
  dailyModelTokens: [],
  modelUsage: {},
  totalSessions: 0,
  totalMessages: 0,
  longestSession: 0,
  firstSessionDate: '',
  hourCounts: {},
  totalSpeculationTimeSavedMs: 0,
}

const DEFAULT_CONFIG: AppConfig = {
  planLimit: 0,
  weeklyLimit: 0,
}

interface SessionEntry {
  type: string
  timestamp?: string
  sessionId?: string
  message?: {
    model?: string
    usage?: {
      input_tokens?: number
      output_tokens?: number
      cache_read_input_tokens?: number
      cache_creation_input_tokens?: number
    }
    content?: Array<{ type: string }>
  }
}

function computeTodayStats(): { activity: DailyActivity; tokens: DailyModelTokens } {
  const today = new Date().toISOString().slice(0, 10)
  const todayPrefix = today + 'T'

  let messageCount = 0
  const sessions = new Set<string>()
  let toolCallCount = 0
  const tokensByModel: Record<string, number> = {}

  try {
    const projectDirs = fs.readdirSync(PROJECTS_PATH, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => path.join(PROJECTS_PATH, d.name))

    for (const projectDir of projectDirs) {
      let entries: fs.Dirent[]
      try {
        entries = fs.readdirSync(projectDir, { withFileTypes: true })
      } catch {
        continue
      }

      for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith('.jsonl')) continue

        const filePath = path.join(projectDir, entry.name)
        let lines: string[]
        try {
          lines = fs.readFileSync(filePath, 'utf-8').split('\n').filter(Boolean)
        } catch {
          continue
        }

        for (const line of lines) {
          let d: SessionEntry
          try {
            d = JSON.parse(line) as SessionEntry
          } catch {
            continue
          }

          if (!d.timestamp?.startsWith(todayPrefix)) continue
          if (d.type !== 'assistant') continue

          messageCount++
          if (d.sessionId) sessions.add(d.sessionId)

          const content = d.message?.content ?? []
          toolCallCount += content.filter((c) => c.type === 'tool_use').length

          const model = d.message?.model ?? 'unknown'
          const usage = d.message?.usage ?? {}
          const tokens = (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0)
          tokensByModel[model] = (tokensByModel[model] ?? 0) + tokens
        }
      }
    }
  } catch {
    // If scanning fails, return empty
  }

  return {
    activity: { date: today, messageCount, sessionCount: sessions.size, toolCallCount },
    tokens: { date: today, tokensByModel },
  }
}

export function readStats(): StatsCache {
  let base: StatsCache
  try {
    const raw = fs.readFileSync(STATS_PATH, 'utf-8')
    base = JSON.parse(raw) as StatsCache
  } catch {
    base = { ...DEFAULT_STATS }
  }

  // Always inject live today stats so the dashboard stays current even when
  // stats-cache.json hasn't been recomputed yet.
  const today = new Date().toISOString().slice(0, 10)
  const { activity: todayActivity, tokens: todayTokens } = computeTodayStats()

  const dailyActivity = base.dailyActivity.filter((d) => d.date !== today)
  if (todayActivity.messageCount > 0) dailyActivity.push(todayActivity)

  const dailyModelTokens = base.dailyModelTokens.filter((d) => d.date !== today)
  if (Object.keys(todayTokens.tokensByModel).length > 0) dailyModelTokens.push(todayTokens)

  return { ...base, dailyActivity, dailyModelTokens }
}

export function readConfig(): AppConfig {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8')
    const parsed = JSON.parse(raw) as Partial<AppConfig>
    return {
      planLimit: parsed.planLimit ?? 0,
      weeklyLimit: parsed.weeklyLimit ?? 0,
    }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

type ChangeCallback = () => void

export function watchStats(onChange: ChangeCallback): () => void {
  const watcher = chokidar.watch(STATS_PATH, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100,
    },
  })

  watcher.on('change', onChange)
  watcher.on('error', (err) => {
    console.error('[statsReader] watch error:', err)
  })

  return () => {
    watcher.close().catch(console.error)
  }
}
