import type { LaneRenderer, LaneRendererOptions } from './types'

const DEFAULT_NOTE_LEAD_TIME_MS = 2000

// TAB譜順(1弦=最上段〜6弦=最下段)の弦名ラベル
const STRING_LABELS = ['E', 'B', 'G', 'D', 'A', 'E']
// 1弦(細い/高音)〜6弦(太い/低音)のレーン配色
const STRING_COLORS = ['#b98cff', '#5fa8ff', '#6fd88a', '#e8d35c', '#f0a860', '#f06c6c']

const LANE_TOP_MARGIN = 60
const LANE_BOTTOM_MARGIN = 60
const JUDGE_LINE_MARGIN_RIGHT = 120 // 弦名ラベル表示分の余白
const NOTE_ORIGIN_X = 40 // ノーツが出現する左端のx座標
const NOTE_RADIUS = 16

/**
 * TAB譜スタイルのレーン描画(design.md 4.4節・9章)。
 * 1弦を最上段・6弦を最下段とする6本の水平レーンに、ノーツが左から右へ流れ、
 * 右側固定の判定ラインに向かう。判定ラインのすぐ右に弦名ラベルを表示する。
 */
export function createLaneRenderer(options: LaneRendererOptions): LaneRenderer {
  const { canvas, chart, clock } = options
  const noteLeadTimeMs = options.noteLeadTimeMs ?? DEFAULT_NOTE_LEAD_TIME_MS
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('2D canvas context is not available')
  }
  const ctx: CanvasRenderingContext2D = context

  let animationFrameId: number | null = null

  function laneY(stringNumber: number): number {
    const usable = canvas.height - LANE_TOP_MARGIN - LANE_BOTTOM_MARGIN
    const step = usable / 5 // 6レーン = 5区間
    return LANE_TOP_MARGIN + step * (stringNumber - 1)
  }

  function judgeLineX(): number {
    return canvas.width - JUDGE_LINE_MARGIN_RIGHT
  }

  function draw() {
    const { width, height } = canvas
    ctx.fillStyle = '#12141a'
    ctx.fillRect(0, 0, width, height)

    const judgeX = judgeLineX()

    for (let s = 1; s <= 6; s++) {
      const y = laneY(s)
      ctx.strokeStyle = '#3a3f4d'
      ctx.lineWidth = 1 + s * 0.5 // 1弦(細い) 〜 6弦(太い)
      ctx.beginPath()
      ctx.moveTo(NOTE_ORIGIN_X, y)
      ctx.lineTo(judgeX, y)
      ctx.stroke()
    }

    ctx.strokeStyle = '#4fd1ff'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(judgeX, LANE_TOP_MARGIN - 20)
    ctx.lineTo(judgeX, laneY(6) + 20)
    ctx.stroke()

    ctx.fillStyle = '#c9ccd6'
    ctx.font = '14px system-ui, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    for (let s = 1; s <= 6; s++) {
      ctx.fillText(STRING_LABELS[s - 1], judgeX + 16, laneY(s))
    }

    const nowMs = clock.nowMs()
    for (const note of chart.notes) {
      const appearMs = note.timeMs - noteLeadTimeMs
      if (nowMs < appearMs || nowMs > note.timeMs + 300) continue

      const progress = Math.min(Math.max((nowMs - appearMs) / noteLeadTimeMs, 0), 1)
      const x = NOTE_ORIGIN_X + (judgeX - NOTE_ORIGIN_X) * progress
      const y = laneY(note.string)

      ctx.beginPath()
      ctx.arc(x, y, NOTE_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = STRING_COLORS[note.string - 1]
      ctx.fill()

      ctx.fillStyle = '#12141a'
      ctx.font = 'bold 13px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(note.fret), x, y + 1)
    }
  }

  function loop() {
    draw()
    animationFrameId = requestAnimationFrame(loop)
  }

  return {
    start() {
      if (animationFrameId === null) {
        loop()
      }
    },
    stop() {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
    },
  }
}
