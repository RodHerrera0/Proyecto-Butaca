import { Link } from 'react-router-dom'
import DetectorEmocion from '../components/DetectorEmocion.jsx'

export default function Deteccion({ animo, onAnimo, consentimiento }) {
  const usarCamara = consentimiento === 'aceptado'

  return (
    <>
      <h1>¿Cómo te sientes?</h1>
      {usarCamara && <p>Analizamos tu expresión un instante para recomendarte algo acorde a tu ánimo.</p>}
      {consentimiento === 'rechazado' && (
        <p>
          Elegiste no usar la cámara. Elige tu ánimo a mano. Si cambias de opinión, revisa el{' '}
          <Link to="/consentimiento">uso de la cámara</Link>.
        </p>
      )}
      {!consentimiento && (
        <p>
          Para usar la cámara primero debes aceptar el <Link to="/consentimiento">uso de la cámara</Link>. Mientras
          tanto, puedes elegir tu ánimo a mano.
        </p>
      )}
      <DetectorEmocion resultado={animo} onResultado={onAnimo} usarCamara={usarCamara} />
      {animo && (
        <p>
          <Link to="/recomendaciones">Ver recomendaciones</Link>
        </p>
      )}
    </>
  )
}
