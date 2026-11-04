import { emocionDominante } from './emociones.js'

// Los modelos se sirven desde frontend/public/models (no se piden a ningún CDN).
const RUTA_MODELOS = '/models'

let promesaFaceApi = null

// Carga face-api (import dinámico para no inflar el bundle inicial) y los dos
// modelos que usamos. Se hace una sola vez; si falla, se permite reintentar.
export function cargarModelos() {
  if (!promesaFaceApi) {
    promesaFaceApi = (async () => {
      const faceapi = await import('@vladmandic/face-api')
      await faceapi.tf.ready()
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(RUTA_MODELOS),
        faceapi.nets.faceExpressionNet.loadFromUri(RUTA_MODELOS),
      ])
      return faceapi
    })().catch((error) => {
      promesaFaceApi = null
      throw error
    })
  }
  return promesaFaceApi
}

// Analiza el cuadro actual del <video> en memoria. No se dibuja ni se guarda
// ninguna imagen: face-api solo devuelve las probabilidades de cada expresión.
// Devuelve { emocion, confianza } o null si no encontró un rostro.
export async function detectarEmocion(video) {
  const faceapi = await cargarModelos()
  const resultado = await faceapi.detectSingleFace(video, opcionesDetector(faceapi)).withFaceExpressions()
  if (!resultado) return null
  return emocionDominante(resultado.expressions)
}

// Máximo de personas que se cuentan en el modo grupo.
export const MAXIMO_PERSONAS = 6

// Modo grupo: analiza todas las caras del cuadro actual, igual que arriba sin
// guardar ninguna imagen. Devuelve [{ emocion, confianza }] ordenado de
// izquierda a derecha tal como se ve en la pantalla (el video está en espejo).
export async function detectarAnimosGrupo(video) {
  const faceapi = await cargarModelos()
  const resultados = await faceapi.detectAllFaces(video, opcionesDetector(faceapi)).withFaceExpressions()
  return resultados
    .sort((a, b) => b.detection.box.x - a.detection.box.x)
    .slice(0, MAXIMO_PERSONAS)
    .map((resultado) => emocionDominante(resultado.expressions))
    .filter(Boolean)
}

function opcionesDetector(faceapi) {
  return new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })
}
