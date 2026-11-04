import { traducirEmocion } from '../lib/emociones.js'
import './ChipAnimo.css'

// Chip con el color de cada emoción. Si recibe onClick es un botón (filtro);
// si no, es solo una etiqueta. `emocion` puede ser 'todos' para el filtro general.
// `testId` se usa como data-testid (para las pruebas E2E).
export default function ChipAnimo({ emocion, seleccionado = false, onClick, tamano = 'normal', testId, children }) {
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
      <span className={clases} data-emocion={emocion} data-testid={testId}>
        {contenido}
      </span>
    )
  }

  return (
    <button
      type="button"
      className={clases}
      data-emocion={emocion}
      data-testid={testId}
      aria-pressed={seleccionado}
      onClick={onClick}
    >
      {contenido}
    </button>
  )
}
