import { useState } from 'react'
import type { PlaybackSpeedPercent } from '../../audio/playback/types'

interface CalibrationScreenProps {
  onPlay: (speedPercent: PlaybackSpeedPercent) => void
  onBack: () => void
}

const DEFAULT_SPEED_PERCENT: PlaybackSpeedPercent = 100

// v1セッションではマイク音量・レイテンシ・判定難易度の実設定(spec.md 4.3節)はまだプレースホルダー。
// 再生速度だけ、BGM再生の動作確認のために先に実装する。
export function CalibrationScreen({ onPlay, onBack }: CalibrationScreenProps) {
  const [speedPercent, setSpeedPercent] = useState<PlaybackSpeedPercent>(DEFAULT_SPEED_PERCENT)

  return (
    <section style={{ display: 'grid', placeItems: 'center', minHeight: '100svh', gap: 16 }}>
      <h2 style={{ margin: 0 }}>キャリブレーション</h2>
      <p style={{ color: '#9aa0ad' }}>(マイク音量・レイテンシ・判定難易度の設定は今後実装)</p>

      <p style={{ color: '#f0a860', maxWidth: 420, textAlign: 'center' }}>
        ⚠️ BGMは必ずヘッドホンで聴いてください。スピーカーで再生するとマイクに音が回り込み、
        正しく判定できません。
      </p>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <span>再生速度: {speedPercent}%</span>
        <input
          type="range"
          min={50}
          max={100}
          step={5}
          value={speedPercent}
          onChange={(e) => setSpeedPercent(Number(e.target.value))}
        />
      </label>

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="button" onClick={onBack}>
          戻る
        </button>
        <button type="button" onClick={() => onPlay(speedPercent)}>
          プレイ開始
        </button>
      </div>
    </section>
  )
}
