import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import './App.css'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import Header from './components/Header.jsx'
import { favoritaDesdeApi } from './lib/adaptadores.js'
import { agregarFavorita, listarFavoritas, quitarFavorita, registrarAnimo } from './lib/api.js'
import { useSesion } from './lib/sesion.js'
import Consentimiento from './pantallas/Consentimiento.jsx'
import Deteccion from './pantallas/Deteccion.jsx'
import Favoritas from './pantallas/Favoritas.jsx'
import Login from './pantallas/Login.jsx'
import NoEncontrada from './pantallas/NoEncontrada.jsx'
import Recomendaciones from './pantallas/Recomendaciones.jsx'
import Tablero from './pantallas/Tablero.jsx'

function Plantilla({ aviso, onCerrarAviso }) {
  return (
    <div className="app">
      <a className="app__saltar" href="#contenido">
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido" className="app__main">
        {aviso && (
          <p className="app__aviso" role="alert" data-testid="aviso-global">
            <span>{aviso}</span>
            <button type="button" className="app__aviso-cerrar" aria-label="Cerrar aviso" onClick={onCerrarAviso}>
              <X size={16} aria-hidden="true" />
            </button>
          </p>
        )}
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

function App() {
  const { sesion } = useSesion()
  const token = sesion?.access_token
  const usuarioId = sesion?.user?.id
  // El token se renueva solo cada cierto tiempo; se guarda aparte para no
  // volver a cargar las favoritas cada vez que cambia.
  const tokenRef = useRef(token)
  useEffect(() => {
    tokenRef.current = token
  })

  const [animo, setAnimo] = useState(null)
  // null (aún no decide) | 'aceptado' | 'rechazado'. La cámara solo se enciende con 'aceptado'.
  const [consentimiento, setConsentimiento] = useState(null)
  // Favoritas de cada usuario (sin sesión, viven solo en memoria).
  const [favoritasDe, setFavoritasDe] = useState({ usuarioId: undefined, lista: [] })
  const favoritas = favoritasDe.usuarioId === usuarioId ? favoritasDe.lista : []
  const [aviso, setAviso] = useState(null)

  function cambiarFavoritas(cambio) {
    setFavoritasDe((actual) => ({
      usuarioId,
      lista: cambio(actual.usuarioId === usuarioId ? actual.lista : []),
    }))
  }

  // Con sesión, las favoritas se traen del backend.
  useEffect(() => {
    if (!usuarioId) return
    let activo = true
    listarFavoritas(tokenRef.current)
      .then((lista) => {
        if (activo) setFavoritasDe({ usuarioId, lista: lista.map(favoritaDesdeApi) })
      })
      .catch(() => {
        if (activo) setAviso('No pudimos cargar tus favoritas. Revisa tu conexión.')
      })
    return () => {
      activo = false
    }
  }, [usuarioId])

  // Un resultado nuevo de la cabina. Con sesión se guarda en el historial
  // (solo la emoción y la confianza; la imagen nunca sale del navegador).
  function guardarResultado(resultado) {
    const nuevo = { ...resultado, creadoEn: Date.now() }
    setAnimo(nuevo)
    if (!token || resultado.simulado) return
    registrarAnimo(token, { emocion: resultado.emocion, confianza: resultado.confianza ?? null })
      .then((registro) =>
        setAnimo((actual) => (actual?.creadoEn === nuevo.creadoEn ? { ...actual, registroId: registro.id } : actual)),
      )
      .catch(() => setAviso('No pudimos guardar tu ánimo en el historial, pero igual puedes ver recomendaciones.'))
  }

  async function alternarFavorita(titulo) {
    const existente = favoritas.find((t) => t.id === titulo.id)
    if (existente) {
      cambiarFavoritas((lista) => lista.filter((t) => t.id !== titulo.id))
    } else {
      cambiarFavoritas((lista) => [...lista, { ...titulo, guardadaEn: new Date().toISOString() }])
    }
    // Sin sesión (o con títulos de ejemplo, que no son de TMDB) se queda en memoria.
    if (!token || !titulo.tmdbId) return

    try {
      if (existente) {
        if (existente.favoritaId) await quitarFavorita(token, existente.favoritaId)
      } else {
        const guardada = favoritaDesdeApi(
          await agregarFavorita(token, {
            tmdbId: titulo.tmdbId,
            mediaType: titulo.mediaType,
            title: titulo.titulo,
            posterPath: titulo.posterPath ?? null,
          }),
        )
        cambiarFavoritas((lista) => lista.map((t) => (t.id === guardada.id ? guardada : t)))
      }
    } catch {
      // Si algo falla, se vuelve a lo que dice el servidor.
      setAviso('No pudimos actualizar tus favoritas. Inténtalo de nuevo.')
      listarFavoritas(token)
        .then((lista) => cambiarFavoritas(() => lista.map(favoritaDesdeApi)))
        .catch(() => {})
    }
  }

  return (
    <Routes>
      <Route element={<Plantilla aviso={aviso} onCerrarAviso={() => setAviso(null)} />}>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="consentimiento" element={<Consentimiento onDecidir={setConsentimiento} />} />
        <Route
          path="detectar"
          element={
            <Deteccion
              animo={animo}
              onAnimo={setAnimo}
              onResultado={guardarResultado}
              consentimiento={consentimiento}
            />
          }
        />
        <Route
          path="recomendaciones"
          element={
            <Recomendaciones
              animo={animo}
              token={token}
              favoritas={favoritas}
              onToggleFavorita={alternarFavorita}
            />
          }
        />
        <Route path="favoritas" element={<Favoritas favoritas={favoritas} onToggleFavorita={alternarFavorita} />} />
        <Route path="tablero" element={<Tablero token={token} />} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  )
}

export default App
