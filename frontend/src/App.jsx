import { useState } from 'react'
import DetectorEmocion from './components/DetectorEmocion.jsx'

function App() {
  // Mientras no exista el backend, el resultado solo vive en el estado de la app.
  const [animo, setAnimo] = useState(null)

  return (
    <main>
      <h1>Butaca</h1>
      <DetectorEmocion resultado={animo} onResultado={setAnimo} />
    </main>
  )
}

export default App
