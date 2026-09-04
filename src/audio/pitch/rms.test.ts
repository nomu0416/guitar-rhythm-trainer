import { describe, expect, it } from 'vitest'
import { calculateRms, rmsToDbfs } from './rms'

describe('calculateRms', () => {
  it('returns 0 for silence', () => {
    expect(calculateRms(new Float32Array(100))).toBe(0)
  })

  it('returns amplitude/sqrt(2) for a full-scale sine wave', () => {
    const length = 1000
    const frame = new Float32Array(length)
    for (let i = 0; i < length; i++) {
      frame[i] = Math.sin((2 * Math.PI * 10 * i) / length)
    }
    expect(calculateRms(frame)).toBeCloseTo(1 / Math.sqrt(2), 2)
  })

  it('returns the constant value for a DC signal', () => {
    expect(calculateRms(new Float32Array(10).fill(0.5))).toBeCloseTo(0.5, 6)
  })
})

describe('rmsToDbfs', () => {
  it('maps rms=1 to 0dBFS', () => {
    expect(rmsToDbfs(1)).toBeCloseTo(0, 6)
  })

  it('clamps silence to the floor', () => {
    expect(rmsToDbfs(0)).toBe(-60)
    expect(rmsToDbfs(0, -40)).toBe(-40)
  })

  it('maps rms=0.5 to about -6dBFS', () => {
    expect(rmsToDbfs(0.5)).toBeCloseTo(-6.02, 1)
  })
})
