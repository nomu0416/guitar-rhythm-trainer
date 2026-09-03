/** tick昇順で並んでいることを前提とするテンポ区間。区間は次のsegmentのstartTick未満まで続く。 */
export interface TempoSegment {
  startTick: number
  bpm: number
}

/**
 * テンポ変更情報を使って tick を実時間(ms)に変換する(design.md 4章)。
 * 単一BPMの決め打ちではなく、区間ごとに経過msを積算することで、
 * テンポチェンジのある譜面でも timeMs がズレないようにする。
 */
export function ticksToMs(
  tick: number,
  segments: TempoSegment[],
  ticksPerQuarter: number,
): number {
  if (segments.length === 0) {
    throw new Error('ticksToMs: at least one tempo segment is required')
  }

  let elapsedMs = 0
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    const segmentEndTick = i + 1 < segments.length ? segments[i + 1].startTick : Infinity
    const msPerTick = 60_000 / segment.bpm / ticksPerQuarter

    if (tick <= segmentEndTick) {
      elapsedMs += (tick - segment.startTick) * msPerTick
      return elapsedMs
    }

    elapsedMs += (segmentEndTick - segment.startTick) * msPerTick
  }

  return elapsedMs
}
