import { Link } from 'react-router-dom'

export default function Tablero() {
  return (
    <>
      <h1>Tablero</h1>
      <p>Aquí irán tu ánimo en el tiempo, el conteo por emoción, los géneros más recomendados y películas vs. series.</p>
      <p>
        <Link to="/detectar">Detectar mi ánimo</Link>
      </p>
    </>
  )
}
