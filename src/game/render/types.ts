import type { Chart } from '../../chart/types'
import type { GameClock } from '../../audio/playback/types'

export interface LaneRendererOptions {
  canvas: HTMLCanvasElement
  chart: Chart
  clock: GameClock
  /** ノーツが判定ラインに到達する何ms前に画面左端へ出現させるか(design.md 9章、既定2000) */
  noteLeadTimeMs?: number
}

export interface LaneRenderer {
  start(): void
  stop(): void
}
