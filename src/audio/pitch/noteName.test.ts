import { describe, expect, it } from 'vitest'
import { frequencyToNoteName } from './noteName'
import { OPEN_STRING_HZ } from '../../chart/parser/pitch'

describe('frequencyToNoteName', () => {
  it('returns null for non-positive or non-finite input', () => {
    expect(frequencyToNoteName(0)).toBeNull()
    expect(frequencyToNoteName(-10)).toBeNull()
    expect(frequencyToNoteName(NaN)).toBeNull()
  })

  it('identifies A4 as 440Hz exactly with 0 cents', () => {
    const result = frequencyToNoteName(440)
    expect(result).toEqual({ name: 'A', octave: 4, cents: 0 })
  })

  it('identifies the standard open-string frequencies', () => {
    // 1弦(E4)〜6弦(E2)。chart/parser/pitch.ts の OPEN_STRING_HZ と一致すること
    expect(frequencyToNoteName(OPEN_STRING_HZ[1])?.name).toBe('E')
    expect(frequencyToNoteName(OPEN_STRING_HZ[1])?.octave).toBe(4)
    expect(frequencyToNoteName(OPEN_STRING_HZ[6])?.name).toBe('E')
    expect(frequencyToNoteName(OPEN_STRING_HZ[6])?.octave).toBe(2)
    expect(frequencyToNoteName(OPEN_STRING_HZ[5])?.name).toBe('A')
    expect(frequencyToNoteName(OPEN_STRING_HZ[5])?.octave).toBe(2)
  })

  it('reports a positive cents offset when slightly sharp', () => {
    // A4 (440Hz) から10セント高い周波数
    const sharpHz = 440 * 2 ** (10 / 1200)
    const result = frequencyToNoteName(sharpHz)
    expect(result?.name).toBe('A')
    expect(result?.cents).toBeCloseTo(10, 1)
  })

  it('reports a negative cents offset when slightly flat', () => {
    const flatHz = 440 * 2 ** (-15 / 1200)
    const result = frequencyToNoteName(flatHz)
    expect(result?.name).toBe('A')
    expect(result?.cents).toBeCloseTo(-15, 1)
  })
})
