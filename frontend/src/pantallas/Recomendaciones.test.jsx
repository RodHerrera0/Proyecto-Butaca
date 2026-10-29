import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Recomendaciones from './Recomendaciones.jsx'

function renderEn(ruta, props = {}) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Recomendaciones {...props} />
    </MemoryRouter>,
  )
}

describe('Recomendaciones', () => {
  it('muestra skeletons mientras carga y luego el destacado y las filas', async () => {
    renderEn('/recomendaciones')
    expect(screen.getByRole('status').textContent).toContain('Cargando recomendaciones')

    expect(await screen.findByRole('button', { name: 'Ver detalles' })).toBeTruthy()
    for (const fila of ['Para tu ánimo de hoy', 'Si estás feliz', 'Para levantar el ánimo', 'Adrenalina pura', 'Para relajarte']) {
      expect(screen.getByRole('heading', { level: 2, name: fila })).toBeTruthy()
    }
  })

  it('filtra por ánimo con los chips y parte del ánimo detectado', async () => {
    renderEn('/recomendaciones', { animo: { emocion: 'sad', confianza: 0.8, origen: 'camara' } })
    expect(await screen.findByRole('heading', { name: 'Para tu ánimo de hoy · Triste' })).toBeTruthy()

    const filtros = screen.getByRole('group', { name: 'Filtrar por ánimo' })
    fireEvent.click(within(filtros).getByRole('button', { name: 'Asco' }))
    expect(screen.getByRole('heading', { name: 'Para tu ánimo de hoy · Asco' })).toBeTruthy()
    expect(within(filtros).getByRole('button', { name: 'Asco' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('avisa al marcar un favorito', async () => {
    const onToggleFavorita = vi.fn()
    renderEn('/recomendaciones', { onToggleFavorita })
    fireEvent.click(await screen.findByRole('button', { name: /Agregar a favoritas/ }))
    expect(onToggleFavorita).toHaveBeenCalledTimes(1)
  })

  it('muestra un mensaje amable y botón de reintentar si falla', async () => {
    renderEn('/recomendaciones?simular=error')
    expect(await screen.findByText('Se nos fue la luz en la sala')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(screen.getByText('Cargando recomendaciones…')).toBeTruthy()
  })

  it('muestra el estado vacío si no hay títulos', async () => {
    renderEn('/recomendaciones?simular=vacio')
    expect(await screen.findByText('La cartelera está vacía por ahora')).toBeTruthy()
  })
})
