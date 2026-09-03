import { useState } from 'react'
import type { Song } from '../types/song'
import type { PlaybackSpeedPercent } from '../audio/playback/types'
import { TitleScreen } from '../screens/Title/TitleScreen'
import { SongSelectScreen } from '../screens/SongSelect/SongSelectScreen'
import { CalibrationScreen } from '../screens/Calibration/CalibrationScreen'
import { PlayScreen } from '../screens/Play/PlayScreen'
import { ResultScreen } from '../screens/Result/ResultScreen'

// design.md 11章・11.1節の状態マシン
type Screen = 'title' | 'songSelect' | 'calibration' | 'play' | 'result'

export function ScreenRouter() {
  const [screen, setScreen] = useState<Screen>('title')
  const [song, setSong] = useState<Song | null>(null)
  const [speedPercent, setSpeedPercent] = useState<PlaybackSpeedPercent>(100)

  switch (screen) {
    case 'title':
      return <TitleScreen onStart={() => setScreen('songSelect')} />

    case 'songSelect':
      return (
        <SongSelectScreen
          onSongReady={(nextSong) => {
            setSong(nextSong)
            setScreen('calibration')
          }}
        />
      )

    case 'calibration':
      return (
        <CalibrationScreen
          onBack={() => setScreen('songSelect')}
          onPlay={(nextSpeedPercent) => {
            setSpeedPercent(nextSpeedPercent)
            setScreen('play')
          }}
        />
      )

    case 'play':
      // calibration経由でのみここに来るため、この時点でsongは必ず設定されている
      if (!song) return null
      return <PlayScreen song={song} speedPercent={speedPercent} onExit={() => setScreen('result')} />

    case 'result':
      return (
        <ResultScreen
          onBackToSongSelect={() => setScreen('songSelect')}
          onRetry={() => setScreen('play')}
        />
      )
  }
}
