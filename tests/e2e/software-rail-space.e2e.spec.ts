import { expect, test } from '@playwright/test'

import { site } from './helpers'

// AUDYT-0811 #10: from 1400 px the side rail stands on the left — no heading, lead or link of a
// Software page may sit under it (rectangles of the folded rail vs the page's text). O firmie
// and Kontakt keep clear through the shared templates' container (PR #418, `--rail-offset`).
const HOST = 'software.localhost'
const PAGES = [
  '/',
  '/rozwiazania',
  '/dobierz',
  '/cennik',
  '/audyt',
  '/o-firmie',
  '/kontakt',
  '/aktualnosci',
  '/polityka-prywatnosci',
  '/regulamin',
  '/mapa-strony',
]

for (const width of [1400, 1440]) {
  test.describe(`rail and content at ${width} px`, () => {
    test.use({ viewport: { width, height: 900 } })

    for (const path of PAGES) {
      test(`${path}: nothing under the rail`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await page.goto(site(HOST, path))
        const rail = page.locator('[data-site-rail]')
        await expect(rail).toBeVisible()
        const under = await page.evaluate(() => {
          const box = document.querySelector('[data-site-rail]')!.getBoundingClientRect()
          // The folded rail: 64 px wide from its left edge (the rest is clipped).
          const right = box.left + 64
          return Array.from(document.querySelectorAll('main :is(h1, h2, h3, p, li, a, button)'))
            .filter((element) => {
              const r = element.getBoundingClientRect()
              const style = getComputedStyle(element)
              if (!r.width || !r.height || style.visibility === 'hidden') return false
              if (element.closest('.hx-flow, [aria-hidden="true"], .hx-mq')) return false
              return r.left < right && r.right > box.left
            })
            .map((element) => (element.textContent ?? '').trim().slice(0, 40))
        })
        expect(under).toEqual([])
      })
    }
  })
}
