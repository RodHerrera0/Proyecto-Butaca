import { describe, expect, it } from 'vitest'
import { elegirCamaraPreferida, esIntegrada } from './camaras.js'

const INTEGRADA = { id: 'a', etiqueta: 'Integrated Camera (04f2:b6dd)' }
const EXTERNA = { id: 'b', etiqueta: 'Logitech C920 HD Pro Webcam (046d:082d)' }

describe('camaras', () => {
  it('reconoce las cámaras integradas por su nombre', () => {
    expect(esIntegrada(INTEGRADA)).toBe(true)
    expect(esIntegrada({ id: 'x', etiqueta: 'FaceTime HD Camera' })).toBe(true)
    expect(esIntegrada({ id: 'x', etiqueta: 'Cámara frontal' })).toBe(true)
    expect(esIntegrada(EXTERNA)).toBe(false)
  })

  it('prefiere la webcam externa aunque la integrada aparezca primero', () => {
    expect(elegirCamaraPreferida([INTEGRADA, EXTERNA])).toBe('b')
  })

  it('respeta la cámara elegida a mano si sigue conectada', () => {
    expect(elegirCamaraPreferida([INTEGRADA, EXTERNA], 'a')).toBe('a')
    expect(elegirCamaraPreferida([INTEGRADA, EXTERNA], 'desconectada')).toBe('b')
  })

  it('sin externas deja la que dé el navegador', () => {
    expect(elegirCamaraPreferida([INTEGRADA])).toBeNull()
    expect(elegirCamaraPreferida([])).toBeNull()
  })
})
