import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// D3-B PR 1b (docs/zadania/prokombiznes-0611.md §8.1 pkt 3): „Oferta ▾” premium — departments,
// categories of the shown department, shortcuts; the keyboard, closing after the pointer leaves,
// axe in the open panel, no sideways scroll. Data from `pnpm seed`.

const biznes = (path = '/') => site('biznes.localhost', path)
const capsule = (page: Page) => page.locator('[data-site-header]')
const trigger = (page: Page) => capsule(page).getByRole('button', { name: /^Oferta/ })
const panel = (page: Page) => page.locator('#oferta-mega')
const tabs = (page: Page) => panel(page).getByRole('tab')

type Index = { groups: { slug: string }[]; categories: { group: string }[] }

/** Open the panel with a click once the header is hydrated (a click before hydration is lost). */
async function open(page: Page) {
  await expect(async () => {
    await trigger(page).click()
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'true', { timeout: 1000 })
  }).toPass()
  await expect(panel(page)).toBeVisible()
}

test.describe('Biznes „Oferta ▾” premium', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('keyboard: ↓ opens, ↑↓ Home End move, → into categories, ← back, Esc closes', async ({
    page,
  }) => {
    await page.goto(biznes())
    // Hydrated: a click toggles it; close again and drive it from the keyboard.
    await open(page)
    await page.keyboard.press('Escape')
    await expect(panel(page)).toBeHidden()
    await expect(trigger(page)).toBeFocused()

    await page.keyboard.press('ArrowDown')
    await expect(tabs(page).first()).toBeFocused()
    await expect(tabs(page).first()).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('ArrowDown')
    await expect(tabs(page).nth(1)).toBeFocused()
    await expect(tabs(page).nth(1)).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('End')
    await expect(tabs(page).last()).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(tabs(page).first()).toBeFocused()
    await page.keyboard.press('ArrowUp')
    await expect(tabs(page).last()).toBeFocused()
    await page.keyboard.press('Home')
    await expect(tabs(page).first()).toBeFocused()

    await page.keyboard.press('ArrowRight')
    const firstCategory = panel(page).getByRole('tabpanel').getByRole('link').first()
    await expect(firstCategory).toBeFocused()
    await page.keyboard.press('ArrowLeft')
    await expect(tabs(page).first()).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(panel(page)).toBeHidden()
    await expect(trigger(page)).toBeFocused()
  })

  test('the focus leaving the panel closes it', async ({ page }) => {
    await page.goto(biznes())
    await open(page)
    await capsule(page).getByRole('link', { name: 'Marki', exact: true }).focus()
    await expect(panel(page)).toBeHidden()
  })

  test('each department lists as many categories as the catalog has', async ({ page }) => {
    await page.goto(biznes())
    const index = await page.evaluate(async () => {
      const response = await fetch('/api/catalog-index', { cache: 'no-store' })
      return (await response.json()) as Index
    })
    await open(page)
    await expect(tabs(page)).toHaveCount(index.groups.length)
    for (const [i, group] of index.groups.entries()) {
      await tabs(page).nth(i).click()
      const expected = index.categories.filter((category) => category.group === group.slug).length
      const grid = panel(page).getByRole('tabpanel').locator('.bmg__grid')
      await expect(grid.getByRole('link')).toHaveCount(expected)
    }
  })

  test('closes 280 ms after the pointer leaves, stays open while it crosses the gap', async ({
    page,
  }) => {
    await page.goto(biznes())
    await open(page)
    // The pointer goes down into the panel (over the bridge) and stays: the panel stays open.
    const box = (await panel(page).boundingBox())!
    await page.mouse.move(box.x + 40, box.y + 60, { steps: 5 })
    await page.waitForTimeout(500)
    await expect(panel(page)).toBeVisible()
    // Leaves far below: closed after the delay.
    await page.mouse.move(box.x + 40, box.y + box.height + 200, { steps: 5 })
    await expect(panel(page)).toBeHidden({ timeout: 2000 })
  })

  test('a link in the panel closes it, also to the page already open', async ({ page }) => {
    await page.goto(biznes('/oferta'))
    await open(page)
    await panel(page)
      .getByRole('link', { name: /^Cały dział/ })
      .click()
    await expect(page).toHaveURL(/\/oferta\?grupa=/)
    await expect(panel(page)).toBeHidden()
  })

  test('„Szukasz konkretnego modelu?” opens the search', async ({ page }) => {
    await page.goto(biznes())
    await open(page)
    await panel(page)
      .getByRole('button', { name: /Szukasz konkretnego modelu/ })
      .click()
    await expect(page.getByRole('dialog', { name: /Szukaj/ })).toBeVisible()
    await expect(panel(page)).toBeHidden()
  })

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`axe passes in the open panel — ${colorScheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' })
      await page.goto(biznes())
      await open(page)
      const results = await new AxeBuilder({ page }).include('#oferta-mega').analyze()
      expect(results.violations).toEqual([])
    })
  }
})

for (const width of [1180, 1440]) {
  test(`„Oferta ▾” fits ${width} px without scrolling sideways`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(biznes())
    await open(page)
    const overflow = await page.evaluate(() => {
      const mega = document.querySelector('#oferta-mega')!
      return {
        page: document.documentElement.scrollWidth - window.innerWidth,
        panel: mega.scrollWidth - mega.clientWidth,
      }
    })
    expect(overflow.page).toBeLessThanOrEqual(0)
    expect(overflow.panel).toBeLessThanOrEqual(0)
  })
}
