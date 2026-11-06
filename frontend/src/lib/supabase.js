import { createClient } from '@supabase/supabase-js'
import { HAY_BACKEND, SUPABASE_ANON_KEY, SUPABASE_URL } from './config.js'

// Cliente de Supabase solo para la sesión (login con Google o GitHub).
// Es null en modo demostración.
export const supabase = HAY_BACKEND ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null
