import { expect, test, type Page } from '@playwright/test'

import { clickUntilVisible, site } from './helpers'

// Runda 1411 R1 (docs/design/prokombiznes/runda-1411/PRZEKAZANIE-RUNDA-1411.md §1, §5): both
// numbers on the Biznes pages, no CEIDG (the line's switch), the Kontakt hero with call tiles and
// the rings map; other lines keep their CEIDG link (the switch is on by default). Data from
// `pnpm seed`.
const MAIN = 'tel:+48889003889'
const SECOND = 'tel:+48883200151'
const PAGES = ['/', '/o-firmie', '/kontakt'] as const

const sideways = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)

test.describe('Biznes runda 1411 — numbers, CEIDG, Kontakt (R1)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  for (const path of PAGES) {
    test(`${path}: both numbers as tel:, no CEIDG in the HTML`, async ({ page }) => {
      const response = await page.goto(site('biznes.localhost', path))
      expect(response?.status()).toBe(200)
      await expect(
        page.locator(`main a[href="${MAIN}"], footer a[href="${MAIN}"]`).first(),
      ).toBeAttached()
      await expect(page.locator(`a[href="${SECOND}"]`).first()).toBeAttached()
      expect((await page.content()).toLowerCase()).not.toContain('ceidg')
    })
  }

  test('the brand bar names both numbers', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/'))
    const bar = page.locator('[data-brand-bar]')
    await expect(bar.locator(`a[href="${MAIN}"]`)).toBeVisible()
    await expect(bar.locator(`a[href="${SECOND}"]`)).toBeVisible()
  })

  test('JSON-LD: the main number as telephone, the second as a ContactPoint', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/kontakt'))
    const ld = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((nodes) => nodes.map((node) => node.textContent ?? '').join('\n'))
    expect(ld).toContain('"telephone":"+48889003889"')
    expect(ld).toContain('"ContactPoint"')
    expect(ld).toContain('"telephone":"+48883200151"')
  })

  test('the rings map: every town of the zones, both numbers, no town field', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/kontakt'))
    const map = page.locator('[data-service-rings]')
    await expect(map.getByRole('heading', { level: 2 })).toBeVisible()
    await expect(map.locator('[data-ring-group]')).toHaveCount(3)
    await expect(map.locator('[data-ring-group]').first()).toContainText('Do 15 km')
    await expect(map).toContainText('Zakopane')
    await expect(map).toContainText('Kraków')
    await expect(map.locator(`a[href="${MAIN}"]`)).toHaveCount(1)
    await expect(map.locator(`a[href="${SECOND}"]`)).toHaveCount(1)
    await expect(map.getByRole('img', { name: /Schemat/ })).toBeVisible()
    await expect(page.getByLabel('Sprawdź swoją miejscowość')).toHaveCount(0)
  })

  test('„Kopiuj” copies the e-mail and says so', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto(site('biznes.localhost', '/kontakt'))
    const bar = page.locator('[data-contact-bar]')
    const copy = bar.locator('[data-copy-email]')
    await expect(copy).toHaveAccessibleName(/^Kopiuj adres kontakt@prokombiznes\.pl$/)
    await copy.click()
    await expect(copy).toContainText('Skopiowano')
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'kontakt@prokombiznes.pl',
    )
  })

  test('Instalacje keep their CEIDG link; two number tiles since 22.11 (like Biznes)', async ({
    page,
  }) => {
    await page.goto(site('instalacje.localhost', '/kontakt'))
    await expect(
      page.locator('[data-contact-page]').getByRole('link', { name: /CEIDG/ }),
    ).toHaveCount(1)
    await expect(page.locator('[data-call-tile]')).toHaveCount(2)
  })
})

for (const width of [360, 390]) {
  test.describe(`Biznes runda 1411 — phone ${width} px`, () => {
    test.use({ viewport: { width, height: 800 } })

    test('/kontakt: no sideways scroll, numbers and e-mail on one line, seven day tiles', async ({
      page,
    }) => {
      await page.goto(site('biznes.localhost', '/kontakt'))
      expect(await sideways(page)).toBe(false)
      const oneLine = async (selector: string) => {
        const lines = await page.locator(selector).evaluateAll((nodes) =>
          nodes.map((node) => {
            const range = document.createRange()
            range.selectNodeContents(node)
            return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size
          }),
        )
        expect(lines.length).toBeGreaterThan(0)
        expect(
          lines.every((count) => count === 1),
          `${selector}: ${lines}`,
        ).toBe(true)
      }
      await oneLine('[data-call-tile] b')
      await oneLine('[data-contact-bar] a[href^="mailto:"]')
      const tiles = page.locator('[data-day-tiles] li')
      await expect(tiles).toHaveCount(7)
      const tops = await tiles.evaluateAll((items) =>
        items.map((item) => Math.round(item.getBoundingClientRect().top)),
      )
      expect(new Set(tops).size).toBe(1)
    })

    test('the menu sheet offers both numbers', async ({ page }) => {
      await page.goto(site('biznes.localhost', '/'))
      const card = page.getByRole('dialog', { name: 'Menu' }).locator('[data-menu-call-card]')
      await clickUntilVisible(
        page.locator('[data-tab-bar]').getByRole('button', { name: 'Menu' }),
        card,
      )
      await expect(card.locator(`a[href="${MAIN}"]`)).toBeVisible()
      await expect(card.locator(`a[href="${SECOND}"]`)).toBeVisible()
    })
  })
}

// Runda 1411 R9 (§6 „gotowe do internetu”): the changed pages of the round — no CEIDG, no
// „na piśmie”, no „dożywotnia” in their HTML, and no sideways scroll at 360 px.
const ROUND_PAGES = [
  '/',
  '/o-firmie',
  '/kontakt',
  '/marki',
  '/produkt/m365-business-standard',
  '/produkt/przeglad-kasy-fiskalnej',
  '/produkt/posnet-ergo-online',
] as const

test.describe('Biznes runda 1411 — ready for the internet (R9)', () => {
  for (const path of ROUND_PAGES) {
    test(`${path}: no CEIDG, „na piśmie” or „dożywotnia”; no sideways scroll at 360 px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 360, height: 800 })
      const response = await page.goto(site('biznes.localhost', path))
      expect(response?.status()).toBe(200)
      const html = (await page.content()).toLowerCase()
      for (const word of ['ceidg', 'na piśmie', 'dożywot']) {
        expect(html, `${path}: ${word}`).not.toContain(word)
      }
      expect(await sideways(page), path).toBe(false)
    })
  }
})
