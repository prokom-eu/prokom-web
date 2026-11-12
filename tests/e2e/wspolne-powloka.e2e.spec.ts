import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { setTheme, site } from './helpers'

// D2-1a (plan `docs/zadania/wspolne-elementy.md`, NAGLOWEK-KAPSULA §8, spec §10 pkt 3): the brand
// bar and the header capsule on the preview page `/_wspolne` of each line, on the seed data.
const LINES = [
  { host: 'biznes.localhost', name: 'Biznes' },
  { host: 'instalacje.localhost', name: 'Instalacje' },
  { host: 'software.localhost', name: 'Software' },
] as const

const preview = (page: Page) => page.locator('[data-wspolne]')
const capsule = (page: Page) => preview(page).locator('.cap')
const wrapper = (page: Page) => preview(page).locator('.cap-wrap')

const scrollTo = (page: Page, top: number) =>
  page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top)

for (const { host, name } of LINES) {
  test.describe(`/_wspolne — ${name}`, () => {
    test.use({ viewport: { width: 1440, height: 900 } })

    test('brand bar: published lines only, the current one marked, phone from the data', async ({
      page,
    }) => {
      await page.goto(site(host, '/_wspolne'))
      const bar = preview(page).getByRole('navigation', { name: 'Linie PRO-KOM' })
      await expect(bar).toBeVisible()
      // Seed: Gaming and Zakopane are not published yet (spec §2.4, §4.1).
      await expect(bar.getByRole('link', { name: 'Gaming' })).toHaveCount(0)
      await expect(bar.getByRole('link', { name: 'Zakopane' })).toHaveCount(0)
      await expect(bar.getByRole('link', { name: 'Tech' })).toHaveAttribute('href', /^https:\/\//)
      await expect(bar.locator('[aria-current="page"]')).toHaveText(name)
      const tel = preview(page).locator('[data-brand-bar] a[href^="tel:"]')
      await expect(tel).toHaveAttribute('href', /^tel:\+48\d{9}$/)
      await expect(preview(page).locator('[data-brand-bar] [data-opening-status]')).toBeVisible()
    })

    test('capsule: lower and stuck 12 px from the top after scrolling, the page does not move', async ({
      page,
    }) => {
      await page.goto(site(host, '/_wspolne'))
      await expect(wrapper(page)).not.toHaveAttribute('data-scrolled')
      await expect
        .poll(async () => Math.round((await capsule(page).boundingBox())?.height ?? 0))
        .toBe(72)

      // A scroll before the capsule's code has arrived (ADR-023) is not seen: scroll again.
      await expect(async () => {
        await scrollTo(page, 0)
        await scrollTo(page, 400)
        await expect(wrapper(page)).toHaveAttribute('data-scrolled', '', { timeout: 1000 })
      }).toPass()
      await expect
        .poll(async () => Math.round((await capsule(page).boundingBox())?.height ?? 0))
        .toBe(60)
      const box = await wrapper(page).boundingBox()
      expect(Math.round(box?.y ?? 0)).toBe(12)
      expect(Math.round(box?.height ?? 0)).toBe(72)

      await scrollTo(page, 0)
      await expect(wrapper(page)).not.toHaveAttribute('data-scrolled')
    })

    test('mega menu slot: opens under the capsule, Esc closes it and returns focus', async ({
      page,
    }) => {
      await page.goto(site(host, '/_wspolne?stan=mega'))
      const trigger = capsule(page).locator('button[aria-expanded]').first()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      const panel = preview(page).locator('[data-demo-mega]:visible')
      await expect(panel).toBeVisible()
      const [cap, mega] = await Promise.all([capsule(page).boundingBox(), panel.boundingBox()])
      expect(Math.round(mega!.y - (cap!.y + cap!.height))).toBe(10)
      expect(Math.round(mega!.width)).toBe(Math.round(cap!.width))

      await panel.getByRole('link').focus()
      await page.keyboard.press('Escape')
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect(trigger).toBeFocused()
    })

    test('the current page has the pill and aria-current; one main menu', async ({ page }) => {
      await page.goto(site(host, '/_wspolne?stan=gora'))
      const nav = preview(page).getByRole('navigation', { name: 'Menu główne' })
      await expect(nav).toHaveCount(1)
      const current = nav.locator('[aria-current="page"]')
      await expect(current).toHaveText('Kontakt')
      const pill = await current.evaluate((link) => getComputedStyle(link).backgroundColor)
      expect(pill).not.toBe('rgba(0, 0, 0, 0)')
      await expect(capsule(page).getByRole('link', { name: /— strona główna$/ })).toHaveAttribute(
        'href',
        '/',
      )
    })

    for (const theme of ['light', 'dark'] as const) {
      test(`axe: no violations in the preview (${theme})`, async ({ page }) => {
        await setTheme(page, theme)
        await page.goto(site(host, '/_wspolne'))
        const results = await new AxeBuilder({ page }).include('[data-wspolne]').analyze()
        expect(results.violations).toEqual([])
      })
    }
  })
}

test.describe('/_wspolne — widths (NAGLOWEK-KAPSULA §3)', () => {
  for (const width of [1081, 1180]) {
    test(`the longest menu (Instalacje) stays on one row at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto(site('instalacje.localhost', '/_wspolne'))
      const tops = await capsule(page)
        .locator('.cap__nav .cap-link')
        .evaluateAll((links) => [
          ...new Set(links.map((l) => Math.round(l.getBoundingClientRect().top))),
        ])
      expect(tops).toHaveLength(1)
      const fits = await capsule(page).evaluate((cap) => cap.scrollWidth <= cap.clientWidth)
      expect(fits).toBe(true)
      await expect(capsule(page).locator('.cap-cta__short')).toBeVisible()
    })
  }

  test('on a phone the capsule hidden while scrolling down is inert', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    // The preview page keeps its capsule still (`state`): a real line page hides it.
    await page.goto(site('instalacje.localhost', '/'))
    const wrap = page.locator('[data-site-header]')
    await expect(async () => {
      await page.mouse.wheel(0, 600)
      await expect(wrap).toHaveAttribute('data-hidden', '', { timeout: 1000 })
    }).toPass()
    await expect(wrap).toHaveAttribute('inert', '')
  })

  for (const { host } of LINES) {
    test(`${host} on a phone: mark, short action and Menu, no sideways scroll`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto(site(host, '/_wspolne'))
      await expect(capsule(page).locator('.cap__nav')).toBeHidden()
      await expect(capsule(page).locator('.cap__extras')).toBeHidden()
      await expect(capsule(page).getByRole('button', { name: 'Menu' })).toBeVisible()
      await expect(preview(page).locator('[data-brand-bar]')).toBeHidden()
      const box = await capsule(page).boundingBox()
      expect(Math.round(box?.height ?? 0)).toBe(58)
      const sideways = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      )
      expect(sideways).toBe(false)
    })
  }
})
