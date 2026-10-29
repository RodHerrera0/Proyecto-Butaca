import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import LogoButaca from '../components/LogoButaca.jsx'
import PosterCard from '../components/PosterCard.jsx'
import './Favoritas.css'

const formatoFecha = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' })

function SalaVacia() {
  return (
    <div className="favoritas__vacio">
      {/* Ilustración: una fila de butacas vacías bajo un foco */}
      <div className="favoritas__ilustracion" aria-hidden="true">
        <span className="favoritas__foco" />
        <LogoButaca tamano={56} className="favoritas__butaca" />
        <LogoButaca tamano={72} className="favoritas__butaca favoritas__butaca--centro" />
        <LogoButaca tamano={56} className="favoritas__butaca" />
      </div>
      <h2>Todavía no guardaste nada</h2>
      <p>Toca el corazón en cualquier película o serie y la guardamos aquí, en tu fila reservada.</p>
      <Link to="/recomendaciones" className="boton boton-primario">
        <Compass size={18} aria-hidden="true" /> Explorar recomendaciones
      </Link>
    </div>
  )
}

export default function Favoritas({ favoritas = [], onToggleFavorita }) {
  return (
    <div className="pagina favoritas">
      <header className="favoritas__cabecera">
        <h1 className="pagina-titulo">Favoritas</h1>
        {favoritas.length > 0 && (
          <p className="pagina-descripcion">
            {favoritas.length === 1 ? '1 título guardado' : `${favoritas.length} títulos guardados`}
          </p>
        )}
      </header>

      {favoritas.length === 0 ? (
        <SalaVacia />
      ) : (
        <ul className="favoritas__cuadricula">
          {favoritas.map((titulo) => (
            <li key={titulo.id}>
              <PosterCard
                titulo={titulo}
                esFavorita
                onToggleFavorita={onToggleFavorita}
                pie={titulo.guardadaEn && `Guardada el ${formatoFecha.format(new Date(titulo.guardadaEn))}`}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
