import type * as alphaTab from '@coderline/alphatab'
import { ticksToMs, type TempoSegment } from '../../chart/parser/tempo'
import type { GameClock } from './types'

/**
 * alphaSynthの再生位置を単一の真実源とするGameClock実装(design.md 5章・7章)。
 *
 * `synth.timePosition`は再生速度(playbackSpeed)に関わらず実時間(壁時計)で進む値のため、
 * そのまま使うと再生速度を落としてもノーツの流れる速さが変わらなくなってしまう。
 * 元テンポ基準のtick位置である`synth.tickPosition`を、Chart生成時と同じテンポ区間情報で
 * ms変換することで、`Chart.notes[].timeMs`と同じ基準の「曲頭からの経過時間」を得る
 * (再生速度が変わると実時間に対するtickの進み方が変わるため、結果としてノーツも連動して遅くなる)。
 */
export function createAlphaSynthClock(
  synth: alphaTab.synth.IAlphaSynth,
  tempoSegments: TempoSegment[],
  ticksPerQuarter: number,
): GameClock {
  return {
    nowMs() {
      return ticksToMs(synth.tickPosition, tempoSegments, ticksPerQuarter)
    },
  }
}
