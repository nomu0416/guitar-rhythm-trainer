// design.md 3章 データモデル(game/difficulty/types.ts)に対応
export type DifficultyPresetId =
  | 'very-loose'
  | 'loose'
  | 'standard'
  | 'strict'
  | 'very-strict'
  | 'custom'

export interface JudgementWindow {
  timingPerfectMs: number
  timingGoodMs: number
  pitchPerfectCents: number
  pitchGoodCents: number
}

export interface DifficultyPreset {
  id: DifficultyPresetId
  label: string // 例: 「標準」
  window: JudgementWindow
}
