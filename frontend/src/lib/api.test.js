import { afterEach, describe, expect, it, vi } from 'vitest'
import { ErrorApi, quitarFavorita, registrarAnimo } from './api.js'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('api', () => {
  it('manda el token y el cuerpo en JSON', async () => {
    const fetchFalso = vi.fn(() => Promise.resolve({ ok: true, status: 201, json: () => Promise.resolve({ id: 'a' }) }))
    vi.stubGlobal('fetch', fetchFalso)

    expect(await registrarAnimo('t', { emocion: 'happy', confianza: 0.8 })).toEqual({ id: 'a' })
    const [url, opciones] = fetchFalso.mock.calls[0]
    expect(url).toMatch(/\/api\/moods$/)
    expect(opciones).toMatchObject({
      method: 'POST',
      headers: { Authorization: 'Bearer t', 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood: 'happy', confidence: 0.8 }),
    })
  })

  it('una respuesta 204 devuelve null', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, status: 204 })))
    expect(await quitarFavorita('t', 'fav-1')).toBeNull()
  })

  it('un error del servidor lanza ErrorApi con el estado y el mensaje', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({ error: 'Token inválido' }) })),
    )
    const error = await registrarAnimo('t', { emocion: 'sad', confianza: null }).catch((e) => e)
    expect(error).toBeInstanceOf(ErrorApi)
    expect(error.estado).toBe(401)
    expect(error.message).toBe('Token inválido')
  })
})
