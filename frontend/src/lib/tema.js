import { useEffect, useState } from 'react'

// Tema claro / oscuro. Si la persona nunca eligió, se sigue al sistema
// (y se actualiza si el sistema cambia). Al elegir con el botón, se recuerda
// solo en este navegador. index.html aplica el tema antes de pintar para
// evitar un parpadeo; esta clave debe coincidir con la de ese script.
export const CLAVE_TEMA = 'butaca-tema'

// Color de la barra del navegador en celular (meta theme-color).
const COLOR_BARRA = { oscuro: '#12141f', claro: '#f5f1e8' }

function consultaSistema() {
  return window.matchMedia?.('(prefers-color-scheme: light)')
}

export function temaDelSistema() {
  return consultaSistema()?.matches ? 'claro' : 'oscuro'
}

export function leerPreferencia() {
  try {
    const valor = localStorage.getItem(CLAVE_TEMA)
    return valor === 'claro' || valor === 'oscuro' ? valor : null
  } catch {
    return null
  }
}

function guardarPreferencia(tema) {
  try {
    localStorage.setItem(CLAVE_TEMA, tema)
  } catch {
    // Sin almacenamiento (modo privado, etc.) el tema solo dura esta visita.
  }
}

function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COLOR_BARRA[tema])
}

export function useTema() {
  const [tema, setTema] = useState(
    () => document.documentElement.dataset.tema || leerPreferencia() || temaDelSistema(),
  )

  useEffect(() => {
    aplicarTema(tema)
  }, [tema])

  useEffect(() => {
    const consulta = consultaSistema()
    if (!consulta) return
    function alCambiarSistema() {
      if (!leerPreferencia()) setTema(temaDelSistema())
    }
    consulta.addEventListener('change', alCambiarSistema)
    return () => consulta.removeEventListener('change', alCambiarSistema)
  }, [])

  function alternarTema() {
    const nuevo = tema === 'oscuro' ? 'claro' : 'oscuro'
    guardarPreferencia(nuevo)
    setTema(nuevo)
  }

  return { tema, alternarTema }
}
