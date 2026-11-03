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

/** Scrolls to the bottom and back, step by step, so every section passes the screen. */
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 60))
    }
  })
}

test('rise-in: nothing on the first screen waits; after scrolling nothing stays hidden', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(site(HOST, '/kontakt'))
  await page.waitForLoadState('networkidle')
  // The first screen is never hidden (LCP), below it the K4 sections wait for their turn.
  const firstScreen = await page.evaluate(
    () =>
      [...document.querySelectorAll('[data-reveal-pending]')].filter(
        (element) => element.getBoundingClientRect().top < window.innerHeight * 0.9,
      ).length,
  )
  expect(firstScreen).toBe(0)
  await expect(page.locator('[data-reveal-pending]').first()).toBeAttached()
  await scrollThrough(page)
  await expect(page.locator('[data-reveal-pending]')).toHaveCount(0)
  await expect(page.locator('[data-revealed]').first()).toBeAttached()
})

test.describe('reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  for (const path of ['/', '/kontakt']) {
    test(`nothing waits hidden and buttons do not move: ${path}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto(site(HOST, path))
      await page.waitForLoadState('networkidle')
      await scrollThrough(page)
      await expect(page.locator('[data-reveal-pending]')).toHaveCount(0)
      const moving = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('main a[href], main button')]
          .filter((element) => element.getClientRects().length > 0)
          .filter((element) =>
            /(translate|scale|transform)/.test(getComputedStyle(element).transitionProperty),
          )
          .slice(0, 3)
          .map((element) => (element.textContent ?? '').trim().slice(0, 30)),
      )
      expect(moving).toEqual([])
    })
  }
})
