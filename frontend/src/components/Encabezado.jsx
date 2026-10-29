import { NavLink } from 'react-router-dom'

const ENLACES = [
  { ruta: '/consentimiento', texto: 'Consentimiento' },
  { ruta: '/detectar', texto: 'Detectar ánimo' },
  { ruta: '/recomendaciones', texto: 'Recomendaciones' },
  { ruta: '/favoritas', texto: 'Favoritas' },
  { ruta: '/tablero', texto: 'Tablero' },
]

export default function Encabezado() {
  return (
    <header className="encabezado">
      <NavLink to="/" className="encabezado-logo">
        Butaca
      </NavLink>
      <nav>
        {ENLACES.map(({ ruta, texto }) => (
          <NavLink key={ruta} to={ruta}>
            {texto}
          </NavLink>
        ))}
      </nav>
      {/* Placeholder: el usuario real llegará con el login de Supabase. */}
      <div className="encabezado-usuario">
        <span>Usuario invitado</span>
        <button type="button" disabled>
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}
