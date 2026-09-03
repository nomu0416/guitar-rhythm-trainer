interface CalibrationScreenProps {
  onPlay: () => void
  onBack: () => void
}

// v1セッションではプレースホルダー。マイク音量・レイテンシ・判定難易度・再生速度の
// 実設定(spec.md 4.3節)は後続セッションで実装する。
export function CalibrationScreen({ onPlay, onBack }: CalibrationScreenProps) {
  return (
    <section style={{ display: 'grid', placeItems: 'center', minHeight: '100svh', gap: 16 }}>
      <h2 style={{ margin: 0 }}>キャリブレーション</h2>
      <p style={{ color: '#9aa0ad' }}>(マイク音量・レイテンシ・判定難易度・再生速度の設定は今後実装)</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button type="button" onClick={onBack}>
          戻る
        </button>
        <button type="button" onClick={onPlay}>
          プレイ開始
        </button>
      </div>
    </section>
  )
}
