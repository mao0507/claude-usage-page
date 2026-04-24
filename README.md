# Claude Usage Monitor

> 最後更新：2026-04-24

個人 Claude Code 使用量監控儀表板，資料來源為本地 `~/.claude/stats-cache.json` 及 `~/.claude/projects/**/*.jsonl`，不需要任何帳號或網路存取（Plan 用量上限功能除外）。

## 功能

- **Plan 用量上限** — 從 claude.ai API 抓取 5hr session / 7-day 週期用量（需設定 `.env`）
- **Token 熱力圖** — 近 90 天每日 token 使用量（GitHub 風格）
- **今日詳情** — 今日 messages / sessions / tokens 與每小時分布（直接讀取 `.jsonl`，即時反映）
- **模型分布** — Opus / Sonnet / Haiku 各模型使用佔比
- **即時更新** — 監聽 `stats-cache.json` 變動，透過 SSE 自動推送至前端

## 快速開始

```bash
# 安裝依賴
npm run install:all

# 啟動（同時啟動 backend:9527 + frontend:5173）
npm run dev
```

開啟 http://localhost:5173

## 設定 Plan 用量上限（選用）

此功能會呼叫 claude.ai 的 `/api/organizations/{orgId}/usage` 端點，取得你目前的用量百分比。

### 1. 取得認證資訊

登入 [claude.ai](https://claude.ai)，開啟 DevTools（F12）→ Network → 過濾 `usage` 請求 → 右鍵「Copy as cURL」，從中擷取以下值：

| 環境變數 | 來源 |
|---|---|
| `CLAUDE_ORG_ID` | URL 路徑中的 org UUID |
| `CLAUDE_SESSION_KEY` | Cookie `sessionKey`（`sk-ant-sid01-...`）|
| `CLAUDE_CF_CLEARANCE` | Cookie `cf_clearance` |
| `CLAUDE_DEVICE_ID` | Header `anthropic-device-id` |
| `CLAUDE_ACTIVITY_SESSION_ID` | Cookie / Header `activitySessionId` |

### 2. 建立 `.env`

```bash
cp .env.example .env
# 填入上面取得的值
```

未設定時，Plan 用量上限區塊會顯示提示訊息，其餘功能不受影響。

## 技術棧

- **Frontend**: Vite + Vue 3 + TypeScript + Tailwind CSS + vue3-calendar-heatmap
- **Backend**: Node.js + Express + TypeScript + chokidar（SSE 即時推送）

## 專案結構

```
.
├── backend/
│   └── src/
│       ├── index.ts                  # Express 入口，port 9527
│       ├── routes/
│       │   ├── stats.ts              # GET /api/stats、GET /api/stream（SSE）
│       │   └── planLimits.ts         # GET /api/plan-limits
│       └── services/
│           ├── statsReader.ts        # 讀取 stats-cache.json + 即時掃描 .jsonl
│           └── planLimitsService.ts  # 呼叫 claude.ai usage API
├── frontend/
│   └── src/
│       ├── App.vue
│       ├── components/
│       │   ├── PlanUsageLimits.vue   # Plan 用量上限（來自 claude.ai）
│       │   ├── UsageHeatmap.vue      # Token 熱力圖
│       │   ├── TodayDetail.vue       # 今日統計
│       │   └── ModelBreakdown.vue    # 模型分布
│       └── composables/
│           ├── useStatsStream.ts     # SSE 訂閱
│           └── usePlanLimits.ts      # Plan 用量輪詢
├── config.json                       # planLimit / weeklyLimit（備用手動上限）
└── .env.example                      # 認證設定範本
```
