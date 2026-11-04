import { Heart, Info, Sparkles } from 'lucide-react'
import { useId, useState } from 'react'
import Calificacion from './Calificacion.jsx'
import Poster from './Poster.jsx'
import './Hero.css'

// Título destacado a lo ancho. `titulo.fondo` será la imagen horizontal de
// TMDB (backdrop); mientras no exista se usa el gradiente del póster.
export default function Hero({ titulo, etiqueta = 'Destacado para tu ánimo', esFavorita = false, onToggleFavorita }) {
  const [detalles, setDetalles] = useState(false)
  const idTitulo = useId()
  const idDetalles = useId()

  return (
    <section className="hero" aria-labelledby={idTitulo}>
      <div className="hero__fondo" aria-hidden="true">
        {titulo.fondo ? (
          <img src={titulo.fondo} alt="" />
        ) : (
          <div className="hero__fondo-placeholder">
            <Poster titulo={titulo} decorativo />
          </div>
        )}
      </div>

      <div className="hero__interior">
        <div className="hero__contenido">
          <p className="hero__etiqueta">
            <Sparkles size={16} aria-hidden="true" /> {etiqueta}
          </p>
          <h2 id={idTitulo} className="hero__titulo">
            {titulo.titulo}
          </h2>
          <p className="hero__meta">
            <span>{titulo.anio}</span>
            <span aria-hidden="true">·</span>
            <span>{titulo.tipo === 'serie' ? 'Serie' : 'Película'}</span>
            <span aria-hidden="true">·</span>
            <span>{titulo.generos.join(', ')}</span>
          </p>
          <Calificacion valor={titulo.calificacion} variante="estrellas" />
          <p id={idDetalles} className={`hero__sinopsis${detalles ? ' hero__sinopsis--completa' : ''}`}>
            {titulo.sinopsis}
          </p>
          <div className="hero__acciones">
            {onToggleFavorita && (
              <button
                type="button"
                className="boton boton-primario boton-favorito"
                aria-pressed={esFavorita}
                onClick={() => onToggleFavorita(titulo)}
              >
                <Heart size={18} aria-hidden="true" />
                {esFavorita ? 'En favoritas' : 'Agregar a favoritas'}
              </button>
            )}
            <button
              type="button"
              className="boton boton-secundario"
              aria-expanded={detalles}
              aria-controls={idDetalles}
              onClick={() => setDetalles((valor) => !valor)}
            >
              <Info size={18} aria-hidden="true" />
              {detalles ? 'Ver menos' : 'Ver detalles'}
            </button>
          </div>
        </div>

        <div className="hero__poster">
          <Poster titulo={titulo} />
        </div>
      </div>
    </section>
  )
}
