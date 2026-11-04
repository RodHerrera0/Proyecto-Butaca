import { ArrowRight, HeartHandshake, Shuffle } from 'lucide-react'
import { emocionObjetivo } from '../lib/emociones.js'
import ChipAnimo from './ChipAnimo.jsx'
import './SelectorIntencion.css'

// Después de detectar el ánimo, la persona decide si quiere recomendaciones
// que lo acompañen ('mantener') o que se lo cambien ('cambiar').
export default function SelectorIntencion({ emocion, intencion = 'mantener', onCambiar, grupal = false }) {
  const objetivo = emocionObjetivo(emocion, 'cambiar')

  return (
    <fieldset className="intencion">
      <legend className="intencion__pregunta">
        {grupal ? '¿Qué quieren hacer con su ánimo?' : '¿Qué quieres hacer con tu ánimo?'}
      </legend>
      <div className="intencion__opciones">
        <button
          type="button"
          className="intencion__opcion"
          aria-pressed={intencion === 'mantener'}
          onClick={() => onCambiar('mantener')}
        >
          <HeartHandshake size={22} aria-hidden="true" />
          <span className="intencion__titulo">Acompañarlo</span>
          <span className="intencion__detalle">Historias que van con cómo {grupal ? 'se sienten' : 'te sientes'}</span>
        </button>
        <button
          type="button"
          className="intencion__opcion"
          data-testid="intencion-cambiar"
          aria-pressed={intencion === 'cambiar'}
          onClick={() => onCambiar('cambiar')}
        >
          <Shuffle size={22} aria-hidden="true" />
          <span className="intencion__titulo">Cambiarlo</span>
          <span className="intencion__detalle">Historias para pasar a otro ánimo</span>
        </button>
      </div>
      {intencion === 'cambiar' && (
        <p className="intencion__ruta" data-testid="ruta-animo">
          <ChipAnimo emocion={emocion} />
          <ArrowRight size={18} aria-label="hacia" />
          <ChipAnimo emocion={objetivo} />
        </p>
      )}
    </fieldset>
  )
}
