import { ChevronDown, LogIn, LogOut, Moon, Sparkles, Sun, User } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useTema } from '../lib/tema.js'
import LogoButaca from './LogoButaca.jsx'
import './Header.css'

const BOLETOS = [
  { ruta: '/recomendaciones', texto: 'Inicio' },
  { ruta: '/favoritas', texto: 'Favoritas' },
  { ruta: '/tablero', texto: 'Tablero' },
]

// Placeholder: el usuario real llegará con el login de Supabase.
function MenuUsuario() {
  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef(null)
  const botonRef = useRef(null)
  const idMenu = useId()

  useEffect(() => {
    if (!abierto) return
    function alHacerClic(evento) {
      if (!contenedorRef.current?.contains(evento.target)) setAbierto(false)
    }
    function alPresionarTecla(evento) {
      if (evento.key === 'Escape') {
        setAbierto(false)
        botonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', alHacerClic)
    document.addEventListener('keydown', alPresionarTecla)
    return () => {
      document.removeEventListener('pointerdown', alHacerClic)
      document.removeEventListener('keydown', alPresionarTecla)
    }
  }, [abierto])

  return (
    <div className="menu-usuario" ref={contenedorRef}>
      <button
        ref={botonRef}
        type="button"
        className="menu-usuario__boton"
        aria-expanded={abierto}
        aria-controls={idMenu}
        aria-label="Menú de usuario"
        onClick={() => setAbierto((valor) => !valor)}
      >
        <span className="menu-usuario__avatar" aria-hidden="true">
          <User size={18} />
        </span>
        <ChevronDown className="menu-usuario__flecha" size={16} aria-hidden="true" />
      </button>
      {abierto && (
        <div id={idMenu} className="menu-usuario__panel">
          <p className="menu-usuario__nombre">Usuario invitado</p>
          <p className="menu-usuario__detalle">Inicia sesión para guardar tu historial.</p>
          <Link to="/login" className="menu-usuario__opcion" onClick={() => setAbierto(false)}>
            <LogIn size={16} aria-hidden="true" /> Iniciar sesión
          </Link>
          <button type="button" className="menu-usuario__opcion" disabled>
            <LogOut size={16} aria-hidden="true" /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

function BotonTema() {
  const { tema, alternarTema } = useTema()
  const etiqueta = tema === 'oscuro' ? 'Activar modo claro' : 'Activar modo oscuro'

  return (
    <button type="button" className="boton-tema" aria-label={etiqueta} title={etiqueta} onClick={alternarTema}>
      {tema === 'oscuro' ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
    </button>
  )
}

export default function Header() {
  const [solido, setSolido] = useState(false)

  useEffect(() => {
    function alHacerScroll() {
      setSolido(window.scrollY > 24)
    }
    alHacerScroll()
    window.addEventListener('scroll', alHacerScroll, { passive: true })
    return () => window.removeEventListener('scroll', alHacerScroll)
  }, [])

  return (
    <header className={`header${solido ? ' header--solido' : ''}`}>
      <div className="header__barra">
        <NavLink to="/" className="header__logo">
          <LogoButaca className="header__logo-icono" />
          <span>Butaca</span>
        </NavLink>

        <nav className="header__nav" aria-label="Principal">
          {BOLETOS.map(({ ruta, texto }) => (
            <NavLink key={ruta} to={ruta} className="boleto">
              {texto}
            </NavLink>
          ))}
        </nav>

        <NavLink to="/detectar" className="header__cta boton boton-primario">
          <Sparkles size={18} aria-hidden="true" />
          ¿Qué veo hoy?
        </NavLink>

        <div className="header__acciones">
          <BotonTema />
          <MenuUsuario />
        </div>
      </div>
    </header>
  )
}
