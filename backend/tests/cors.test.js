import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'

vi.mock('../src/middleware/auth.js', () => ({ requireAuth: (_req, _res, next) => next() }))
vi.mock('../src/lib/prisma.js', () => ({ prisma: {} }))
import { app } from '../src/app.js'

describe('CORS', () => {
  beforeEach(() => vi.stubEnv('FRONTEND_URL', ' http://localhost:5173, , https://butaca-prueba.vercel.app , '))
  afterEach(() => vi.unstubAllEnvs())

  it.each(['http://localhost:5173', 'https://butaca-prueba.vercel.app'])('autoriza exactamente %s', async (origin) => {
    const res = await request(app).get('/health').set('Origin', origin)
    expect(res.status).toBe(200)
    expect(res.headers['access-control-allow-origin']).toBe(origin)
    expect(res.headers.vary).toContain('Origin')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
  })

  it.each(['https://ajeno.example', 'https://butaca-prueba.vercel.app.ajeno.example', 'http://localhost:9999', 'null'])('rechaza %s', async (origin) => {
    const res = await request(app).get('/health').set('Origin', origin)
    expect(res.status).toBe(403)
    expect(res.body).toEqual({ error: 'Origen no permitido' })
    expect(res.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('resuelve preflight con Authorization y Content-Type', async () => {
    const res = await request(app).options('/api/favorites/abc')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'DELETE')
      .set('Access-Control-Request-Headers', 'authorization,content-type')
    expect(res.status).toBe(204)
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173')
    expect(res.headers['access-control-allow-methods']).toContain('DELETE')
    expect(res.headers['access-control-allow-headers']).toBe('authorization,content-type')
  })

  it('rechaza preflight de un origen ajeno', async () => {
    const res = await request(app).options('/api/recommendations')
      .set('Origin', 'https://ajeno.example').set('Access-Control-Request-Method', 'GET')
    expect(res.status).toBe(403)
    expect(res.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('acepta herramientas y servidores sin Origin', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('usa localhost si falta la variable', async () => {
    vi.stubEnv('FRONTEND_URL', undefined)
    const res = await request(app).get('/health').set('Origin', 'http://localhost:5173')
    expect(res.status).toBe(200)
  })

  it('una lista vacía no abre el acceso a todos los orígenes', async () => {
    vi.stubEnv('FRONTEND_URL', ' , , ')
    const res = await request(app).get('/health').set('Origin', 'https://ajeno.example')
    expect(res.status).toBe(403)
  })
})
