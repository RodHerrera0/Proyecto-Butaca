import { useState } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Encabezado from './components/Encabezado.jsx'
import Consentimiento from './pantallas/Consentimiento.jsx'
import Deteccion from './pantallas/Deteccion.jsx'
import Favoritas from './pantallas/Favoritas.jsx'
import Login from './pantallas/Login.jsx'
import NoEncontrada from './pantallas/NoEncontrada.jsx'
import Recomendaciones from './pantallas/Recomendaciones.jsx'
import Tablero from './pantallas/Tablero.jsx'

function Plantilla() {
  return (
    <>
      <Encabezado />
      <main className="contenido">
        <Outlet />
      </main>
    </>
  )
}

function App() {
  // Mientras no exista el backend, el resultado solo vive en el estado de la app.
  const [animo, setAnimo] = useState(null)

  return (
    <Routes>
      <Route element={<Plantilla />}>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="consentimiento" element={<Consentimiento />} />
        <Route path="detectar" element={<Deteccion animo={animo} onAnimo={setAnimo} />} />
        <Route path="recomendaciones" element={<Recomendaciones />} />
        <Route path="favoritas" element={<Favoritas />} />
        <Route path="tablero" element={<Tablero />} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  )
}

export default App
