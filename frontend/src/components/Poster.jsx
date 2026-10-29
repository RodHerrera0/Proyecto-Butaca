import { Film, Tv } from 'lucide-react'
import './Poster.css'

const VARIANTES = 8

// Elige siempre el mismo gradiente para el mismo título.
function varianteDe(id) {
  let hash = 0
  for (const letra of String(id)) hash = (hash * 31 + letra.charCodeAt(0)) >>> 0
  return (hash % VARIANTES) + 1
}

// Muestra el póster real si hay URL (TMDB, más adelante) o un placeholder
// elegante con gradiente y el título. Con `decorativo` se oculta a lectores.
export default function Poster({ titulo, decorativo = false }) {
  const alt = decorativo ? '' : `Póster de ${titulo.titulo}`

  if (titulo.poster) {
    return <img className="poster" src={titulo.poster} alt={alt} loading="lazy" decoding="async" />
  }

  const Icono = titulo.tipo === 'serie' ? Tv : Film
  return (
    <div
      className="poster poster--placeholder"
      style={{ background: `var(--poster-${varianteDe(titulo.id)})` }}
      role={decorativo ? undefined : 'img'}
      aria-label={decorativo ? undefined : alt}
      aria-hidden={decorativo || undefined}
    >
      <Icono className="poster__icono" size={18} aria-hidden="true" />
      <span className="poster__titulo" aria-hidden="true">
        {titulo.titulo}
      </span>
      <span className="poster__pie" aria-hidden="true">
        {titulo.tipo === 'serie' ? 'Serie' : 'Película'} · {titulo.anio}
      </span>
    </div>
  )
}
