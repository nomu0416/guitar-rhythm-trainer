import { useEffect, useRef, useState } from 'react'
import type { PlaybackSpeedPercent } from '../../audio/playback/types'
import type { StringNumber } from '../../chart/types'
import { OPEN_STRING_HZ } from '../../chart/parser/pitch'
import { requestMicrophoneStream } from '../../audio/input/microphone'
import {
  createMicAudioContext,
  createPitchDetectionPipeline,
} from '../../audio/input/pitchDetectionPipeline'
import { frequencyToNoteName } from '../../audio/pitch/noteName'
import { rmsToDbfs } from '../../audio/pitch/rms'

interface CalibrationScreenProps {
  onPlay: (speedPercent: PlaybackSpeedPercent) => void
  onBack: () => void
}

const DEFAULT_SPEED_PERCENT: PlaybackSpeedPercent = 100
const CONFIDENCE_THRESHOLD = 0.5
const METER_FLOOR_DB = -60

type MicState = 'idle' | 'requesting' | 'active' | 'error'

interface DetectedNote {
  name: string
  octave: number
  cents: number
  hz: number
}

// v1セッションではレイテンシ較正UI・判定難易度選択UIはまだプレースホルダー(次セッションで実装)。
export function CalibrationScreen({ onPlay, onBack }: CalibrationScreenProps) {
  const [speedPercent, setSpeedPercent] = useState<PlaybackSpeedPercent>(DEFAULT_SPEED_PERCENT)

  const [micState, setMicState] = useState<MicState>('idle')
  const [micError, setMicError] = useState<string | null>(null)
  const [rmsDb, setRmsDb] = useState(METER_FLOOR_DB)
  const [detected, setDetected] = useState<DetectedNote | null>(null)

  // 開発用: 実マイクが使えない環境でもパイプライン全体を検証できるようにする(懸念事項2の対応策)
  const [useSynthetic, setUseSynthetic] = useState(false)
  const [syntheticString, setSyntheticString] = useState<StringNumber>(6)

  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => cleanupRef.current?.()
  }, [])

  async function enableMic() {
    setMicState('requesting')
    setMicError(null)

    try {
      const audioContext = createMicAudioContext()
      let stream: MediaStream
      let stopSource: () => void

      if (useSynthetic) {
        const { createSyntheticMicStream } = await import('../../audio/input/syntheticMicStream')
        const synthetic = createSyntheticMicStream(audioContext, OPEN_STRING_HZ[syntheticString])
        stream = synthetic.stream
        stopSource = synthetic.stop
      } else {
        const mic = await requestMicrophoneStream()
        stream = mic.stream
        stopSource = mic.stop
      }

      const pipeline = await createPitchDetectionPipeline(audioContext, stream)
      const unsubscribe = pipeline.onResult((result) => {
        setRmsDb(rmsToDbfs(result.rms, METER_FLOOR_DB))
        if (result.frequencyHz !== null && result.confidence >= CONFIDENCE_THRESHOLD) {
          const note = frequencyToNoteName(result.frequencyHz)
          setDetected(note ? { ...note, hz: result.frequencyHz } : null)
        } else {
          setDetected(null)
        }
      })

      cleanupRef.current = () => {
        unsubscribe()
        pipeline.dispose()
        stopSource()
        void audioContext.close()
      }

      setMicState('active')
    } catch (e) {
      setMicError(`マイクを有効にできませんでした: ${String(e)}`)
      setMicState('error')
    }
  }

  const meterPercent = Math.max(0, Math.min(100, ((rmsDb - METER_FLOOR_DB) / -METER_FLOOR_DB) * 100))

  return (
    <section style={{ display: 'grid', placeItems: 'center', minHeight: '100svh', gap: 16 }}>
      <h2 style={{ margin: 0 }}>キャリブレーション</h2>
      <p style={{ color: '#9aa0ad' }}>(レイテンシ・判定難易度の設定は今後実装)</p>

      <p style={{ color: '#f0a860', maxWidth: 420, textAlign: 'center' }}>
        ⚠️ BGMは必ずヘッドホンで聴いてください。スピーカーで再生するとマイクに音が回り込み、
        正しく判定できません。
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', width: 320 }}>
        {import.meta.env.DEV && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
            <label style={{ fontSize: 13, color: '#9aa0ad' }}>
              <input
                type="checkbox"
                checked={useSynthetic}
                onChange={(e) => setUseSynthetic(e.target.checked)}
                disabled={micState === 'active'}
              />{' '}
              テスト用音源を使う(開発用、実マイク不要)
            </label>
            {useSynthetic && (
              <select
                value={syntheticString}
                onChange={(e) => setSyntheticString(Number(e.target.value) as StringNumber)}
                disabled={micState === 'active'}
              >
                {([1, 2, 3, 4, 5, 6] as StringNumber[]).map((s) => (
                  <option key={s} value={s}>
                    {s}弦 ({OPEN_STRING_HZ[s].toFixed(1)}Hz)
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {micState !== 'active' && (
          <button type="button" onClick={enableMic} disabled={micState === 'requesting'}>
            {micState === 'requesting' ? '接続中...' : 'マイクを有効にする'}
          </button>
        )}

        {micState === 'active' && (
          <>
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: 12, color: '#9aa0ad', marginBottom: 4 }}>入力レベル</div>
              <div style={{ height: 10, background: '#2a2d36', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${meterPercent}%`,
                    height: '100%',
                    background: meterPercent > 90 ? '#f06c6c' : '#5fa8ff',
                  }}
                />
              </div>
            </div>
            <div>
              検出中:{' '}
              {detected
                ? `${detected.name}${detected.octave} (${detected.hz.toFixed(1)}Hz, ${detected.cents >= 0 ? '+' : ''}${detected.cents.toFixed(0)}¢)`
                : '—'}
            </div>
          </>
        )}

        {micError && <p style={{ color: '#f06c6c', fontSize: 13, textAlign: 'center' }}>{micError}</p>}
      </div>

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
