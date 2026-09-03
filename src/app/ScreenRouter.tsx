import { useState } from 'react'
import type { Chart } from '../chart/types'
import { TitleScreen } from '../screens/Title/TitleScreen'
import { SongSelectScreen } from '../screens/SongSelect/SongSelectScreen'
import { CalibrationScreen } from '../screens/Calibration/CalibrationScreen'
import { PlayScreen } from '../screens/Play/PlayScreen'
import { ResultScreen } from '../screens/Result/ResultScreen'

// design.md 11章・11.1節の状態マシン
type Screen = 'title' | 'songSelect' | 'calibration' | 'play' | 'result'

export function ScreenRouter() {
  const [screen, setScreen] = useState<Screen>('title')
  const [chart, setChart] = useState<Chart | null>(null)

  switch (screen) {
    case 'title':
      return <TitleScreen onStart={() => setScreen('songSelect')} />

    case 'songSelect':
      return (
        <SongSelectScreen
          onChartReady={(nextChart) => {
            setChart(nextChart)
            setScreen('calibration')
          }}
        />
      )

    case 'calibration':
      return (
        <CalibrationScreen
          onBack={() => setScreen('songSelect')}
          onPlay={() => setScreen('play')}
        />
      )

    case 'play':
      // calibration経由でのみここに来るため、この時点でchartは必ず設定されている
      if (!chart) return null
      return <PlayScreen chart={chart} onExit={() => setScreen('result')} />

    case 'result':
      return (
        <ResultScreen
          onBackToSongSelect={() => setScreen('songSelect')}
          onRetry={() => setScreen('play')}
        />
      )
  }
}
