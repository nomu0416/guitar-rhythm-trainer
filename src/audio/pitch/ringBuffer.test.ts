import { describe, expect, it } from 'vitest'
import { FloatRingBuffer } from './ringBuffer'

describe('FloatRingBuffer', () => {
  it('is not full until capacity samples have been written', () => {
    const buf = new FloatRingBuffer(4)
    expect(buf.isFull).toBe(false)
    buf.write(new Float32Array([1, 2, 3]))
    expect(buf.isFull).toBe(false)
    buf.write(new Float32Array([4]))
    expect(buf.isFull).toBe(true)
  })

  it('readLatest returns the most recent samples in write order', () => {
    const buf = new FloatRingBuffer(4)
    buf.write(new Float32Array([1, 2, 3, 4]))
    expect(Array.from(buf.readLatest(4))).toEqual([1, 2, 3, 4])

    buf.write(new Float32Array([5, 6])) // 1,2 が押し出される
    expect(Array.from(buf.readLatest(4))).toEqual([3, 4, 5, 6])
    expect(Array.from(buf.readLatest(2))).toEqual([5, 6])
  })

  it('handles writes larger than capacity in one call', () => {
    const buf = new FloatRingBuffer(3)
    buf.write(new Float32Array([1, 2, 3, 4, 5]))
    expect(Array.from(buf.readLatest(3))).toEqual([3, 4, 5])
  })

  it('throws when reading more than capacity', () => {
    const buf = new FloatRingBuffer(4)
    buf.write(new Float32Array([1, 2, 3, 4]))
    expect(() => buf.readLatest(5)).toThrow()
  })
})
