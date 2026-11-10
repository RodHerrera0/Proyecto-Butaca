import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { createMood } from '../controllers/moods.js'

export const moodsRouter = Router()
moodsRouter.use(requireAuth)
moodsRouter.post('/', createMood)
