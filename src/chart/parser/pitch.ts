import type { StringNumber } from '../types'

const A4_HZ = 440
const A4_MIDI = 69

function midiToHz(midiNote: number): number {
  return A4_HZ * 2 ** ((midiNote - A4_MIDI) / 12)
}

/**
 * 標準チューニング(EADGBE)の開放弦のMIDIノート番号。1弦(E4)〜6弦(E2)。
 * alphaTabの Staff.tuning と同じ並び([64, 59, 55, 50, 45, 40])。
 */
export const OPEN_STRING_MIDI: Record<StringNumber, number> = {
  1: 64,
  2: 59,
  3: 55,
  4: 50,
  5: 45,
  6: 40,
}

/** 標準チューニングの開放弦周波数(E2/A2/D3/G3/B3/E4。design.md 6章) */
export const OPEN_STRING_HZ: Record<StringNumber, number> = {
  1: midiToHz(OPEN_STRING_MIDI[1]),
  2: midiToHz(OPEN_STRING_MIDI[2]),
  3: midiToHz(OPEN_STRING_MIDI[3]),
  4: midiToHz(OPEN_STRING_MIDI[4]),
  5: midiToHz(OPEN_STRING_MIDI[5]),
  6: midiToHz(OPEN_STRING_MIDI[6]),
}

/** 弦・フレット位置の実音高(Hz)。design.md 6章: expectedHz = openHz * 2^(fret/12) */
export function noteFrequencyHz(string: StringNumber, fret: number): number {
  return OPEN_STRING_HZ[string] * 2 ** (fret / 12)
}

export interface PitchCandidate {
  string: StringNumber
  fret: number
}

/**
 * 同時発音の複数候補(和音)から、実音高が最も高い1件だけを返す。
 * 弦番号・フレット番号の大小ではなく、実際に鳴る周波数の高低で比較する
 * (design.md 4章「v1では実際の発音周波数が最も高い1音のみを採用」)。
 */
export function pickHighestPitchNote(candidates: PitchCandidate[]): PitchCandidate | null {
  if (candidates.length === 0) return null
  return candidates.reduce((highest, candidate) =>
    noteFrequencyHz(candidate.string, candidate.fret) >
    noteFrequencyHz(highest.string, highest.fret)
      ? candidate
      : highest,
  )
}
