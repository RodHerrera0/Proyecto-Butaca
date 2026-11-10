// Elección de cámara: si hay una webcam externa conectada, se prefiere sobre
// la integrada de la laptop, y se recuerda la que el usuario elija a mano.

const CLAVE_GUARDADA = 'butaca-camara'

// Nombres típicos de las cámaras integradas (Windows, macOS, Linux, móviles)
const PATRON_INTEGRADA = /integrat|integrad|built-?in|internal|interna|facetime|front|frontal|user facing/i

export function esIntegrada(camara) {
  return PATRON_INTEGRADA.test(camara.etiqueta)
}

// Devuelve el deviceId de la cámara a usar: la guardada si sigue conectada;
// si no, la primera externa; si no hay externas, null (la que dé el navegador).
export function elegirCamaraPreferida(camaras, guardada = null) {
  if (guardada && camaras.some((camara) => camara.id === guardada)) return guardada
  return camaras.find((camara) => !esIntegrada(camara))?.id ?? null
}

export async function listarCamaras() {
  if (!navigator.mediaDevices?.enumerateDevices) return []
  try {
    const dispositivos = await navigator.mediaDevices.enumerateDevices()
    return dispositivos
      .filter((dispositivo) => dispositivo.kind === 'videoinput' && dispositivo.deviceId)
      .map((dispositivo, indice) => ({
        id: dispositivo.deviceId,
        etiqueta: dispositivo.label || `Cámara ${indice + 1}`,
      }))
  } catch {
    return []
  }
}

// deviceId de la cámara que está usando un stream (null si no se sabe)
export function camaraDeStream(stream) {
  return stream?.getVideoTracks?.()[0]?.getSettings?.().deviceId ?? null
}

export function leerCamaraGuardada() {
  try {
    return localStorage.getItem(CLAVE_GUARDADA)
  } catch {
    return null
  }
}

export function guardarCamara(id) {
  try {
    localStorage.setItem(CLAVE_GUARDADA, id)
  } catch {
    // Sin almacenamiento (modo privado): solo no se recuerda la elección
  }
}
