export interface YinOptions {
  sampleRate: number
  /** 差分関数のしきい値。小さいほど厳格(既定0.15、YIN原論文の推奨値) */
  threshold?: number
  /** 探索する最低周波数(Hz)。既定70(6弦開放E2≈82.4Hzに余裕を持たせた下限) */
  minFrequencyHz?: number
  /** 探索する最高周波数(Hz)。既定1500 */
  maxFrequencyHz?: number
}

export interface YinResult {
  frequencyHz: number | null
  /** 0-1。1に近いほど検出結果が確からしい(1 - 採用したtauでの正規化差分値) */
  confidence: number
}

const DEFAULT_THRESHOLD = 0.15
const DEFAULT_MIN_FREQUENCY_HZ = 70
const DEFAULT_MAX_FREQUENCY_HZ = 1500

/**
 * 最低周波数まで検出するために必要なフレーム長を逆算する。
 * 呼び出し側(AudioWorkletのリングバッファ等)のバッファサイズ確保に使う。
 */
export function requiredFrameLength(sampleRate: number, minFrequencyHz: number): number {
  // 最大tau(=sampleRate/minFrequencyHz)の周期を2周期分以上カバーできる長さが必要
  const maxTau = Math.ceil(sampleRate / minFrequencyHz)
  return maxTau * 2
}

/** 差分関数 d(tau) = Σ (frame[j] - frame[j+tau])^2, j: 0..maxTau-1 */
export function differenceFunction(frame: Float32Array, maxTau: number): Float64Array {
  const diff = new Float64Array(maxTau)
  for (let tau = 0; tau < maxTau; tau++) {
    let sum = 0
    for (let j = 0; j < maxTau; j++) {
      const delta = frame[j] - frame[j + tau]
      sum += delta * delta
    }
    diff[tau] = sum
  }
  return diff
}

/** 累積平均正規化差分関数(YIN法のステップ2)。cmnd[0] は常に1として扱う */
export function cumulativeMeanNormalizedDifference(diff: Float64Array): Float64Array {
  const cmnd = new Float64Array(diff.length)
  cmnd[0] = 1
  let runningSum = 0
  for (let tau = 1; tau < diff.length; tau++) {
    runningSum += diff[tau]
    cmnd[tau] = (diff[tau] * tau) / runningSum
  }
  return cmnd
}

/** cmndの`tauEstimate`周辺を放物線補間し、サブサンプル精度のtauを返す */
export function parabolicInterpolate(cmnd: Float64Array, tauEstimate: number): number {
  const x0 = tauEstimate < 1 ? tauEstimate : tauEstimate - 1
  const x2 = tauEstimate + 1 < cmnd.length ? tauEstimate + 1 : tauEstimate

  if (x0 === tauEstimate) return cmnd[tauEstimate] <= cmnd[x2] ? tauEstimate : x2
  if (x2 === tauEstimate) return cmnd[tauEstimate] <= cmnd[x0] ? tauEstimate : x0

  const s0 = cmnd[x0]
  const s1 = cmnd[tauEstimate]
  const s2 = cmnd[x2]
  const denominator = 2 * s1 - s2 - s0
  if (denominator === 0) return tauEstimate
  return tauEstimate + (s2 - s0) / (2 * denominator)
}

/**
 * YIN法による基本周波数推定(design.md 6章)。
 * `frame.length` は `requiredFrameLength()` 以上である必要がある。
 */
export function detectPitch(frame: Float32Array, options: YinOptions): YinResult {
  const threshold = options.threshold ?? DEFAULT_THRESHOLD
  const minFrequencyHz = options.minFrequencyHz ?? DEFAULT_MIN_FREQUENCY_HZ
  const maxFrequencyHz = options.maxFrequencyHz ?? DEFAULT_MAX_FREQUENCY_HZ

  const maxTau = Math.min(
    Math.ceil(options.sampleRate / minFrequencyHz),
    Math.floor(frame.length / 2),
  )
  const minTau = Math.max(1, Math.floor(options.sampleRate / maxFrequencyHz))

  if (maxTau <= minTau) {
    return { frequencyHz: null, confidence: 0 }
  }

  const diff = differenceFunction(frame, maxTau)
  const cmnd = cumulativeMeanNormalizedDifference(diff)

  let tauEstimate = -1
  for (let tau = minTau; tau < maxTau; tau++) {
    if (cmnd[tau] < threshold) {
      // しきい値を下回った後、さらに下がる限り局所最小値を探す(YIN法の絶対しきい値ステップ)
      while (tau + 1 < maxTau && cmnd[tau + 1] < cmnd[tau]) {
        tau++
      }
      tauEstimate = tau
      break
    }
  }

  if (tauEstimate === -1) {
    return { frequencyHz: null, confidence: 0 }
  }

  const betterTau = parabolicInterpolate(cmnd, tauEstimate)
  if (betterTau <= 0) {
    return { frequencyHz: null, confidence: 0 }
  }

  return {
    frequencyHz: options.sampleRate / betterTau,
    confidence: Math.max(0, 1 - cmnd[tauEstimate]),
  }
}
