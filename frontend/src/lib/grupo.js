import { EMOCIONES, traducirEmocion } from './emociones.js'

// Combina el ánimo de varias personas en uno solo para todo el grupo.
// Es un voto ponderado: cada persona vota por su emoción dominante con el peso
// de su confianza. Gana la emoción con más peso; si empatan, la que tiene más
// personas y, al final, el orden de EMOCIONES.
// Recibe [{ emocion, confianza }] y devuelve { emocion, confianza, conteo }
// o null si no hay nadie. `confianza` es el promedio de quienes votaron por ella.
export function combinarAnimos(personas) {
  if (!personas?.length) return null

  const votos = {}
  for (const { emocion, confianza } of personas) {
    votos[emocion] ??= { peso: 0, personas: 0 }
    votos[emocion].peso += confianza ?? 1
    votos[emocion].personas += 1
  }

  const orden = Object.keys(EMOCIONES)
  const [ganadora] = Object.keys(votos).sort(
    (a, b) =>
      votos[b].peso - votos[a].peso ||
      votos[b].personas - votos[a].personas ||
      orden.indexOf(a) - orden.indexOf(b),
  )

  const conteo = {}
  for (const clave of Object.keys(votos)) conteo[clave] = votos[clave].personas

  return {
    emocion: ganadora,
    confianza: votos[ganadora].peso / votos[ganadora].personas,
    conteo,
  }
}

// Resume el conteo de un grupo: "2 Feliz, 1 Triste" (de más a menos personas).
export function resumirConteo(conteo) {
  return Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .map(([emocion, cantidad]) => `${cantidad} ${traducirEmocion(emocion)}`)
    .join(', ')
}

// Mensaje que acompaña al resultado del grupo en la cabina.
export function mensajeGrupo({ emocion, conteo }) {
  const total = Object.values(conteo).reduce((suma, n) => suma + n, 0)
  const nombre = traducirEmocion(emocion).toLowerCase()
  if (total === 1) return `Solo encontramos a una persona en la sala, con ánimo ${nombre}.`
  if (Object.keys(conteo).length === 1) {
    return `¡Todos en la sala coinciden! Ánimo ${nombre} para las ${total} personas.`
  }
  return `La sala está dividida (${resumirConteo(conteo)}). Elegimos lo que mejor le queda a todo el grupo: ${nombre}.`
}
