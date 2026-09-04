/** フレームの実効値(Root Mean Square)。音量メーター表示用(design.md 6章) */
export function calculateRms(frame: Float32Array): number {
  let sumSquares = 0
  for (let i = 0; i < frame.length; i++) {
    sumSquares += frame[i] * frame[i]
  }
  return Math.sqrt(sumSquares / frame.length)
}

/** RMS(0-1程度)をdBFSに変換する。無音(0)は -Infinity ではなく下限値にクランプする */
export function rmsToDbfs(rms: number, floorDb = -60): number {
  if (rms <= 0) return floorDb
  return Math.max(floorDb, 20 * Math.log10(rms))
}
