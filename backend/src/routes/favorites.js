import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { favoriteParamsSchema } from '../schemas/api.js'

export const favoritesRouter = Router()

const favoriteSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(['MOVIE', 'TV']),
  title: z.string().min(1),
  posterPath: z.string().nullable().optional(),
})

favoritesRouter.use(requireAuth)

// Lista las favoritas del usuario en sesión
favoritesRouter.get('/', async (req, res) => {
  const favorites = await prisma.favorite.findMany({
    where: { user: { authId: req.auth.id } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(favorites)
})

// Guarda una favorita para el usuario en sesión
favoritesRouter.post('/', async (req, res) => {
  const parsed = favoriteSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  try {
    const favorite = await prisma.favorite.create({
      data: {
        ...parsed.data,
        user: { connect: { authId: req.auth.id } },
      },
    })
    res.status(201).json(favorite)
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Ya está en favoritas' })
    }
    throw err
  }
})

// Borra una favorita, solo si pertenece al usuario en sesión
favoritesRouter.delete('/:id', async (req, res) => {
  const parsed = favoriteParamsSchema.safeParse(req.params)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }
  const result = await prisma.favorite.deleteMany({
    where: { id: parsed.data.id, user: { authId: req.auth.id } },
  })
  if (result.count === 0) {
    return res.status(404).json({ error: 'No encontrada' })
  }
  res.status(204).end()
})
