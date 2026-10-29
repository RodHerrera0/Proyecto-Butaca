import { Link } from 'react-router-dom'

export default function Consentimiento() {
  return (
    <>
      <h1>Uso de la cámara</h1>
      <p>Aquí irá la explicación de para qué usamos la cámara y la opción de aceptar o no.</p>
      <p>
        <Link to="/detectar">Ir a detectar mi ánimo</Link>
      </p>
    </>
  )
}
