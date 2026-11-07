import { prisma } from '../lib/prisma.js'

// Nombres de los géneros que usamos en las recomendaciones
const NOMBRES_GENERO = {
  12: 'Aventura',
  14: 'Fantasía',
  16: 'Animación',
  18: 'Drama',
  28: 'Acción',
  35: 'Comedia',
  99: 'Documental',
  878: 'Ciencia ficción',
  9648: 'Misterio',
  10751: 'Familia',
  10759: 'Acción y aventura',
  10762: 'Infantil',
  10765: 'Sci-Fi y fantasía',
}


// Datos para el tablero: historial de ánimos y conteos de emociones, tipos y géneros
export async function getDashboard(req, res) {
  const userId = req.user.id

  const [moods, recs] = await Promise.all([
    prisma.moodEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: { mood: true, confidence: true, createdAt: true },
    }),
    prisma.recommendation.findMany({
      where: { userId },
      select: { mediaType: true, genres: true },
    }),
  ])

  const porEmocion = {}
  for (const m of moods) {
    const clave = m.mood.toLowerCase()
    porEmocion[clave] = (porEmocion[clave] ?? 0) + 1
  }

  const porTipo = { MOVIE: 0, TV: 0 }
  const conteoGeneros = {}
  for (const r of recs) {
    porTipo[r.mediaType] += 1
    for (const g of r.genres) {
      conteoGeneros[g] = (conteoGeneros[g] ?? 0) + 1
    }
  }

  res.json({
    historial: moods.map((m) => ({
      emocion: m.mood.toLowerCase(),
      confianza: m.confidence,
      fecha: m.createdAt,
    })),
    porEmocion,
    porTipo,
    porGenero: Object.entries(conteoGeneros)
      .map(([id, total]) => ({
        id: Number(id),
        nombre: NOMBRES_GENERO[id] ?? 'Otro',
        total,
      }))
      .sort((a, b) => b.total - a.total),
  })
}
