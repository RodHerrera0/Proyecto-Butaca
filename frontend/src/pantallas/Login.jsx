import { Link } from 'react-router-dom'

export default function Login() {
  return (
    <>
      <h1>Iniciar sesión</h1>
      <p>Aquí irá el inicio de sesión con Google o GitHub.</p>
      {/* Placeholder: el login real con Supabase es otra tarea. */}
      <div className="acciones">
        <button type="button" disabled>
          Entrar con Google
        </button>
        <button type="button" disabled>
          Entrar con GitHub
        </button>
      </div>
      <p>
        <Link to="/consentimiento">Continuar sin iniciar sesión</Link>
      </p>
    </>
  )
}
