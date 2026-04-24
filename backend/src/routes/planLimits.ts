import { Router, type Request, type Response } from 'express'
import { fetchPlanLimits } from '../services/planLimitsService.js'

const router = Router()

router.get('/plan-limits', async (_req: Request, res: Response) => {
  const data = await fetchPlanLimits()
  res.json(data)
})

export default router
