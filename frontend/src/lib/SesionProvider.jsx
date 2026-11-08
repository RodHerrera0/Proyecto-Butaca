import { useEffect, useState } from 'react'
import { SesionContexto } from './sesion.js'
import { supabase } from './supabase.js'

// Datos que mostramos del usuario. Google y GitHub mandan el nombre y la foto
// con nombres distintos (igual que en el middleware del backend).
function usuarioDe(sesion) {
  if (!sesion?.user) return null
  const meta = sesion.user.user_metadata ?? {}
  return {
    nombre: meta.full_name ?? meta.name ?? meta.user_name ?? sesion.user.email,
    correo: sesion.user.email,
    avatar: meta.avatar_url ?? meta.picture ?? null,
  }
}

export function SesionProvider({ children }) {
  const [sesion, setSesion] = useState(null)
  const [cargando, setCargando] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) return
    let activo = true
    supabase.auth.getSession().then(({ data }) => {
      if (!activo) return
      setSesion(data.session)
      setCargando(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_evento, nueva) => setSesion(nueva))
    return () => {
      activo = false
      data.subscription.unsubscribe()
    }
  }, [])

  // proveedor: 'google' | 'github'. Al volver del proveedor se sigue al consentimiento.
  async function entrar(proveedor) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: proveedor,
      options: { redirectTo: `${window.location.origin}/consentimiento` },
    })
    if (error) throw error
  }

  async function salir() {
    await supabase.auth.signOut()
  }

  const valor = {
    sesion,
    usuario: usuarioDe(sesion),
    cargando,
    disponible: Boolean(supabase),
    entrar,
    salir,
  }
  return <SesionContexto.Provider value={valor}>{children}</SesionContexto.Provider>
}
