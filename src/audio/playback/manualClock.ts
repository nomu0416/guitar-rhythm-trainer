import type { GameClock } from './types'

/**
 * 今回のセッション限定の仮GameClock実装。performance.now() を基準に、
 * 生成時刻からの経過msを曲頭からの経過時間として扱う。
 * 次回セッションでalphaSynthの再生位置ベースの実装に置き換える(design.md 5章)。
 */
export function createManualClock(): GameClock {
  const startedAt = performance.now()
  return {
    nowMs() {
      return performance.now() - startedAt
    },
  }
}
