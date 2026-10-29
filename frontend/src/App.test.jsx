import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.jsx'

vi.mock('./lib/detector.js', () => ({
  cargarModelos: vi.fn(() => Promise.resolve({})),
  detectarEmocion: vi.fn(),
}))

function renderEn(ruta) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>,
  )
}

let getUserMedia

beforeEach(() => {
  getUserMedia = vi.fn(() => Promise.resolve({ getTracks: () => [{ stop: vi.fn() }] }))
  Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia }, configurable: true })
})

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

describe('consentimiento', () => {
  it('/detectar no enciende la cámara si no se aceptó antes', () => {
    renderEn('/detectar')
    expect(getUserMedia).not.toHaveBeenCalled()
    expect(screen.getByTestId('selector-animo-manual')).toBeTruthy()
  })

  it('"Acepto" lleva a /detectar y enciende la cámara', async () => {
    renderEn('/consentimiento')
    fireEvent.click(screen.getByTestId('boton-acepto'))

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('¿Cómo te sientes?')
    await screen.findByTestId('boton-analizar')
    expect(getUserMedia).toHaveBeenCalled()
  })

  it('"No acepto" lleva a /detectar en modo manual sin encender la cámara', () => {
    renderEn('/consentimiento')
    fireEvent.click(screen.getByTestId('boton-no-acepto'))

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('¿Cómo te sientes?')
    expect(screen.getByText(/Elegiste no usar la cámara/)).toBeTruthy()
    expect(getUserMedia).not.toHaveBeenCalled()
  })
})

describe('favoritas', () => {
  it('muestra el estado vacío cuando no hay nada guardado', () => {
    renderEn('/favoritas')
    expect(screen.getByText('Todavía no guardaste nada')).toBeTruthy()
  })

  it('lo que se marca en recomendaciones aparece en favoritas y se puede quitar', async () => {
    renderEn('/recomendaciones')
    const boton = await screen.findByRole('button', { name: 'Agregar a favoritas' })
    const nombre = boton.closest('section').querySelector('h2').textContent
    fireEvent.click(boton)

    fireEvent.click(within(screen.getByRole('navigation', { name: 'Principal' })).getByRole('link', { name: 'Favoritas' }))
    expect(screen.getByRole('heading', { level: 3, name: nombre })).toBeTruthy()
    expect(screen.getByText(/Guardada el/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: `Quitar ${nombre} de favoritas` }))
    expect(screen.getByText('Todavía no guardaste nada')).toBeTruthy()
  })
})
