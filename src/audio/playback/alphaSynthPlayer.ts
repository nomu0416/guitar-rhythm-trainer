import * as alphaTab from '@coderline/alphatab'
import type { PlaybackSpeedPercent } from './types'

export interface AlphaSynthPlayer {
  readonly synth: alphaTab.synth.IAlphaSynth
  loadSong(midi: alphaTab.midi.MidiFile, speedPercent: PlaybackSpeedPercent): void
  play(): boolean
  stop(): void
  /** 非表示要素の除去とプレイヤーの破棄を行う */
  dispose(): void
  onReadyForPlayback(cb: () => void): () => void
  onFinished(cb: () => void): () => void
}

/** PlaybackSpeedPercent(50-100) を alphaSynthの playbackSpeed(0.125-8.0) へ変換する(spec.md 6章) */
export function speedPercentToPlaybackSpeed(percent: PlaybackSpeedPercent): number {
  return percent / 100
}

/**
 * 非表示の`AlphaTabApi`をプレイヤーのファクトリとして使い、`IAlphaSynth`を取得する(design.md 5章)。
 * 記譜レンダリングは一切呼び出さない(load()/renderScore()等は使わず、api.scoreも設定しない)。
 * Worker/AudioWorkletの配線(`@coderline/alphatab-vite`が解決)はAlphaTabApiに任せる。
 */
export function createAlphaSynthPlayer(soundFontUrl: string): Promise<AlphaSynthPlayer> {
  return new Promise((resolve, reject) => {
    const settings = new alphaTab.Settings()
    settings.player.playerMode = alphaTab.PlayerMode.EnabledSynthesizer
    settings.player.enableCursor = false
    // Vite dev環境ではscriptFileの自動検出がバンドラの内部パスを拾ってしまうため明示指定する
    // (public/font配下にalphaTab-viteが自動配置するBravuraフォント。レンダリングは使わないが
    // AlphaTabApiが初期化時に読み込みを試みるため、コンソールエラー抑制のために設定する)
    settings.core.fontDirectory = '/font/'

    const container = document.createElement('div')
    container.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;'
    document.body.appendChild(container)

    const api = new alphaTab.AlphaTabApi(container, settings)
    const synth = api.player
    if (!synth) {
      container.remove()
      reject(new Error('alphaSynthの初期化に失敗しました(AlphaTabApi.player が null です)'))
      return
    }

    const player: AlphaSynthPlayer = {
      synth,
      loadSong(midi, speedPercent) {
        synth.playbackSpeed = speedPercentToPlaybackSpeed(speedPercent)
        synth.loadMidiFile(midi)
      },
      play: () => synth.play(),
      stop: () => synth.stop(),
      dispose() {
        api.destroy()
        container.remove()
      },
      onReadyForPlayback: (cb) => synth.readyForPlayback.on(cb),
      onFinished: (cb) => synth.finished.on(cb),
    }

    api.loadSoundFontFromUrl(soundFontUrl, false)
    resolve(player)
  })
}
