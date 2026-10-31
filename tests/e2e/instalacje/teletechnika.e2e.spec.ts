import { expect, type Page, test } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../../src/lib/inquiry/spam'
import { api, loginAsAdmin, site } from '../helpers'

// I8: the quote form of the Teletechnika page (`#zapytanie`, ADR-I002 §4): a contact inquiry
// „Teletechnika — przedmiar” without file upload. Data from `pnpm seed`.
const HOST = 'instalacje.localhost'

// Own client address per run: the inquiry limit keys on `X-Real-IP` (see software-home spec).
const clientIp = `198.19.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`

async function open(page: Page, path = '/teletechnika') {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  return page.goto(site(HOST, path))
}

test.describe('Instalacje Teletechnika', () => {
  test.use({ viewport: { width: 1440, height: 1000 } })

  test('the building scene follows the stages and the numbered elements', async ({ page }) => {
    await open(page)
    const hero = page.locator('.ttw')
    await hero.getByRole('button', { name: /Pomiary/ }).click()
    await expect(hero.locator('svg.ttx')).toHaveClass(/\bs4\b/)
    await expect(hero.locator('.ttnote')).toContainText('Etap: Pomiary')
    await hero.getByRole('button', { name: '3. Szafa główna' }).click()
    await expect(hero.locator('svg.ttx')).toHaveClass(/\bfocus\b/)
    await expect(hero.locator('.ttnote')).toContainText('Szafa główna')
  })

  test('the quote form asks for the missing answers, then saves an inquiry', async ({ page }) => {
    await page.setExtraHTTPHeaders({ 'X-Real-IP': clientIp })
    const name = `E2E teletechnika I8 ${Date.now()}`
    await open(page, '/teletechnika#zapytanie')
    const form = page.locator('#zapytanie')
    const send = form.getByRole('button', { name: 'Wyślij zapytanie' })
    await send.click()
    await expect(form.getByRole('alert')).toHaveText(
      'Uzupełnij: imię i nazwisko lub firmę, telefon albo e-mail, zgodę na kontakt.',
    )
    // No file field in v1: the bill of quantities goes by e-mail.
    await expect(form.locator('input[type="file"]')).toHaveCount(0)

    await form.getByRole('button', { name: 'Osiedle domów' }).click()
    await form.getByRole('button', { name: /Monitoring/ }).click()
    await form.getByLabel('Liczba lokali').fill('2a4')
    await expect(form.getByLabel('Liczba lokali')).toHaveValue('24')
    await form.getByLabel('Lokalizacja').fill('Nowy Targ')
    await form.getByLabel('Planowany termin').fill('II kwartał 2027')
    await form.getByLabel('Imię i nazwisko lub firma').fill(name)
    await form.getByLabel('E-mail').fill('biuro@example.test')
    await expect(form.locator('.zsum')).toContainText('Osiedle domów')
    await send.click()
    await expect(form.getByRole('alert')).toHaveText('Uzupełnij: zgodę na kontakt.')
    await form.locator('label.xc-chk').click()
    await expect(form.getByRole('checkbox')).toBeChecked()

    await page.waitForTimeout(FORM_MIN_FILL_MS + 500)
    await send.click()
    await expect(page.getByText('Dziękujemy. Zapytanie przyjęte.')).toBeFocused()
    await expect(page.locator('#zapytanie')).toContainText(/PKI-\d{4}-\d{4,}/)

    await loginAsAdmin(page)
    const { json } = await api(
      page,
      'GET',
      `/api/inquiries?where[name][equals]=${encodeURIComponent(name)}&depth=0`,
    )
    const record = (json.docs as Record<string, unknown>[])[0]
    try {
      expect(record).toMatchObject({
        line: 'instalacje',
        type: 'contact',
        category: 'Teletechnika — przedmiar',
        city: 'Nowy Targ',
        deadline: 'II kwartał 2027',
        email: 'biuro@example.test',
      })
      expect(record?.topics).toEqual(['Okablowanie LAN', 'Światłowód', 'Domofony', 'Monitoring'])
      expect(String(record?.message)).toContain('Inwestycja: Osiedle domów')
      expect(String(record?.message)).toContain('Liczba lokali: 24')
    } finally {
      if (record) await api(page, 'DELETE', `/api/inquiries/${record.id}`)
    }
  })
})
