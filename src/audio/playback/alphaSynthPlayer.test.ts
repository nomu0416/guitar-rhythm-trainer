import { describe, expect, it } from 'vitest'
import { speedPercentToPlaybackSpeed } from './alphaSynthPlayer'

describe('speedPercentToPlaybackSpeed', () => {
  it('maps 50-100(%) to 0.5-1.0', () => {
    expect(speedPercentToPlaybackSpeed(50)).toBe(0.5)
    expect(speedPercentToPlaybackSpeed(70)).toBeCloseTo(0.7, 6)
    expect(speedPercentToPlaybackSpeed(100)).toBe(1)
  })
})
