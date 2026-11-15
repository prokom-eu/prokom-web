import { describe, expect, it } from 'vitest'

import { shouldTick } from './interval'

const playing = { enabled: true, hidden: false, visible: true, reducedMotion: false }

describe('shouldTick', () => {
  it('ticks for a visible, untouched widget', () => {
    expect(shouldTick(playing)).toBe(true)
  })

  it.each([
    ['the visitor touched the widget', { enabled: false }],
    ['the browser tab is hidden', { hidden: true }],
    ['the widget is off screen', { visible: false }],
    ['the visitor prefers reduced motion', { reducedMotion: true }],
  ])('pauses when %s', (_, change) => {
    expect(shouldTick({ ...playing, ...change })).toBe(false)
  })
})
