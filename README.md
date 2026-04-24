# Claude Usage Monitor

個人 Claude Code 使用量監控儀表板，資料來源為本地 `~/.claude/stats-cache.json`，不需要任何帳號或網路存取。

## 功能

- **Plan / Weekly 進度條** — 顯示訊息用量與手動設定的上限
- **Token 熱力圖** — 近 90 天每日 token 使用量（GitHub 風格）
- **今日詳情** — 今日 messages / sessions / tokens 與每小時分布
- **模型分布** — Opus / Sonnet / Haiku 各模型使用佔比
- **即時更新** — Claude Code session 結束後自動刷新

## 快速開始

```bash
# 安裝依賴
npm run install:all

# 啟動（同時啟動 backend:3001 + frontend:5173）
npm run dev
```

開啟 http://localhost:5173

## 設定 Plan Limits

編輯根目錄的 `config.json`，填入你的 Plan 對應上限：

```json
{
  "planLimit": 5000,
  "weeklyLimit": 500
}
```

設為 `0` 表示不顯示上限（只顯示絕對用量）。

## 技術棧

- **Frontend**: Vite + Vue 3 + TypeScript + Tailwind CSS + vue3-calendar-heatmap
- **Backend**: Node.js + Express + TypeScript + chokidar（SSE 即時推送）
