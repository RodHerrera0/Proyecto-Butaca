import { Heart } from 'lucide-react'
import Calificacion from './Calificacion.jsx'
import Poster from './Poster.jsx'
import './PosterCard.css'

// Tarjeta de póster 2:3. En escritorio la información aparece al pasar el
// mouse (o al enfocar con teclado); en pantallas táctiles va siempre debajo.
// `pie` permite agregar una línea extra (por ejemplo, la fecha en Favoritas).
export default function PosterCard({ titulo, esFavorita = false, onToggleFavorita, pie }) {
  return (
    <article className="poster-card" data-testid="poster-card">
      <div className="poster-card__marco">
        <Poster titulo={titulo} />
        {onToggleFavorita && (
          <button
            type="button"
            className="poster-card__favorito boton-favorito"
            aria-pressed={esFavorita}
            aria-label={esFavorita ? `Quitar ${titulo.titulo} de favoritas` : `Agregar ${titulo.titulo} a favoritas`}
            onClick={() => onToggleFavorita(titulo)}
          >
            <Heart size={18} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="poster-card__info">
        <h3 className="poster-card__titulo">{titulo.titulo}</h3>
        <p className="poster-card__meta">
          <span>{titulo.anio}</span>
          <span aria-hidden="true">·</span>
          <span>{titulo.tipo === 'serie' ? 'Serie' : 'Película'}</span>
          <span aria-hidden="true">·</span>
          <Calificacion valor={titulo.calificacion} />
        </p>
        {pie && <p className="poster-card__pie">{pie}</p>}
      </div>
    </article>
  )
}
