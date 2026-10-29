import { useCallback, useEffect, useRef, useState } from 'react'
import { cargarModelos, detectarEmocion } from '../lib/detector.js'
import { EMOCIONES, formatearConfianza, traducirEmocion } from '../lib/emociones.js'

const MENSAJES_ERROR = {
  permiso:
    'No diste permiso para usar la cámara. Si cambias de opinión, habilítala en la configuración del navegador y vuelve a intentarlo.',
  'sin-camara': 'No encontramos una cámara en este dispositivo.',
  'camara-ocupada': 'La cámara está siendo usada por otra aplicación. Ciérrala y vuelve a intentarlo.',
  'sin-soporte': 'Este navegador no permite usar la cámara (la página debe abrirse con https o en localhost).',
  modelos: 'No se pudo cargar el detector de emociones. Revisa tu conexión y vuelve a intentarlo.',
  'sin-rostro': 'No detectamos un rostro. Busca buena luz, mira de frente a la cámara y vuelve a intentarlo.',
  analisis: 'Ocurrió un error al analizar la imagen. Vuelve a intentarlo.',
}

function tipoErrorCamara(error) {
  switch (error?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'permiso'
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'sin-camara'
    case 'NotReadableError':
    case 'AbortError':
      return 'camara-ocupada'
    default:
      return 'permiso'
  }
}

// Fases: 'cargando' (modelos y cámara) → 'lista' → 'analizando' → 'terminado' | 'error'
// Sin `usarCamara` (no se aceptó el consentimiento) la fase es 'manual' y la
// cámara nunca se enciende.
export default function DetectorEmocion({ resultado, onResultado, usarCamara = false }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  // Cada intento de encender la cámara tiene un número; si cambia mientras
  // esperamos (por ejemplo, el componente se desmontó), se descarta ese stream.
  const intentoRef = useRef(0)
  const [fase, setFase] = useState(usarCamara ? 'cargando' : 'manual')
  const [error, setError] = useState(null)

  const apagarCamara = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  const encenderCamara = useCallback(async () => {
    const intento = ++intentoRef.current

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('sin-soporte')
      setFase('error')
      return
    }

    try {
      await cargarModelos()
    } catch {
      if (intento !== intentoRef.current) return
      setError('modelos')
      setFase('error')
      return
    }
    if (intento !== intentoRef.current) return

    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
    } catch (e) {
      if (intento !== intentoRef.current) return
      setError(tipoErrorCamara(e))
      setFase('error')
      return
    }
    if (intento !== intentoRef.current) {
      stream.getTracks().forEach((track) => track.stop())
      return
    }

    streamRef.current = stream
    const video = videoRef.current
    video.srcObject = stream
    try {
      await video.play()
    } catch {
      // Algunos navegadores rechazan play() si se interrumpe; el autoPlay lo retoma.
    }
    if (intento === intentoRef.current) setFase('lista')
  }, [])

  useEffect(() => {
    if (!usarCamara) return
    encenderCamara()
    return () => {
      intentoRef.current++
      apagarCamara()
    }
  }, [usarCamara, encenderCamara, apagarCamara])

  function reintentar() {
    setError(null)
    setFase('cargando')
    encenderCamara()
  }

  async function analizar() {
    setFase('analizando')
    let detectado
    try {
      detectado = await detectarEmocion(videoRef.current)
    } catch {
      apagarCamara()
      setError('analisis')
      setFase('error')
      return
    }
    // La cámara se apaga apenas termina el análisis, se haya encontrado rostro o no.
    apagarCamara()
    if (!detectado) {
      setError('sin-rostro')
      setFase('error')
      return
    }
    onResultado({ ...detectado, origen: 'camara' })
    setFase('terminado')
  }

  function elegirManual(evento) {
    const emocion = evento.target.value
    if (!emocion) return
    intentoRef.current++
    apagarCamara()
    setError(null)
    setFase(usarCamara ? 'terminado' : 'manual')
    onResultado({ emocion, confianza: null, origen: 'manual' })
  }

  const camaraVisible = fase === 'lista' || fase === 'analizando'

  return (
    <section className="detector">
      {usarCamara && (
        <video
          ref={videoRef}
          className="detector-video"
          hidden={!camaraVisible}
          autoPlay
          muted
          playsInline
        />
      )}

      {fase === 'cargando' && <p>Preparando la cámara y el detector…</p>}

      {camaraVisible && (
        <button type="button" data-testid="boton-analizar" onClick={analizar} disabled={fase === 'analizando'}>
          {fase === 'analizando' ? 'Analizando…' : 'Analizar'}
        </button>
      )}

      {error && (
        <p className="detector-error" role="alert">
          {MENSAJES_ERROR[error]} También puedes elegir tu ánimo a mano.
        </p>
      )}

      {usarCamara && (fase === 'terminado' || fase === 'error') && (
        <button type="button" onClick={reintentar}>
          {fase === 'error' ? 'Intentar de nuevo' : 'Volver a usar la cámara'}
        </button>
      )}

      {resultado && (
        <p className="detector-resultado" data-testid="resultado-emocion">
          {resultado.origen === 'camara'
            ? `Emoción detectada: ${traducirEmocion(resultado.emocion)} (${formatearConfianza(resultado.confianza)})`
            : `Ánimo elegido a mano: ${traducirEmocion(resultado.emocion)}`}
        </p>
      )}

      <label className="detector-manual">
        Elegir mi ánimo a mano:{' '}
        <select
          data-testid="selector-animo-manual"
          value={resultado?.origen === 'manual' ? resultado.emocion : ''}
          onChange={elegirManual}
        >
          <option value="">— Selecciona —</option>
          {Object.entries(EMOCIONES).map(([clave, nombre]) => (
            <option key={clave} value={clave}>
              {nombre}
            </option>
          ))}
        </select>
      </label>
    </section>
  )
}
