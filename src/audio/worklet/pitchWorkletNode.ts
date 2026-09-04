export interface PitchDetectionResult {
  timeSec: number
  frequencyHz: number | null
  confidence: number
  rms: number
}

export interface PitchWorklet {
  node: AudioWorkletNode
  onResult(cb: (result: PitchDetectionResult) => void): () => void
  dispose(): void
}

/**
 * マイク入力ストリームをAudioWorkletに接続し、ピッチ検出結果を受け取れるようにする(design.md 6章)。
 * `micStream` にはマイクからの本物のストリーム、または開発用の合成音源ストリームを渡せる。
 */
export async function createPitchWorklet(
  audioContext: AudioContext,
  micStream: MediaStream,
): Promise<PitchWorklet> {
  // Vite dev環境での既知の落とし穴(design.md 6章参照): `?worker&url`/`?url`サフィックスは
  // 「実URLを含むJSモジュール」を返す変換であり、addModule()が要求する生スクリプトにはならない。
  // クエリなしの `new URL('./pitchProcessor.ts', import.meta.url)` が正しい(トランスパイル済み
  // ESモジュールとして配信され、内部のimportもVite側で解決される)。
  const workletUrl = new URL('./pitchProcessor.ts', import.meta.url)
  await audioContext.audioWorklet.addModule(workletUrl)

  const source = audioContext.createMediaStreamSource(micStream)
  const node = new AudioWorkletNode(audioContext, 'pitch-detector', {
    numberOfInputs: 1,
    numberOfOutputs: 1,
    channelCount: 1,
    channelCountMode: 'explicit',
  })

  // マイク音をそのまま出力するとハウリングするため、無音のGainNode経由でdestinationに接続する。
  // (destinationに繋がないとブラウザによっては process() が呼ばれ続けない既知の挙動があるため)
  const silentGain = audioContext.createGain()
  silentGain.gain.value = 0
  source.connect(node)
  node.connect(silentGain).connect(audioContext.destination)

  const listeners = new Set<(result: PitchDetectionResult) => void>()
  node.port.onmessage = (event: MessageEvent) => {
    if (event.data?.type === 'result') {
      const result = event.data.result as PitchDetectionResult
      for (const listener of listeners) listener(result)
    }
  }

  return {
    node,
    onResult(cb) {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    dispose() {
      listeners.clear()
      node.port.onmessage = null
      node.disconnect()
      source.disconnect()
      silentGain.disconnect()
    },
  }
}
