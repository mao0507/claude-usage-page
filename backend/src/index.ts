import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../../.env') })
import express from 'express'
import cors from 'cors'
import statsRouter, { stopWatcher } from './routes/stats.js'
import planLimitsRouter from './routes/planLimits.js'

const app = express()
const PORT = process.env.PORT ?? 9527

app.use(cors())
app.use(express.json())
app.use('/api', statsRouter)
app.use('/api', planLimitsRouter)

const server = app.listen(PORT, () => {
  console.log(`[backend] running on http://localhost:${PORT}`)
})

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[backend] Port ${PORT} is already in use. Please stop the existing process and try again.`)
    process.exit(1)
  } else {
    throw err
  }
})

function shutdown() {
  stopWatcher()
  server.close(() => process.exit(0))
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
