import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

const EMOCIONES = ['neutral', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised']

const moodSchema = z.object({
  mood: z.enum(EMOCIONES),
  // null cuando el usuario eligió el ánimo a mano
  confidence: z.number().min(0).max(1).nullable(),
})

// Guarda el ánimo detectado (o elegido a mano) para el usuario en sesión
export async function createMood(req, res) {
  const parsed = moodSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const entry = await prisma.moodEntry.create({
    data: {
      mood: parsed.data.mood.toUpperCase(),
      confidence: parsed.data.confidence,
      userId: req.user.id,
    },
  })
  res.status(201).json(entry)
}
