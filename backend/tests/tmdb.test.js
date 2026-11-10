import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { obtenerRecomendaciones } from '../src/services/tmdb.js'

describe('Servicio TMDB sin credenciales reales', () => {
  beforeEach(() => {
    vi.stubEnv('TMDB_API_KEY', 'token-ficticio')
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('normaliza campos ausentes y conserva el JSON esperado por el frontend', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ results: [{ id: 1, title: 'Película' }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [{ id: 2, name: 'Serie', genre_ids: [35] }] }) })
    expect(await obtenerRecomendaciones('happy')).toEqual([
      { tmdbId: 1, mediaType: 'MOVIE', title: 'Película', posterPath: null, overview: null, year: null, voteAverage: null, genres: [] },
      { tmdbId: 2, mediaType: 'TV', title: 'Serie', posterPath: null, overview: null, year: null, voteAverage: null, genres: ['35'] },
    ])
  })

  it('conserva resultados de un catálogo cuando el otro está vacío', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [{ id: 2, name: 'Serie' }] }) })
    const items = await obtenerRecomendaciones('neutral')
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({ tmdbId: 2, mediaType: 'TV' })
  })

  it('propaga un fallo de red y limpia los temporizadores', async () => {
    vi.useFakeTimers()
    fetch.mockRejectedValue(new Error('Red no disponible'))
    await expect(obtenerRecomendaciones('sad')).rejects.toThrow('Red no disponible')
    expect(vi.getTimerCount()).toBe(0)
  })

  it('propaga JSON ilegible sin esconderlo como catálogo vacío', async () => {
    vi.useFakeTimers()
    fetch.mockResolvedValue({ ok: true, json: async () => { throw new SyntaxError('JSON inválido') } })
    await expect(obtenerRecomendaciones('angry')).rejects.toThrow('JSON inválido')
    expect(vi.getTimerCount()).toBe(0)
  })

  it('mantiene el límite de ocho segundos mientras lee el body', async () => {
    vi.useFakeTimers()
    fetch.mockImplementation(async (_url, { signal }) => ({
      ok: true,
      json: () => new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('Body cancelado')), { once: true })
      }),
    }))
    const pending = expect(obtenerRecomendaciones('fearful')).rejects.toThrow('Body cancelado')
    await vi.advanceTimersByTimeAsync(8000)
    await pending
    expect(vi.getTimerCount()).toBe(0)
  })
})
