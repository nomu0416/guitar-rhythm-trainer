// design.md 3章 データモデル(game/engine/types.ts)に対応
export type JudgementRank = 'perfect' | 'good' | 'miss'

export interface JudgementResult {
  noteId: string
  rank: JudgementRank
  timingErrorMs: number
  pitchErrorCents: number | null // 無音などでピッチ未検出の場合は null
}
