export interface SyntheticMicStream {
  stream: MediaStream
  stop(): void
}

/**
 * 開発用の合成音源(懸念事項2の対応策。design.md 6章)。
 * 実マイクの許可が下りない/デバイスが無い環境でも、AudioWorklet起動〜ピッチ検出〜UI表示
 * までの経路を通しで確認できるようにする。本番ビルドには含めない
 * (呼び出し側で `import.meta.env.DEV` 時のみ動的importする)。
 */
export function createSyntheticMicStream(
  audioContext: AudioContext,
  frequencyHz: number,
  type: OscillatorType = 'sawtooth', // ギター音に近い倍音を持たせ、基音のみのsineより検証として厳しくする
): SyntheticMicStream {
  const oscillator = audioContext.createOscillator()
  oscillator.type = type
  oscillator.frequency.value = frequencyHz

  const destination = audioContext.createMediaStreamDestination()
  oscillator.connect(destination)
  oscillator.start()

  return {
    stream: destination.stream,
    stop() {
      oscillator.stop()
      oscillator.disconnect()
    },
  }
}
