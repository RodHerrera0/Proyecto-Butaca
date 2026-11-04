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
  const opciones = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })
  const resultado = await faceapi.detectSingleFace(video, opciones).withFaceExpressions()
  if (!resultado) return null
  return emocionDominante(resultado.expressions)
}
