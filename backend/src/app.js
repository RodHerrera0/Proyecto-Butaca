import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { requireAuth } from './middleware/auth.js'
import { prisma } from './lib/prisma.js'
import { favoritesRouter } from './routes/favorites.js'

// Crea y configura la app de Express (sin levantar el servidor, para poder probarla con supertest)
export const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL }))
app.use(express.json())

// Ruta de salud: permite verificar que la API está viva
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/me', requireAuth, async (req, res) => {
  const user = await prisma.user.upsert({
    where: { authId: req.auth.id },
    update: { email: req.auth.email },
    create: { authId: req.auth.id, email: req.auth.email },
  })
  res.json(user)
})

app.use('/api/favorites', favoritesRouter)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Error interno' })
})