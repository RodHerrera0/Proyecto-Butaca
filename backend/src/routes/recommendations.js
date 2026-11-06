import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

export const recommendationsRouter = Router()

const TMDB = 'https://api.themoviedb.org/3'

// Decisión de diseño: géneros de TMDB (IDs de películas) para cada emoción
const GENEROS_POR_EMOCION = {
  neutral: [12, 35],
  happy: [35, 16],
  sad: [10751, 35],
  angry: [28, 12],
  fearful: [16, 10751],
  disgusted: [99, 18],
  surprised: [878, 9648],
}

// En series, TMDB usa otros IDs para algunos géneros
const GENEROS_TV = { 28: 10759, 12: 10759, 878: 10765 }

async function buscar(tipo, generos) {
  const params = new URLSearchParams({
    with_genres: generos.join('|'),
    language: 'es-MX',
    sort_by: 'popularity.desc',
    'vote_count.gte': '200',
  })
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(`${TMDB}/discover/${tipo}?${params}`, {
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        accept: 'application/json',
      },
    })
    if (!res.ok) throw new Error(`TMDB respondió ${res.status}`)
    const data = await res.json()
    if (!Array.isArray(data.results)) throw new Error('Respuesta TMDB inválida')
    return data.results.slice(0, 5)
  } finally {
    clearTimeout(timeout)
  }
}

function normalizar(mediaType, item) {
  const esPelicula = mediaType === 'MOVIE'
  const fecha = esPelicula ? item.release_date : item.first_air_date
  return {
    tmdbId: item.id,
    mediaType,
    title: esPelicula ? item.title : item.name,
    posterPath: item.poster_path ?? null,
    overview: item.overview ?? null,
    year: fecha ? Number(fecha.slice(0, 4)) : null,
    voteAverage: item.vote_average ?? null,
    genres: (item.genre_ids ?? []).map(String),
  }
}

recommendationsRouter.use(requireAuth)

// Devuelve recomendaciones para una emoción y guarda lo que se muestra
recommendationsRouter.get('/', async (req, res) => {
  const emocion = String(req.query.mood ?? '')
  const generos = GENEROS_POR_EMOCION[emocion]
  if (!generos) {
    return res.status(400).json({ error: 'Emoción no válida' })
  }

  const moodEntryId = req.query.moodId ? String(req.query.moodId) : null
  if (moodEntryId) {
    const existe = await prisma.moodEntry.findFirst({
      where: { id: moodEntryId, userId: req.user.id },
    })
    if (!existe) {
      return res.status(404).json({ error: 'Ánimo no encontrado' })
    }
  }

  if (!process.env.TMDB_API_KEY?.trim()) {
    return res.status(503).json({ error: 'Servicio de recomendaciones no configurado' })
  }

  const [peliculas, series] = await Promise.all([
    buscar('movie', generos),
    buscar('tv', [...new Set(generos.map((g) => GENEROS_TV[g] ?? g))]),
  ])

  const items = [
    ...peliculas.map((p) => normalizar('MOVIE', p)),
    ...series.map((s) => normalizar('TV', s)),
  ]

  // Solo guardamos lo que necesita el tablero
  if (items.length > 0) await prisma.recommendation.createMany({
    data: items.map((i) => ({
      userId: req.user.id,
      moodEntryId,
      tmdbId: i.tmdbId,
      mediaType: i.mediaType,
      title: i.title,
      genres: i.genres,
    })),
  })

  res.json(items)
})
