import { expect, test, type Page } from '@playwright/test'

import { hydrated, site } from './helpers'

// WSP-M PR 1 (ADR-028, MOTYW-PASEK-LINII §7): the theme button with the action as its label, Auto
// „dark at night”, the choice carried between our domains with `?motyw=`. Needs `pnpm seed`.

const DESKTOP = { width: 1440, height: 900 }
const NOON = new Date('2026-11-18T11:00:00Z') // 12:00 in Warsaw
const NIGHT = new Date('2026-11-18T21:00:00Z') // 22:00 in Warsaw

const html = (page: Page) => page.locator('html')
const header = (page: Page) => page.locator('[data-site-header]')

test.describe('theme button (spec §1)', () => {
  test.use({ viewport: DESKTOP })

  test('says the action, switches, stores and turns into the other label', async ({ page }) => {
    await page.clock.setFixedTime(NOON)
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto(site('biznes.localhost'))
    await expect(html(page)).toHaveAttribute('data-theme', 'light')

    const toDark = header(page).getByRole('button', { name: 'Ciemny motyw' })
    await expect(toDark).toBeVisible()
    await hydrated(toDark)
    await expect(async () => {
      if ((await html(page).getAttribute('data-theme')) !== 'dark') await toDark.click()
      await expect(html(page)).toHaveAttribute('data-theme', 'dark', { timeout: 1000 })
    }).toPass()
    await expect(header(page).getByRole('button', { name: 'Jasny motyw' })).toBeVisible()
    expect(await page.evaluate(() => localStorage.getItem('pk-theme'))).toBe('dark')
  })

  test('the pill keeps its width when the label changes', async ({ page }) => {
    await page.clock.setFixedTime(NOON)
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto(site('biznes.localhost'))
    const button = header(page).locator('[data-theme-toggle]')
    await hydrated(button)
    const before = (await button.boundingBox())?.width
    await expect(async () => {
      if ((await html(page).getAttribute('data-theme')) !== 'dark') await button.click()
      await expect(html(page)).toHaveAttribute('data-theme', 'dark', { timeout: 1000 })
    }).toPass()
    expect((await button.boundingBox())?.width).toBe(before)
  })
})

test.describe('Auto: dark at night in Rabka (spec §2)', () => {
  test.use({ viewport: DESKTOP })

  for (const host of ['biznes.localhost', 'instalacje.localhost']) {
    test(`${host}: 22:00 dark, 12:00 light without a choice`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' })
      await page.clock.setFixedTime(NIGHT)
      await page.goto(site(host))
      await expect(html(page)).toHaveAttribute('data-theme', 'dark')

      await page.clock.setFixedTime(NOON)
      await page.reload()
      await expect(html(page)).toHaveAttribute('data-theme', 'light')
    })
  }

  test('a stored choice wins over the night', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('pk-theme', 'light'))
    await page.clock.setFixedTime(NIGHT)
    await page.goto(site('biznes.localhost'))
    await expect(html(page)).toHaveAttribute('data-theme', 'light')
  })
})

test.describe('the choice between our domains (spec §3)', () => {
  test.use({ viewport: DESKTOP })

  test('a parameter is applied, stored and cleared from the address after hydration', async ({
    page,
  }) => {
    await page.goto(site('software.localhost', '/?motyw=jasny'))
    await expect(html(page)).toHaveAttribute('data-theme', 'light')
    await expect.poll(() => new URL(page.url()).search).toBe('')
    expect(await page.evaluate(() => localStorage.getItem('pk-theme'))).toBe('light')
  })

  test('after the clean-up the router still works: a link, then Back', async ({ page }) => {
    await page.goto(site('software.localhost', '/?motyw=jasny'))
    await expect.poll(() => new URL(page.url()).search).toBe('')
    const heading = await page.locator('main h1').first().textContent()
    // The capsule's CTA: a plain client-side link (tiles of the hero may redirect).
    const link = page.locator('[data-site-header] a[href="/kontakt"]').first()
    await hydrated(link)
    await link.click()
    // A client-side navigation fires no `load`: poll the address instead of `waitForURL`.
    await expect.poll(() => new URL(page.url()).pathname).toBe('/kontakt')
    await page.goBack()
    await expect.poll(() => new URL(page.url()).pathname).toBe('/')
    // The router kept its state: Back shows the home page again, not the contact page.
    await expect(page.locator('main h1').first()).toHaveText(heading ?? '')
    expect(new URL(page.url()).search).toBe('')
  })

  test('an unknown value is ignored and cleared too', async ({ page }) => {
    await page.goto(site('software.localhost', '/?motyw=zielony'))
    await expect(html(page)).toHaveAttribute('data-theme', 'dark')
    await expect.poll(() => new URL(page.url()).search).toBe('')
  })

  test('a line link of the brand bar carries the choice in the request only', async ({ page }) => {
    // The seeded links lead to production; the request is caught and sent to the local host.
    const requests: string[] = []
    await page.route('https://prokomsoftware.pl/**', async (route) => {
      requests.push(route.request().url())
      const search = new URL(route.request().url()).search
      await route.fulfill({
        status: 302,
        headers: { location: site('software.localhost', `/${search}`) },
      })
    })
    await page.addInitScript(() => localStorage.setItem('pk-theme', 'light'))
    await page.goto(site('biznes.localhost'))
    const link = page
      .locator('[data-brand-bar]')
      .getByRole('link', { name: /Software/ })
      .first()
    await hydrated(link)
    expect(await link.getAttribute('href')).not.toContain('motyw')
    await link.click()

    await expect.poll(() => requests[0] ?? '').toContain('motyw=jasny')
    await page.waitForURL((url) => url.hostname === 'software.localhost')
    // Software is dark by default; the carried choice makes it light.
    await expect(html(page)).toHaveAttribute('data-theme', 'light')
    await expect.poll(() => new URL(page.url()).search).toBe('')
  })
})

test.describe('reduced motion (spec §1.5)', () => {
  test.use({ viewport: DESKTOP, contextOptions: { reducedMotion: 'reduce' } })

  test('the theme changes at once, without the circle', async ({ page }) => {
    await page.clock.setFixedTime(NOON)
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
    await page.goto(site('biznes.localhost'))
    const toggle = header(page).getByRole('button', { name: 'Ciemny motyw' })
    await hydrated(toggle)
    await expect(async () => {
      if ((await html(page).getAttribute('data-theme')) !== 'dark') await toggle.click()
      await expect(html(page)).toHaveAttribute('data-theme', 'dark', { timeout: 500 })
    }).toPass()
    await expect(html(page)).not.toHaveAttribute('data-theme-reveal')
  })
})

test.describe('phone 360 px', () => {
  test.use({ viewport: { width: 360, height: 780 } })

  for (const host of [
    'biznes.localhost',
    'instalacje.localhost',
    'software.localhost',
    'prokom.localhost',
  ]) {
    test(`${host}: no sideways scroll, theme in the menu sheet`, async ({ page }) => {
      await page.goto(site(host))
      await expect(header(page).locator('[data-theme-toggle]')).toBeHidden()
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true)
    })
  }
})
