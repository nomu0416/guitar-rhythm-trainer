import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import * as alphaTab from '@coderline/alphatab'
import { ChartImportError, importChartFromBytes } from './fromAlphaTabScore'

// public/samples/practice-phrase.gp は動作確認用に自作したオリジナルの短いフレーズ
// (alphaTexで作成しGp7Exporterでエクスポートしたもの。実在の楽曲データではない)
const SAMPLE_PATH = fileURLToPath(
  new URL('../../../public/samples/practice-phrase.gp', import.meta.url),
)

describe('importChartFromBytes', () => {
  it('parses the bundled sample .gp file into a Chart', () => {
    const bytes = new Uint8Array(readFileSync(SAMPLE_PATH))
    const { chart, midiFile } = importChartFromBytes(bytes, 'practice-phrase', 'gp')

    expect(chart.title).toBe('Practice Phrase')
    expect(chart.artist).toBe('FretRush Dev')
    expect(chart.tuning).toBe('standard-eadgbe')
    expect(chart.notes).toHaveLength(16)
    // BGM再生(audio/playback/alphaSynthPlayer.ts)がそのまま使えるMidiFileも返すこと
    expect(midiFile).toBeInstanceOf(alphaTab.midi.MidiFile)

    // alphaTexの入力(fret.string、TAB譜慣習の弦番号):
    //   3.3 5.3 3.2 5.2 | 3.1 5.1 3.1 1.1 |
    //   0.6 2.6 3.6 0.5 | 2.5 3.5 0.4 2.4 |
    // Note.string の採番反転(TAB1弦=alphaTab内部6弦)が正しく行われていることを確認する
    expect(chart.notes.map((n) => ({ string: n.string, fret: n.fret }))).toEqual([
      { string: 3, fret: 3 },
      { string: 3, fret: 5 },
      { string: 2, fret: 3 },
      { string: 2, fret: 5 },
      { string: 1, fret: 3 },
      { string: 1, fret: 5 },
      { string: 1, fret: 3 },
      { string: 1, fret: 1 },
      { string: 6, fret: 0 },
      { string: 6, fret: 2 },
      { string: 6, fret: 3 },
      { string: 5, fret: 0 },
      { string: 5, fret: 2 },
      { string: 5, fret: 3 },
      { string: 4, fret: 0 },
      { string: 4, fret: 2 },
    ])

    // timeMsが昇順(=発音順)になっていること
    const timings = chart.notes.map((n) => n.timeMs)
    expect(timings).toEqual([...timings].sort((a, b) => a - b))
  })

  it('throws ChartImportError for corrupt data', () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5])
    expect(() => importChartFromBytes(bytes, 'broken', 'gp3')).toThrow(ChartImportError)
  })

  it('parses a public-domain melody (Ode to Joy excerpt) with recognizable note names', () => {
    const path = fileURLToPath(new URL('../../../public/samples/ode-to-joy.gp', import.meta.url))
    const bytes = new Uint8Array(readFileSync(path))
    const { chart } = importChartFromBytes(bytes, 'ode-to-joy', 'gp')

    expect(chart.title).toBe('Ode to Joy (excerpt)')
    expect(chart.notes).toHaveLength(16)

    // E E F G | G F E D | C C D E | E D D D | (1ポジション運指: D線2f=E, D線3f=F, G線開放=G, D線開放=D, A線3f=C)
    expect(chart.notes.map((n) => ({ string: n.string, fret: n.fret }))).toEqual([
      { string: 4, fret: 2 },
      { string: 4, fret: 2 },
      { string: 4, fret: 3 },
      { string: 3, fret: 0 },
      { string: 3, fret: 0 },
      { string: 4, fret: 3 },
      { string: 4, fret: 2 },
      { string: 4, fret: 0 },
      { string: 5, fret: 3 },
      { string: 5, fret: 3 },
      { string: 4, fret: 0 },
      { string: 4, fret: 2 },
      { string: 4, fret: 2 },
      { string: 4, fret: 0 },
      { string: 4, fret: 0 },
      { string: 4, fret: 0 },
    ])
  })

  it('reflects a mid-song tempo change in timeMs (tempo 80 -> 160)', () => {
    const path = fileURLToPath(
      new URL('../../../public/samples/tempo-change-phrase.gp', import.meta.url),
    )
    const bytes = new Uint8Array(readFileSync(path))
    const { chart } = importChartFromBytes(bytes, 'tempo-change', 'gp')

    expect(chart.notes).toHaveLength(8)
    const timings = chart.notes.map((n) => n.timeMs)

    // 1小節目(80bpm、四分音符間隔750ms) -> 2小節目(160bpm、四分音符間隔375ms)
    const firstBarGaps = [timings[1] - timings[0], timings[2] - timings[1], timings[3] - timings[2]]
    const secondBarGaps = [timings[5] - timings[4], timings[6] - timings[5], timings[7] - timings[6]]

    for (const gap of firstBarGaps) expect(gap).toBeCloseTo(750, 0)
    for (const gap of secondBarGaps) expect(gap).toBeCloseTo(375, 0)
  })
})
