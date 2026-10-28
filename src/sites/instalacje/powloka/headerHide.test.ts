import { describe, expect, it } from 'vitest'

import { nextHeaderHidden } from './headerHide'

const phone = { narrow: true, sheetOpen: false }

describe('nextHeaderHidden', () => {
  it('hides after scrolling down more than 8 px below 90 px', () => {
    expect(nextHeaderHidden({ ...phone, y: 300, lastY: 200, hidden: false })).toEqual({
      hidden: true,
      lastY: 300,
    })
  })

  it('shows again after scrolling up more than 8 px', () => {
    expect(nextHeaderHidden({ ...phone, y: 280, lastY: 300, hidden: true })).toEqual({
      hidden: false,
      lastY: 280,
    })
  })

  it('ignores moves of up to 8 px and keeps the reference point', () => {
    expect(nextHeaderHidden({ ...phone, y: 305, lastY: 300, hidden: true })).toEqual({
      hidden: true,
      lastY: 300,
    })
    expect(nextHeaderHidden({ ...phone, y: 295, lastY: 300, hidden: false })).toEqual({
      hidden: false,
      lastY: 300,
    })
  })

  it('always shows it near the top of the page', () => {
    expect(nextHeaderHidden({ ...phone, y: 60, lastY: 40, hidden: true })).toEqual({
      hidden: false,
      lastY: 60,
    })
  })

  it('never hides it on wider screens or with the menu sheet open', () => {
    expect(
      nextHeaderHidden({ narrow: false, sheetOpen: false, y: 900, lastY: 100, hidden: false })
        .hidden,
    ).toBe(false)
    expect(
      nextHeaderHidden({ narrow: true, sheetOpen: true, y: 900, lastY: 100, hidden: false }).hidden,
    ).toBe(false)
  })
})
