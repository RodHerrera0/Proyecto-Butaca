import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ChipAnimo from './ChipAnimo.jsx'
import PosterCard from './PosterCard.jsx'
import { TITULOS_MOCK } from '../data/mock-titulos.js'

const titulo = TITULOS_MOCK[0]

describe('PosterCard', () => {
  it('muestra un placeholder accesible cuando no hay póster', () => {
    render(<PosterCard titulo={titulo} />)
    expect(screen.getByRole('img', { name: `Póster de ${titulo.titulo}` })).toBeTruthy()
    expect(screen.getByRole('heading', { name: titulo.titulo })).toBeTruthy()
  })

  it('usa la imagen real cuando llega la URL del póster', () => {
    render(<PosterCard titulo={{ ...titulo, poster: 'https://example.com/poster.jpg' }} />)
    expect(screen.getByAltText(`Póster de ${titulo.titulo}`).getAttribute('src')).toBe('https://example.com/poster.jpg')
  })

  it('el botón de favorito indica su estado y avisa al hacer clic', () => {
    const onToggle = vi.fn()
    render(<PosterCard titulo={titulo} esFavorita onToggleFavorita={onToggle} />)
    const boton = screen.getByRole('button', { name: `Quitar ${titulo.titulo} de favoritas` })
    expect(boton.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(boton)
    expect(onToggle).toHaveBeenCalledWith(titulo)
  })
})

describe('ChipAnimo', () => {
  it('muestra la emoción en español y su estado de selección', () => {
    render(<ChipAnimo emocion="happy" seleccionado onClick={() => {}} />)
    const chip = screen.getByRole('button', { name: 'Feliz' })
    expect(chip.getAttribute('aria-pressed')).toBe('true')
    expect(chip.dataset.emocion).toBe('happy')
  })
})
