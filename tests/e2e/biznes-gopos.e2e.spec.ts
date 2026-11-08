import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// K4h: `/gopos` of the Biznes line from K4 sections (K32 §3, plansza Web-GoPOS): hero with the
// stage of devices and the 4-step flow, „Twój lokal”, areas, GoHub, the package configurator,
// films behind a facade, FAQ. Axe at 360 px in `a11y`.

const cartButton = (page: Page) =>
  page.locator('[data-site-header]').getByRole('link', { name: /^Zapytanie/ })

test.describe('Biznes /gopos (K4h)', () => {
  test('shows the hero, the venues, the package and the FAQ', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/gopos'))

    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toContainText('GoPOS dla gastronomii')
    await expect(page.getByRole('navigation', { name: 'Okruszki' })).toHaveText(
      /Strona główna\s*\/\s*Oferta\s*\/\s*GoPOS/,
    )
    await expect(
      page.locator('section[aria-labelledby="gopos-h"]').getByText(/Autoryzowany partner GoPOS/),
    ).toBeVisible()
    await expect(page.locator('#lokal').getByRole('tab')).toHaveCount(5)
    await expect(page.locator('#pakiet')).toContainText('bez cen · wycena na piśmie')
    await expect(page.locator('#faq details')).toHaveCount(8)
    // No YouTube request before „▶” (ADR-016).
    await expect(page.locator('#film-gopos iframe')).toHaveCount(0)
  })

  test('clicking „Kuchnia” lights the KDS screen up', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/gopos'))
    const hero = page.locator('section[aria-labelledby="gopos-h"]')
    // The order plays by itself (POPRAWKI-0311 §A): the click counts its 2.6 s from zero.
    await expect(async () => {
      await hero
        .getByRole('button', { name: /Kuchnia.*Od razu na ekranie/ })
        .click({ timeout: 1000 })
      await expect(hero.getByRole('button', { name: /Kuchnia — / })).toHaveAttribute(
        'aria-pressed',
        'true',
        { timeout: 1000 },
      )
    }).toPass()
    await expect(hero.getByRole('button', { name: /Sala — / })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  test('a package of 3 modules gives 3 positions with the note', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/gopos'))
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie 0 pozycji')

    // „Food truck i sezon” starts with GoPOS + the number system; KDS makes it three.
    await page.locator('#lokal').getByRole('tab', { name: 'Food truck i sezon' }).click()
    const pack = page.locator('#pakiet')
    await pack.getByRole('button', { name: /^✓?\s*KDS/ }).click()
    await expect(
      pack.getByRole('complementary', { name: 'Twój pakiet GoPOS' }).locator('dd'),
    ).toHaveCount(3)

    await pack.getByRole('button', { name: 'Zapytaj o ten pakiet' }).click()
    await expect(cartButton(page)).toHaveAccessibleName('Zapytanie 3 pozycje')
    const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('pk-cart') ?? '[]'))
    expect(cart.map((item: { uwaga?: string }) => item.uwaga)).toEqual([
      'Pakiet GoPOS',
      'Pakiet GoPOS',
      'Pakiet GoPOS',
    ])
  })

  test('„Dodaj GoHub do pakietu” marks GoHub in the package', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/gopos'))
    // Clicks work once the page is hydrated: retried until the tab is picked.
    const tab = page.locator('#lokal').getByRole('tab', { name: 'Kawiarnia' })
    await expect(async () => {
      await tab.click({ timeout: 1000 })
      await expect(tab).toHaveAttribute('aria-selected', 'true', { timeout: 1000 })
    }).toPass()
    const hub = page.getByRole('button', { name: 'Dodaj GoHub do pakietu' })
    const added = page.getByRole('button', { name: 'GoHub jest w pakiecie ✓' })
    // Clicked only while not added yet: the button is a switch.
    await expect(async () => {
      if (await hub.isVisible()) await hub.click({ timeout: 1000 })
      await expect(added).toBeVisible({ timeout: 1000 })
    }).toPass()
    await expect(
      page.locator('#pakiet').getByRole('complementary', { name: 'Twój pakiet GoPOS' }),
    ).toContainText('GoHub')
  })

  test('no prices, leasing or instalments on the page', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/gopos'))
    const text = await page.locator('main').innerText()
    expect(text).not.toMatch(/leasing|\braty\b|\d+[,.]\d{2}\s*zł|\bAut\./i)
  })

  test('no horizontal scroll on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto(site('biznes.localhost', '/gopos'))
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test('the stage shows the GoPOS photos with the screen on (POPRAWKI-0311 §A)', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost', '/gopos'))
    const stage = page.getByRole('group', { name: 'Droga zamówienia w GoPOS' })
    const photos = stage.locator('img')
    await expect(photos).toHaveCount(4)
    for (const src of await photos.evaluateAll((els) => els.map((el) => el.getAttribute('src')))) {
      expect(src).toContain('k4-gopos-')
    }
    // The ticket never covers a device's photo (≥ 8 px).
    const gaps = await stage.evaluate((root) => {
      const t = root.querySelector('.gps-stage-ticket')!.getBoundingClientRect()
      return [...root.querySelectorAll('.gps-dev img')].map((img) => {
        const r = img.getBoundingClientRect()
        const dx = Math.max(r.left - t.right, t.left - r.right, 0)
        const dy = Math.max(r.top - t.bottom, t.top - r.bottom, 0)
        return dx === 0 && dy === 0 ? -1 : Math.hypot(dx, dy)
      })
    })
    for (const gap of gaps) expect(Math.round(gap)).toBeGreaterThanOrEqual(8)
  })

  test('the order plays by itself; „Wstrzymaj animację” stops it', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/gopos'))
    const hero = page.locator('section[aria-labelledby="gopos-h"]')
    const lit = () =>
      hero
        .getByRole('group', { name: 'Droga zamówienia w GoPOS' })
        .locator('button[aria-pressed="true"]')
    await expect(lit()).toHaveCount(1)
    const first = await lit().textContent()
    // 2.6 s per step: after ~3 s another device is lit.
    await expect(lit()).not.toHaveText(first ?? '', { timeout: 4000 })

    const pause = hero.getByRole('button', { name: 'Wstrzymaj animację' })
    await expect(async () => {
      await pause.click({ timeout: 1000 })
      await expect(hero.getByRole('button', { name: 'Wznów animację' })).toBeVisible({
        timeout: 1000,
      })
    }).toPass()
    const held = await lit().textContent()
    await page.waitForTimeout(3500)
    await expect(lit()).toHaveText(held ?? '')
  })

  test('on a phone the stage is four tiles in the order of the flow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(site('biznes.localhost', '/gopos'))
    const tiles = page.getByRole('list', { name: 'Droga zamówienia w GoPOS' }).getByRole('listitem')
    await expect(tiles).toHaveCount(4)
    expect(await tiles.locator('b').allTextContents()).toEqual(['1', '2', '3', '4'])
  })

  test('every venue tab shows its own photo, the ticket below the device (§B)', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost', '/gopos'))
    const venues = page.locator('#lokal')
    const tabs = venues.getByRole('tab')
    const photo = venues.locator('.gps-scene-img')
    const seen = new Set<string>()
    for (let i = 0; i < 5; i++) {
      await expect(async () => {
        await tabs.nth(i).click({ timeout: 1000 })
        await expect(tabs.nth(i)).toHaveAttribute('aria-selected', 'true', { timeout: 1000 })
      }).toPass()
      const src = await photo.getAttribute('src')
      expect(src).toContain('k4-gopos-')
      seen.add(src!)
      const gap = await venues.locator('.gps-scene').evaluate(async (scene) => {
        const img = scene.querySelector('.gps-scene-img')!
        // The photo slides in (`gps-in-img`, translate 10 px → 0): measure once it has landed,
        // the box of an element in flight includes its transform.
        await Promise.all(img.getAnimations().map((animation) => animation.finished))
        const image = img.getBoundingClientRect()
        const ticket = scene.querySelector('.gps-scene-ticket')!.getBoundingClientRect()
        // Rounded: the 8 px gap of the flex column lands on sub-pixels (7.998).
        return Math.round(ticket.top - image.bottom)
      })
      expect(gap).toBeGreaterThanOrEqual(8)
    }
    expect(seen.size).toBe(5)
    // The ticket moves on in the venue picked last too (1.8 s per status).
    const now = venues.locator('.gps-scene-ticket li[data-state="now"]')
    const first = await now.textContent()
    await expect(now).not.toHaveText(first ?? '', { timeout: 3000 })
  })

  test('the page belongs to the Biznes line only', async ({ page }) => {
    const response = await page.goto(site('instalacje.localhost', '/gopos'))
    expect(response?.status()).toBe(404)
  })
})
