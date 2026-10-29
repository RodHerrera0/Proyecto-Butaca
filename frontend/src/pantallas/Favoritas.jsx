import { Link } from 'react-router-dom'

export default function Favoritas() {
  return (
    <>
      <h1>Favoritas</h1>
      <p>Aquí irán las películas y series que guardaste, con la opción de quitarlas.</p>
      <p>
        <Link to="/recomendaciones">Volver a recomendaciones</Link>
      </p>
    </>
  )
}
