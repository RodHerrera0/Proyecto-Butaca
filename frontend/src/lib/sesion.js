import { createContext, useContext } from 'react'

// Sesión de Supabase compartida por toda la app (ver SesionProvider.jsx).
// Sin sesión o en modo demostración, `sesion` y `usuario` son null.
export const SesionContexto = createContext({
  sesion: null,
  usuario: null,
  cargando: false,
  disponible: false,
  entrar: async () => {},
  salir: async () => {},
})

export function useSesion() {
  return useContext(SesionContexto)
}
