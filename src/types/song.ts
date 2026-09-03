import type * as alphaTab from '@coderline/alphatab'
import type { Chart } from '../chart/types'
import type { TempoSegment } from '../chart/parser/tempo'

/**
 * 画面横断で使う「選択中の曲」。Chart=レーン描画・判定用、MidiFile=BGM再生用と責務が分かれる
 * (design.md 5章)。どちらも同じ alphaTab.model.Score から生成されるため、速度を変えても
 * 両者の相対タイミングは自動的に一致する。
 * tempoSegments/ticksPerQuarter は GameClock(audio/playback/alphaSynthClock.ts)が
 * alphaSynthのtick位置を Chart.notes[].timeMs と同じ基準のmsへ変換するために必要。
 */
export interface Song {
  chart: Chart
  midiFile: alphaTab.midi.MidiFile
  tempoSegments: TempoSegment[]
  ticksPerQuarter: number
}
