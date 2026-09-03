interface TitleScreenProps {
  onStart: () => void
}

export function TitleScreen({ onStart }: TitleScreenProps) {
  return (
    <section style={{ display: 'grid', placeItems: 'center', minHeight: '100svh', gap: 24 }}>
      <h1 style={{ fontSize: 48, margin: 0 }}>FRETRUSH</h1>
      <button type="button" onClick={onStart}>
        はじめる
      </button>
    </section>
  )
}
