import { useEffect, useRef } from 'react'
import type { Chart } from '../../chart/types'
import { createManualClock } from '../../audio/playback/manualClock'
import { createLaneRenderer } from '../../game/render/laneRenderer'

interface PlayScreenProps {
  chart: Chart
  onExit: () => void
}

export function PlayScreen({ chart, onExit }: PlayScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // design.md 11章: プレイ画面に入る際に描画ループを開始し、離れるときに停止・破棄する
    const renderer = createLaneRenderer({
      canvas,
      chart,
      clock: createManualClock(),
    })
    renderer.start()
    return () => renderer.stop()
  }, [chart])

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
      <canvas ref={canvasRef} width={1280} height={720} style={{ width: '100%', height: '100%' }} />
    </section>
  )
}
