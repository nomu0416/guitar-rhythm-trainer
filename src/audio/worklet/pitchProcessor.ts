import { detectPitch, requiredFrameLength } from '../pitch/yin'
import { FloatRingBuffer } from '../pitch/ringBuffer'
import { calculateRms } from '../pitch/rms'

const MIN_FREQUENCY_HZ = 70
const HOP_SIZE = 512

/**
 * マイク入力からYIN法でピッチを検出するAudioWorkletProcessor(design.md 6章)。
 * process()はrender quantum(128サンプル)単位で呼ばれるため、リングバッファに蓄積し、
 * ホップサイズ(既定512サンプル)ごとに検出処理を実行する。
 */
class PitchDetectorProcessor extends AudioWorkletProcessor {
  private readonly frameLength: number
  private readonly ringBuffer: FloatRingBuffer
  private samplesSinceLastHop = 0

  constructor() {
    super()
    this.frameLength = requiredFrameLength(sampleRate, MIN_FREQUENCY_HZ)
    this.ringBuffer = new FloatRingBuffer(this.frameLength)
  }

  process(inputs: Float32Array[][]): boolean {
    const input = inputs[0]?.[0]
    if (!input || input.length === 0) return true

    this.ringBuffer.write(input)
    this.samplesSinceLastHop += input.length

    if (this.ringBuffer.isFull && this.samplesSinceLastHop >= HOP_SIZE) {
      this.samplesSinceLastHop = 0
      const frame = this.ringBuffer.readLatest(this.frameLength)
      const { frequencyHz, confidence } = detectPitch(frame, {
        sampleRate,
        minFrequencyHz: MIN_FREQUENCY_HZ,
      })
      this.port.postMessage({
        type: 'result',
        result: {
          timeSec: currentTime,
          frequencyHz,
          confidence,
          rms: calculateRms(frame),
        },
      })
    }

    return true
  }
}

registerProcessor('pitch-detector', PitchDetectorProcessor)
