import { Link } from 'react-router-dom'
import LogoButaca from '../components/LogoButaca.jsx'

export default function NoEncontrada() {
  return (
    <div className="pagina no-encontrada">
      <LogoButaca tamano={56} className="no-encontrada__logo" />
      <h1 className="pagina-titulo">Página no encontrada</h1>
      <p className="pagina-descripcion">Esta sala está vacía. Volvamos a la cartelera.</p>
      <Link to="/" className="boton boton-primario">
        Volver al inicio
      </Link>
    </div>
  )
}
