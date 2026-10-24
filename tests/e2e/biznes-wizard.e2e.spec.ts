import { expect, test, type Page } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../src/lib/inquiry/spam'
import { api, loginAsAdmin, site } from './helpers'

// B10c: the offer wizard `/kreator` (spec. §6.8, board `Kreator`). Rules from `pnpm seed`
// (`BiznesSettings.wizard`): gastronomy proposes the Posnet Thermal HX, GoPOS and PolCard.

const KREATOR = '/kreator'

async function asNewVisitor(page: Page) {
  const ip = `10.${[0, 0, 0].map(() => Math.floor(Math.random() * 250)).join('.')}`
  await page.setExtraHTTPHeaders({ 'X-Real-IP': ip })
}

const summary = (page: Page) => page.getByRole('complementary', { name: /Gastronomia|Zaczynamy/ })
const next = (page: Page) => page.getByRole('button', { name: /^Dalej/ })

test.describe('offer wizard /kreator (B10c)', () => {
  test('choosing the business type builds the kit live; the scale multiplies the register', async ({
    page,
  }) => {
    const response = await page.goto(site('biznes.localhost', KREATOR))
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Jaka to firma?')
    await expect(page.getByText('Wybierz branżę — zestaw zbuduje się sam.')).toBeVisible()

    await page.getByRole('button', { name: /Gastronomia/ }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Jak duża jest firma?')
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
    const kit = summary(page)
    await expect(kit.getByRole('heading', { name: 'Gastronomia' })).toBeVisible()
    await expect(kit).toContainText('Posnet Thermal HX Online')
    await expect(kit).toContainText('Wgranie menu')

    await page.getByRole('group', { name: 'Ile stanowisk sprzedaży (kas)?' }).getByText('2').click()
    await expect(kit).toContainText('2 × Posnet Thermal HX Online')

    await next(page).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Co ma działać?')
    await page.getByRole('button', { name: /Terminal płatniczy/ }).click()
    await expect(kit).not.toContainText('Terminal płatniczy PolCard')
  })

  test('?firma= from an industry page starts at the scale; an unknown one is ignored', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost', `${KREATOR}?firma=gastro`))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Jak duża jest firma?')
    await expect(summary(page).getByRole('heading', { name: 'Gastronomia' })).toBeVisible()

    await page.goto(site('biznes.localhost', `${KREATOR}?firma=kosmos`))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Jaka to firma?')
  })

  test('sends the kit: the server saves the products with quantities; the kit goes to the list', async ({
    page,
  }) => {
    await asNewVisitor(page)
    const name = `E2E kreator ${Date.now()}`
    await page.goto(site('biznes.localhost', `${KREATOR}?firma=gastro`))
    await page.getByRole('group', { name: 'Ile stanowisk sprzedaży (kas)?' }).getByText('2').click()
    await next(page).click()
    await next(page).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Na kiedy i gdzie zadzwonić?')

    // Required fields first, as on the board.
    await page.getByRole('button', { name: 'Wyślij zestaw — oddzwonimy' }).click()
    await expect(page.getByLabel(/^Imię/)).toBeFocused()

    await page.getByRole('group', { name: 'Na kiedy?' }).getByText('Przed sezonem').click()
    await page.getByLabel(/^Imię/).fill(name)
    await page.getByLabel(/^Telefon/).fill('600 100 200')
    await page.getByRole('checkbox').check()
    // The server refuses forms sent faster than a person can fill them (spam protection).
    await page.waitForTimeout(FORM_MIN_FILL_MS + 500)
    await page.getByRole('button', { name: 'Wyślij zestaw — oddzwonimy' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Zestaw wysłany. Dziękujemy!')

    await page.getByRole('button', { name: 'Dodaj zestaw do listy zapytania' }).click()
    await expect(
      page.getByRole('button', { name: 'Zestaw jest na liście zapytania' }),
    ).toBeDisabled()
    await expect(
      page.getByRole('banner').getByRole('button', { name: /^Zapytanie/ }),
    ).toHaveAccessibleName(/Zapytanie [1-9]/)

    await loginAsAdmin(page)
    const { json } = await api(
      page,
      'GET',
      `/api/inquiries?where[name][equals]=${encodeURIComponent(name)}&depth=0`,
    )
    const record = (json.docs as Record<string, unknown>[])[0]
    try {
      expect(record).toMatchObject({ type: 'wizard', deadline: 'Przed sezonem' })
      const items = record?.items as { nameSnapshot: string; quantity: number }[]
      expect(items).toContainEqual(
        expect.objectContaining({ nameSnapshot: 'Posnet Thermal HX Online', quantity: 2 }),
      )
      expect(record?.wizard).toMatchObject({ 'Rodzaj firmy': 'Gastronomia' })
    } finally {
      if (record) await api(page, 'DELETE', `/api/inquiries/${record.id}`)
    }
  })

  test('the wizard belongs to the Biznes line only', async ({ page }) => {
    for (const host of ['instalacje.localhost', 'software.localhost']) {
      const response = await page.goto(site(host, KREATOR))
      expect(response?.status(), host).toBe(404)
    }
  })

  test.describe('at 390 px', () => {
    test.use({ viewport: { width: 390, height: 844 } })

    test('the kit is under the steps and nothing scrolls sideways', async ({ page }) => {
      await page.goto(site('biznes.localhost', `${KREATOR}?firma=sklep`))
      const width = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(width).toBeLessThanOrEqual(390)
      const heading = await page.getByRole('heading', { level: 1 }).boundingBox()
      const kit = await page.getByRole('complementary', { name: /Sklep/ }).boundingBox()
      expect(kit!.y).toBeGreaterThan(heading!.y)
    })
  })
})
