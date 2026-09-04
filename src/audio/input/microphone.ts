export interface MicrophoneStream {
  stream: MediaStream
  stop(): void
}

/**
 * マイク入力を取得する(design.md 6章)。
 * DSP補正(エコーキャンセル・ノイズ抑制・自動ゲイン)はピッチ検出を歪めるため全て無効化する。
 */
export async function requestMicrophoneStream(): Promise<MicrophoneStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  })
  return {
    stream,
    stop() {
      for (const track of stream.getTracks()) track.stop()
    },
  }
}
