import { expect, test, type Page } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../src/lib/inquiry/spam'
import { hydrated, api, loginAsAdmin, site } from './helpers'

// SW11a: `/audyt` of the Software line (spec. §6.5; board `Audyt`). Data from `pnpm seed`: the
// `swAuditForm` block and the FAQ, the audit solution with its levels. Inquiries made here are
// deleted at the end.
const HOST = 'software.localhost'
const NBSP = ' '

const newVisitor = (page: Page) =>
  page.setExtraHTTPHeaders({
    'X-Real-IP': `198.18.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`,
  })

const form = (page: Page) => page.locator('#formularz form')
const send = (page: Page) => form(page).getByRole('button', { name: 'Zamów darmowy audyt' })

test.describe('Software /audyt', () => {
  test('hero with the form, checks, audit kinds from the solution, FAQ, own CTA', async ({
    page,
  }) => {
    await page.goto(site(HOST, '/audyt'))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Sprawdzimy Twoją stronę. Za darmo.',
    )
    await expect(form(page).getByLabel('Imię')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Pięć rzeczy, które decydują, czy strona zarabia' }),
    ).toBeVisible()
    const kinds = page.locator('#rodzaje')
    await expect(kinds.getByRole('heading', { level: 3 })).toHaveCount(3)
    await expect(kinds).toContainText(`990${NBSP}zł`)
    await expect(kinds).toContainText('Polecamy')
    await expect(page.locator('#faq')).toContainText('Czy szybki audyt naprawdę jest darmowy?')
    // One CTA before the footer (AUDYT po SWA7 #6): the shared band, no band of the block's own.
    await expect(page.locator('[data-footer-cta]')).toBeVisible()
    await expect(page.locator('[data-final-cta]')).toHaveCount(0)
    // H2 with its highlighted part (AUDYT po SWA7 #5).
    await expect(page.locator('#kroki-h em')).toHaveText('darmowy audyt')
  })

  test('„Skanuj podgląd →” plays the sample card with the typed address, sends nothing', async ({
    page,
  }) => {
    await page.goto(site(HOST, '/audyt'))
    const card = page.locator('.sw-scan')
    await expect(card).toContainText('twojafirma.pl')
    // At rest the finished sample: five rows with their badges.
    await expect(card.locator('.sw-scan-mark.is-on')).toHaveCount(5)
    let posted = false
    page.on('request', (request) => {
      if (request.url().includes('/api/inquiry')) posted = true
    })
    const scan = form(page).getByRole('button', { name: /^Skanuj podgląd/ })
    await hydrated(scan)
    await form(page).getByLabel('Adres strony').fill('https://www.pensjonat-gorce.pl/oferta')
    await scan.click()
    await expect(card).toContainText('pensjonat-gorce.pl · raport')
    await expect(card).toHaveAttribute('data-scanning', 'true')
    // The badges come back one by one, then the bar stops.
    await expect(card.locator('.sw-scan-mark.is-on')).toHaveCount(5)
    await expect(card).not.toHaveAttribute('data-scanning')
    expect(posted).toBe(false)
  })

  test('with reduced motion the scan only swaps the address', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(site(HOST, '/audyt'))
    const scan = form(page).getByRole('button', { name: /^Skanuj podgląd/ })
    await hydrated(scan)
    await form(page).getByLabel('Adres strony').fill('firma.pl')
    await scan.click()
    const card = page.locator('.sw-scan')
    await expect(card).toContainText('firma.pl · raport')
    await expect(card).not.toHaveAttribute('data-scanning')
    await expect(card.locator('.sw-scan-mark.is-on')).toHaveCount(5)
  })

  test('errors under the fields and in the box; focus on the first wrong one', async ({ page }) => {
    await page.goto(site(HOST, '/audyt'))
    await send(page).click()
    await expect(form(page).getByLabel('Adres strony')).toBeFocused()
    await expect(
      form(page).getByText('Wpisz adres strony, np. twojafirma.pl.').first(),
    ).toBeVisible()

    await form(page).getByLabel('Adres strony').fill('twojafirma.pl')
    await form(page).getByLabel('Imię').fill('E2E')
    await form(page).getByLabel('E-mail albo telefon').fill('e2e-audyt@example.test')
    await send(page).click()
    await expect(form(page).getByRole('checkbox', { name: /Wyrażam zgodę/ })).toBeFocused()
    await expect(page).not.toHaveURL(/dziekujemy/)
  })

  test('sends an `audit` with the address; the server writes the message', async ({ page }) => {
    await newVisitor(page)
    const name = `E2E audyt SW11a ${Date.now()}`
    await page.goto(site(HOST, '/audyt'))
    await form(page).getByLabel('Adres strony').fill('twojafirma.pl')
    await form(page).getByLabel('Imię').fill(name)
    await form(page).getByLabel('E-mail albo telefon').fill('600 100 200')
    await form(page)
      .getByRole('checkbox', { name: /Wyrażam zgodę/ })
      .check()
    await page.waitForTimeout(FORM_MIN_FILL_MS + 500)
    await send(page).click()
    await expect(page).toHaveURL(/\/dziekujemy\?nr=PKS-\d{4}-\d{4,}$/)

    await loginAsAdmin(page)
    const { json } = await api(
      page,
      'GET',
      `/api/inquiries?where[name][equals]=${encodeURIComponent(name)}&depth=0`,
    )
    const record = (json.docs as Record<string, unknown>[])[0]
    try {
      expect(record).toMatchObject({
        line: 'software',
        type: 'audit',
        auditUrl: 'https://twojafirma.pl',
        phone: '600 100 200',
        message: 'Prośba o audyt strony: https://twojafirma.pl',
      })
    } finally {
      if (record) await api(page, 'DELETE', `/api/inquiries/${record.id}`)
    }
  })
})

test.describe('Software /audyt on a phone', () => {
  // Touch phone emulation in Chromium (`devices[...]` would switch the browser: not in a group).
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

  for (const width of [360, 390, 414]) {
    test(`fits ${width} px: no sideways scroll, the full audit first`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await page.goto(site(HOST, '/audyt'))
      const sizes = await page.evaluate(() => ({
        page: Math.max(document.scrollingElement!.scrollWidth, window.innerWidth),
        view: document.documentElement.clientWidth,
      }))
      expect(sizes.page).toBeLessThanOrEqual(sizes.view)
      const tops = await page
        .locator('#rodzaje')
        .getByRole('heading', { level: 3 })
        .evaluateAll((elements) =>
          elements.map((element) => [element.textContent, element.getBoundingClientRect().top]),
        )
      const first = [...tops].sort((a, b) => Number(a[1]) - Number(b[1]))[0]
      expect(first?.[0]).toBe('Pełny')
    })
  }
})
