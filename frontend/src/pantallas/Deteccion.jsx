import { ArrowRight, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import DetectorEmocion from '../components/DetectorEmocion.jsx'
import './Deteccion.css'

export default function Deteccion({ animo, onAnimo, consentimiento }) {
  const usarCamara = consentimiento === 'aceptado'

  return (
    <div className="pagina deteccion">
      <header className="deteccion__cabecera">
        <p className="deteccion__etiqueta">Cabina de ánimo</p>
        <h1 className="pagina-titulo">¿Cómo te sientes?</h1>
        {usarCamara && (
          <p className="pagina-descripcion">
            Mira a la cámara y presiona "Analizar". Solo vemos tu expresión un instante y la imagen nunca sale de tu
            dispositivo.
          </p>
        )}
      </header>

      {consentimiento === 'rechazado' && (
        <p className="deteccion__aviso">
          <Info size={18} aria-hidden="true" />
          <span>
            Elegiste no usar la cámara. Elige tu ánimo a mano. Si cambias de opinión, revisa el{' '}
            <Link to="/consentimiento">uso de la cámara</Link>.
          </span>
        </p>
      )}
      {!consentimiento && (
        <p className="deteccion__aviso">
          <Info size={18} aria-hidden="true" />
          <span>
            Para usar la cámara primero debes aceptar el <Link to="/consentimiento">uso de la cámara</Link>. Mientras
            tanto, puedes elegir tu ánimo a mano.
          </span>
        </p>
      )}

      <DetectorEmocion resultado={animo} onResultado={onAnimo} usarCamara={usarCamara} />

      {animo && (
        <Link to="/recomendaciones" className="boton boton-primario deteccion__continuar">
          Ver recomendaciones <ArrowRight size={18} aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
