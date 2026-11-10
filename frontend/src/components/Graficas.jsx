import { EMOCIONES, formatearConfianza, traducirEmocion } from '../lib/emociones.js'
import './Graficas.css'

const formatoCorto = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' })
const formatoLargo = new Intl.DateTimeFormat('es', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

// Máximo de visitas que se dibujan en la línea de tiempo (las más recientes)
const MAXIMO_VISITAS = 30

function describirVisita(visita) {
  const confianza = visita.confianza != null ? formatearConfianza(visita.confianza) : 'elegido a mano'
  return `${traducirEmocion(visita.emocion)} · ${formatoLargo.format(new Date(visita.fecha))} · ${confianza}`
}

// Ánimo en el tiempo: una fila por emoción (con su nombre, así el color nunca es
// la única pista) y un punto por visita, de la más antigua a la más reciente.
export function LineaAnimo({ historial }) {
  const visitas = historial.slice(-MAXIMO_VISITAS)
  const posicion = (i) => (visitas.length === 1 ? 50 : (i / (visitas.length - 1)) * 100)

  return (
    <figure className="grafica linea-animo">
      <div className="linea-animo__filas" aria-hidden="true">
        {Object.keys(EMOCIONES).map((emocion) => (
          <div key={emocion} className="linea-animo__fila">
            <span className="linea-animo__etiqueta">{traducirEmocion(emocion)}</span>
            <span className="linea-animo__pista">
              {visitas.map((visita, i) =>
                visita.emocion === emocion ? (
                  <span
                    key={i}
                    className="linea-animo__punto"
                    data-emocion={emocion}
                    style={{ left: `${posicion(i)}%` }}
                    title={describirVisita(visita)}
                  />
                ) : null,
              )}
            </span>
          </div>
        ))}
      </div>
      <figcaption className="linea-animo__eje" aria-hidden="true">
        <span>{formatoCorto.format(new Date(visitas[0].fecha))}</span>
        <span>{formatoCorto.format(new Date(visitas.at(-1).fecha))}</span>
      </figcaption>
      {/* Versión en texto para lectores de pantalla */}
      <ol className="solo-lectores">
        {visitas.map((visita, i) => (
          <li key={i}>{describirVisita(visita)}</li>
        ))}
      </ol>
    </figure>
  )
}

// Barras horizontales con el nombre y el valor siempre visibles.
// `items`: [{ clave, etiqueta, total, emocion? }]. Con `emocion` la barra toma su color.
export function Barras({ items, unidad }) {
  const maximo = Math.max(...items.map((item) => item.total), 1)
  return (
    <ul className="grafica barras">
      {items.map((item) => (
        <li key={item.clave} className="barras__fila" title={`${item.etiqueta}: ${item.total} ${unidad}`}>
          <span className="barras__etiqueta">{item.etiqueta}</span>
          <span className="barras__pista" aria-hidden="true">
            <span
              className="barras__barra"
              data-emocion={item.emocion}
              style={{ width: `${Math.max((item.total / maximo) * 100, 2)}%` }}
            />
          </span>
          <span className="barras__valor">{item.total}</span>
        </li>
      ))}
    </ul>
  )
}

// Películas vs. series: dos porcentajes grandes y una barra repartida.
export function ReparticionTipo({ porTipo }) {
  const total = porTipo.MOVIE + porTipo.TV
  const porcentaje = (n) => (total === 0 ? 0 : Math.round((n / total) * 100))
  const partes = [
    { clave: 'MOVIE', etiqueta: 'Películas', total: porTipo.MOVIE },
    { clave: 'TV', etiqueta: 'Series', total: porTipo.TV },
  ]

  return (
    <figure className="grafica reparticion">
      <div className="reparticion__numeros">
        {partes.map((parte) => (
          <p key={parte.clave} className="reparticion__numero" data-tipo={parte.clave}>
            <span className="reparticion__cifra">{porcentaje(parte.total)}%</span>
            <span className="reparticion__etiqueta">
              <span className="reparticion__muestra" aria-hidden="true" />
              {parte.etiqueta} ({parte.total})
            </span>
          </p>
        ))}
      </div>
      <div className="reparticion__barra" aria-hidden="true">
        {partes.map((parte) =>
          parte.total > 0 ? (
            <span
              key={parte.clave}
              className="reparticion__parte"
              data-tipo={parte.clave}
              style={{ flexGrow: parte.total }}
              title={`${parte.etiqueta}: ${parte.total}`}
            />
          ) : null,
        )}
      </div>
    </figure>
  )
}
