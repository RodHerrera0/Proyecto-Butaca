import { describe, expect, it } from 'vitest'
import { favoritaDesdeApi, tituloDesdeApi } from './adaptadores.js'

describe('adaptadores', () => {
  it('convierte una recomendación del backend a la forma de las tarjetas', () => {
    const titulo = tituloDesdeApi({
      tmdbId: 550,
      mediaType: 'MOVIE',
      title: 'El club de la pelea',
      posterPath: '/abc.jpg',
      overview: 'Un insomne...',
      year: 1999,
      voteAverage: 8.4,
      genres: ['18', '53', '99999'],
    })
    expect(titulo).toMatchObject({
      id: 'MOVIE-550',
      titulo: 'El club de la pelea',
      tipo: 'pelicula',
      anio: 1999,
      calificacion: 8.4,
      generos: ['Drama', 'Suspenso'],
      poster: 'https://image.tmdb.org/t/p/w500/abc.jpg',
    })
  })

  it('una serie sin póster ni sinopsis sigue siendo mostrable', () => {
    const titulo = tituloDesdeApi({ tmdbId: 1, mediaType: 'TV', title: 'X', posterPath: null, overview: '', genres: [] })
    expect(titulo.tipo).toBe('serie')
    expect(titulo.poster).toBeNull()
    expect(titulo.sinopsis).toBe('Sin sinopsis disponible.')
  })

  it('una favorita conserva el id del registro para poder borrarla', () => {
    const favorita = favoritaDesdeApi({
      id: 'fav-1',
      tmdbId: 550,
      mediaType: 'MOVIE',
      title: 'El club de la pelea',
      posterPath: null,
      createdAt: '2026-11-05T10:00:00.000Z',
    })
    // Mismo id que la recomendación, así el corazón aparece marcado
    expect(favorita).toMatchObject({ id: 'MOVIE-550', favoritaId: 'fav-1', guardadaEn: '2026-11-05T10:00:00.000Z' })
  })
})
