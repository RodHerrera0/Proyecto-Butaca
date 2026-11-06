import { CloudOff, FlaskConical, RefreshCw, ScanFace } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Barras, LineaAnimo, ReparticionTipo } from '../components/Graficas.jsx'
import Skeleton from '../components/Skeleton.jsx'
import { TABLERO_EJEMPLO } from '../data/mock-tablero.js'
import { obtenerTablero } from '../lib/api.js'
import { HAY_BACKEND } from '../lib/config.js'
import { EMOCIONES, traducirEmocion } from '../lib/emociones.js'
import './Tablero.css'

// Máximo de géneros que se muestran (los más recomendados)
const MAXIMO_GENEROS = 6

function Tarjeta({ id, titulo, descripcion, ancha = false, children }) {
  return (
    <section
      className={`tablero__tarjeta tarjeta${ancha ? ' tablero__tarjeta--ancha' : ''}`}
      aria-labelledby={`tablero-${id}`}
      data-testid={`grafica-${id}`}
    >
      <h2 id={`tablero-${id}`} className="tablero__titulo">
        {titulo}
      </h2>
      <p className="tablero__descripcion">{descripcion}</p>
      {children}
    </section>
  )
}

function Graficas({ datos }) {
  const emociones = Object.keys(EMOCIONES)
    .map((emocion) => ({
      clave: emocion,
      emocion,
      etiqueta: traducirEmocion(emocion),
      total: datos.porEmocion[emocion] ?? 0,
    }))
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total)
  const generos = datos.porGenero
    .slice(0, MAXIMO_GENEROS)
    .map((genero) => ({ clave: genero.id, etiqueta: genero.nombre, total: genero.total }))

  return (
    <div className="tablero__cuadricula">
      <Tarjeta id="tiempo" titulo="Tu ánimo en el tiempo" descripcion="Cómo te has sentido en cada visita." ancha>
        <LineaAnimo historial={datos.historial} />
      </Tarjeta>
      <Tarjeta id="emociones" titulo="Conteo por emoción" descripcion="Cuántas veces detectamos cada ánimo.">
        <Barras items={emociones} unidad="visitas" />
      </Tarjeta>
      <Tarjeta id="generos" titulo="Géneros más recomendados" descripcion="Los géneros que más te hemos sugerido.">
        {generos.length > 0 ? (
          <Barras items={generos} unidad="recomendaciones" />
        ) : (
          <p className="tablero__sin-datos">Todavía no hay recomendaciones.</p>
        )}
      </Tarjeta>
      <Tarjeta id="tipos" titulo="Películas vs. series" descripcion="Qué tipo de título te recomendamos más.">
        <ReparticionTipo porTipo={datos.porTipo} />
      </Tarjeta>
    </div>
  )
}

function Cargando() {
  return (
    <div className="tablero__cuadricula" aria-busy="true" data-testid="estado-cargando">
      <p className="solo-lectores" role="status">
        Cargando tu tablero…
      </p>
      {[true, false, false, false].map((ancha, i) => (
        <div key={i} className={`tablero__tarjeta tarjeta${ancha ? ' tablero__tarjeta--ancha' : ''}`}>
          <Skeleton forma="titulo" ancho="200px" />
          <Skeleton forma="texto" ancho="70%" />
          <Skeleton forma="texto" ancho="100%" alto={ancha ? '200px' : '120px'} />
        </div>
      ))}
    </div>
  )
}

// Con sesión muestra los datos reales de GET /api/dashboard; sin sesión, un ejemplo.
export default function Tablero({ token }) {
  const [respuesta, setRespuesta] = useState({ token: undefined, datos: null, error: false })
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    if (!token) return
    let activo = true
    obtenerTablero(token)
      .then((datos) => {
        if (activo) setRespuesta({ token, datos, error: false })
      })
      .catch(() => {
        if (activo) setRespuesta({ token, datos: null, error: true })
      })
    return () => {
      activo = false
    }
  }, [token, intento])

  function reintentar() {
    setRespuesta({ token: undefined, datos: null, error: false })
    setIntento((valor) => valor + 1)
  }

  let contenido
  if (!token) {
    contenido = (
      <>
        <p className="tablero__demo" data-testid="aviso-demo">
          <FlaskConical size={18} aria-hidden="true" />
          <span>
            Estos son datos de ejemplo.{' '}
            {HAY_BACKEND ? (
              <>
                <Link to="/login">Inicia sesión</Link> para ver tu propio historial.
              </>
            ) : (
              'Esta versión todavía no está conectada al servidor.'
            )}
          </span>
        </p>
        <Graficas datos={TABLERO_EJEMPLO} />
      </>
    )
  } else if (respuesta.token !== token) {
    contenido = <Cargando />
  } else if (respuesta.error) {
    contenido = (
      <div className="tablero__aviso tarjeta" role="status" data-testid="estado-error">
        <CloudOff size={32} aria-hidden="true" />
        <h2>No pudimos cargar tu tablero</h2>
        <p>Revisa tu conexión y vuelve a intentarlo.</p>
        <button type="button" className="boton boton-primario" onClick={reintentar}>
          <RefreshCw size={18} aria-hidden="true" /> Reintentar
        </button>
      </div>
    )
  } else if (respuesta.datos.historial.length === 0) {
    contenido = (
      <div className="tablero__aviso tarjeta" role="status" data-testid="estado-vacio">
        <ScanFace size={32} aria-hidden="true" />
        <h2>Tu tablero está vacío</h2>
        <p>Detecta tu ánimo y aquí verás cómo te has sentido y qué te recomendamos.</p>
        <Link to="/detectar" className="boton boton-primario">
          Detectar mi ánimo
        </Link>
      </div>
    )
  } else {
    contenido = <Graficas datos={respuesta.datos} />
  }

  return (
    <div className="pagina tablero">
      <header>
        <h1 className="pagina-titulo">Tablero</h1>
        <p className="pagina-descripcion">Tu ánimo y tus recomendaciones de un vistazo.</p>
      </header>
      {contenido}
    </div>
  )
}
