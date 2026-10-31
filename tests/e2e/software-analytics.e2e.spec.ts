import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// SW12: analytics events of the Software line (spec. §8.4, ADR-020). Umami is off in CI (no
// `UMAMI_*`), so a stand-in `window.umami` records what `track()` sends. Data from `pnpm seed`.
const HOST = 'software.localhost'

type Recorded = [string, Record<string, string | number> | null]

async function recordEvents(page: Page) {
  await page.addInitScript(() => {
    const events: Recorded[] = []
    Object.assign(window, {
      __events: events,
      umami: {
        track: (name: string, data?: Record<string, string | number>) =>
          events.push([name, data ?? null]),
      },
    })
  })
}

const events = (page: Page) =>
  page.evaluate(() => (window as unknown as { __events: Recorded[] }).__events)

/** Every recorded value is an identifier or a small number — nothing a visitor typed. */
async function expectNoTypedValues(page: Page) {
  for (const [, data] of await events(page)) {
    for (const value of Object.values(data ?? {})) {
      expect(String(value)).toMatch(/^([a-zA-Z][a-zA-Z0-9_-]*|\d{1,2})$/)
    }
  }
}

test.beforeEach(async ({ page }) => {
  await recordEvents(page)
})

test.describe('Software analytics (ADR-020)', () => {
  test('without UMAMI_* no script is loaded and the proxy path answers 404', async ({
    page,
    request,
  }) => {
    await page.goto(site(HOST))
    await expect(page.locator('script[src="/_s/script.js"]')).toHaveCount(0)
    expect((await request.get(site(HOST, '/_s/script.js'))).status()).toBe(404)
    expect((await request.get(site(HOST, '/_s/api/websites'))).status()).toBe(404)
  })

  test('the offer window: opening it and adding from it', async ({ page }) => {
    await page.goto(site(HOST, '/rozwiazania?rozwiazanie=strona-firmowa-z-panelem'))
    const dialog = page.getByRole('dialog', { name: 'Strona firmowa z panelem', exact: true })
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: /Dodaj do wyceny/ }).click()
    await expect(dialog.getByRole('link', { name: 'Wyślij do wyceny' })).toBeFocused()
    const slug = { slug: 'strona-firmowa-z-panelem' }
    expect(await events(page)).toEqual(
      expect.arrayContaining([
        ['oferta_okno', slug],
        ['projekt_dodaj', slug],
        ['oferta_dodaj', slug],
      ]),
    )
  })

  test('the wizard: start, steps, „więcej”, result, add-on and field errors', async ({ page }) => {
    await page.goto(site(HOST, '/dobierz'))
    const main = page.getByRole('main')
    const button = (name: string | RegExp) => main.getByRole('button', { name })
    await main.getByRole('button', { name: /^Strona dla firmy/ }).click()
    await button('Pensjonat, hotel, apartamenty').click()
    await main.getByLabel('Rezerwacja z zaliczką online').check()
    await button('Nic, zaczynam od zera').click()
    await button('Przed sezonem zimowym').click()
    await button('Pokaż wynik →').click()
    await button(/^Opieka nad stroną/).click()
    await main.locator('form button[type="submit"]').click()
    await expect(main.getByText('Wpisz numer telefonu (9 cyfr).')).toBeVisible()

    const recorded = await events(page)
    const names = recorded.map(([name]) => name)
    expect(names.filter((name) => name === 'kreator_start')).toHaveLength(1)
    expect(recorded).toEqual(
      expect.arrayContaining([
        ['kreator_krok', { krok: 2 }],
        ['kreator_krok', { krok: 3 }],
        ['kreator_krok', { krok: 4 }],
        ['kreator_wynik', { wynik: 'pensjonat' }],
        ['formularz_blad', { formularz: 'kreator', pole: 'contact' }],
        ['formularz_blad', { formularz: 'kreator', pole: 'consent' }],
      ]),
    )
    expect(names.filter((name) => name === 'kreator_dodatek')).toHaveLength(2)
    expect(names).not.toContain('kreator_wyslij')
    await expectNoTypedValues(page)
  })

  test('the audit form names the wrong fields, not their values', async ({ page }) => {
    await page.goto(site(HOST, '/audyt'))
    const form = page.locator('form').filter({ has: page.getByLabel('Adres strony') })
    await form.getByLabel('E-mail albo telefon').fill('jan@example.test')
    await form.getByRole('button', { name: 'Zamów darmowy audyt' }).click()
    await expect(form.getByLabel('Adres strony')).toBeFocused()
    expect(await events(page)).toEqual(
      expect.arrayContaining([['formularz_blad', { formularz: 'audyt', pole: 'url' }]]),
    )
    expect(JSON.stringify(await events(page))).not.toContain('example.test')
    expect((await events(page)).map(([name]) => name)).not.toContain('audyt_wyslij')
  })
})

test.describe('Software analytics on a phone (ADR-020)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('bottom bar items and the menu sheet', async ({ page }) => {
    await page.goto(site(HOST, '/dziekujemy'))
    const bar = page.getByRole('navigation', { name: 'Pasek nawigacji' })
    await bar.getByRole('button', { name: 'Menu' }).click()
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible()
    expect(await events(page)).toEqual([
      ['pasek_klik', { pozycja: 'menu' }],
      ['menu_otworz', null],
    ])
    await page.keyboard.press('Escape')
    await bar.getByRole('link', { name: 'Oferta' }).click()
    await expect(page).toHaveURL(/\/rozwiazania/)
    expect(await events(page)).toContainEqual(['pasek_klik', { pozycja: 'oferta' }])
  })
})
