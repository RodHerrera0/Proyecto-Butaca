import { API_URL } from './config.js'

export class ErrorApi extends Error {
  constructor(estado, mensaje) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.estado = estado
  }
}

// Llama al backend con el token de Supabase. Nunca se envían imágenes:
// solo la emoción, la confianza y los datos de las favoritas.
async function pedir(ruta, { token, metodo = 'GET', cuerpo } = {}) {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(cuerpo && { 'Content-Type': 'application/json' }),
    },
    body: cuerpo && JSON.stringify(cuerpo),
  })
  if (!respuesta.ok) {
    const datos = await respuesta.json().catch(() => ({}))
    throw new ErrorApi(respuesta.status, typeof datos.error === 'string' ? datos.error : 'Error del servidor')
  }
  return respuesta.status === 204 ? null : respuesta.json()
}

// confianza es null cuando el ánimo se eligió a mano
export function registrarAnimo(token, { emocion, confianza }) {
  return pedir('/api/moods', { token, metodo: 'POST', cuerpo: { mood: emocion, confidence: confianza } })
}

export function obtenerRecomendaciones(token, { emocion, registroId }) {
  const parametros = new URLSearchParams({ mood: emocion })
  if (registroId) parametros.set('moodId', registroId)
  return pedir(`/api/recommendations?${parametros}`, { token })
}

export function listarFavoritas(token) {
  return pedir('/api/favorites', { token })
}

export function agregarFavorita(token, { tmdbId, mediaType, title, posterPath }) {
  return pedir('/api/favorites', { token, metodo: 'POST', cuerpo: { tmdbId, mediaType, title, posterPath } })
}

export function quitarFavorita(token, favoritaId) {
  return pedir(`/api/favorites/${encodeURIComponent(favoritaId)}`, { token, metodo: 'DELETE' })
}

export function obtenerTablero(token) {
  return pedir('/api/dashboard', { token })
}
