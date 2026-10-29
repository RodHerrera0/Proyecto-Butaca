// Las 7 expresiones que devuelve face-api, con su nombre en español.
// El orden es el que se muestra en el selector manual.
export const EMOCIONES = {
  neutral: 'Neutral',
  happy: 'Feliz',
  sad: 'Triste',
  angry: 'Enojado',
  fearful: 'Miedo',
  disgusted: 'Asco',
  surprised: 'Sorpresa',
}

export function traducirEmocion(clave) {
  return EMOCIONES[clave] ?? clave
}

// Recibe el objeto de probabilidades de face-api ({ happy: 0.9, sad: 0.01, ... })
// y devuelve la emoción con mayor probabilidad y su confianza (0 a 1).
export function emocionDominante(expresiones) {
  let emocion = null
  let confianza = -1
  for (const clave of Object.keys(EMOCIONES)) {
    const valor = expresiones?.[clave]
    if (typeof valor === 'number' && valor > confianza) {
      emocion = clave
      confianza = valor
    }
  }
  if (emocion === null) return null
  return { emocion, confianza }
}

export function formatearConfianza(confianza) {
  return `${Math.round(confianza * 100)}%`
}
