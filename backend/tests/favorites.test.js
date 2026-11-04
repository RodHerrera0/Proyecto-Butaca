import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'

// Simula la sesión: siempre entra el usuario de prueba
vi.mock('../src/middleware/auth.js', () => ({
  requireAuth: (req, res, next) => {
    req.user = { id: 'user-1' }
    req.auth = { id: 'auth-1', email: 'test@test.com' }
    next()
  },
}))

// Simula la base de datos
vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    favorite: {
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}))

import { app } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'

const favoritaValida = {
  tmdbId: 550,
  mediaType: 'MOVIE',
  title: 'Fight Club',
}

describe('GET /health', () => {
  it('responde ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})

describe('POST /api/favorites', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rechaza datos inválidos con 400', async () => {
    const res = await request(app)
      .post('/api/favorites')
      .send({ tmdbId: 'no-es-numero', mediaType: 'MOVIE', title: 'X' })
    expect(res.status).toBe(400)
    expect(prisma.favorite.create).not.toHaveBeenCalled()
  })

  it('guarda la favorita para el usuario de la sesión', async () => {
    prisma.favorite.create.mockResolvedValue({ id: 'f1', ...favoritaValida })
    const res = await request(app).post('/api/favorites').send(favoritaValida)
    expect(res.status).toBe(201)
    expect(prisma.favorite.create).toHaveBeenCalledWith({
      data: {
        ...favoritaValida,
        user: { connect: { authId: 'auth-1' } },
      },
    })
  })

  it('responde 409 si la favorita ya existe', async () => {
    prisma.favorite.create.mockRejectedValue({ code: 'P2002' })
    const res = await request(app).post('/api/favorites').send(favoritaValida)
    expect(res.status).toBe(409)
  })
})

describe('DELETE /api/favorites/:id', () => {
  beforeEach(() => vi.clearAllMocks())

  it('responde 404 si no es de este usuario o no existe', async () => {
    prisma.favorite.deleteMany.mockResolvedValue({ count: 0 })
    const res = await request(app).delete('/api/favorites/abc')
    expect(res.status).toBe(404)
  })

  it('borra solo las favoritas del usuario de la sesión', async () => {
    prisma.favorite.deleteMany.mockResolvedValue({ count: 1 })
    const res = await request(app).delete('/api/favorites/abc')
    expect(res.status).toBe(204)
    expect(prisma.favorite.deleteMany).toHaveBeenCalledWith({
      where: { id: 'abc', user: { authId: 'auth-1' } },
    })
  })
})