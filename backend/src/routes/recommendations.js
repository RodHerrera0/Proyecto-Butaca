import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getRecommendations } from '../controllers/recommendations.js'

export const recommendationsRouter = Router()
recommendationsRouter.use(requireAuth)
recommendationsRouter.get('/', getRecommendations)
