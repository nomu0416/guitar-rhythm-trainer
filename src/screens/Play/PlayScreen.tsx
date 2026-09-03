import { useEffect, useRef, useState } from 'react'
import type { Song } from '../../types/song'
import type { PlaybackSpeedPercent } from '../../audio/playback/types'
import { createAlphaSynthPlayer } from '../../audio/playback/alphaSynthPlayer'
import { createAlphaSynthClock } from '../../audio/playback/alphaSynthClock'
import { createLaneRenderer } from '../../game/render/laneRenderer'

interface PlayScreenProps {
  song: Song
  speedPercent: PlaybackSpeedPercent
  onExit: () => void
}

const SOUND_FONT_URL = '/soundfont/sonivox.sf2'

export function PlayScreen({ song, speedPercent, onExit }: PlayScreenProps) {
  const { chart, midiFile, tempoSegments, ticksPerQuarter } = song
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let cancelled = false
    let renderer: ReturnType<typeof createLaneRenderer> | null = null
    let player: Awaited<ReturnType<typeof createAlphaSynthPlayer>> | null = null

    createAlphaSynthPlayer(SOUND_FONT_URL)
      .then((p) => {
        if (cancelled) {
          p.dispose()
          return
        }
        player = p
        p.onFinished(() => onExit())
        p.onReadyForPlayback(() => {
          if (cancelled) return
          // design.md 11章: プレイ画面に入る際に描画ループを開始し、離れるときに停止・破棄する
          renderer = createLaneRenderer({
            canvas,
            chart,
            clock: createAlphaSynthClock(p.synth, tempoSegments, ticksPerQuarter),
          })
          renderer.start()
          p.play()
        })
        p.loadSong(midiFile, speedPercent)
      })
      .catch((e) => {
        if (!cancelled) setError(`BGM再生を開始できませんでした: ${String(e)}`)
      })

    return () => {
      cancelled = true
      renderer?.stop()
      player?.dispose()
    }
  }, [chart, midiFile, tempoSegments, ticksPerQuarter, speedPercent, onExit])

  return (
    <section style={{ position: 'relative', width: '100%', height: '100svh' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
        }}
      >
        <span>{chart.title}</span>
        <button type="button" onClick={onExit}>
          終了
        </button>
      </div>
      {error && (
        <p style={{ position: 'absolute', top: 60, left: 20, color: '#f06c6c' }}>{error}</p>
      )}
      <canvas ref={canvasRef} width={1280} height={720} style={{ width: '100%', height: '100%' }} />
    </section>
  )
}
