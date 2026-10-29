import { Link } from 'react-router-dom'

export default function Recomendaciones() {
  return (
    <>
      <h1>Recomendaciones</h1>
      <p>Aquí irán las películas y series recomendadas según tu ánimo.</p>
      <p>
        <Link to="/detectar">Volver a detectar mi ánimo</Link> · <Link to="/favoritas">Ver favoritas</Link>
      </p>
    </>
  )
}
