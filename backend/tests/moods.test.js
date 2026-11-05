import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'

vi.mock('../src/middleware/auth.js', () => ({
  requireAuth: (req, res, next) => {
    req.user = { id: 'user-1' }
    req.auth = { id: 'auth-1', email: 'test@test.com' }
    next()
  },
}))

vi.mock('../src/lib/prisma.js', () => ({
  prisma: { moodEntry: { create: vi.fn() } },
}))

import { app } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'

describe('POST /api/moods', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rechaza una emoción que no existe', async () => {
    const res = await request(app).post('/api/moods').send({ mood: 'tired', confidence: 0.5 })
    expect(res.status).toBe(400)
    expect(prisma.moodEntry.create).not.toHaveBeenCalled()
  })

  it('rechaza una confianza fuera de rango', async () => {
    const res = await request(app).post('/api/moods').send({ mood: 'happy', confidence: 1.5 })
    expect(res.status).toBe(400)
  })

  it('guarda el ánimo en mayúsculas para el usuario de la sesión', async () => {
    prisma.moodEntry.create.mockResolvedValue({ id: 'm1' })
    const res = await request(app).post('/api/moods').send({ mood: 'happy', confidence: 0.9 })
    expect(res.status).toBe(201)
    expect(prisma.moodEntry.create).toHaveBeenCalledWith({
      data: { mood: 'HAPPY', confidence: 0.9, userId: 'user-1' },
    })
  })

  it('acepta confianza null cuando el ánimo se elige a mano', async () => {
    prisma.moodEntry.create.mockResolvedValue({ id: 'm2' })
    const res = await request(app).post('/api/moods').send({ mood: 'sad', confidence: null })
    expect(res.status).toBe(201)
  })
})