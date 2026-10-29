import { Link } from 'react-router-dom'
import DetectorEmocion from '../components/DetectorEmocion.jsx'

export default function Deteccion({ animo, onAnimo }) {
  return (
    <>
      <h1>¿Cómo te sientes?</h1>
      <p>Analizamos tu expresión un instante para recomendarte algo acorde a tu ánimo.</p>
      <DetectorEmocion resultado={animo} onResultado={onAnimo} />
      {animo && (
        <p>
          <Link to="/recomendaciones">Ver recomendaciones</Link>
        </p>
      )}
    </>
  )
}
