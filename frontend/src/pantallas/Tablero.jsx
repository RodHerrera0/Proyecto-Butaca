import { ChartColumn, ChartLine, ChartPie, Tags } from 'lucide-react'
import ChipAnimo from '../components/ChipAnimo.jsx'
import { EMOCIONES } from '../lib/emociones.js'
import './Tablero.css'

// Solo el layout: las gráficas llegarán cuando el backend entregue el historial.
const TARJETAS = [
  {
    id: 'tiempo',
    titulo: 'Tu ánimo en el tiempo',
    descripcion: 'Cómo te has sentido en cada visita.',
    Icono: ChartLine,
    ancha: true,
  },
  {
    id: 'emociones',
    titulo: 'Conteo por emoción',
    descripcion: 'Cuántas veces detectamos cada ánimo.',
    Icono: ChartColumn,
    leyenda: true,
  },
  {
    id: 'generos',
    titulo: 'Géneros más recomendados',
    descripcion: 'Los géneros que más te hemos sugerido.',
    Icono: Tags,
  },
  {
    id: 'tipos',
    titulo: 'Películas vs. series',
    descripcion: 'Qué tipo de título ves más.',
    Icono: ChartPie,
  },
]

export default function Tablero() {
  return (
    <div className="pagina tablero">
      <header>
        <h1 className="pagina-titulo">Tablero</h1>
        <p className="pagina-descripcion">Tu ánimo y tus recomendaciones de un vistazo.</p>
      </header>

      <div className="tablero__cuadricula">
        {TARJETAS.map(({ id, titulo, descripcion, Icono, ancha, leyenda }) => (
          <section
            key={id}
            className={`tablero__tarjeta tarjeta${ancha ? ' tablero__tarjeta--ancha' : ''}`}
            aria-labelledby={`tablero-${id}`}
          >
            <h2 id={`tablero-${id}`} className="tablero__titulo">
              {titulo}
            </h2>
            <p className="tablero__descripcion">{descripcion}</p>
            <div className="tablero__grafica">
              <Icono size={28} aria-hidden="true" />
              <p>Aquí irá la gráfica</p>
            </div>
            {leyenda && (
              <div className="tablero__leyenda">
                {Object.keys(EMOCIONES).map((emocion) => (
                  <ChipAnimo key={emocion} emocion={emocion} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
