import { ArrowRight, FlaskConical, Info } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import DetectorEmocion from '../components/DetectorEmocion.jsx'
import SelectorIntencion from '../components/SelectorIntencion.jsx'
import { animoSimulado } from '../lib/simulacion.js'
import './Deteccion.css'

export default function Deteccion({ animo, onAnimo, onResultado, consentimiento }) {
  const [parametros] = useSearchParams()
  const simular = parametros.get('simular')
  const simulado = animoSimulado(simular)
  // Con una emoción simulada la cámara nunca se enciende
  const usarCamara = consentimiento === 'aceptado' && !simulado

  useEffect(() => {
    const resultado = animoSimulado(simular)
    if (resultado) onAnimo({ ...resultado, intencion: 'mantener' })
  }, [simular, onAnimo])

  // Un nuevo resultado conserva lo que se eligió hacer con el ánimo
  function guardarResultado(resultado) {
    onResultado({ ...resultado, intencion: animo?.intencion ?? 'mantener' })
  }

  return (
    <div className="pagina deteccion">
      <title>¿Cómo te sientes? · Butaca</title>
      <header className="deteccion__cabecera">
        <p className="deteccion__etiqueta">Cabina de ánimo</p>
        <h1 className="pagina-titulo">¿Cómo te sientes?</h1>
        {usarCamara && (
          <p className="pagina-descripcion">
            Mira a la cámara (o pónganse todos, si ven en grupo) y presiona "Analizar". Solo vemos tu expresión un instante y la imagen nunca sale de tu
            dispositivo.
          </p>
        )}
      </header>

      {simulado && (
        <p className="deteccion__aviso" data-testid="aviso-simulacion">
          <FlaskConical size={18} aria-hidden="true" />
          <span>Modo de prueba: el ánimo es simulado y la cámara no se usa.</span>
        </p>
      )}
      {!simulado && consentimiento === 'rechazado' && (
        <p className="deteccion__aviso">
          <Info size={18} aria-hidden="true" />
          <span>
            Elegiste no usar la cámara. Elige tu ánimo a mano. Si cambias de opinión, revisa el{' '}
            <Link to="/consentimiento">uso de la cámara</Link>.
          </span>
        </p>
      )}
      {!simulado && !consentimiento && (
        <p className="deteccion__aviso">
          <Info size={18} aria-hidden="true" />
          <span>
            Para usar la cámara primero debes aceptar el <Link to="/consentimiento">uso de la cámara</Link>. Mientras
            tanto, puedes elegir tu ánimo a mano.
          </span>
        </p>
      )}

      <DetectorEmocion
        resultado={animo}
        onResultado={guardarResultado}
        usarCamara={usarCamara}
      />

      {animo && (
        <SelectorIntencion
          emocion={animo.emocion}
          intencion={animo.intencion}
          grupal={animo.origen === 'grupo' && animo.personas.length > 1}
          onCambiar={(intencion) => onAnimo({ ...animo, intencion })}
        />
      )}

      {animo && (
        <Link to="/recomendaciones" className="boton boton-primario deteccion__continuar">
          Ver recomendaciones <ArrowRight size={18} aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
