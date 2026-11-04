import { describe, expect, it } from 'vitest'
import { animoSimulado } from './simulacion.js'

describe('animoSimulado', () => {
  it('acepta cualquiera de las 7 emociones', () => {
    expect(animoSimulado('sad')).toMatchObject({ emocion: 'sad', origen: 'camara', simulado: true })
  })

  it('simula un grupo dividido', () => {
    const grupo = animoSimulado('grupo')
    expect(grupo).toMatchObject({ emocion: 'happy', origen: 'grupo', conteo: { happy: 2, sad: 1 } })
    expect(grupo.personas).toHaveLength(3)
  })

  it('ignora valores que no son emociones', () => {
    expect(animoSimulado(null)).toBeNull()
    expect(animoSimulado('toString')).toBeNull()
    expect(animoSimulado('feliz')).toBeNull()
  })
})
