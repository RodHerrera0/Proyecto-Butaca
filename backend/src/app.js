import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { requireAuth } from './middleware/auth.js'
import { prisma } from './lib/prisma.js'
import { favoritesRouter } from './routes/favorites.js'
import { moodsRouter } from './routes/moods.js'
import { recommendationsRouter } from './routes/recommendations.js'
import { dashboardRouter } from './routes/dashboard.js'

// Crea y configura la app de Express (sin levantar el servidor, para poder probarla con supertest)
export const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL }))
app.use(express.json())

// Ruta de salud: permite verificar que la API está viva
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/me', requireAuth, (req, res) => {
  res.json(req.user)
})

app.use('/api/favorites', favoritesRouter)
app.use('/api/moods', moodsRouter)
app.use('/api/recommendations', recommendationsRouter)
app.use('/api/dashboard', dashboardRouter)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Error interno' })
})