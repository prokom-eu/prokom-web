import { expect, test, type Page } from '@playwright/test'

import { HEADER_OFFSET } from '../../src/lib/software/smoothScroll'

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

// Prompt 4 R2 + Krystian 03.11: the side rail opens softly and a click glides to the section,
// whose heading arrives; the marker follows. Dialogs open with the system's motion.
test.describe('side rail and dialogs (R2)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('the rail opens with its labels and glides to a section', async ({ page }) => {
    await page.goto(site(HOST, '/'))
    await page.waitForLoadState('networkidle')
    const rail = page.getByRole('navigation', { name: 'Na tej stronie' })
    const label = rail.locator('[data-rail-label]').first()
    await expect(label).toHaveCSS('opacity', '0')
    await rail.hover()
    await expect(label).toHaveCSS('opacity', '1')
    const link = rail.locator('a[href="#faq"]')
    await link.click()
    await expect(page).toHaveURL(/#faq$/)
    await expect
      .poll(() =>
        page.evaluate((headerOffset) => {
          const section = document.getElementById('faq')!
          const top = Math.round(section.getBoundingClientRect().top)
          // Same stop as `glideTo`: the section's own `scroll-margin-top`, else room for the header.
          const own = Number.parseFloat(getComputedStyle(section).scrollMarginTop)
          const margin = Math.round(own > 0 ? own : headerOffset)
          return Math.abs(top - margin) <= 2 && section.hasAttribute('data-arrive')
            ? 'arrived'
            : top
        }, HEADER_OFFSET),
      )
      .toBe('arrived')
    await expect(link).toHaveAttribute('aria-current', 'true')
    await expect(rail.locator('[data-rail-marker]')).toBeAttached()
  })

  test('the inquiry drawer slides in from the right', async ({ page }) => {
    await page.goto(site(HOST, '/oferta'))
    await page.waitForLoadState('networkidle')
    const drawer = page.locator('dialog[data-motion="drawer"]')
    await expect(drawer).toHaveCSS('translate', '100%')
    await page
      .getByRole('button', { name: /^Zapytanie/ })
      .first()
      .click()
    await expect(drawer).toBeVisible()
    await expect(drawer).toHaveCSS('translate', 'none')
  })
})

test.describe('side rail with reduced motion', () => {
  test.use({ viewport: { width: 1440, height: 900 }, contextOptions: { reducedMotion: 'reduce' } })

  test('labels do not fade and the drawer does not slide', async ({ page }) => {
    await page.goto(site(HOST, '/'))
    const rail = page.getByRole('navigation', { name: 'Na tej stronie' })
    await expect(rail.locator('[data-rail-label]').first()).toHaveCSS('opacity', '1')
    await expect(page.locator('dialog[data-motion="drawer"]')).not.toHaveCSS('translate', '100%')
  })
})
