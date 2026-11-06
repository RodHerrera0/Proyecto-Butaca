import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { favoriteParamsSchema } from '../src/schemas/api.js'

vi.mock('../src/middleware/auth.js', () => ({
  requireAuth: (req, _res, next) => {
    req.user = { id: 'user-1' }
    req.auth = { id: 'auth-1' }
    next()
  },
}))
vi.mock('../src/lib/prisma.js', () => ({ prisma: {
  moodEntry: { findFirst: vi.fn() },
  recommendation: { createMany: vi.fn() },
  favorite: { deleteMany: vi.fn() },
} }))
import { app } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'
import { deleteFavorite } from '../src/controllers/favorites.js'

describe('Validación de entradas API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('TMDB_API_KEY', 'token-ficticio')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ results: [] }) }))
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it.each([
    '', '?mood=', '?mood=tired', '?mood=Happy', '?mood=__proto__',
    '?mood=happy&mood=sad', '?mood=happy&moodId=',
    '?mood=happy&moodId=no-es-uuid',
    '?mood=happy&moodId=00000000-0000-0000-0000-000000000000&moodId=otro',
  ])('rechaza query incorrecta con 400: %s', async (query) => {
    const res = await request(app).get(`/api/recommendations${query}`)
    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
    expect(fetch).not.toHaveBeenCalled()
    expect(prisma.moodEntry.findFirst).not.toHaveBeenCalled()
  })

  it('acepta moodId UUID y comprueba la propiedad del registro', async () => {
    const id = '954c047f-7cc5-4f20-8984-0d083314ca52'
    prisma.moodEntry.findFirst.mockResolvedValue({ id })
    const res = await request(app).get('/api/recommendations').query({ mood: 'happy', moodId: id })
    expect(res.status).toBe(200)
    expect(prisma.moodEntry.findFirst).toHaveBeenCalledWith({ where: { id, userId: 'user-1' } })
  })

  it.each([{}, { id: '' }, { id: 123 }, { id: ['abc'] }])('rechaza params faltantes o incorrectos: %j', (params) => {
    expect(favoriteParamsSchema.safeParse(params).success).toBe(false)
  })

  it('acepta el identificador no vacío sin imponer otro formato', () => {
    expect(favoriteParamsSchema.safeParse({ id: 'abc' }).success).toBe(true)
  })

  it.each([{}, { id: '' }, { id: 123 }])('el controlador responde 400 para params inválidos: %j', async (params) => {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
    await deleteFavorite({ params, auth: { id: 'auth-1' } }, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(Object) })
    expect(prisma.favorite.deleteMany).not.toHaveBeenCalled()
  })

  it('sin segmento :id no existe la ruta DELETE y no llega a Prisma', async () => {
    const res = await request(app).delete('/api/favorites/')
    expect(res.status).toBe(404)
    expect(prisma.favorite.deleteMany).not.toHaveBeenCalled()
  })
})
