import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// K31c: the showrooms of Lenovo and Dell (`/marki/lenovo|dell`) and the series filter of a
// category (`?seria=`), K31-ZMIANY §5, spec. §6.11. Catalog and showrooms from `pnpm seed`.
const biznes = (path: string) => site('biznes.localhost', path)

const segments = (page: Page) => page.getByRole('group', { name: 'Działy' })
const seriesTiles = (page: Page) => page.locator('#salon ul[aria-label^="Serie"] button')
const showroomCards = (page: Page) => page.locator('#salon [data-card]')

test.describe('Biznes showrooms (K31c)', () => {
  test('Dell: segments from the data, Akcesoria and the Dell Plus series', async ({ page }) => {
    const response = await page.goto(biznes('/marki/dell'))
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/^Dell dla firm/)
    for (const name of ['Laptopy', 'Monitory', 'Akcesoria', 'Serwery'])
      await expect(
        segments(page).getByRole('button', { name: new RegExp(`^${name}`) }),
      ).toBeVisible()

    await segments(page)
      .getByRole('button', { name: /^Monitory/ })
      .click()
    const all = await showroomCards(page).count()
    const plus = seriesTiles(page).filter({ has: page.getByText('Dell Plus', { exact: true }) })
    await plus.click()
    await expect(plus).toHaveAttribute('aria-pressed', 'true')
    await expect.poll(() => showroomCards(page).count()).toBeLessThan(all)
    // A second click clears the filter.
    await plus.click()
    await expect.poll(() => showroomCards(page).count()).toBe(all)

    await segments(page)
      .getByRole('button', { name: /^Akcesoria/ })
      .click()
    await expect(seriesTiles(page)).toHaveCount(2)
  })

  test('Lenovo: the wizard answers with a series and products', async ({ page }) => {
    await page.goto(biznes('/marki/lenovo'))
    const wizard = page.locator('#dobor')
    const result = wizard.locator('[aria-live]')
    // Start: the first answer of each question → the default rule of the panel.
    await expect(result).toContainText('ThinkPad T')
    await wizard.getByRole('button', { name: 'Grafika, CAD, zdjęcia' }).click()
    await expect(result).toContainText('ThinkPad P')
    await expect(result.getByRole('link').first()).toHaveAttribute('href', /^\/produkt\//)
    await expect(result).toContainText('To podpowiedź')
  })

  test('a brand without a showroom keeps the brand template', async ({ page }) => {
    await page.goto(biznes('/marki/elzab'))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Elzab w PRO-KOM')
    await expect(page.locator('#salon')).toHaveCount(0)
  })

  test('the film of a series plays only after a click (no YouTube before)', async ({ page }) => {
    const youtube: string[] = []
    page.on('request', (request) => {
      if (/youtube/.test(request.url())) youtube.push(request.url())
    })
    await page.goto(biznes('/marki/lenovo'))
    const play = page.locator('button[data-play]')
    await play.scrollIntoViewIfNeeded()
    expect(youtube).toEqual([])
    await play.click()
    await expect(page.locator('iframe[src*="youtube-nocookie.com/embed/"]')).toBeVisible()
  })
})

test.describe('Biznes category series filter (K31c)', () => {
  const LAPTOPS = '/oferta/laptopy'
  const grid = (page: Page) => page.locator('[data-category-grid] [data-card]')

  test('`?seria=` filters from the first render, the canonical stays without it', async ({
    page,
  }) => {
    await page.goto(biznes(`${LAPTOPS}?seria=thinkpad-p`))
    await expect(page.locator('input[name="seria"]:checked')).toHaveCount(1)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`${LAPTOPS}$`),
    )
    const filtered = await grid(page).count()
    await page
      .locator('label', { hasText: /^Wszystkie/ })
      .first()
      .click()
    await expect(page).toHaveURL(biznes(LAPTOPS))
    await expect.poll(() => grid(page).count()).toBeGreaterThan(filtered)
  })

  test('a series chip writes `?seria=`; „Nie wiesz, który?” goes to the wizard', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(biznes(LAPTOPS))
    await page.locator('label', { hasText: /^ThinkBook\s*\d+$/ }).click()
    await expect(page).toHaveURL(biznes(`${LAPTOPS}?seria=thinkbook`))
    await expect(page.getByRole('complementary', { name: 'Filtry' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Dobierz w 3 pytaniach' })).toHaveAttribute(
      'href',
      /^\/marki\/(lenovo|dell)#dobor$/,
    )
  })
})
