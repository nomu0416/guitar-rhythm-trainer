/**
 * AudioWorkletのprocess()呼び出し(128サンプル単位)ごとの断片を蓄積し、
 * YIN法に必要なフレーム長のスライディングウィンドウを取り出すためのリングバッファ。
 */
export class FloatRingBuffer {
  private readonly capacity: number
  private readonly buffer: Float32Array
  private writeIndex = 0
  private filled = false

  constructor(capacity: number) {
    this.capacity = capacity
    this.buffer = new Float32Array(capacity)
  }

  /** これまでにcapacity分以上書き込まれ、リングバッファ全体が有効なサンプルで埋まっているか */
  get isFull(): boolean {
    return this.filled
  }

  write(chunk: Float32Array): void {
    for (let i = 0; i < chunk.length; i++) {
      this.buffer[this.writeIndex] = chunk[i]
      this.writeIndex = (this.writeIndex + 1) % this.capacity
      if (this.writeIndex === 0) this.filled = true
    }
  }

  /** 直近length分のサンプルを、書き込み順(古い→新しい)で返す */
  readLatest(length: number): Float32Array {
    if (length > this.capacity) {
      throw new Error('length exceeds ring buffer capacity')
    }
    const result = new Float32Array(length)
    for (let i = 0; i < length; i++) {
      const idx = (this.writeIndex - length + i + this.capacity * 2) % this.capacity
      result[i] = this.buffer[idx]
    }
    return result
  }
}
