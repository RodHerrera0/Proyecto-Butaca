import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Children, useCallback, useEffect, useId, useRef, useState } from 'react'
import './Carrusel.css'

function prefiereMenosMovimiento() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

// Fila horizontal con scroll suave. Las flechas solo se muestran en
// escritorio; en celular se desliza con el dedo.
export default function Carrusel({ titulo, children }) {
  const pistaRef = useRef(null)
  const idTitulo = useId()
  const [bordes, setBordes] = useState({ inicio: true, fin: false })

  const actualizarBordes = useCallback(() => {
    const pista = pistaRef.current
    if (!pista) return
    const max = pista.scrollWidth - pista.clientWidth
    setBordes({ inicio: pista.scrollLeft <= 4, fin: pista.scrollLeft >= max - 4 })
  }, [])

  useEffect(() => {
    actualizarBordes()
    if (typeof ResizeObserver === 'undefined') return
    const observador = new ResizeObserver(actualizarBordes)
    observador.observe(pistaRef.current)
    return () => observador.disconnect()
  }, [actualizarBordes])

  function desplazar(direccion) {
    const pista = pistaRef.current
    pista.scrollBy?.({
      left: direccion * pista.clientWidth * 0.85,
      behavior: prefiereMenosMovimiento() ? 'auto' : 'smooth',
    })
  }

  return (
    <section className="carrusel" aria-labelledby={idTitulo}>
      <div className="carrusel__cabecera">
        <h2 id={idTitulo} className="carrusel__titulo">
          {titulo}
        </h2>
        <div className="carrusel__flechas">
          <button
            type="button"
            className="carrusel__flecha"
            aria-label={`Ver anteriores en ${titulo}`}
            disabled={bordes.inicio}
            onClick={() => desplazar(-1)}
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="carrusel__flecha"
            aria-label={`Ver siguientes en ${titulo}`}
            disabled={bordes.fin}
            onClick={() => desplazar(1)}
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
      <ul className="carrusel__pista" ref={pistaRef} onScroll={actualizarBordes}>
        {Children.map(children, (hijo) => (
          <li className="carrusel__item">{hijo}</li>
        ))}
      </ul>
    </section>
  )
}
