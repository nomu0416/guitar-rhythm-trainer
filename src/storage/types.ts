import type { DifficultyPresetId } from '../game/difficulty/types'
import type { PlaybackSpeedPercent } from '../audio/playback/types'

// design.md 3章 データモデル(storage/types.ts)に対応
export interface ScoreRecord {
  songId: string
  // 'custom'(詳細設定)は自己ベスト管理の対象外(spec.md 10章)なので保存しない
  difficultyId: Exclude<DifficultyPresetId, 'custom'>
  speed: PlaybackSpeedPercent // 例: 100 = 等倍速
  bestScore: number
  rank: string // 'S' | 'A' | 'B' | 'C' | ...
  maxCombo: number
  accuracy: number // 0-1
  breakdown: { perfect: number; good: number; miss: number }
  recordedAt: string // ISO 8601
}
