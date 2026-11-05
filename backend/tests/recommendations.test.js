import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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
    moodEntry: { findFirst: vi.fn() },
    recommendation: { createMany: vi.fn() },
  },
}))

import { app } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'

const peliculaTMDB = {
  id: 550, title: 'Fight Club', release_date: '1999-10-15',
  poster_path: '/p.jpg', overview: 'x', vote_average: 8.4, genre_ids: [18],
}
const serieTMDB = {
  id: 456, name: 'Los Simpson', first_air_date: '1989-12-17',
  poster_path: '/s.jpg', overview: 'y', vote_average: 8, genre_ids: [16, 35],
}

const respuestaTMDB = (results) => ({ ok: true, status: 200, json: async () => ({ results }) })

describe('GET /api/recommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => vi.unstubAllGlobals())

  it('rechaza una emoción no válida con 400', async () => {
    const res = await request(app).get('/api/recommendations?mood=tired')
    expect(res.status).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('responde 404 si el ánimo no pertenece al usuario', async () => {
    prisma.moodEntry.findFirst.mockResolvedValue(null)
    const res = await request(app).get(
      '/api/recommendations?mood=happy&moodId=00000000-0000-0000-0000-000000000000'
    )
    expect(res.status).toBe(404)
  })

  it('devuelve películas y series, y guarda lo mostrado', async () => {
    fetch
      .mockResolvedValueOnce(respuestaTMDB([peliculaTMDB]))
      .mockResolvedValueOnce(respuestaTMDB([serieTMDB]))
    prisma.recommendation.createMany.mockResolvedValue({ count: 2 })

    const res = await request(app).get('/api/recommendations?mood=happy')

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
    expect(res.body[0]).toMatchObject({ tmdbId: 550, mediaType: 'MOVIE', title: 'Fight Club', year: 1999 })
    expect(res.body[1]).toMatchObject({ tmdbId: 456, mediaType: 'TV', title: 'Los Simpson', year: 1989 })
    expect(prisma.recommendation.createMany).toHaveBeenCalledWith({
      data: [
        { userId: 'user-1', moodEntryId: null, tmdbId: 550, mediaType: 'MOVIE', title: 'Fight Club', genres: ['18'] },
        { userId: 'user-1', moodEntryId: null, tmdbId: 456, mediaType: 'TV', title: 'Los Simpson', genres: ['16', '35'] },
      ],
    })
  })
})