import { useState } from 'react'
import type { Song } from '../../types/song'
import {
  ChartImportError,
  importChartFromBytes,
  sourceFormatFromFileName,
} from '../../chart/parser/fromAlphaTabScore'

interface SongSelectScreenProps {
  onSongReady: (song: Song) => void
}

export function SongSelectScreen({ onSongReady }: SongSelectScreenProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = '' // 同じファイルを連続で選び直せるようにする
    if (!file) return

    const sourceFormat = sourceFormatFromFileName(file.name)
    if (!sourceFormat) {
      setError('対応していないファイル形式です(.gp3〜.gp5, .gpx, .gp のみ対応)。')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const buffer = await file.arrayBuffer()
      const { chart, midiFile, tempoSegments, ticksPerQuarter } = importChartFromBytes(
        new Uint8Array(buffer),
        file.name,
        sourceFormat,
      )
      onSongReady({ chart, midiFile, tempoSegments, ticksPerQuarter })
    } catch (e) {
      setError(e instanceof ChartImportError ? e.message : `インポートに失敗しました: ${String(e)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section style={{ display: 'grid', placeItems: 'center', minHeight: '100svh', gap: 16 }}>
      <h2 style={{ margin: 0 }}>譜面を選ぶ</h2>
      <label
        style={{
          border: '1px dashed #4a4f5c',
          borderRadius: 8,
          padding: '14px 24px',
          cursor: 'pointer',
        }}
      >
        {isLoading ? '読み込み中...' : 'TAB譜をインポート(.gp, .gp3〜.gp5, .gpx)'}
        <input
          type="file"
          accept=".gp,.gp3,.gp4,.gp5,.gpx"
          onChange={handleFileChange}
          disabled={isLoading}
          style={{ display: 'none' }}
        />
      </label>
      {error && <p style={{ color: '#f06c6c', maxWidth: 480, textAlign: 'center' }}>{error}</p>}
    </section>
  )
}
