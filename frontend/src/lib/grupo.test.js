import { describe, expect, it } from 'vitest'
import { emocionObjetivo } from './emociones.js'
import { combinarAnimos, mensajeGrupo, resumirConteo } from './grupo.js'

describe('combinarAnimos', () => {
  it('gana la emoción con más peso sumando la confianza de cada persona', () => {
    const grupo = combinarAnimos([
      { emocion: 'happy', confianza: 0.6 },
      { emocion: 'sad', confianza: 0.95 },
      { emocion: 'happy', confianza: 0.7 },
    ])
    expect(grupo.emocion).toBe('happy')
    expect(grupo.confianza).toBeCloseTo(0.65)
    expect(grupo.conteo).toEqual({ happy: 2, sad: 1 })
  })

  it('una persona muy segura puede pesar más que dos dudosas', () => {
    const grupo = combinarAnimos([
      { emocion: 'neutral', confianza: 0.3 },
      { emocion: 'neutral', confianza: 0.3 },
      { emocion: 'angry', confianza: 0.9 },
    ])
    expect(grupo.emocion).toBe('angry')
  })

  it('en un empate de peso gana la emoción con más personas', () => {
    const grupo = combinarAnimos([
      { emocion: 'sad', confianza: 0.8 },
      { emocion: 'happy', confianza: 0.4 },
      { emocion: 'happy', confianza: 0.4 },
    ])
    expect(grupo.emocion).toBe('happy')
  })

  it('devuelve null si no hay personas', () => {
    expect(combinarAnimos([])).toBeNull()
    expect(combinarAnimos(undefined)).toBeNull()
  })
})

describe('mensajes del grupo', () => {
  it('resume el conteo de más a menos personas', () => {
    expect(resumirConteo({ sad: 1, happy: 2 })).toBe('2 Feliz, 1 Triste')
  })

  it('distingue una sala de acuerdo de una dividida', () => {
    expect(mensajeGrupo({ emocion: 'happy', conteo: { happy: 3 } })).toContain('Todos en la sala coinciden')
    expect(mensajeGrupo({ emocion: 'happy', conteo: { happy: 2, sad: 1 } })).toContain(
      'La sala está dividida (2 Feliz, 1 Triste)',
    )
  })
})

describe('emocionObjetivo', () => {
  it('mantiene la emoción si se quiere acompañar el ánimo', () => {
    expect(emocionObjetivo('sad')).toBe('sad')
    expect(emocionObjetivo('sad', 'mantener')).toBe('sad')
  })

  it('propone otra emoción si se quiere cambiar el ánimo', () => {
    expect(emocionObjetivo('sad', 'cambiar')).toBe('happy')
    expect(emocionObjetivo('angry', 'cambiar')).toBe('neutral')
  })
})
