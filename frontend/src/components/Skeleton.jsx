import './Skeleton.css'

// Bloque de carga con brillo animado. Es decorativo: quien lo use debe
// anunciar "Cargando…" a lectores de pantalla (por ejemplo con aria-busy).
export default function Skeleton({ forma = 'bloque', ancho, alto, className = '' }) {
  return (
    <span
      className={`skeleton skeleton--${forma} ${className}`}
      style={{ width: ancho, height: alto }}
      aria-hidden="true"
    />
  )
}
