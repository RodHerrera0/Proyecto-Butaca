import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DetectorEmocion from './DetectorEmocion.jsx'
import { cargarModelos, detectarAnimosGrupo, detectarEmocion } from '../lib/detector.js'

vi.mock('../lib/detector.js', () => ({
  MAXIMO_PERSONAS: 6,
  cargarModelos: vi.fn(),
  detectarEmocion: vi.fn(),
  detectarAnimosGrupo: vi.fn(),
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

    const resultado = await screen.findByTestId('resultado-emocion')
    expect(resultado.textContent).toContain('Emoción detectada')
    expect(resultado.textContent).toContain('Feliz')
    expect(resultado.textContent).toContain('87%')
    expect(resultado.textContent).toContain('te encontramos algo para seguir así')
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
    expect(screen.getByTestId('resultado-emocion').textContent).toMatch(/Ánimo elegido a mano.*Triste/)
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
    expect(screen.getByTestId('resultado-emocion').textContent).toMatch(/Ánimo elegido a mano.*Feliz/)
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

  it('en modo grupo muestra el ánimo de cada persona y el del grupo', async () => {
    const { track, stream } = crearStreamFalso()
    getUserMedia.mockResolvedValue(stream)
    detectarAnimosGrupo.mockResolvedValue([
      { emocion: 'happy', confianza: 0.9 },
      { emocion: 'sad', confianza: 0.7 },
      { emocion: 'happy', confianza: 0.8 },
    ])

    render(<ConEstado />)
    fireEvent.click(await screen.findByTestId('modo-grupo'))
    fireEvent.click(await screen.findByTestId('boton-analizar'))

    const resultado = await screen.findByTestId('resultado-emocion')
    expect(detectarEmocion).not.toHaveBeenCalled()
    expect(resultado.textContent).toContain('Ánimo del grupo')
    expect(resultado.textContent).toContain('3 personas')
    expect(resultado.textContent).toContain('Persona 2')
    expect(resultado.textContent).toContain('La sala está dividida (2 Feliz, 1 Triste)')
    expect(track.stop).toHaveBeenCalled()
  })

  it('en modo grupo avisa si no encontró a nadie', async () => {
    const { stream } = crearStreamFalso()
    getUserMedia.mockResolvedValue(stream)
    detectarAnimosGrupo.mockResolvedValue([])

    render(<ConEstado />)
    fireEvent.click(await screen.findByTestId('modo-grupo'))
    fireEvent.click(await screen.findByTestId('boton-analizar'))

    expect((await screen.findByRole('alert')).textContent).toContain('No detectamos un rostro')
  })

  describe('con varias cámaras conectadas', () => {
    const CAMARAS = [
      { kind: 'videoinput', deviceId: 'laptop', label: 'Integrated Camera' },
      { kind: 'videoinput', deviceId: 'webcam', label: 'Logitech C920' },
      { kind: 'audioinput', deviceId: 'mic', label: 'Micrófono' },
    ]

    function streamDe(deviceId) {
      const track = { stop: vi.fn(), getSettings: () => ({ deviceId }) }
      return { track, stream: { getTracks: () => [track], getVideoTracks: () => [track] } }
    }

    beforeEach(() => {
      localStorage.clear()
      navigator.mediaDevices.enumerateDevices = vi.fn().mockResolvedValue(CAMARAS)
    })

    it('cambia a la webcam externa aunque el navegador abra la de la laptop', async () => {
      const laptop = streamDe('laptop')
      const webcam = streamDe('webcam')
      getUserMedia.mockImplementation(({ video }) =>
        Promise.resolve(video.deviceId?.exact === 'webcam' ? webcam.stream : laptop.stream),
      )

      render(<ConEstado />)
      await screen.findByTestId('boton-analizar')

      expect(getUserMedia).toHaveBeenLastCalledWith({ video: { deviceId: { exact: 'webcam' } }, audio: false })
      expect(laptop.track.stop).toHaveBeenCalled()
      expect(webcam.track.stop).not.toHaveBeenCalled()
      expect(screen.getByTestId('selector-camara').value).toBe('webcam')
    })

    it('permite elegir otra cámara y la recuerda', async () => {
      getUserMedia.mockImplementation(({ video }) => Promise.resolve(streamDe(video.deviceId?.exact ?? 'laptop').stream))

      render(<ConEstado />)
      await screen.findByTestId('boton-analizar')
      fireEvent.change(screen.getByTestId('selector-camara'), { target: { value: 'laptop' } })
      await screen.findByTestId('boton-analizar')

      expect(getUserMedia).toHaveBeenLastCalledWith({ video: { deviceId: { exact: 'laptop' } }, audio: false })
      expect(screen.getByTestId('selector-camara').value).toBe('laptop')
      expect(localStorage.getItem('butaca-camara')).toBe('laptop')
    })

    it('si la cámara guardada ya no está, usa otra sin mostrar error', async () => {
      localStorage.setItem('butaca-camara', 'desconectada')
      getUserMedia.mockImplementation(({ video }) =>
        video.deviceId?.exact === 'desconectada'
          ? Promise.reject(Object.assign(new Error('no está'), { name: 'OverconstrainedError' }))
          : Promise.resolve(streamDe(video.deviceId?.exact ?? 'laptop').stream),
      )

      render(<ConEstado />)
      await screen.findByTestId('boton-analizar')

      expect(screen.queryByRole('alert')).toBeNull()
      expect(screen.getByTestId('selector-camara').value).toBe('webcam')
    })
  })

  it('con una sola cámara no muestra el selector', async () => {
    getUserMedia.mockResolvedValue(crearStreamFalso().stream)

    render(<ConEstado />)
    await screen.findByTestId('boton-analizar')

    expect(screen.queryByTestId('selector-camara')).toBeNull()
  })

  it('mantiene los data-testid de la cámara acordados con QA', async () => {
    getUserMedia.mockRejectedValue(Object.assign(new Error('denegado'), { name: 'NotAllowedError' }))

    render(<ConEstado />)
    expect(screen.getByTestId('camara-video')).toBeTruthy()
    expect(screen.getByTestId('camara-cargando')).toBeTruthy()
    expect(await screen.findByTestId('estado-error')).toBeTruthy()
  })
})
