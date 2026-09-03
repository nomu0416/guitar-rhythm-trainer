// design.md 3章 データモデル(chart/types.ts)に対応
export type StringNumber = 1 | 2 | 3 | 4 | 5 | 6 // TAB譜の弦番号(1弦〜6弦)

export interface Note {
  id: string
  timeMs: number // 曲頭からの発音タイミング(判定ラインに到達する時刻)
  string: StringNumber
  fret: number // 0 = 開放弦
  durationMs?: number // v1では表示用途のみ。判定は始点(timeMs)のみで行う(spec.md 5章)
}

export interface Chart {
  songId: string
  title: string
  artist: string
  bpm: number
  tuning: 'standard-eadgbe' // v1は固定(spec.md 2章)
  notes: Note[]
  sourceFormat: 'gp3' | 'gp4' | 'gp5' | 'gpx' | 'gp' | 'musicxml' | 'alphatex'
}
