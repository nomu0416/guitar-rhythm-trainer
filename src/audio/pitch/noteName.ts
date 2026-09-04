export interface NoteNameResult {
  /** 音名(シャープ表記。C, C#, D, ...) */
  name: string
  /** オクターブ(MIDI規格、中央Cを含むオクターブ=4) */
  octave: number
  /** 最寄りの半音からのセント差(-50〜+50)。表示用(キャリブレーション画面の検出音程表示) */
  cents: number
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const A4_MIDI = 69
const A4_HZ = 440

/**
 * 周波数を最寄りの音名・オクターブ・セント差に変換する(A4=440Hz基準の平均律)。
 * `chart/parser/pitch.ts` の弦・フレット→周波数計算とは独立した、表示専用の逆変換。
 */
export function frequencyToNoteName(hz: number): NoteNameResult | null {
  if (!(hz > 0) || !Number.isFinite(hz)) return null

  const midiFloat = A4_MIDI + 12 * Math.log2(hz / A4_HZ)
  const midiRounded = Math.round(midiFloat)
  const cents = (midiFloat - midiRounded) * 100
  const name = NOTE_NAMES[((midiRounded % 12) + 12) % 12]
  const octave = Math.floor(midiRounded / 12) - 1

  return { name, octave, cents }
}
