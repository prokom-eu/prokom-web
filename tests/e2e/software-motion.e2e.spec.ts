import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// SWV5 (MOBILE-APLIKACJA §4 pkt 10, ZMIANY-v23 §5): motion of the Software line — the rail
// glides, sections rise in on scroll, and with reduced motion nothing moves at all.
const HOST = 'software.localhost'

/** Names of the CSS animations running on the page (scroll-driven ones included). */
const animationNames = (page: Page) =>
  page.evaluate(() =>
    document
      .getAnimations()
      .map((animation) => (animation as CSSAnimation).animationName ?? '')
      .filter(Boolean),
  )

test.describe('Software motion', () => {
  test.use({ viewport: { width: 1500, height: 900 } })

  test('the rail glides to a section and its heading arrives', async ({ page }) => {
    await page.goto(site(HOST))
    expect(
      await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior),
    ).toBe('smooth')
    // Section headings rise in while scrolling (Chromium supports `animation-timeline`).
    expect(await animationNames(page)).toContain('sw-rise')
    await page
      .getByRole('navigation', { name: 'Na tej stronie' })
      .locator('a[href="#jak-robimy"]')
      .click()
    await expect(page).toHaveURL(/#jak-robimy$/)
    await expect
      .poll(() =>
        page.evaluate(() =>
          Math.round(document.getElementById('jak-robimy')?.getBoundingClientRect().top ?? -1),
        ),
      )
      .toBe(84)
    await expect(page.locator('#jak-robimy')).toHaveAttribute('data-arrive', '')
  })
})

test.describe('Software motion with reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('the start page does not move', async ({ page }) => {
    await page.goto(site(HOST))
    expect(
      await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior),
    ).toBe('auto')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
    const names = await animationNames(page)
    expect(names.filter((name) => /^(sw-|panel-in|map-pulse)/.test(name))).toEqual([])
  })

  test('the contact map pin does not pulse and an FAQ answer opens at once', async ({ page }) => {
    await page.goto(site(HOST, '/kontakt'))
    await page.locator('#gdzie').scrollIntoViewIfNeeded()
    const faq = page.locator('#faq details').nth(1)
    await faq.locator('summary').click()
    await expect(faq).toHaveAttribute('open', '')
    const names = await animationNames(page)
    expect(names.filter((name) => /^(sw-|map-pulse)/.test(name))).toEqual([])
  })
})
