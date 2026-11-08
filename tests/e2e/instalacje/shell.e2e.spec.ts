import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

import { site } from '../helpers'

// L1-I: the Instalacje line on the shared shell (ADR-022, NAGLOWEK-KAPSULA, WSPOLNE-ELEMENTY §5,
// §5.1): brand bar, header capsule with the line's two mega menus, side rail with „Na tej
// stronie”, the search window with the line's index, the shared footer with the mountain ridge,
// and on a phone the tab bar and the menu sheet. Data from `pnpm seed`.
const HOST = 'instalacje.localhost'
const DESKTOP = { width: 1440, height: 1000 }
const PHONE = { width: 390, height: 844 }

/** The page, after the widgets' code has arrived (ADR-023): a key or click before it is lost. */
async function open(page: Page, path = '/') {
  await page.goto(site(HOST, path))
  await page.waitForLoadState('networkidle')
}

const capsule = (page: Page) => page.locator('[data-site-header]')
const rail = (page: Page) => page.locator('[data-site-rail]')
const search = (page: Page) => page.locator('[data-search-dialog]')
const sheet = (page: Page) => page.getByRole('dialog', { name: 'Menu' })
const tabBar = (page: Page) => page.getByRole('navigation', { name: 'Pasek aplikacji' })

test.describe('Instalacje capsule (desktop)', () => {
  test.use({ viewport: DESKTOP })

  test('mega menu: hover, the pointer crosses to an item, the click works', async ({ page }) => {
    await open(page)
    const button = capsule(page).getByRole('button', { name: 'Usługi', exact: true })
    const panel = page.getByRole('region', { name: 'Usługi' })
    await expect(async () => {
      await page.mouse.move(700, 950)
      await button.hover()
      await expect(panel).toBeVisible({ timeout: 500 })
    }).toPass()
    await expect(button).toHaveAttribute('aria-expanded', 'true')

    // The item's box is read once the panel has stopped sliding in: measured mid-animation, the
    // pointer aims where the item is no longer, leaves the panel and it closes (flaky in CI).
    await panel.evaluate((element) =>
      Promise.all(
        element
          .getAnimations({ subtree: true })
          .map((animation) => animation.finished.catch(() => undefined)),
      ),
    )
    // Through the gap between the capsule and the panel (the bridge), slowly, like a hand.
    const item = panel.getByRole('link').first()
    const href = await item.getAttribute('href')
    const box = await item.boundingBox()
    if (!box) throw new Error('no menu item box')
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 25 })
    await expect(panel).toBeVisible()
    await item.click()
    await expect(page).toHaveURL(new RegExp(`${href}$`))
    await expect(panel).toBeHidden()
  })

  test('closes after the pointer leaves, and on Esc back to its button', async ({ page }) => {
    await open(page)
    const button = capsule(page).getByRole('button', { name: 'Dla kogo', exact: true })
    const panel = page.getByRole('region', { name: 'Dla kogo' })
    await button.hover()
    await expect(panel).toBeVisible()
    await page.mouse.move(700, 950)
    await expect(panel).toBeHidden()

    await button.focus()
    await page.keyboard.press('Enter')
    await expect(panel).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
    await expect(button).toBeFocused()
  })

  test('a click toggles; Tab stays inside the open panel', async ({ page }) => {
    await open(page)
    const button = capsule(page).getByRole('button', { name: 'Usługi', exact: true })
    const panel = page.getByRole('region', { name: 'Usługi' })
    await expect(async () => {
      await button.focus()
      await page.keyboard.press('Enter')
      await expect(panel).toBeVisible({ timeout: 500 })
    }).toPass()

    const stops = await panel.locator('a[href], button').count()
    for (let i = 0; i < stops + 1; i++) await page.keyboard.press('Tab')
    await expect(button).toBeFocused()

    await page.waitForTimeout(700)
    await button.click()
    await expect(panel).toBeHidden()
  })

  test('marks the page and the section of the page', async ({ page }) => {
    await open(page, '/realizacje')
    const menu = page.getByRole('navigation', { name: 'Menu główne' })
    await expect(menu.getByRole('link', { name: 'Realizacje', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await open(page, '/monitoring')
    await expect(menu.getByRole('button', { name: 'Usługi', exact: true })).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  test('brand bar: this line marked, the line slot and the phone from the panel', async ({
    page,
  }) => {
    await open(page)
    const lines = page.getByRole('navigation', { name: 'Linie PRO-KOM' })
    await expect(lines.getByText('Instalacje', { exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: /Zgłoś awarię/ }).first()).toHaveAttribute(
      'href',
      '/serwis#zglos',
    )
    await expect(page.locator('a[href^="tel:"]').first()).toBeVisible()
  })

  test('the capsule gets smaller after scrolling and the theme switch remembers', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await open(page)
    await page.evaluate(() => window.scrollTo(0, 600))
    await expect(capsule(page)).toHaveAttribute('data-scrolled', '')
    await capsule(page).getByRole('button', { name: 'Tryb ciemny' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })

  test('no WhatsApp anywhere in the shell or on the home page (decision 01.11)', async ({
    page,
  }) => {
    await open(page)
    await expect(page.locator('a[href*="wa.me"]')).toHaveCount(0)
    expect(await page.locator('body').textContent()).not.toMatch(/WhatsApp/i)
  })
})

test.describe('Instalacje side rail and search (1440 px)', () => {
  test.use({ viewport: DESKTOP })

  test('home: the sections of the page, „Zaplanuj” and „Do góry”', async ({ page }) => {
    await open(page)
    await expect(rail(page)).toBeVisible()
    await expect(rail(page).getByRole('link', { name: 'Dla kogo' })).toHaveAttribute(
      'href',
      '#dla-kogo',
    )
    await expect(
      rail(page)
        .getByRole('link', { name: /Zaplanuj/ })
        .last(),
    ).toHaveAttribute('href', '/zaplanuj')
  })

  test('a service page: „Na tej stronie” from the anchor bar, which hides from 1400 px', async ({
    page,
  }) => {
    await open(page, '/monitoring')
    await expect(rail(page).getByRole('group', { name: 'Na tej stronie' })).toBeVisible()
    await expect(page.locator('nav.anchors')).toBeHidden()
  })

  test('search: Ctrl K, a typo still finds the service, nothing found → „Zapytaj o”', async ({
    page,
  }) => {
    await open(page)
    // Retried until the page is hydrated (before that nothing listens to the keys).
    await expect(async () => {
      await page.keyboard.press('Control+k')
      await expect(search(page)).toBeVisible({ timeout: 500 })
    }).toPass()
    const field = search(page).getByRole('searchbox')
    await field.fill('monitorng')
    await expect(
      search(page)
        .getByRole('link', { name: /Monitoring i kamery/ })
        .first(),
    ).toBeVisible()
    await field.fill('xyzqwerty')
    await expect(search(page).getByText(/Zapytaj o „xyzqwerty”/)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(search(page)).toBeHidden()

    // The folded rail shows 64 px: a hand points at it first, then it opens and „Szukaj” is clicked.
    await rail(page).hover({ position: { x: 32, y: 40 } })
    await rail(page)
      .getByRole('button', { name: /Szukaj/ })
      .click()
    await expect(search(page)).toBeVisible()
  })

  test('the index answers on this line only', async ({ page }) => {
    // Through the browser: Node does not resolve `*.localhost`.
    const ok = await page.goto(site(HOST, '/api/inst-search-index'))
    expect(ok?.status()).toBe(200)
    const index = ((await ok?.json()) ?? []) as { group: string }[]
    expect(new Set(index.map((entry) => entry.group))).toContain('Rozwiązania')
    const other = await page.goto(site('software.localhost', '/api/inst-search-index'))
    expect(other?.status()).toBe(404)
  })

  test('axe: the home page shell has no violations of WCAG A/AA landmarks', async ({ page }) => {
    await open(page)
    const results = await new AxeBuilder({ page })
      .include('[data-site-header]')
      .include('[data-site-footer]')
      .include('[data-site-rail]')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    expect(results.violations.map((v) => v.id)).toEqual([])
  })
})

test.describe('Instalacje phone shell', () => {
  test.use({ viewport: PHONE, hasTouch: true })

  test('tab bar: Główna · Usługi · Zaplanuj · Kontakt · Menu', async ({ page }) => {
    await open(page)
    const bar = tabBar(page)
    await expect(bar.getByRole('link', { name: 'Główna' })).toHaveAttribute('aria-current', 'page')
    await expect(bar.getByRole('link', { name: 'Usługi' })).toHaveAttribute('href', '/uslugi')
    await expect(bar.getByRole('link', { name: 'Zaplanuj' })).toHaveAttribute('href', '/zaplanuj')
    await expect(bar.getByRole('link', { name: 'Kontakt' })).toHaveAttribute('href', '/kontakt')
    await expect(bar.getByRole('button', { name: 'Menu' })).toBeVisible()
  })

  test('the menu sheet: the line tiles behind three tabs, Esc closes', async ({ page }) => {
    await open(page)
    await tabBar(page).getByRole('button', { name: 'Menu' }).click()
    await expect(sheet(page)).toBeVisible()
    await expect(sheet(page).getByRole('link', { name: /Monitoring i kamery/ })).toBeVisible()
    await sheet(page).getByRole('button', { name: 'Dla kogo', exact: true }).click()
    await expect(sheet(page).getByRole('link', { name: /Pensjonat/ })).toBeVisible()
    await sheet(page).getByRole('button', { name: 'Strony', exact: true }).click()
    await sheet(page)
      .getByRole('link', { name: /Realizacje/ })
      .click()
    await expect(page).toHaveURL(site(HOST, '/realizacje'))
    await expect(sheet(page)).toBeHidden()
  })

  test('the capsule hides while scrolling down and comes back when scrolling up', async ({
    page,
  }) => {
    await open(page)
    const scrollTo = (y: number) => page.evaluate((top) => window.scrollTo({ top }), y)
    await expect(async () => {
      await scrollTo(0)
      for (const y of [150, 300, 450, 600]) {
        await scrollTo(y)
        await page.waitForTimeout(50)
      }
      await expect(capsule(page)).toHaveAttribute('data-hidden', '', { timeout: 500 })
    }).toPass()
    await scrollTo(400)
    await expect(capsule(page)).not.toHaveAttribute('data-hidden', '')
  })
})

test.describe('Instalacje shell layout', () => {
  for (const width of [360, 390, 414]) {
    test(`no horizontal scroll at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      for (const path of ['/', '/monitoring', '/dla-architektow']) {
        await open(page, path)
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        )
        expect(overflow, path).toBeLessThanOrEqual(0)
      }
    })
  }

  test('a missing page answers 404 inside the shell', async ({ page }) => {
    const response = await page.goto(site(HOST, '/nie-ma-takiej-strony'))
    expect(response?.status()).toBe(404)
    await expect(capsule(page)).toBeVisible()
    await expect(page.locator('[data-site-footer]')).toBeVisible()
  })
})
