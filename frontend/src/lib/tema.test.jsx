import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import Header from '../components/Header.jsx'
import { CLAVE_TEMA } from './tema.js'

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  )
}

afterEach(() => {
  localStorage.clear()
  delete document.documentElement.dataset.tema
})

describe('tema claro / oscuro', () => {
  it('parte del tema que dejó el script de index.html', () => {
    document.documentElement.dataset.tema = 'claro'
    renderHeader()
    expect(screen.getByRole('button', { name: 'Activar modo oscuro' })).toBeTruthy()
  })

  it('sin preferencia ni sistema conocido usa el oscuro', () => {
    renderHeader()
    expect(document.documentElement.dataset.tema).toBe('oscuro')
  })

  it('el botón alterna el tema, lo aplica a la página y lo recuerda', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'Activar modo claro' }))
    expect(document.documentElement.dataset.tema).toBe('claro')
    expect(localStorage.getItem(CLAVE_TEMA)).toBe('claro')

    fireEvent.click(screen.getByRole('button', { name: 'Activar modo oscuro' }))
    expect(document.documentElement.dataset.tema).toBe('oscuro')
    expect(localStorage.getItem(CLAVE_TEMA)).toBe('oscuro')
  })
})
