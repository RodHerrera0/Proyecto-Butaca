import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DetectorEmocion from './DetectorEmocion.jsx'
import { cargarModelos, detectarEmocion } from '../lib/detector.js'

vi.mock('../lib/detector.js', () => ({
  cargarModelos: vi.fn(),
  detectarEmocion: vi.fn(),
}))

function ConEstado(props) {
  const [animo, setAnimo] = useState(null)
  return <DetectorEmocion resultado={animo} onResultado={setAnimo} usarCamara {...props} />
}

function crearStreamFalso() {
  const track = { stop: vi.fn() }
  return { track, stream: { getTracks: () => [track] } }
}

describe('DetectorEmocion', () => {
  let getUserMedia

  beforeEach(() => {
    getUserMedia = vi.fn()
    Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia }, configurable: true })
    cargarModelos.mockResolvedValue({})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('detecta la emoción, la muestra en español y apaga la cámara', async () => {
    const { track, stream } = crearStreamFalso()
    getUserMedia.mockResolvedValue(stream)
    detectarEmocion.mockResolvedValue({ emocion: 'happy', confianza: 0.87 })

    render(<ConEstado />)
    fireEvent.click(await screen.findByTestId('boton-analizar'))

    expect((await screen.findByTestId('resultado-emocion')).textContent).toContain('Feliz (87%)')
    expect(track.stop).toHaveBeenCalled()
    expect(screen.queryByTestId('boton-analizar')).toBeNull()
  })

  it('avisa si no se detectó un rostro y apaga la cámara', async () => {
    const { track, stream } = crearStreamFalso()
    getUserMedia.mockResolvedValue(stream)
    detectarEmocion.mockResolvedValue(null)

    render(<ConEstado />)
    fireEvent.click(await screen.findByTestId('boton-analizar'))

    expect((await screen.findByRole('alert')).textContent).toContain('No detectamos un rostro')
    expect(track.stop).toHaveBeenCalled()
    expect(screen.getByTestId('selector-animo-manual')).toBeTruthy()
  })

  it('avisa si se negó el permiso de cámara y permite elegir a mano', async () => {
    getUserMedia.mockRejectedValue(Object.assign(new Error('denegado'), { name: 'NotAllowedError' }))

    render(<ConEstado />)

    expect((await screen.findByRole('alert')).textContent).toContain('No diste permiso')
    fireEvent.change(screen.getByTestId('selector-animo-manual'), { target: { value: 'sad' } })
    expect(screen.getByTestId('resultado-emocion').textContent).toContain('Ánimo elegido a mano: Triste')
  })

  it('avisa si los modelos no cargan y no pide la cámara', async () => {
    cargarModelos.mockRejectedValue(new Error('404'))

    render(<ConEstado />)

    expect((await screen.findByRole('alert')).textContent).toContain('No se pudo cargar el detector')
    expect(getUserMedia).not.toHaveBeenCalled()
  })

  it('en modo manual no enciende la cámara ni carga los modelos', () => {
    render(<ConEstado usarCamara={false} />)

    expect(getUserMedia).not.toHaveBeenCalled()
    expect(cargarModelos).not.toHaveBeenCalled()
    expect(screen.queryByTestId('boton-analizar')).toBeNull()
    fireEvent.change(screen.getByTestId('selector-animo-manual'), { target: { value: 'happy' } })
    expect(screen.getByTestId('resultado-emocion').textContent).toContain('Ánimo elegido a mano: Feliz')
    expect(screen.queryByRole('button', { name: 'Volver a usar la cámara' })).toBeNull()
  })

  it('apaga la cámara al salir de la pantalla', async () => {
    const { track, stream } = crearStreamFalso()
    getUserMedia.mockResolvedValue(stream)

    const { unmount } = render(<ConEstado />)
    await screen.findByTestId('boton-analizar')
    unmount()

    expect(track.stop).toHaveBeenCalled()
  })
})
