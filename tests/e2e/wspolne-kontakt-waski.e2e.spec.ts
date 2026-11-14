import { expect, test } from '@playwright/test'

import { site } from './helpers'

// Production audit 14.11 (P1): on a 360–390 px phone, when the company is closed, the hero of the
// shared Kontakt template was cut on the right — the pill „Zamknięte · otwieramy w poniedziałek
// o 9:00” did not wrap and the hero grid (one implicit `auto` column below 1000 px) grew to its
// width, while the section's `overflow-hidden` clipped instead of scrolling. Saturday 22:00 gives
// the longest status text. Same component on the contact pages of all three lines.

const HOSTS = ['biznes.localhost', 'software.localhost', 'instalacje.localhost'] as const
const VIEWPORTS = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
] as const
// Saturday 14.11.2026, 22:00 in Rabka — closed until Monday 9:00.
const SATURDAY_NIGHT = new Date('2026-11-14T22:00:00+01:00')

for (const host of HOSTS) {
  for (const viewport of VIEWPORTS) {
    test(`${host} /kontakt at ${viewport.width} px, closed: nothing sticks out on the right`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport)
      await page.clock.setFixedTime(SATURDAY_NIGHT)
      const response = await page.goto(site(host, '/kontakt'))
      expect(response?.status()).toBe(200)

      // The status refreshes right after hydration to the (fixed) browser time.
      const status = page.locator('[data-contact-page] [data-opening-status]').first()
      await expect(status).toContainText('otwieramy w poniedziałek')
      // Narrow screen: the short form is what the eye sees (the full one is for screen readers).
      await expect(status.locator('.oh-status__short')).toBeVisible()
      await expect(status.locator('.oh-status__short')).toHaveText('Zamknięte · pn 9:00')

      const overflowing = await page.evaluate(() => {
        const limit = window.innerWidth + 1
        const scrolls = (element: Element) => {
          const overflowX = getComputedStyle(element).overflowX
          return overflowX === 'auto' || overflowX === 'scroll'
        }
        const result: string[] = []
        for (const element of document.querySelectorAll('main *')) {
          // Shapes inside an <svg> (contours, map) are clipped by it — the <svg> itself is measured.
          if (element instanceof SVGElement && element.ownerSVGElement) continue
          // Children of a horizontal scroller may legitimately extend past the screen.
          let parent = element.parentElement
          let insideScroller = false
          while (parent && parent.tagName !== 'MAIN') {
            if (scrolls(parent)) {
              insideScroller = true
              break
            }
            parent = parent.parentElement
          }
          if (insideScroller) continue
          const rect = element.getBoundingClientRect()
          if (rect.width === 0 || rect.height === 0) continue
          if (rect.right > limit) {
            const label = (element.textContent ?? '').trim().slice(0, 40)
            result.push(`${element.tagName.toLowerCase()} ${Math.round(rect.right)}px „${label}”`)
          }
        }
        return result
      })
      expect(overflowing).toEqual([])
    })
  }
}
