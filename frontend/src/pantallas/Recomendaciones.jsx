import { CloudOff, Popcorn, RefreshCw, Ticket } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Carrusel from '../components/Carrusel.jsx'
import ChipAnimo from '../components/ChipAnimo.jsx'
import Hero from '../components/Hero.jsx'
import PosterCard from '../components/PosterCard.jsx'
import Skeleton from '../components/Skeleton.jsx'
import { FILAS_MOCK, obtenerTitulosMock } from '../data/mock-titulos.js'
import { EMOCIONES, emocionObjetivo, traducirEmocion } from '../lib/emociones.js'
import { resumirConteo } from '../lib/grupo.js'
import './Recomendaciones.css'

const FILTROS = ['todos', ...Object.keys(EMOCIONES)]

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

function CargandoRecomendaciones() {
  return (
    <div className="recomendaciones__cargando" aria-busy="true">
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

function Aviso({ Icono, titulo, children }) {
  return (
    <div className="recomendaciones__aviso tarjeta" role="status">
      <span className="recomendaciones__aviso-icono" aria-hidden="true">
        <Icono size={32} />
      </span>
      <h2>{titulo}</h2>
      {children}
    </div>
  )
}

export default function Recomendaciones({ animo, favoritas = [], onToggleFavorita }) {
  const [parametros] = useSearchParams()
  const simular = parametros.get('simular')
  const [estado, setEstado] = useState('cargando')
  const [titulos, setTitulos] = useState([])
  const [intento, setIntento] = useState(0)
  // El filtro inicial depende de si se quiere mantener o cambiar el ánimo
  const objetivo = animo ? emocionObjetivo(animo.emocion, animo.intencion) : 'todos'
  const [filtro, setFiltro] = useState(objetivo)

  useEffect(() => {
    let activo = true
    obtenerTitulosMock({ simular })
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
  }, [simular, intento])

  function reintentar() {
    setEstado('cargando')
    setIntento((valor) => valor + 1)
  }

  const idsFavoritas = new Set(favoritas.map((t) => t.id))
  const filtrados = filtro === 'todos' ? titulos : titulos.filter((t) => t.animos.includes(filtro))
  const paraTuAnimo = [...filtrados].sort(porCalificacion)
  const filas = [
    {
      id: 'animo',
      titulo: tituloFilaAnimo(filtro, animo, objetivo),
      items: paraTuAnimo,
    },
    ...FILAS_MOCK.map((fila) => ({ ...fila, items: filtrados.filter((t) => t.filas.includes(fila.id)) })),
  ].filter((fila) => fila.items.length > 0)
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
        <Aviso Icono={CloudOff} titulo="Se nos fue la luz en la sala">
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
        <Aviso Icono={Popcorn} titulo="La cartelera está vacía por ahora">
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
          {animo && <ResumenFuncion animo={animo} objetivo={objetivo} />}
          <div className="recomendaciones__filtros" role="group" aria-label="Filtrar por ánimo">
            {FILTROS.map((emocion) => (
              <ChipAnimo
                key={emocion}
                emocion={emocion}
                seleccionado={filtro === emocion}
                onClick={() => setFiltro(emocion)}
              />
            ))}
          </div>

          {filas.length === 0 ? (
            <Aviso Icono={Popcorn} titulo={`Nada en cartelera para «${traducirEmocion(filtro)}»`}>
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
