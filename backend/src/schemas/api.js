import { z } from 'zod'

export const recommendationsQuerySchema = z.object({
  mood: z.enum(['neutral', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised']),
  moodId: z.uuid().optional(),
})

export const favoriteParamsSchema = z.object({
  id: z.string().min(1),
})
