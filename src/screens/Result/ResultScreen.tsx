interface ResultScreenProps {
  onRetry: () => void
  onBackToSongSelect: () => void
}

// v1セッションではプレースホルダー。スコア・自己ベスト比較・難易度速度別ベストスコア一覧
// (spec.md 4.5節)は判定エンジン・永続化の実装後に対応する。
export function ResultScreen({ onRetry, onBackToSongSelect }: ResultScreenProps) {
  return (
    <section style={{ display: 'grid', placeItems: 'center', minHeight: '100svh', gap: 16 }}>
      <h2 style={{ margin: 0 }}>リザルト</h2>
      <p style={{ color: '#9aa0ad' }}>(スコア表示は今後実装)</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button type="button" onClick={onBackToSongSelect}>
          譜面選択に戻る
        </button>
        <button type="button" onClick={onRetry}>
          もう一度プレイ
        </button>
      </div>
    </section>
  )
}
