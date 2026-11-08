// ⚠️ DATOS DE EJEMPLO ⚠️
// Tablero que se muestra sin sesión (modo demostración). Tiene la misma forma
// que la respuesta de GET /api/dashboard.

const EMOCIONES_EJEMPLO = [
  'happy',
  'neutral',
  'sad',
  'happy',
  'surprised',
  'happy',
  'angry',
  'neutral',
  'happy',
  'fearful',
  'happy',
  'surprised',
]

const HORA = 3600 * 1000

export const TABLERO_EJEMPLO = {
  historial: EMOCIONES_EJEMPLO.map((emocion, i) => ({
    emocion,
    confianza: 0.6 + ((i * 7) % 4) / 10,
    // Una visita cada día y medio, terminando hoy
    fecha: new Date(Date.now() - (EMOCIONES_EJEMPLO.length - 1 - i) * 36 * HORA).toISOString(),
  })),
  porEmocion: { happy: 5, neutral: 2, surprised: 2, sad: 1, angry: 1, fearful: 1 },
  porTipo: { MOVIE: 34, TV: 26 },
  porGenero: [
    { id: 35, nombre: 'Comedia', total: 22 },
    { id: 16, nombre: 'Animación', total: 14 },
    { id: 10751, nombre: 'Familia', total: 9 },
    { id: 12, nombre: 'Aventura', total: 7 },
    { id: 878, nombre: 'Ciencia ficción', total: 5 },
    { id: 9648, nombre: 'Misterio', total: 3 },
  ],
}
