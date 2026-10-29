import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import App from './App.jsx'

vi.mock('./lib/detector.js', () => ({
  cargarModelos: vi.fn(() => new Promise(() => {})),
  detectarEmocion: vi.fn(),
}))

function renderEn(ruta) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>,
  )
}

describe('rutas', () => {
  it.each([
    ['/login', 'Iniciar sesión'],
    ['/consentimiento', 'Uso de la cámara'],
    ['/detectar', '¿Cómo te sientes?'],
    ['/recomendaciones', 'Recomendaciones'],
    ['/favoritas', 'Favoritas'],
    ['/tablero', 'Tablero'],
    ['/no-existe', 'Página no encontrada'],
  ])('%s muestra "%s"', (ruta, titulo) => {
    renderEn(ruta)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(titulo)
  })

  it('/ redirige a /login', () => {
    renderEn('/')
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Iniciar sesión')
  })

  it('el encabezado muestra el nombre de la app en todas las pantallas', () => {
    renderEn('/tablero')
    expect(screen.getByRole('link', { name: 'Butaca' })).toBeTruthy()
  })
})
