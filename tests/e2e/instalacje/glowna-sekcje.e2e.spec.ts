import { expect, type Page, test } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../../src/lib/inquiry/spam'
import { api, loginAsAdmin, site } from '../helpers'

// I6: the home sections below the hero (KOMPONENTY §3, spec §5.1/§6, MOBILE-APLIKACJA §10).
// Data from `pnpm seed`. Realizations are left out until one is published with consent.
const HOST = 'instalacje.localhost'
const SECTIONS = ['start', 'dla-kogo', 'uslugi', 'gory', 'proces', 'serwis', 'faq', 'zaplanuj']

// Own client address per run: the inquiry limit keys on `X-Real-IP` (see software-home spec).
const clientIp = `198.19.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`

async function open(page: Page, path = '/') {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  return page.goto(site(HOST, path))
}

test.describe('Instalacje home sections', () => {
  test.use({ viewport: { width: 1440, height: 1000 } })

  test('sections in the order of the design, no placeholders, structured data', async ({
    page,
  }) => {
    await open(page)
    const ids = await page.locator('main section[id]').evaluateAll((els) => els.map((e) => e.id))
    expect(ids.filter((id) => SECTIONS.includes(id))).toEqual(SECTIONS)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('.ut2')).toHaveCount(10)
    await expect(page.locator('.obc')).toHaveCount(12)
    expect(await page.locator('main').innerText()).not.toMatch(/\[[A-ZĄĆĘŁŃÓŚŹŻ ]{3,}[:\]]/)
    const types = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((els) => els.map((e) => JSON.parse(e.textContent ?? '{}')['@type']))
    expect(types).toEqual(expect.arrayContaining(['WebSite', 'FAQPage']))
  })

  test('„Pokaż na żywo” switches the hero to the card’s object', async ({ page }) => {
    await open(page)
    await page
      .locator('.obc', { hasText: 'Hotel' })
      .getByRole('link', { name: 'Pokaż na żywo' })
      .click()
    await expect(page.getByRole('tab', { name: 'Hotel' })).toHaveAttribute('aria-selected', 'true')
  })

  test('the section rail shows after scrolling, from 1400 px only', async ({ page }) => {
    await open(page)
    const rail = page.locator('nav.rail')
    await page.locator('#proces').scrollIntoViewIfNeeded()
    await expect(rail).toHaveClass(/\bon\b/)
    await expect(rail.locator('a.act')).toHaveAttribute('href', '#proces')
    await page.setViewportSize({ width: 1399, height: 900 })
    await expect(rail).toBeHidden()
  })

  test('the quick plan form asks in order, then saves an inquiry of this line', async ({
    page,
  }) => {
    await page.setExtraHTTPHeaders({ 'X-Real-IP': clientIp })
    const name = `E2E glowna I6 ${Date.now()}`
    await open(page, '/#zaplanuj')
    const form = page.locator('#zaplanuj')
    const send = form.getByRole('button', { name: 'Zamów oddzwonienie' })
    await send.click()
    await expect(form.getByRole('alert')).toHaveText('Zaznacz przynajmniej jedną instalację.')

    await form.getByRole('button', { name: /Monitoring/ }).click()
    await form.getByRole('button', { name: 'Pensjonat lub apartamenty' }).click()
    await form.getByRole('button', { name: 'Zakopane' }).click()
    await expect(form.locator('.zktl')).toContainText('Zakopane i Tatry')
    await send.click()
    await expect(form.getByRole('alert')).toHaveText(/Podaj imię/)
    await form.getByLabel('Imię').fill(name)
    await form.getByLabel('Telefon').fill('600 100 200')
    await send.click()
    await expect(form.getByRole('alert')).toHaveText('Zaznacz zgodę na kontakt.')
    // The checkbox is visually hidden; its label is what people click.
    await form.locator('label.hzkcons').click()
    await expect(form.getByRole('checkbox')).toBeChecked()

    await page.waitForTimeout(FORM_MIN_FILL_MS + 500)
    await send.click()
    await expect(form.getByRole('status')).toContainText('Dziękujemy! Oddzwonimy.')
    await expect(form.getByRole('status')).toContainText(/PKI-\d{4}-\d{4,}/)

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
        category: 'Instalacje — strona główna',
        city: 'Zakopane',
        phone: '600 100 200',
      })
      expect(record?.topics).toHaveLength(1)
      expect(String(record?.message)).toContain('Strefa dojazdu: Zakopane i Tatry')
    } finally {
      if (record) await api(page, 'DELETE', `/api/inquiries/${record.id}`)
    }
  })
})

test.describe('Instalacje home sections on a phone', () => {
  for (const width of [360, 390, 414]) {
    test(`no horizontal scroll at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await open(page)
      await page.locator('#zaplanuj').scrollIntoViewIfNeeded()
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    })
  }

  test('form buttons and fields are touch targets of at least 44 px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await open(page)
    for (const target of await page
      .locator('#zaplanuj .hzkb, #zaplanuj .hzko, #zaplanuj .hzkf, #zaplanuj .hzksend')
      .all()) {
      const box = await target.boundingBox()
      expect(box?.height ?? 0, await target.innerText()).toBeGreaterThanOrEqual(40)
    }
  })
})
