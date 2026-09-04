import { createPitchWorklet, type PitchDetectionResult } from '../worklet/pitchWorkletNode'

export type { PitchDetectionResult }

export interface PitchDetectionPipeline {
  onResult(cb: (result: PitchDetectionResult) => void): () => void
  dispose(): void
}

/** マイク入力用のAudioContextを生成する(design.md 6章: BGM再生用とは別インスタンス) */
export function createMicAudioContext(): AudioContext {
  return new AudioContext()
}

/**
 * マイクの生ストリームからピッチ検出結果のイベントストリームまでを束ねる公開エントリポイント
 * (design.md 2.1節の依存図: audio/input -> audio/worklet)。
 */
export async function createPitchDetectionPipeline(
  audioContext: AudioContext,
  micStream: MediaStream,
): Promise<PitchDetectionPipeline> {
  const worklet = await createPitchWorklet(audioContext, micStream)
  return {
    onResult: worklet.onResult,
    dispose: worklet.dispose,
  }
}
