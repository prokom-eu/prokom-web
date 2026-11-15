import { expect, test } from '@playwright/test'

import { site } from './helpers'

// Audit 14.11 P2-6: touch targets on a phone. WCAG 2.2 asks for 24 px, MOBILE-APLIKACJA for 44 px;
// the test holds the line at 32 px for every link and button of `main`, except links in running
// text (inline in a paragraph). /kontakt is the shared contact page (zone of ADR-022) — not here.
const PAGES = [
  '/',
  '/oferta',
  '/oferta/kasy-fiskalne',
  '/produkt/posnet-ergo-online',
  '/marki/posnet',
  '/marki/niszczarki',
  '/zestawy',
  '/zestawy/zestaw-sklep-kasa-start',
  '/insert',
  '/gopos',
]

test.describe('Biznes touch targets on a phone (390 px)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  for (const path of PAGES) {
    test(`${path}: no link or button under 32 px`, async ({ page }) => {
      await page.goto(site('biznes.localhost', path))
      const small = await page.evaluate(() =>
        [...document.querySelectorAll('main a, main button')].flatMap((element) => {
          const box = element.getBoundingClientRect()
          const style = getComputedStyle(element)
          if (!box.width || !box.height || style.visibility === 'hidden') return []
          if (element.closest('p') && style.display === 'inline') return []
          if (box.height >= 32) return []
          const label = (element.getAttribute('aria-label') ?? element.textContent ?? '').trim()
          return [`${Math.round(box.height)} px: ${label.slice(0, 50)}`]
        }),
      )
      expect(small).toEqual([])
    })
  }
})
