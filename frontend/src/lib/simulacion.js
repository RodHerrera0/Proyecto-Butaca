import { EMOCIONES } from './emociones.js'
import { combinarAnimos } from './grupo.js'

// Grupo fijo para /detectar?simular=grupo: 2 personas felices y 1 triste.
const PERSONAS_SIMULADAS = [
  { emocion: 'happy', confianza: 0.9 },
  { emocion: 'sad', confianza: 0.7 },
  { emocion: 'happy', confianza: 0.8 },
]

// Modo de emoción simulada para las pruebas E2E (no hay cámara en CI).
// /detectar?simular=happy (o cualquier clave de EMOCIONES) da ese ánimo y
// /detectar?simular=grupo da el grupo de arriba, sin encender la cámara.
// Devuelve el resultado como lo daría el detector, o null si el valor no es válido.
export function animoSimulado(valor) {
  if (valor === 'grupo') {
    return { ...combinarAnimos(PERSONAS_SIMULADAS), personas: PERSONAS_SIMULADAS, origen: 'grupo', simulado: true }
  }
  if (valor && Object.hasOwn(EMOCIONES, valor)) {
    return { emocion: valor, confianza: 0.9, origen: 'camara', simulado: true }
  }
  return null
}
