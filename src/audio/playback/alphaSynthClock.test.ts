import { describe, expect, it } from 'vitest'
import type * as alphaTab from '@coderline/alphatab'
import type { TempoSegment } from '../../chart/parser/tempo'
import { createAlphaSynthClock } from './alphaSynthClock'

const TICKS_PER_QUARTER = 480

describe('createAlphaSynthClock', () => {
  it('converts synth.tickPosition to ms using the original tempo (not wall-clock timePosition)', () => {
    // IAlphaSynthはinterfaceなので、tickPositionだけを持つダックタイピングで十分検証できる
    const fakeSynth = { tickPosition: 0 } as unknown as alphaTab.synth.IAlphaSynth
    const segments: TempoSegment[] = [{ startTick: 0, bpm: 120 }]
    const clock = createAlphaSynthClock(fakeSynth, segments, TICKS_PER_QUARTER)

    expect(clock.nowMs()).toBe(0)

    // 120bpmでは四分音符(480tick)が500ms。playbackSpeedを落として壁時計時間が
    // 余分に経過しても、tickPositionが同じであればnowMs()は変わらない(=元テンポ基準)。
    fakeSynth.tickPosition = 480
    expect(clock.nowMs()).toBeCloseTo(500, 6)
  })
})
