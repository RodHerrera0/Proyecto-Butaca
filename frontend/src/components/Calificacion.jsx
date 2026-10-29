import { Star, StarHalf } from 'lucide-react'
import './Calificacion.css'

// Calificación de TMDB (0 a 10). 'compacta' muestra una estrella y el número;
// 'estrellas' la convierte a 5 estrellas con medias.
export default function Calificacion({ valor, variante = 'compacta' }) {
  const etiqueta = `Calificación ${valor.toFixed(1)} de 10`

  if (variante === 'compacta') {
    return (
      <span className="calificacion" aria-label={etiqueta} role="img">
        <Star className="calificacion__estrella" size={14} aria-hidden="true" />
        {valor.toFixed(1)}
      </span>
    )
  }

  const medias = Math.round(valor) // 0..10 medias estrellas
  return (
    <span className="calificacion calificacion--estrellas" aria-label={etiqueta} role="img">
      {Array.from({ length: 5 }, (_, i) => {
        const llenas = medias - i * 2
        if (llenas >= 2) return <Star key={i} className="calificacion__estrella" size={18} aria-hidden="true" />
        if (llenas === 1) return <StarHalf key={i} className="calificacion__estrella" size={18} aria-hidden="true" />
        return <Star key={i} className="calificacion__estrella calificacion__estrella--vacia" size={18} aria-hidden="true" />
      })}
      <span className="calificacion__numero">{valor.toFixed(1)}</span>
    </span>
  )
}
