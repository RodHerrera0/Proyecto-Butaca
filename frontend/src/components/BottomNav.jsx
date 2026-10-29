import { ChartColumn, Heart, House, ScanFace, ShieldCheck } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import './BottomNav.css'

const ENLACES = [
  { ruta: '/recomendaciones', texto: 'Inicio', Icono: House },
  { ruta: '/favoritas', texto: 'Favoritas', Icono: Heart },
  { ruta: '/detectar', texto: 'Detectar', Icono: ScanFace, destacado: true },
  { ruta: '/tablero', texto: 'Tablero', Icono: ChartColumn },
  { ruta: '/consentimiento', texto: 'Privacidad', Icono: ShieldCheck },
]

// Barra inferior tipo app, solo en celular. Detectar va resaltado al centro.
export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegación inferior">
      {ENLACES.map(({ ruta, texto, Icono, destacado }) => (
        <NavLink key={ruta} to={ruta} className={`bottom-nav__enlace${destacado ? ' bottom-nav__enlace--destacado' : ''}`}>
          <span className="bottom-nav__icono">
            <Icono size={destacado ? 26 : 22} aria-hidden="true" />
          </span>
          <span className="bottom-nav__texto">{texto}</span>
        </NavLink>
      ))}
    </nav>
  )
}
