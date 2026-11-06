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
    vi.stubEnv('TMDB_API_KEY', 'token-simulado-sin-acceso-real')
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it.each([undefined, '', '   '])('controla credencial ausente o vacía (%s)', async (token) => {
    vi.stubEnv('TMDB_API_KEY', token)
    const res = await request(app).get('/api/recommendations?mood=happy')
    expect(res.status).toBe(503)
    expect(res.body).toEqual({ error: 'Servicio de recomendaciones no configurado' })
    expect(fetch).not.toHaveBeenCalled()
    expect(prisma.recommendation.createMany).not.toHaveBeenCalled()
  })

  it('rechaza una emoción no válida con 400', async () => {
    const res = await request(app).get('/api/recommendations?mood=tired')
    expect(res.status).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
  })

  it.each([
    ['neutral', '12|35', '10759|35'],
    ['happy', '35|16', '35|16'],
    ['sad', '10751|35', '10751|35'],
    ['angry', '28|12', '10759'],
    ['fearful', '16|10751', '16|10751'],
    ['disgusted', '35|12', '35|10759'],
    ['surprised', '878|9648', '10765|9648'],
  ])('consulta géneros OR y sin duplicados para %s', async (mood, movie, tv) => {
    fetch.mockResolvedValue(respuestaTMDB([]))
    const res = await request(app).get('/api/recommendations').query({ mood })
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
    expect(prisma.recommendation.createMany).not.toHaveBeenCalled()
    const urls = fetch.mock.calls.map(([url]) => new URL(url))
    expect(urls.map((url) => url.pathname)).toEqual(['/3/discover/movie', '/3/discover/tv'])
    expect(urls.map((url) => url.searchParams.get('with_genres'))).toEqual([movie, tv])
    for (const url of urls) {
      expect(url.searchParams.get('language')).toBe('es-MX')
      expect(url.searchParams.get('sort_by')).toBe('popularity.desc')
      expect(url.searchParams.get('vote_count.gte')).toBe('200')
    }
  })

  it.each([401, 429, 500])('controla HTTP %s de TMDB sin guardar resultados parciales', async (status) => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      fetch.mockResolvedValue({ ok: false, status })
      const res = await request(app).get('/api/recommendations?mood=happy')
      expect(res.status).toBe(500)
      expect(res.body).toEqual({ error: 'Error interno' })
      expect(prisma.recommendation.createMany).not.toHaveBeenCalled()
    } finally { log.mockRestore() }
  })

  it('limita a cinco películas y cinco series', async () => {
    fetch.mockResolvedValueOnce(respuestaTMDB(Array(7).fill(peliculaTMDB)))
      .mockResolvedValueOnce(respuestaTMDB(Array(8).fill(serieTMDB)))
    const res = await request(app).get('/api/recommendations?mood=happy')
    expect(res.status).toBe(200)
    expect(res.body.map((item) => item.mediaType)).toEqual([
      ...Array(5).fill('MOVIE'), ...Array(5).fill('TV'),
    ])
  })

  it('cancela TMDB después de ocho segundos y no persiste resultados', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      fetch.mockImplementation((_url, { signal }) => new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('Solicitud cancelada')), { once: true })
        queueMicrotask(() => vi.advanceTimersByTime(8000))
      }))
      const res = await request(app).get('/api/recommendations?mood=happy')
      expect(res.status).toBe(500)
      expect(res.body).toEqual({ error: 'Error interno' })
      expect(fetch.mock.calls.every(([, options]) => options.signal.aborted)).toBe(true)
      expect(prisma.recommendation.createMany).not.toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
      log.mockRestore()
    }
  })

  it('controla una respuesta malformada del proveedor', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      fetch.mockResolvedValue({ ok: true, json: async () => ({ results: null }) })
      const res = await request(app).get('/api/recommendations?mood=happy')
      expect(res.status).toBe(500)
      expect(res.body).toEqual({ error: 'Error interno' })
      expect(prisma.recommendation.createMany).not.toHaveBeenCalled()
    } finally { log.mockRestore() }
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
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer token-simulado-sin-acceso-real')
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
