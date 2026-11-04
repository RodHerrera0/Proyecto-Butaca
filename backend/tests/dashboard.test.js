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
  prisma: {
    moodEntry: { findMany: vi.fn() },
    recommendation: { findMany: vi.fn() },
  },
}))

import { app } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'

describe('GET /api/dashboard', () => {
  beforeEach(() => vi.clearAllMocks())

  it('devuelve historial, conteos y géneros con nombre', async () => {
    prisma.moodEntry.findMany.mockResolvedValue([
      { mood: 'HAPPY', confidence: 0.9, createdAt: new Date('2026-11-01T10:00:00Z') },
      { mood: 'SAD', confidence: null, createdAt: new Date('2026-11-02T10:00:00Z') },
      { mood: 'HAPPY', confidence: 0.8, createdAt: new Date('2026-11-03T10:00:00Z') },
    ])
    prisma.recommendation.findMany.mockResolvedValue([
      { mediaType: 'MOVIE', genres: ['16', '35'] },
      { mediaType: 'TV', genres: ['16'] },
    ])

    const res = await request(app).get('/api/dashboard')

    expect(res.status).toBe(200)
    expect(res.body.porEmocion).toEqual({ happy: 2, sad: 1 })
    expect(res.body.porTipo).toEqual({ MOVIE: 1, TV: 1 })
    expect(res.body.porGenero[0]).toEqual({ id: 16, nombre: 'Animación', total: 2 })
    expect(res.body.historial[0]).toEqual({
      emocion: 'happy',
      confianza: 0.9,
      fecha: '2026-11-01T10:00:00.000Z',
    })
  })
})