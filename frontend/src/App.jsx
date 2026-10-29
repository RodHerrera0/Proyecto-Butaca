import { useState } from 'react'
import './App.css'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import Header from './components/Header.jsx'
import Consentimiento from './pantallas/Consentimiento.jsx'
import Deteccion from './pantallas/Deteccion.jsx'
import Favoritas from './pantallas/Favoritas.jsx'
import Login from './pantallas/Login.jsx'
import NoEncontrada from './pantallas/NoEncontrada.jsx'
import Recomendaciones from './pantallas/Recomendaciones.jsx'
import Tablero from './pantallas/Tablero.jsx'

function Plantilla() {
  return (
    <div className="app">
      <a className="app__saltar" href="#contenido">
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido" className="app__main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

function App() {
  // Mientras no exista el backend, el resultado solo vive en el estado de la app.
  const [animo, setAnimo] = useState(null)
  // null (aún no decide) | 'aceptado' | 'rechazado'. La cámara solo se enciende con 'aceptado'.
  const [consentimiento, setConsentimiento] = useState(null)
  // Favoritas en memoria hasta que exista el backend (llevan la fecha en que se guardaron).
  const [favoritas, setFavoritas] = useState([])

  function alternarFavorita(titulo) {
    setFavoritas((actuales) =>
      actuales.some((t) => t.id === titulo.id)
        ? actuales.filter((t) => t.id !== titulo.id)
        : [...actuales, { ...titulo, guardadaEn: new Date().toISOString() }],
    )
  }

  return (
    <Routes>
      <Route element={<Plantilla />}>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="consentimiento" element={<Consentimiento onDecidir={setConsentimiento} />} />
        <Route
          path="detectar"
          element={<Deteccion animo={animo} onAnimo={setAnimo} consentimiento={consentimiento} />}
        />
        <Route
          path="recomendaciones"
          element={<Recomendaciones animo={animo} favoritas={favoritas} onToggleFavorita={alternarFavorita} />}
        />
        <Route path="favoritas" element={<Favoritas />} />
        <Route path="tablero" element={<Tablero />} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  )
}

export default App
