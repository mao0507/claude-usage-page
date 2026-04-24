import { Router, type Request, type Response } from 'express'
import { readStats, readConfig, watchStats } from '../services/statsReader.js'
import type { StatsCache } from '../types/stats.js'
import type { AppConfig } from '../types/config.js'

type StatsResponse = StatsCache & AppConfig

const router = Router()

// SSE client management
const clients = new Set<Response>()

function buildResponse(): StatsResponse {
  return { ...readStats(), ...readConfig() }
}

function broadcastToClients(data: StatsResponse): void {
  const payload = `data: ${JSON.stringify(data)}\n\n`
  clients.forEach((res) => {
    try {
      res.write(payload)
    } catch {
      clients.delete(res)
    }
  })
}

// Start file watcher and broadcast on change
watchStats(() => {
  const updated = buildResponse()
  broadcastToClients(updated)
})

// GET /api/stats
router.get('/stats', (_req: Request, res: Response) => {
  res.json(buildResponse())
})

// GET /api/stream  (SSE)
router.get('/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  // Send current data immediately
  res.write(`data: ${JSON.stringify(buildResponse())}\n\n`)

  clients.add(res)

  req.on('close', () => {
    clients.delete(res)
  })
})

export default router
