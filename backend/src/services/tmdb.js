const TMDB = 'https://api.themoviedb.org/3'

// Decisión de diseño: géneros de TMDB (IDs de películas) para cada emoción
const GENEROS_POR_EMOCION = {
  neutral: [12, 35],
  happy: [35, 16],
  sad: [10751, 35],
  angry: [28, 12],
  fearful: [16, 10751],
  disgusted: [35, 12],
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

export async function obtenerRecomendaciones(mood) {
  const generos = GENEROS_POR_EMOCION[mood]
  const [peliculas, series] = await Promise.all([
    buscar('movie', generos),
    buscar('tv', [...new Set(generos.map((g) => GENEROS_TV[g] ?? g))]),
  ])

  const items = [
    ...peliculas.map((p) => normalizar('MOVIE', p)),
    ...series.map((s) => normalizar('TV', s)),
  ]

  return items
}
