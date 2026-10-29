import { describe, expect, it } from 'vitest'
import { EMOCIONES, emocionDominante, formatearConfianza, traducirEmocion } from './emociones.js'

describe('emociones', () => {
  it('traduce las 7 emociones de face-api al español', () => {
    expect(Object.keys(EMOCIONES)).toHaveLength(7)
    expect(traducirEmocion('happy')).toBe('Feliz')
    expect(traducirEmocion('disgusted')).toBe('Asco')
    expect(traducirEmocion('surprised')).toBe('Sorpresa')
  })

  it('elige la emoción con mayor probabilidad', () => {
    const expresiones = { neutral: 0.1, happy: 0.05, sad: 0.8, angry: 0.02, fearful: 0.01, disgusted: 0.01, surprised: 0.01 }
    expect(emocionDominante(expresiones)).toEqual({ emocion: 'sad', confianza: 0.8 })
  })

  it('devuelve null si no hay expresiones', () => {
    expect(emocionDominante(undefined)).toBeNull()
    expect(emocionDominante({})).toBeNull()
  })

  it('formatea la confianza como porcentaje', () => {
    expect(formatearConfianza(0.876)).toBe('88%')
  })
})
