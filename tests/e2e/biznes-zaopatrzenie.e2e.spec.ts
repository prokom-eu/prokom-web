import { expect, test, type Page } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../src/lib/inquiry/spam'
import { api, hydrated, loginAsAdmin, site } from './helpers'

// B2-1c: „AGD i RTV dla firm” (ZAOPATRZENIE §3–§7) — one configurator state drives the summary,
// the offer preview, the schedule, the class cards and the form; the inquiry reaches the panel.
// Data from `pnpm seed` (package `strony-k4.json → zaopatrzenie.agd`). Records made here are
// deleted at the end.

const PAGE = '/agd-rtv-dla-firm'
const VALID_NIP = '526-000-12-46'

async function asNewVisitor(page: Page) {
  const ip = `10.${[0, 0, 0].map(() => Math.floor(Math.random() * 250)).join('.')}`
  await page.setExtraHTTPHeaders({ 'X-Real-IP': ip })
}

async function open(page: Page, query = '') {
  await asNewVisitor(page)
  await page.goto(site('biznes.localhost', `${PAGE}${query}`))
  await hydrated(page.locator('#zestaw .zp-itm').first())
}

test.describe('Biznes „Zaopatrzenie firm” AGD (B2-1c)', () => {
  test('server HTML: H1, Service and FAQPage JSON-LD, the default list without placeholders', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost', PAGE))
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const jsonLd = (
      await page.locator('script[type="application/ld+json"]').allTextContents()
    ).join()
    expect(jsonLd).toContain('"Service"')
    expect(jsonLd).toContain('"FAQPage"')
    await expect(page.locator('[data-procurement-slot]')).toHaveCount(0)
    await expect(page.locator('.zp-paper .zp-ptot')).toContainText('Razem')
  })

  test('count, items and class cards drive the summary and the offer', async ({ page }) => {
    await open(page)
    const total = page.locator('.zp-paper .zp-ptot')
    const before = Number((await total.textContent())?.match(/Razem (\d+)/)?.[1])
    // 12 flats at the start: devices per flat = total / 12.
    const perUnit = before / 12

    await page.getByRole('button', { name: 'Więcej' }).click()
    await expect(page.locator('#zestaw .zp-stepper output')).toHaveText('13')
    await expect(total).toContainText(`Razem ${before + perUnit}`)
    await expect(page.locator('.zp-sum')).toContainText('· 13 lokali')

    const firstItem = page.locator('#zestaw .zp-itm').first()
    const name = (await firstItem.locator('b').textContent()) ?? ''
    const rows = page.locator('.zp-paper .zp-prow:not(.zp-prow-h)')
    await expect(rows.filter({ hasText: name })).toHaveCount(1)
    await firstItem.click()
    await expect(firstItem).toHaveAttribute('aria-pressed', 'false')
    await expect(rows.filter({ hasText: name })).toHaveCount(0)

    // 7′: the class card is the offer variant (A/B/C).
    await page.getByRole('button', { name: 'Wybierz klasę Premium' }).click()
    await expect(page.getByRole('button', { name: 'Wybierz klasę Premium' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(
      page.getByRole('group', { name: 'Warianty oferty' }).getByRole('button', { name: /Premium/ }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  test('the home page handoff sets the configurator; „Wyślij do wyceny” fills the form', async ({
    page,
  }) => {
    await open(page, '?typ=pokoj&n=30')
    await expect(page.locator('#zestaw .zp-stepper output')).toHaveText('30')
    await expect(
      page.locator('#zestaw').getByRole('button', { name: 'Pokój w pensjonacie' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('.zp-chip[data-live]')).toContainText('30 × pokój')

    await page
      .locator('.zp-sum')
      .getByRole('link', { name: /Wyślij do wyceny/ })
      .click()
    await expect(page.locator('#f-msg')).toHaveValue(/Pokój w pensjonacie × 30 lokali/)
    await expect(page.locator('#f-cnt')).toHaveValue('30')
    await expect(page.getByRole('status').filter({ hasText: 'Lista z zestawu' })).toBeVisible()
  })

  test('an invalid NIP is explained at the field and stops the form', async ({ page }) => {
    await open(page)
    const form = page.locator('#formularz')
    await form.getByLabel('Nazwa firmy').fill('E2E Firma')
    await form.getByLabel('NIP').fill('5260001247')
    await expect(form.getByText('Sprawdź NIP — suma kontrolna się nie zgadza.')).toBeVisible()
    await form.getByLabel(/^Telefon/).fill('600 100 200')
    await form.getByLabel(/Wyrażam zgodę/).check()
    await form.getByRole('button', { name: 'Wyślij zapytanie' }).click()
    await expect(form.getByLabel('NIP')).toHaveAttribute('aria-invalid', 'true')
    await expect(form.getByLabel('NIP')).toBeFocused()
  })

  test('a valid inquiry reaches the panel and thanks the company', async ({ page }) => {
    const marker = `E2E Zaopatrzenie ${Date.now()}`
    await open(page)
    const form = page.locator('#formularz')
    await form.getByLabel('Nazwa firmy').fill(marker)
    await form.getByLabel('NIP').fill(VALID_NIP)
    await form.getByRole('button', { name: 'Deweloper' }).click()
    await form.getByLabel(/^Telefon/).fill('600 100 200')
    await form.getByLabel(/Wyrażam zgodę/).check()
    await page.waitForTimeout(FORM_MIN_FILL_MS + 500)
    await form.getByRole('button', { name: 'Wyślij zapytanie' }).click()
    await expect(form.getByRole('status')).toContainText(`Dziękujemy, ${marker}!`)

    await loginAsAdmin(page)
    const { json } = await api(
      page,
      'GET',
      `/api/inquiries?where[company][equals]=${encodeURIComponent(marker)}&depth=0`,
    )
    const [record] = json.docs as Record<string, unknown>[]
    expect(record, 'the inquiry is in the panel').toBeDefined()
    try {
      expect(record).toMatchObject({
        line: 'biznes',
        type: 'contact',
        nip: '5260001246',
        phone: '600 100 200',
      })
      expect(String(record?.message)).toContain('Deweloper')
    } finally {
      expect((await api(page, 'DELETE', `/api/inquiries/${record?.id}`)).status).toBe(200)
    }
  })

  for (const width of [360, 390, 1024, 1440]) {
    test(`no horizontal scroll at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(site('biznes.localhost', PAGE))
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      )
      expect(overflow).toBe(false)
    })
  }
})

// B2-2: „Dostawy IT dla firm” on the same template (ZAOPATRZENIE §2 IT, §5).
const IT_PAGE = '/dostawy-it-dla-firm'

test.describe('Biznes „Zaopatrzenie firm” IT (B2-2)', () => {
  test('server HTML: H1, JSON-LD and the „Przygotowanie” steps without JavaScript', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost', IT_PAGE))
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Komputery dla firm.')
    const jsonLd = (
      await page.locator('script[type="application/ld+json"]').allTextContents()
    ).join()
    expect(jsonLd).toContain('"Service"')
    expect(jsonLd).toContain('"FAQPage"')
    // §0 pkt 2: without the panel's service list the steps tied to services are not shown.
    await expect(page.locator('#prep .zp-plist li')).toHaveCount(6)
    await expect(page.locator('#prep')).not.toContainText('Etykieta inwentarzowa')
  })

  test('reduced motion: every step ticked at once, no replay', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await asNewVisitor(page)
    await page.goto(site('biznes.localhost', IT_PAGE))
    await hydrated(page.locator('#zestaw .zp-itm').first())
    await page.locator('#prep').scrollIntoViewIfNeeded()
    await expect(page.locator('#prep .zp-plist li.is-ok')).toHaveCount(6)
    await expect(page.locator('#prep .zp-pstage')).toContainText('Gotowe do pracy')
    await expect(page.getByRole('button', { name: 'Pokaż jeszcze raz' })).toHaveCount(0)
  })

  test('the home page handoff sets the IT configurator', async ({ page }) => {
    await asNewVisitor(page)
    await page.goto(site('biznes.localhost', `${IT_PAGE}?typ=ksiegowosc&n=7`))
    await hydrated(page.locator('#zestaw .zp-itm').first())
    await expect(page.locator('#zestaw .zp-stepper output')).toHaveText('7')
    await expect(
      page.locator('#zestaw').getByRole('button', { name: 'Księgowość i ERP' }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  test('each page links to the other under the form', async ({ page }) => {
    await page.goto(site('biznes.localhost', IT_PAGE))
    await expect(page.locator('.zp-cross')).toHaveAttribute('href', PAGE)
    await page.goto(site('biznes.localhost', PAGE))
    await expect(page.locator('.zp-cross')).toHaveAttribute('href', IT_PAGE)
  })

  for (const width of [360, 390, 1024, 1440]) {
    test(`IT: no horizontal scroll at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(site('biznes.localhost', IT_PAGE))
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      )
      expect(overflow).toBe(false)
    })
  }
})
