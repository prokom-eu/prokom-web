import { describe, expect, it } from 'vitest'

import { mapConcurrent } from './concurrency'

describe('mapConcurrent', () => {
  it('keeps the order of the input in the results', async () => {
    const delays = [30, 5, 15, 1]
    const result = await mapConcurrent(delays, 2, async (ms, index) => {
      await new Promise((resolve) => setTimeout(resolve, ms))
      return index
    })
    expect(result).toEqual([0, 1, 2, 3])
  })

  it('never runs more than the limit at once', async () => {
    let running = 0
    let peak = 0
    await mapConcurrent(Array.from({ length: 10 }), 4, async () => {
      running += 1
      peak = Math.max(peak, running)
      await new Promise((resolve) => setTimeout(resolve, 2))
      running -= 1
    })
    expect(peak).toBe(4)
  })

  it('fails with the first error', async () => {
    await expect(
      mapConcurrent([1, 2, 3], 2, async (n) => {
        if (n === 2) throw new Error('boom')
        return n
      }),
    ).rejects.toThrow('boom')
  })

  it('starts no new item after the first error', async () => {
    const started: number[] = []
    await expect(
      mapConcurrent([1, 2, 3, 4, 5, 6], 2, async (n) => {
        started.push(n)
        if (n === 1) throw new Error('boom')
        await new Promise((resolve) => setTimeout(resolve, 5))
        return n
      }),
    ).rejects.toThrow('boom')
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(started).toEqual([1, 2])
  })

  it('rejects a limit below 1', async () => {
    await expect(mapConcurrent([1], 0, async (n) => n)).rejects.toThrow(/limit/)
  })
})
