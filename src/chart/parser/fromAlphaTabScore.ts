import * as alphaTab from '@coderline/alphatab'
import type { Chart, Note, StringNumber } from '../types'
import { pickHighestPitchNote, type PitchCandidate } from './pitch'
import { ticksToMs, type TempoSegment } from './tempo'

/** 標準チューニング以外しか無い、破損ファイル等でインポートに失敗した場合に投げる */
export class ChartImportError extends Error {}

export interface ImportResult {
  chart: Chart
  warnings: string[]
}

// 標準EADGBEの開放弦MIDIノート番号。alphaTabの Staff.tuning と同じ並び(先頭が1弦=最上段)
const STANDARD_TUNING_MIDI = [64, 59, 55, 50, 45, 40]

function isStandardTuning(tuning: number[]): boolean {
  return (
    tuning.length === STANDARD_TUNING_MIDI.length &&
    tuning.every((value, index) => value === STANDARD_TUNING_MIDI[index])
  )
}

function findStandardTuningStaff(
  score: alphaTab.model.Score,
): { track: alphaTab.model.Track; staff: alphaTab.model.Staff } | null {
  for (const track of score.tracks) {
    for (const staff of track.staves) {
      if (staff.isStringed && isStandardTuning(staff.tuning)) {
        return { track, staff }
      }
    }
  }
  return null
}

/**
 * alphaTabの `Note.string` は「1が最も低い弦(TAB譜の一番下の線)」という採番で、
 * design.md の StringNumber(1が最も高い弦 = TAB譜の一番上の線)とは逆になっている。
 * (`Staff.tuning` は逆に「先頭が一番上の線」なのでこちらは design.md の並びと一致する)
 * ここで採番を反転させる。
 */
function toStringNumber(alphaTabString: number, stringCount: number): StringNumber {
  return (stringCount + 1 - alphaTabString) as StringNumber
}

/**
 * テンポ変更情報を使って tick -> ms 変換に使うテンポ区間列を取り出す(design.md 4章)。
 * 実際に音を鳴らすわけではなく、MidiFileGenerator が構築する tickLookup だけを利用する。
 */
function extractTempoSegments(
  score: alphaTab.model.Score,
  settings: alphaTab.Settings,
): { segments: TempoSegment[]; ticksPerQuarter: number } {
  const midiFile = new alphaTab.midi.MidiFile()
  const handler = new alphaTab.midi.AlphaSynthMidiFileHandler(midiFile)
  const generator = new alphaTab.midi.MidiFileGenerator(score, settings, handler)
  generator.generate()

  const segments: TempoSegment[] = []
  for (const masterBar of generator.tickLookup.masterBars) {
    for (const change of masterBar.tempoChanges) {
      segments.push({ startTick: change.tick, bpm: change.tempo })
    }
  }
  segments.sort((a, b) => a.startTick - b.startTick)

  if (segments.length === 0) {
    // テンポ変更が全く記録されていない極端なケースへのフォールバック
    segments.push({ startTick: 0, bpm: score.tempo })
  }

  return { segments, ticksPerQuarter: midiFile.division }
}

export function convertScoreToChart(
  score: alphaTab.model.Score,
  songId: string,
  sourceFormat: Chart['sourceFormat'],
  settings: alphaTab.Settings,
): ImportResult {
  const warnings: string[] = []

  const found = findStandardTuningStaff(score)
  if (!found) {
    throw new ChartImportError(
      '標準チューニング(EADGBE)のギタートラックが見つかりませんでした。v1はレギュラーチューニングの譜面のみ対応しています。',
    )
  }
  const { staff } = found
  const stringCount = staff.tuning.length

  const { segments, ticksPerQuarter } = extractTempoSegments(score, settings)

  const notes: Note[] = []
  let noteIndex = 0
  for (const bar of staff.bars) {
    for (const voice of bar.voices) {
      for (const beat of voice.beats) {
        if (beat.notes.length === 0) continue // 休符

        const candidates: PitchCandidate[] = beat.notes.map((n) => ({
          string: toStringNumber(n.string, stringCount),
          fret: n.fret,
        }))
        const picked = pickHighestPitchNote(candidates)
        if (!picked) continue

        notes.push({
          id: `note-${noteIndex++}`,
          timeMs: ticksToMs(beat.absolutePlaybackStart, segments, ticksPerQuarter),
          string: picked.string,
          fret: picked.fret,
        })
      }
    }
  }

  notes.sort((a, b) => a.timeMs - b.timeMs)

  const chart: Chart = {
    songId,
    title: score.title || '(無題)',
    artist: score.artist || '',
    bpm: score.tempo,
    tuning: 'standard-eadgbe',
    notes,
    sourceFormat,
  }

  return { chart, warnings }
}

/** ファイル拡張子から Chart.sourceFormat を推測する */
export function sourceFormatFromFileName(fileName: string): Chart['sourceFormat'] | null {
  const ext = fileName.toLowerCase().split('.').pop()
  switch (ext) {
    case 'gp3':
    case 'gp4':
    case 'gp5':
      return ext
    case 'gpx':
      return 'gpx'
    case 'gp':
      return 'gp'
    case 'musicxml':
    case 'xml':
      return 'musicxml'
    default:
      return null
  }
}

/**
 * ファイルの生バイト列から Chart を組み立てる(譜面選択画面から呼ぶ入口)。
 * alphaTab がサポートしない形式・破損ファイルの場合は ChartImportError を投げる。
 */
export function importChartFromBytes(
  data: Uint8Array,
  songId: string,
  sourceFormat: Chart['sourceFormat'],
): ImportResult {
  const settings = new alphaTab.Settings()
  let score: alphaTab.model.Score
  try {
    score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(data, settings)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    throw new ChartImportError(`譜面の読み込みに失敗しました: ${message}`)
  }
  return convertScoreToChart(score, songId, sourceFormat, settings)
}
