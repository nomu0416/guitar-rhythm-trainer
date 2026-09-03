import { describe, expect, it } from 'vitest'
import { noteFrequencyHz, pickHighestPitchNote } from './pitch'

describe('noteFrequencyHz', () => {
  it('returns the standard open-string frequency for fret 0', () => {
    expect(noteFrequencyHz(1, 0)).toBeCloseTo(329.63, 1) // 1弦開放 = E4
    expect(noteFrequencyHz(6, 0)).toBeCloseTo(82.41, 1) // 6弦開放 = E2
  })

  it('raises the pitch by one octave 12 frets up', () => {
    const open = noteFrequencyHz(1, 0)
    const twelfthFret = noteFrequencyHz(1, 12)
    expect(twelfthFret).toBeCloseTo(open * 2, 6)
  })
})

describe('pickHighestPitchNote', () => {
  it('returns null for an empty list', () => {
    expect(pickHighestPitchNote([])).toBeNull()
  })

  it('returns the only candidate when there is one', () => {
    const only = { string: 4 as const, fret: 3 }
    expect(pickHighestPitchNote([only])).toEqual(only)
  })

  it('picks the string with the lower number when both are open', () => {
    // 弦番号が小さいほど高音弦(design.md 6章)なので、通常は1弦側が高い
    const result = pickHighestPitchNote([
      { string: 3, fret: 0 },
      { string: 1, fret: 0 },
    ])
    expect(result).toEqual({ string: 1, fret: 0 })
  })

  it('picks by actual pitch even when the string number order is reversed', () => {
    // 2弦開放(B3, ~246.94Hz) より 3弦5フレット(G3+5半音, ~261.63Hz)の方が実際には高い音
    // 弦番号やフレット番号の大小ではなく、実音高で比較していることを確認する(design.md 4章)
    const result = pickHighestPitchNote([
      { string: 2, fret: 0 },
      { string: 3, fret: 5 },
    ])
    expect(result).toEqual({ string: 3, fret: 5 })
  })
})
