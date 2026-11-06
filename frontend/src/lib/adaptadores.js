// Convierte las respuestas del backend (nombres en inglés, como TMDB) a la
// forma que usan los componentes (la misma de los datos de ejemplo).

const IMAGENES_TMDB = 'https://image.tmdb.org/t/p/w500'

// Géneros de TMDB (películas y series) en español
export const NOMBRES_GENERO = {
  12: 'Aventura',
  14: 'Fantasía',
  16: 'Animación',
  18: 'Drama',
  27: 'Terror',
  28: 'Acción',
  35: 'Comedia',
  36: 'Historia',
  37: 'Western',
  53: 'Suspenso',
  80: 'Crimen',
  99: 'Documental',
  878: 'Ciencia ficción',
  9648: 'Misterio',
  10402: 'Música',
  10749: 'Romance',
  10751: 'Familia',
  10752: 'Bélica',
  10759: 'Acción y aventura',
  10762: 'Infantil',
  10765: 'Sci-Fi y fantasía',
  10768: 'Guerra y política',
}

function urlPoster(posterPath) {
  return posterPath ? `${IMAGENES_TMDB}${posterPath}` : null
}

// El id combina tipo e id de TMDB: una película y una serie pueden compartir número.
function idDe(mediaType, tmdbId) {
  return `${mediaType}-${tmdbId}`
}

// Una recomendación de GET /api/recommendations
export function tituloDesdeApi(item) {
  return {
    id: idDe(item.mediaType, item.tmdbId),
    tmdbId: item.tmdbId,
    mediaType: item.mediaType,
    titulo: item.title,
    tipo: item.mediaType === 'TV' ? 'serie' : 'pelicula',
    anio: item.year,
    calificacion: item.voteAverage ?? 0,
    sinopsis: item.overview || 'Sin sinopsis disponible.',
    generos: (item.genres ?? []).map((id) => NOMBRES_GENERO[id]).filter(Boolean),
    poster: urlPoster(item.posterPath),
    posterPath: item.posterPath,
  }
}

// Una favorita de GET /api/favorites (el backend guarda solo lo básico)
export function favoritaDesdeApi(favorita) {
  return {
    id: idDe(favorita.mediaType, favorita.tmdbId),
    favoritaId: favorita.id,
    tmdbId: favorita.tmdbId,
    mediaType: favorita.mediaType,
    titulo: favorita.title,
    tipo: favorita.mediaType === 'TV' ? 'serie' : 'pelicula',
    poster: urlPoster(favorita.posterPath),
    posterPath: favorita.posterPath,
    generos: [],
    guardadaEn: favorita.createdAt,
  }
}
