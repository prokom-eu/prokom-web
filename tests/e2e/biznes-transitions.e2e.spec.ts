import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// Prompt 4 R1 (Definition of Done): Biznes joins the motion system of Software and Instalacje
// (`src/styles/motion.css`) — every clickable element changes smoothly, none has a transition of
// 0 s; with reduced motion nothing waits hidden for a rise-in.
const HOST = 'biznes.localhost'

/** Visible clickable elements whose every transition lasts 0 s, as short descriptions. */
const withoutTransition = (page: Page) =>
  page.evaluate(() => {
    const selector =
      'a[href], button, summary, [role="tab"], input:not([type="hidden"]), select, textarea, label'
    return [...document.querySelectorAll<HTMLElement>(selector)]
      .filter((element) => element.getClientRects().length > 0)
      .filter((element) =>
        getComputedStyle(element)
          .transitionDuration.split(',')
          .every((duration) => Number.parseFloat(duration) === 0),
      )
      .map(
        (element) =>
          `${element.tagName.toLowerCase()} „${(element.textContent ?? '').trim().slice(0, 40)}”`,
      )
  })

const PAGES = ['/', '/oferta', '/produkt/posnet-ergo-online', '/marki/apple', '/kontakt']

for (const path of PAGES) {
  for (const viewport of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'phone', width: 390, height: 844 },
  ]) {
    test(`every clickable element has a transition: ${path} (${viewport.name})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto(site(HOST, path))
      expect(await withoutTransition(page)).toEqual([])
    })
  }
}

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('nothing waits hidden and buttons do not move', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(site(HOST, '/kontakt'))
    await expect(page.locator('[data-reveal-pending]')).toHaveCount(0)
    const moving = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('main a[href], main button')]
        .filter((element) => element.getClientRects().length > 0)
        .filter((element) =>
          /\b(translate|scale|transform)\b/.test(getComputedStyle(element).transitionProperty),
        )
        .slice(0, 3)
        .map((element) => (element.textContent ?? '').trim().slice(0, 30)),
    )
    expect(moving).toEqual([])
  })
})
