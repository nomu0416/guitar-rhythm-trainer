import { describe, expect, it } from 'vitest'
import { detectPitch, requiredFrameLength, type YinOptions } from './yin'
import { OPEN_STRING_HZ } from '../../chart/parser/pitch'

const SAMPLE_RATE = 44100
const MIN_FREQUENCY_HZ = 70

function generateSineWave(
  freqHz: number,
  sampleRate: number,
  length: number,
  amplitude = 0.5,
): Float32Array {
  const frame = new Float32Array(length)
  for (let i = 0; i < length; i++) {
    frame[i] = amplitude * Math.sin((2 * Math.PI * freqHz * i) / sampleRate)
  }
  return frame
}

function generateHarmonicWave(
  fundamentalHz: number,
  sampleRate: number,
  length: number,
): Float32Array {
  const frame = new Float32Array(length)
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate
    frame[i] =
      0.5 * Math.sin(2 * Math.PI * fundamentalHz * t) +
      0.25 * Math.sin(2 * Math.PI * fundamentalHz * 2 * t) +
      0.125 * Math.sin(2 * Math.PI * fundamentalHz * 3 * t)
  }
  return frame
}

function centsDiff(detectedHz: number, expectedHz: number): number {
  return 1200 * Math.log2(detectedHz / expectedHz)
}

const options: YinOptions = { sampleRate: SAMPLE_RATE, minFrequencyHz: MIN_FREQUENCY_HZ }
const frameLength = requiredFrameLength(SAMPLE_RATE, MIN_FREQUENCY_HZ)

describe('detectPitch', () => {
  it.each(Object.entries(OPEN_STRING_HZ))(
    '開放弦%s弦(%fHz)の正弦波を5セント以内の誤差で検出できる',
    (_string, hz) => {
      const frame = generateSineWave(hz, SAMPLE_RATE, frameLength)
      const result = detectPitch(frame, options)

      expect(result.frequencyHz).not.toBeNull()
      expect(Math.abs(centsDiff(result.frequencyHz!, hz))).toBeLessThan(5)
      expect(result.confidence).toBeGreaterThan(0.5)
    },
  )

  it('倍音を含む波形でも基音を検出できる', () => {
    const fundamental = OPEN_STRING_HZ[6] // E2 ≈ 82.4Hz
    const frame = generateHarmonicWave(fundamental, SAMPLE_RATE, frameLength)
    const result = detectPitch(frame, options)

    expect(result.frequencyHz).not.toBeNull()
    expect(Math.abs(centsDiff(result.frequencyHz!, fundamental))).toBeLessThan(10)
  })

  it('無音では frequencyHz が null になる', () => {
    const frame = new Float32Array(frameLength) // 全て0
    const result = detectPitch(frame, options)

    expect(result.frequencyHz).toBeNull()
    expect(result.confidence).toBe(0)
  })

  it('ホワイトノイズでは検出周波数がnull、または信頼度が低い', () => {
    const frame = new Float32Array(frameLength)
    // 決定的な擬似乱数(シード固定)でテストの再現性を確保する
    let seed = 42
    for (let i = 0; i < frameLength; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      frame[i] = (seed / 0x7fffffff) * 2 - 1
    }
    const result = detectPitch(frame, options)

    if (result.frequencyHz !== null) {
      expect(result.confidence).toBeLessThan(0.5)
    }
  })

  it('requiredFrameLength はサンプルレートと最低周波数から妥当な長さを返す', () => {
    // 44.1kHz・70Hz下限なら概ね2周期分(2 * 44100/70 ≈ 1260)以上
    expect(frameLength).toBeGreaterThanOrEqual(Math.ceil((2 * SAMPLE_RATE) / MIN_FREQUENCY_HZ))
  })
})
