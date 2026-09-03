import { describe, expect, it } from 'vitest'
import { ticksToMs, type TempoSegment } from './tempo'

const TICKS_PER_QUARTER = 480

describe('ticksToMs', () => {
  it('converts ticks to ms under a single constant tempo', () => {
    const segments: TempoSegment[] = [{ startTick: 0, bpm: 120 }]
    // 120 BPMでは4分音符(=1拍=480tick)が500ms
    expect(ticksToMs(480, segments, TICKS_PER_QUARTER)).toBeCloseTo(500, 6)
    expect(ticksToMs(0, segments, TICKS_PER_QUARTER)).toBe(0)
  })

  it('accumulates elapsed time across a tempo change', () => {
    const segments: TempoSegment[] = [
      { startTick: 0, bpm: 120 }, // 2拍(960tick) = 1000ms
      { startTick: 960, bpm: 60 }, // その後1拍(480tick) = 1000ms
    ]
    // 切り替え地点ちょうど
    expect(ticksToMs(960, segments, TICKS_PER_QUARTER)).toBeCloseTo(1000, 6)
    // 切り替え後さらに1拍進んだ地点
    expect(ticksToMs(1440, segments, TICKS_PER_QUARTER)).toBeCloseTo(2000, 6)
  })
})
