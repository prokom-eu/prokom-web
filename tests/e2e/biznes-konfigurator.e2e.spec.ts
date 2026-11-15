import { expect, test, type Page } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../src/lib/inquiry/spam'
import { api, loginAsAdmin, site } from './helpers'

// K4g: Konfigurator 3.0 `/konfigurator` (K35 §1, §8; boards `Web-Kreator*`). Rules from
// `pnpm seed` (`BiznesSettings.wizard` from konfigurator-k4.json).
const KONFIGURATOR = '/konfigurator'
const RESULT = `${KONFIGURATOR}?kr=${encodeURIComponent('gastro|nowa|2||dowozy:1')}`

async function asNewVisitor(page: Page) {
  const ip = `10.${[0, 0, 0].map(() => Math.floor(Math.random() * 250)).join('.')}`
  await page.setExtraHTTPHeaders({ 'X-Real-IP': ip })
}

const need = (page: Page, title: string) =>
  page.getByRole('article').filter({ has: page.getByRole('heading', { name: title }) })

test.describe('Konfigurator 3.0 (K4g)', () => {
  test('three steps lead to the result; „Pytanie 1 z 3” and the link in the address', async ({
    page,
  }) => {
    const response = await page.goto(site('biznes.localhost', KONFIGURATOR))
    expect(response?.status()).toBe(200)
    await expect(page.getByText('Konfigurator · Pytanie 1 z 3')).toBeVisible()
    await page.getByRole('button', { name: /^Sklep/ }).click()
    await expect(page.getByRole('heading', { name: 'Co się teraz dzieje w firmie?' })).toBeVisible()
    await page.getByRole('button', { name: /^Otwieram firmę lub lokal/ }).click()
    await page.getByRole('button', { name: /1 stanowisko/ }).click()
    await expect(
      page.getByRole('heading', { name: 'Kilka szczegółów o Twoim sklepie' }),
    ).toBeVisible()
    await page.getByRole('button', { name: /^Pokaż mój zestaw/ }).click()
    await expect(page.getByRole('heading', { name: 'Twój zestaw jest gotowy' })).toBeVisible()
    await expect(page).toHaveURL(/\?kr=sklep%7Cnowa%7C1%7C%7C$/)
  })

  test('gastro|nowa|2||dowozy:1 → GoHub, GoOrder, GoPOS under „Program do sprzedaży” (K35 §8)', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost', RESULT))
    const prog = need(page, 'Program do sprzedaży i magazynu')
    await expect(prog.getByRole('link', { name: 'GoPOS GoHub' }).first()).toBeVisible()
    await expect(prog.getByRole('link', { name: 'GoPOS GoOrder' })).toBeVisible()
    // The product „GoPOS” among the options (the page link „GoPOS →” is the other one).
    await expect(prog.getByRole('link', { name: 'GoPOS', exact: true }).first()).toBeVisible()
    await expect(prog).toContainText('dowozy i zamówienia online')
  })

  test('changing an answer changes the result at once (K35 §8)', async ({ page }) => {
    await page.goto(site('biznes.localhost', RESULT))
    await page.getByRole('button', { name: 'Zmień odpowiedzi' }).click()
    const menu = page.getByRole('group', { name: /Menu na ekranie/ })
    await menu.getByRole('button', { name: 'Tak' }).click()
    await page.getByRole('button', { name: /^Pokaż mój zestaw · 6/ }).click()
    await expect(page.getByRole('heading', { name: /Ekran|ekran/ }).first()).toBeVisible()
  })

  test('„Dodaj wszystkie polecane · N” adds N items with the note (K35 §8)', async ({ page }) => {
    await page.goto(site('biznes.localhost', RESULT))
    await page.evaluate(() => localStorage.removeItem('pk-cart'))
    await page.reload()
    const add = page.getByRole('button', { name: /^\+ Dodaj wszystkie polecane · \d+$/ })
    const count = Number((await add.textContent())?.match(/· (\d+)/)?.[1])
    await add.click()
    await expect(
      page.getByRole('button', { name: '✓ Wszystkie polecane w zapytaniu' }),
    ).toBeVisible()
    const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('pk-cart') ?? '[]'))
    expect(cart).toHaveLength(count)
    expect(cart[0]).toMatchObject({ uwaga: expect.stringMatching(/^Konfigurator: /) as unknown })
  })

  test('sends the profile and the chosen items; the server names the profile', async ({ page }) => {
    await asNewVisitor(page)
    const name = `E2E konfigurator ${Date.now()}`
    await page.goto(site('biznes.localhost', RESULT))
    await page.evaluate(() => localStorage.removeItem('pk-cart'))
    await page.reload()
    await need(page, 'Dotykowy system POS').getByRole('button', { name: '+ Do zapytania' }).click()

    const form = page.locator('aside form')
    await form.getByLabel(/^Imię/).fill(name)
    await form.getByLabel(/^lub e-mail/).fill('e2e@example.test')
    await form.getByRole('checkbox').check()
    // The server refuses forms sent faster than a person can fill them (spam protection).
    await page.waitForTimeout(FORM_MIN_FILL_MS + 500)
    await form.getByRole('button', { name: 'Wyślij zapytanie' }).click()
    await expect(page.getByRole('heading', { name: 'Zapytanie wysłane' })).toBeVisible()

    await loginAsAdmin(page)
    const { json } = await api(
      page,
      'GET',
      `/api/inquiries?where[name][equals]=${encodeURIComponent(name)}&depth=0`,
    )
    const record = (json.docs as Record<string, unknown>[])[0]
    try {
      expect(record).toMatchObject({ type: 'wizard' })
      expect(record?.items).toEqual([
        expect.objectContaining({ note: 'Konfigurator: Dotykowy system POS' }),
      ])
      expect(record?.wizard).toMatchObject({
        'Rodzaj firmy': 'Gastronomia',
        Skala: '2–3 stanowiska',
      })
    } finally {
      if (record) await api(page, 'DELETE', `/api/inquiries/${record.id}`)
    }
  })

  test('/kreator answers 301 to /konfigurator with the query; Biznes only', async ({ request }) => {
    const response = await request.get(site('biznes.localhost', '/kreator?firma=gastro'), {
      maxRedirects: 0,
    })
    expect(response.status()).toBe(301)
    expect(response.headers().location).toMatch(/\/konfigurator\?firma=gastro$/)
    for (const host of ['instalacje.localhost', 'software.localhost']) {
      const other = await request.get(site(host, KONFIGURATOR), { maxRedirects: 0 })
      expect(other.status(), host).toBe(404)
    }
  })

  test('?firma= starts at the second step', async ({ page }) => {
    await page.goto(site('biznes.localhost', `${KONFIGURATOR}?firma=gastro`))
    await expect(page.getByRole('heading', { name: 'Co się teraz dzieje w firmie?' })).toBeVisible()
  })

  for (const width of [360, 390, 414]) {
    test(`no horizontal scroll at ${width} px, steps and result`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      for (const path of [KONFIGURATOR, RESULT]) {
        await page.goto(site('biznes.localhost', path))
        const scroll = await page.evaluate(() => document.documentElement.scrollWidth)
        expect(scroll, path).toBeLessThanOrEqual(width)
      }
    })
  }
})
