import { traducirEmocion } from '../lib/emociones.js'
import './ChipAnimo.css'

// Chip con el color de cada emoción. Si recibe onClick es un botón (filtro);
// si no, es solo una etiqueta. `emocion` puede ser 'todos' para el filtro general.
export default function ChipAnimo({ emocion, seleccionado = false, onClick, tamano = 'normal', children }) {
  const contenido = (
    <>
      <span className="chip-animo__punto" aria-hidden="true" />
      <span>{emocion === 'todos' ? 'Todos' : traducirEmocion(emocion)}</span>
      {children}
    </>
  )
  const clases = `chip-animo chip-animo--${tamano}`

  if (!onClick) {
    return (
      <span className={clases} data-emocion={emocion}>
        {contenido}
      </span>
    )
  }

  return (
    <button type="button" className={clases} data-emocion={emocion} aria-pressed={seleccionado} onClick={onClick}>
      {contenido}
    </button>
  )
}
