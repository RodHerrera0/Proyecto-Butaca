import { afterAll, describe, expect, it, vi } from 'vitest'
import request from 'supertest'

vi.mock('jose', () => ({ createRemoteJWKSet: vi.fn(), jwtVerify: vi.fn() }))
vi.mock('../src/lib/prisma.js', () => ({ prisma: { user: { upsert: vi.fn() } } }))
vi.stubEnv('SUPABASE_URL', 'https://supabase-prueba.example')
const { app } = await import('../src/app.js')
const { jwtVerify } = await import('jose')
const { prisma } = await import('../src/lib/prisma.js')
afterAll(() => vi.unstubAllEnvs())

describe('Seguridad conservada', () => {
  it.each([
    ['get', '/api/me'], ['get', '/api/recommendations?mood=happy'],
    ['get', '/api/favorites'], ['post', '/api/favorites'],
    ['delete', '/api/favorites/abc'], ['post', '/api/moods'], ['get', '/api/dashboard'],
  ])('%s %s exige autenticación', async (method, path) => {
    const res = await request(app)[method](path)
    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: 'Falta el token' })
    expect(prisma.user.upsert).not.toHaveBeenCalled()
  })

  it('un token inválido no llega a la base de datos', async () => {
    jwtVerify.mockRejectedValueOnce(new Error('JWT inválido'))
    const res = await request(app).get('/api/me').set('Authorization', 'Bearer token-falso')
    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: 'Token inválido' })
    expect(prisma.user.upsert).not.toHaveBeenCalled()
  })

  it('el límite de recomendaciones sigue devolviendo 429 sin stack', async () => {
    let res
    for (let i = 0; i < 31; i++) res = await request(app).get('/api/recommendations?mood=happy')
    expect(res.status).toBe(429)
    expect(res.body).toEqual({ error: 'Demasiadas recomendaciones, intenta más tarde' })
    expect(res.headers['retry-after']).toBeDefined()
    expect(res.headers['ratelimit-policy']).toBeDefined()
  })
})
