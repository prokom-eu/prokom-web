import { describe, expect, it } from 'vitest'

import { COUNT_MS, countAt, countStart, parseCount } from './countUp'

// SWV7: „PRO-KOM w liczbach” counts up once, 900 ms, ease-out.

describe('parseCount', () => {
  it('takes the leading number and keeps the rest', () => {
    expect(parseCount('100+')).toEqual({ value: 100, suffix: '+' })
    expect(parseCount('2004')).toEqual({ value: 2004, suffix: '' })
    expect(parseCount('[ROK]')).toBeNull()
    expect(parseCount('1 200+')).toBeNull()
    expect(parseCount('3,5')).toBeNull()
  })
})

describe('countAt', () => {
  it('runs from the start to the figure in 900 ms', () => {
    expect(countAt(100, 0)).toBe(0)
    expect(countAt(100, COUNT_MS)).toBe(100)
    expect(countAt(100, COUNT_MS * 2)).toBe(100)
    expect(countAt(100, COUNT_MS / 2)).toBeGreaterThan(50)
  })

  it('counts a year only over its last years', () => {
    expect(countStart(2004)).toBe(1984)
    expect(countAt(2004, 0)).toBe(1984)
  })
})
