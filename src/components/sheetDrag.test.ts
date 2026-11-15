import { describe, expect, it } from 'vitest'

import { shouldCloseOnDrag } from './sheetDrag'

describe('shouldCloseOnDrag', () => {
  it('closes after a pull of more than 80 px', () => {
    expect(shouldCloseOnDrag(81, 0.1)).toBe(true)
    expect(shouldCloseOnDrag(80, 0.1)).toBe(false)
  })

  it('closes on a quick flick that moved the sheet a little', () => {
    expect(shouldCloseOnDrag(30, 0.8)).toBe(true)
  })

  it('stays open for a slow short pull, a tiny flick or an upward move', () => {
    expect(shouldCloseOnDrag(40, 0.2)).toBe(false)
    expect(shouldCloseOnDrag(10, 2)).toBe(false)
    expect(shouldCloseOnDrag(-50, 1)).toBe(false)
  })
})
