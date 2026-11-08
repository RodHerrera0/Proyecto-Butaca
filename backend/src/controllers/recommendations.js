import { prisma } from '../lib/prisma.js'
import { recommendationsQuerySchema } from '../schemas/api.js'
import { obtenerRecomendaciones } from '../services/tmdb.js'

export async function getRecommendations(req, res) {
  const parsed = recommendationsQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    const error = parsed.error.issues.some((issue) => issue.path[0] === 'mood')
      ? 'Emoción no válida' : parsed.error.flatten()
    return res.status(400).json({ error })
  }

  const moodEntryId = parsed.data.moodId ?? null
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

  const items = await obtenerRecomendaciones(parsed.data.mood)

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
}
