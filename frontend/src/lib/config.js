// Variables públicas de Vite (ver frontend/.env.example). Ninguna es secreta:
// la anon key de Supabase está pensada para el navegador.
export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

// Sin estas variables la app funciona en "modo demostración" con datos de ejemplo.
export const HAY_BACKEND = Boolean(API_URL && SUPABASE_URL && SUPABASE_ANON_KEY)
