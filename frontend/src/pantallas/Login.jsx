import { LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'
import LogoButaca from '../components/LogoButaca.jsx'
import Poster from '../components/Poster.jsx'
import { TITULOS_MOCK } from '../data/mock-titulos.js'
import './Login.css'

// Pósters de fondo: solo decoración, se repiten para llenar pantallas grandes.
const POSTERS_FONDO = [...TITULOS_MOCK, ...TITULOS_MOCK].slice(0, 32)

export default function Login() {
  return (
    <div className="login">
      <div className="login__fondo" aria-hidden="true">
        {POSTERS_FONDO.map((titulo, i) => (
          <div key={`${titulo.id}-${i}`} className="login__poster">
            <Poster titulo={titulo} decorativo />
          </div>
        ))}
      </div>

      <section className="login__tarjeta tarjeta" aria-labelledby="login-titulo">
        <LogoButaca tamano={48} className="login__logo" />
        <h1 id="login-titulo" className="login__titulo">
          Iniciar sesión
        </h1>
        <p className="login__texto">Tu butaca te espera. Entra para guardar tus favoritas y ver tu ánimo en el tiempo.</p>
        {/* Placeholder: el login real con Supabase es otra tarea. */}
        <div className="login__botones">
          <button type="button" className="boton boton-secundario" disabled>
            <LogIn size={18} aria-hidden="true" /> Entrar con Google
          </button>
          <button type="button" className="boton boton-secundario" disabled>
            <LogIn size={18} aria-hidden="true" /> Entrar con GitHub
          </button>
        </div>
        <p className="login__nota">El inicio de sesión estará disponible pronto.</p>
        <Link to="/consentimiento" className="login__continuar">
          Continuar sin iniciar sesión
        </Link>
      </section>
    </div>
  )
}
