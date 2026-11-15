import { expect, test } from '@playwright/test'

import { hiddenAfterScroll, PAGES } from '../../scripts/widocznosc.mjs'
import { site } from './helpers'

// PRODUKCJA-BIZNES-1211 P0: sections in the HTML but never on screen (a side-rail rule hid every
// K4 section with an anchor). With motion on — the rise-ins and rail rules apply only then —
// scrolled like a visitor at desktop and phone width, every section and reveal target shows.
test.use({ contextOptions: { reducedMotion: 'no-preference' } })

const WIDTHS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
]

for (const { name, width, height } of WIDTHS) {
  test.describe(`Biznes — widoczność sekcji ${name}`, () => {
    test.use({ viewport: { width, height } })

    for (const path of PAGES) {
      test(`${path} shows every section after scrolling`, async ({ page }) => {
        test.setTimeout(120_000)
        const response = await page.goto(site('biznes.localhost', path))
        expect(response?.status(), path).toBe(200)
        const problems = await hiddenAfterScroll(page)
        expect(
          problems.map((p) => `${path} @${name}: ${p.element} — ${p.why} — ${p.rule}`),
        ).toEqual([])
      })
    }
  })
}
