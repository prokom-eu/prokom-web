import { expect, test, type Page } from '@playwright/test'

import { hydrated, site } from './helpers'

// SWV5 (MOBILE-APLIKACJA §4 pkt 10, ZMIANY-v23 §5): motion of the Software line — the rail
// glides, sections rise in on scroll, and with reduced motion nothing moves at all.
const HOST = 'software.localhost'

/** CSS animations running on the page (scroll-driven and view transition ones included). */
const animations = (page: Page) =>
  page.evaluate(() =>
    document.getAnimations().map((animation) => ({
      name: (animation as CSSAnimation).animationName ?? '',
      pseudo: (animation.effect as KeyframeEffect | null)?.pseudoElement ?? '',
    })),
  )

/** Our animations: sections, the phone panel card, the map pin, page transitions. */
const OURS = /^(sw-|hx-|mk-|panel-in|map-pulse)/

const scrollBehavior = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)

test.describe('Software motion', () => {
  test.use({ viewport: { width: 1500, height: 900 } })

  test('the rail glides to a section, focuses it and its heading arrives', async ({ page }) => {
    await page.goto(site(HOST))
    expect(await scrollBehavior(page)).toBe('smooth')
    await page
      .getByRole('navigation', { name: 'Na tej stronie' })
      .locator('a[href="#proces"]')
      .click()
    await expect(page).toHaveURL(/#proces$/)
    await expect(page.locator('#proces')).toBeFocused()
    // Lands where a plain anchor jump would (the section's scroll margin), marked as arrived.
    await expect
      .poll(() =>
        page.evaluate(() => {
          const section = document.getElementById('proces')
          if (!section) return 'missing'
          const top = Math.round(section.getBoundingClientRect().top)
          const margin = Math.round(Number.parseFloat(getComputedStyle(section).scrollMarginTop))
          return top === margin && section.hasAttribute('data-arrive') ? 'arrived' : top
        }),
      )
      .toBe('arrived')
    // v24: the heading rises in with the scroll alone (`data-rise`, CSS) and is there on arrival.
    const head = page.locator('#proces h2')
    await expect(head).toHaveAttribute('data-rise')
    await expect.poll(() => head.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
  })
})

test.describe('Software motion with reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('the start page does not move', async ({ page }) => {
    await page.goto(site(HOST))
    expect(await scrollBehavior(page)).toBe('auto')
    // Nothing waits hidden for a rise-in (SWV7).
    expect(await page.locator('[data-reveal-pending]').count()).toBe(0)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
    expect((await animations(page)).filter((a) => OURS.test(a.name))).toEqual([])
  })

  test('the hero stands on its first slide, tiles still switch by hand', async ({ page }) => {
    await page.clock.install()
    await page.goto(site(HOST))
    const word = page.locator('#start .hx-word')
    await expect(word).toHaveText('stronę wizytówkę.')
    await page.clock.fastForward(9000)
    await expect(word).toHaveText('stronę wizytówkę.')
    const tile = page.locator('#start').getByRole('tab', { name: /Restauracja/ })
    await hydrated(tile)
    await tile.click()
    await expect(word).toHaveText('stronę restauracji.')
    expect((await animations(page)).filter((a) => OURS.test(a.name))).toEqual([])
  })

  test('a page change swaps without a transition', async ({ page }) => {
    await page.goto(site(HOST))
    await page.locator('header').getByRole('link', { name: 'Kontakt' }).first().click()
    const during = await animations(page)
    expect(during.filter((a) => a.pseudo.includes('view-transition'))).toEqual([])
    await expect(page).toHaveURL(/\/kontakt$/)
  })

  test('the contact map pin does not pulse and an FAQ answer opens at once', async ({ page }) => {
    await page.goto(site(HOST, '/kontakt'))
    await page.locator('#gdzie').scrollIntoViewIfNeeded()
    const faq = page.locator('#faq details').nth(1)
    await faq.locator('summary').click()
    await expect(faq).toHaveAttribute('open', '')
    expect((await animations(page)).filter((a) => OURS.test(a.name))).toEqual([])
  })
})
