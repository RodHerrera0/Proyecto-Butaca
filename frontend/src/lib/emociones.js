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

// Mensaje cálido que acompaña al resultado en la cabina de detección.
export const MENSAJES_ANIMO = {
  neutral: 'Hoy te vemos con calma. Te encontramos algo para disfrutar sin prisa.',
  happy: 'Parece que hoy estás feliz, te encontramos algo para seguir así.',
  sad: 'Parece que hoy es un día gris. Tenemos historias que abrazan.',
  angry: 'Parece que algo te molesta hoy. Va algo de acción para soltar la tensión.',
  fearful: 'Parece que hoy algo te inquieta. Vamos con algo ligero y reconfortante.',
  disgusted: 'Parece que algo no te cayó bien hoy. Te proponemos cambiar de aire.',
  surprised: 'Parece que algo te sorprendió hoy. Sigamos con historias llenas de giros.',
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

// "Cambiar el ánimo": hacia qué emoción apuntan las recomendaciones cuando la
// persona no quiere quedarse como está. Se inspira en la regulación emocional:
// de la tristeza o el miedo a algo alegre, del enojo a la calma, etc.
export const EMOCION_PARA_CAMBIAR = {
  neutral: 'surprised',
  happy: 'surprised',
  sad: 'happy',
  angry: 'neutral',
  fearful: 'happy',
  disgusted: 'happy',
  surprised: 'neutral',
}

// Emoción con la que se filtran las recomendaciones según lo que se quiera
// hacer con el ánimo: 'mantener' (acompañarlo) o 'cambiar'.
export function emocionObjetivo(emocion, intencion = 'mantener') {
  if (intencion === 'cambiar') return EMOCION_PARA_CAMBIAR[emocion] ?? emocion
  return emocion
}
