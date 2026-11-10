import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import BottomNav from './BottomNav.jsx'
import Header from './Header.jsx'

function renderEn(ruta, componente) {
  return render(<MemoryRouter initialEntries={[ruta]}>{componente}</MemoryRouter>)
}

describe('Header', () => {
  it('marca como activa la sección actual y enlaza "¿Qué veo hoy?" a /detectar', () => {
    renderEn('/favoritas', <Header />)
    expect(screen.getByRole('link', { name: 'Favoritas' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: '¿Qué veo hoy?' }).getAttribute('href')).toBe('/detectar')
  })

  it('abre el menú de usuario y lo cierra con Escape', () => {
    renderEn('/', <Header />)
    const boton = screen.getByRole('button', { name: 'Menú de usuario' })
    fireEvent.click(boton)
    expect(boton.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText('Usuario invitado')).toBeTruthy()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(boton.getAttribute('aria-expanded')).toBe('false')
  })
})

describe('BottomNav', () => {
  it('incluye Inicio, Detectar, Favoritas y Tablero', () => {
    renderEn('/detectar', <BottomNav />)
    for (const nombre of ['Inicio', 'Detectar', 'Favoritas', 'Tablero']) {
      expect(screen.getByRole('link', { name: nombre })).toBeTruthy()
    }
    expect(screen.getByRole('link', { name: 'Detectar' }).getAttribute('aria-current')).toBe('page')
  })
})
