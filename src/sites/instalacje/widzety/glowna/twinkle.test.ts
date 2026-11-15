import { describe, expect, it } from 'vitest'

import { HERO_BACKDROP } from './backdrop'
import { heroStars } from './heroModel'
import { groupTwinkles } from './twinkle'

const STARS = heroStars()
  .map(
    (s) =>
      `<circle cx="${s.x}" cy="${s.y}" r="${s.r}" class="star" style="animation-delay: ${s.d}s"/>`,
  )
  .join('')
const full = HERO_BACKDROP.replace('%STARS%', STARS)
const count = (markup: string, re: RegExp) => markup.match(re)?.length ?? 0

describe('groupTwinkles', () => {
  const grouped = groupTwinkles(full)

  it('keeps every light, without its own animation delay', () => {
    for (const kind of ['star', 'mws', 'vl']) {
      const re = new RegExp(`<circle [^>]*class="${kind}"`, 'g')
      expect(count(grouped, re)).toBe(count(full, re))
      expect(count(grouped, re)).toBeGreaterThan(0)
    }
    expect(grouped).not.toMatch(/class="(star|mws|vl)" style=/)
  })

  it('makes three groups per kind', () => {
    expect(count(grouped, /<g class="twg /g)).toBe(9)
    for (const kind of ['star', 'mws', 'vl']) {
      for (const n of [1, 2, 3]) expect(grouped).toContain(`<g class="twg tw-${kind} tw${n}">`)
    }
  })

  it('deals circles in turn and leaves the rest of the markup alone', () => {
    const run =
      '<path d="M0 0"/><circle cx="1" class="vl" style="animation-delay: 0.7s"/>' +
      '<circle cx="2" class="vl" style="animation-delay: 1s"/>' +
      '<circle cx="3" class="vl" style="animation-delay: 0s"/>' +
      '<circle cx="4" class="vl" style="animation-delay: 2s"/><rect/>'
    expect(groupTwinkles(run)).toBe(
      '<path d="M0 0"/>' +
        '<g class="twg tw-vl tw1"><circle cx="1" class="vl"/><circle cx="4" class="vl"/></g>' +
        '<g class="twg tw-vl tw2"><circle cx="2" class="vl"/></g>' +
        '<g class="twg tw-vl tw3"><circle cx="3" class="vl"/></g><rect/>',
    )
  })
})
