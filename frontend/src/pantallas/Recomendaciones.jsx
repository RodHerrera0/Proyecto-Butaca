import { CloudOff, FlaskConical, Popcorn, RefreshCw, Ticket } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Carrusel from '../components/Carrusel.jsx'
import ChipAnimo from '../components/ChipAnimo.jsx'
import Hero from '../components/Hero.jsx'
import PosterCard from '../components/PosterCard.jsx'
import Skeleton from '../components/Skeleton.jsx'
import { FILAS_MOCK, obtenerTitulosMock } from '../data/mock-titulos.js'
import { tituloDesdeApi } from '../lib/adaptadores.js'
import { obtenerRecomendaciones } from '../lib/api.js'
import { HAY_BACKEND } from '../lib/config.js'
import { EMOCIONES, emocionObjetivo, traducirEmocion } from '../lib/emociones.js'
import { resumirConteo } from '../lib/grupo.js'
import './Recomendaciones.css'

const FILTROS = ['todos', ...Object.keys(EMOCIONES)]
// Con datos reales cada chip pide al backend las recomendaciones de esa emoción,
// así que no existe "Todos".
const FILTROS_REALES = Object.keys(EMOCIONES)
const EMOCION_INICIAL_REAL = 'happy'

function porCalificacion(a, b) {
  return b.calificacion - a.calificacion
}

function tituloFilaAnimo(filtro, animo, objetivo) {
  const esGrupo = animo?.origen === 'grupo' && animo.personas.length > 1
  if (filtro === 'todos') return esGrupo ? 'Para ver en grupo' : 'Para tu ánimo de hoy'
  if (animo?.intencion === 'cambiar' && filtro === objetivo) {
    return `${esGrupo ? 'Para cambiar el ánimo del grupo' : 'Para cambiarte el ánimo'} · ${traducirEmocion(filtro)}`
  }
  return `${esGrupo ? 'Para ver en grupo' : 'Para tu ánimo de hoy'} · ${traducirEmocion(filtro)}`
}

// Resumen de la "función" de hoy: cuántas personas, cómo están y hacia dónde
// apuntan las recomendaciones.
function ResumenFuncion({ animo, objetivo }) {
  const esGrupo = animo.origen === 'grupo' && animo.personas.length > 1
  const quien = esGrupo
    ? `Función para ${animo.personas.length} personas (${resumirConteo(animo.conteo)})`
    : `Hoy te sientes ${traducirEmocion(animo.emocion).toLowerCase()}`
  const plan =
    animo.intencion === 'cambiar'
      ? `buscamos llevar${esGrupo ? 'los' : 'te'} hacia ${traducirEmocion(objetivo).toLowerCase()}`
      : `elegimos historias que ${esGrupo ? 'los' : 'te'} acompañen`

  return (
    <p className="recomendaciones__funcion" data-testid="resumen-funcion">
      <Ticket size={18} aria-hidden="true" />
      <span>
        {quien}: {plan}.
      </span>
    </p>
  )
}

// Sin sesión se muestran títulos de ejemplo; se avisa para que no se confundan con TMDB.
function AvisoDemostracion() {
  return (
    <p className="recomendaciones__demo" data-testid="aviso-demo">
      <FlaskConical size={18} aria-hidden="true" />
      <span>
        Estás viendo títulos de ejemplo.{' '}
        {HAY_BACKEND ? (
          <>
            <Link to="/login">Inicia sesión</Link> para ver recomendaciones reales.
          </>
        ) : (
          'Esta versión todavía no está conectada al servidor.'
        )}
      </span>
    </p>
  )
}

function CargandoRecomendaciones() {
  return (
    <div className="recomendaciones__cargando" aria-busy="true" data-testid="estado-cargando">
      <p className="solo-lectores" role="status">
        Cargando recomendaciones…
      </p>
      <div className="recomendaciones__hero-skeleton">
        <Skeleton forma="texto" ancho="140px" />
        <Skeleton forma="titulo" ancho="min(420px, 80%)" alto="3rem" />
        <Skeleton forma="texto" ancho="min(520px, 90%)" />
        <Skeleton forma="texto" ancho="min(360px, 70%)" />
      </div>
      {[1, 2].map((fila) => (
        <div key={fila} className="recomendaciones__fila-skeleton">
          <Skeleton forma="titulo" ancho="220px" />
          <div className="recomendaciones__posters-skeleton">
            {Array.from({ length: 7 }, (_, i) => (
              <Skeleton key={i} forma="poster" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function Aviso({ Icono, titulo, testId, children }) {
  return (
    <div className="recomendaciones__aviso tarjeta" role="status" data-testid={testId}>
      <span className="recomendaciones__aviso-icono" aria-hidden="true">
        <Icono size={32} />
      </span>
      <h2>{titulo}</h2>
      {children}
    </div>
  )
}

export default function Recomendaciones({ animo, token, favoritas = [], onToggleFavorita }) {
  const [parametros] = useSearchParams()
  const simular = parametros.get('simular')
  const [estado, setEstado] = useState('cargando')
  const [titulos, setTitulos] = useState([])
  const [intento, setIntento] = useState(0)
  // El filtro inicial depende de si se quiere mantener o cambiar el ánimo
  const objetivo = animo ? emocionObjetivo(animo.emocion, animo.intencion) : 'todos'
  const [filtro, setFiltro] = useState(objetivo)

  // Con sesión se usan las recomendaciones reales de TMDB (vía backend).
  // `?simular=` fuerza los datos de ejemplo para las pruebas.
  const modoReal = Boolean(token) && !simular
  const filtroReal = filtro === 'todos' ? EMOCION_INICIAL_REAL : filtro
  // Solo la emoción del ánimo detectado se enlaza con su registro del historial
  const registroId = filtroReal === objetivo ? animo?.registroId : undefined

  useEffect(() => {
    let activo = true
    const peticion = modoReal
      ? obtenerRecomendaciones(token, { emocion: filtroReal, registroId }).then((lista) => lista.map(tituloDesdeApi))
      : obtenerTitulosMock({ simular })
    peticion
      .then((datos) => {
        if (!activo) return
        setTitulos(datos)
        setEstado('listo')
      })
      .catch(() => {
        if (activo) setEstado('error')
      })
    return () => {
      activo = false
    }
  }, [modoReal, token, filtroReal, registroId, simular, intento])

  function reintentar() {
    setEstado('cargando')
    setIntento((valor) => valor + 1)
  }

  const idsFavoritas = new Set(favoritas.map((t) => t.id))
  const filtroVisible = modoReal ? filtroReal : filtro
  const filtrados =
    modoReal || filtro === 'todos' ? titulos : titulos.filter((t) => t.animos.includes(filtro))
  const paraTuAnimo = [...filtrados].sort(porCalificacion)
  const filasExtra = modoReal
    ? [
        { id: 'peliculas', titulo: 'Películas', items: filtrados.filter((t) => t.tipo === 'pelicula') },
        { id: 'series', titulo: 'Series', items: filtrados.filter((t) => t.tipo === 'serie') },
      ]
    : FILAS_MOCK.map((fila) => ({ ...fila, items: filtrados.filter((t) => t.filas.includes(fila.id)) }))
  const filas = [
    {
      id: 'animo',
      titulo: tituloFilaAnimo(filtroVisible, animo, objetivo),
      items: paraTuAnimo,
    },
    ...filasExtra,
  ].filter((fila) => fila.items.length > 0)

  function elegirFiltro(emocion) {
    if (emocion === filtroVisible) return
    // Con datos reales cambiar de emoción es una nueva petición
    if (modoReal) setEstado('cargando')
    setFiltro(emocion)
  }
  const destacado = paraTuAnimo[0]

  function tarjeta(titulo) {
    return (
      <PosterCard
        key={titulo.id}
        titulo={titulo}
        esFavorita={idsFavoritas.has(titulo.id)}
        onToggleFavorita={onToggleFavorita}
      />
    )
  }

  let contenido
  if (estado === 'cargando') {
    contenido = <CargandoRecomendaciones />
  } else if (estado === 'error') {
    contenido = (
      <div className="pagina recomendaciones__estado">
        <Aviso Icono={CloudOff} titulo="Se nos fue la luz en la sala" testId="estado-error">
          <p>No pudimos cargar tus recomendaciones. Revisa tu conexión y vuelve a intentarlo.</p>
          <button type="button" className="boton boton-primario" onClick={reintentar}>
            <RefreshCw size={18} aria-hidden="true" /> Reintentar
          </button>
        </Aviso>
      </div>
    )
  } else if (titulos.length === 0) {
    contenido = (
      <div className="pagina recomendaciones__estado">
        <Aviso Icono={Popcorn} titulo="La cartelera está vacía por ahora" testId="estado-vacio">
          <p>Todavía no tenemos recomendaciones para ti. Cuéntanos cómo te sientes y armamos la función.</p>
          <Link to="/detectar" className="boton boton-primario">
            Detectar mi ánimo
          </Link>
        </Aviso>
      </div>
    )
  } else {
    contenido = (
      <>
        {destacado && (
          <Hero
            titulo={destacado}
            esFavorita={idsFavoritas.has(destacado.id)}
            onToggleFavorita={onToggleFavorita}
          />
        )}
        <div className="pagina recomendaciones__filas">
          {!modoReal && !simular && <AvisoDemostracion />}
          {animo && <ResumenFuncion animo={animo} objetivo={objetivo} />}
          <div className="recomendaciones__filtros" role="group" aria-label="Filtrar por ánimo">
            {(modoReal ? FILTROS_REALES : FILTROS).map((emocion) => (
              <ChipAnimo
                key={emocion}
                emocion={emocion}
                seleccionado={filtroVisible === emocion}
                testId={`filtro-animo-${emocion}`}
                onClick={() => elegirFiltro(emocion)}
              />
            ))}
          </div>

          {filas.length === 0 ? (
            <Aviso
              Icono={Popcorn}
              titulo={`Nada en cartelera para «${traducirEmocion(filtro)}»`}
              testId="estado-filtro-vacio"
            >
              <p>Prueba con otro ánimo o mira todo lo que tenemos.</p>
              <button type="button" className="boton boton-secundario" onClick={() => setFiltro('todos')}>
                Ver todos
              </button>
            </Aviso>
          ) : (
            filas.map((fila) => (
              <Carrusel key={fila.id} titulo={fila.titulo}>
                {fila.items.map(tarjeta)}
              </Carrusel>
            ))
          )}
        </div>
      </>
    )
  }

  return (
    <div className="recomendaciones">
      <h1 className="solo-lectores">Recomendaciones</h1>
      {contenido}
    </div>
  )
}
