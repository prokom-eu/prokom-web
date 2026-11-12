import { describe, expect, it } from 'vitest'

import { measure, PAGES, shortfalls } from '../../../scripts/porownaj-tresc.mjs'

const page = (sections: number, words = 40) =>
  `<html><body><header><h2>Menu</h2></header><main>${Array.from(
    { length: sections },
    (_, i) => `<section><h2>Sekcja ${i}</h2><p>${'słowo '.repeat(words)}</p></section>`,
  ).join(
    '',
  )}<script>var x = "${'a'.repeat(500)}"</script></main><footer><h2>Stopka</h2></footer></body></html>`

describe('porownaj-tresc (staging = content from the code, NAPRAWA-0911)', () => {
  it('counts H2, sections and text of <main> only (frame and scripts left out)', () => {
    const m = measure(page(3))
    expect(m.h2).toBe(3)
    expect(m.sections).toBe(3)
    expect(m.text).toBeGreaterThan(3 * 40 * 5)
    expect(m.text).toBeLessThan(3 * 40 * 7 + 60)
  })

  it('the staging GoPOS of 09.11 (4 of 12 sections) fails; the same page passes', () => {
    const local = measure(page(12))
    expect(shortfalls(local, measure(page(4)))).toEqual(['h2', 'sections', 'text'])
    expect(shortfalls(local, measure(page(12)))).toEqual([])
    // 10 of 12 sections is still above 80%.
    expect(shortfalls(local, measure(page(10)))).toEqual([])
  })

  it('a page without <main> measures zero; covers the pages of the audit', () => {
    expect(measure('<html></html>')).toEqual({ h2: 0, sections: 0, text: 0 })
    for (const path of ['/gopos', '/insert', '/opieka-it', '/o-firmie', '/kontakt']) {
      expect(PAGES).toContain(path)
    }
  })
})
