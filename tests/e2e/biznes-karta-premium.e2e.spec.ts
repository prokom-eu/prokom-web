import { expect, test } from '@playwright/test'

import { hydrated, site } from './helpers'

// PRODUKCJA-BIZNES-1211 §1 (sesja 2, karta premium): the photo enlarged from the keyboard,
// „Do tego zwykle dobierają” never shorter than 3, versions as a table with per-model values,
// the date at every source.

test.describe('Biznes — karta produktu premium', () => {
  test('enlarges the photo: arrows, counter, Esc gives the focus back', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site('biznes.localhost', '/produkt/posnet-ergo-online'))
    const open = page.locator('[data-gallery-open]').first()
    await hydrated(open)
    await open.focus()
    await page.keyboard.press('Enter')
    const zoom = page.locator('dialog[data-gallery-zoom]')
    await expect(zoom).toHaveAttribute('aria-label', /zdjęcie 1 z \d+/)
    await page.keyboard.press('ArrowRight')
    await expect(zoom).toHaveAttribute('aria-label', /zdjęcie 2 z \d+/)
    await page.keyboard.press('Escape')
    await expect(zoom).not.toHaveAttribute('open', '')
    await expect(open).toBeFocused()
  })

  test('Kyocera TASKalfa: 3+ suggestions with consumables, versions in a table', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site('biznes.localhost', '/produkt/kyocera-taskalfa-2320-2020'))
    const suggestions = page.locator('#dobierz li')
    expect(await suggestions.count()).toBeGreaterThanOrEqual(3)
    await expect(page.locator('#dobierz')).toContainText(/toner/i)
    const table = page.locator('#wersje [data-version-table]')
    await expect(table).toContainText('Prędkość druku')
    await expect(table).toContainText('20 str./min A4')
    await expect(page.locator('#zrodla li').first()).toContainText(/sprawdzono \d{2}\.\d{2}\.\d{4}/)
  })
})
