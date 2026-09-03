// design.md 3章 データモデル(audio/playback/types.ts)に対応
export type PlaybackSpeedPercent = number // 50-100 の整数(50%〜100%、5%刻みに丸めて記録する。spec.md 6章/10章)

/**
 * ゲーム全体が参照する単一の時刻源(design.md 5章・7章)。
 * alphaSynthClock.ts が alphaSynth の再生位置(timePosition)ベースで実装する。
 * game/render・game/engine はこのインターフェースにのみ依存し、実装の詳細を知らない。
 */
export interface GameClock {
  /** 曲頭からの経過時間(ms) */
  nowMs(): number
}
