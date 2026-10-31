import { devices, expect, test, type Page } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../src/lib/inquiry/spam'
import { api, loginAsAdmin, site } from './helpers'

// SW11a: `/kontakt` of the Software line (spec. §6.10, §7; board `Kontakt`, stany
// `kontakt-90…99c`). Data from `pnpm seed`: the `swContactPage` block and the FAQ, solutions
// of the package. Inquiries made here are deleted at the end.
const HOST = 'software.localhost'

// Own client address per test (benchmark range 198.18.0.0/15): the limit of 5 inquiries per
// 10 minutes keys on `X-Real-IP`, so these sends never use up the limit of other specs.
const newVisitor = (page: Page) =>
  page.setExtraHTTPHeaders({
    'X-Real-IP': `198.18.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`,
  })

const PROJECT = [
  { id: 'strona-firmowa-z-panelem', name: 'Strona firmowa z panelem' },
  { id: 'opieka-nad-strona-i-systemem', name: 'Opieka nad stroną i systemem · poziom Rozszerzona' },
]

const withProject = (page: Page, project: unknown) =>
  page.addInitScript((value) => localStorage.setItem('pk-project', value), JSON.stringify(project))

const form = (page: Page) => page.locator('#formularz')
const send = (page: Page) => form(page).getByRole('button', { name: 'Wyślij zgłoszenie' })

test.describe('Software /kontakt', () => {
  test('hero with the hours card and four channels; the lines replace the footer cards', async ({
    page,
  }) => {
    await page.goto(site(HOST, '/kontakt'))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Napisz, zadzwoń albo wpadnij. Odpowiemy z konkretem.',
    )
    await expect(page.getByText(/^Teraz (otwarte|zamknięte)$/)).toBeVisible()
    await expect(page.locator('main a[href^="tel:"]').first()).toBeVisible()
    await expect(page.locator('main a[href^="mailto:"]').first()).toBeVisible()
    // The page ends with its own form and shows the PRO-KOM lines: no footer band nor cards.
    await expect(page.locator('[data-footer-cta]')).toBeHidden()
    await expect(page.locator('[data-footer-lines]')).toBeHidden()
    await expect(page.locator('[data-lines-section] li')).toHaveCount(5)
    await expect(page.getByRole('link', { name: /Nawiguj/ })).toHaveAttribute(
      'href',
      /google\.com\/maps/,
    )
    await expect(page.locator('#faq')).toContainText('Czy rozmowa i wycena coś kosztują?')
    // v21: no topic picked at first.
    const topics = form(page).getByRole('group', { name: 'Czego dotyczy sprawa?' })
    await expect(topics.getByRole('radio', { checked: true })).toHaveCount(0)
  })

  test('errors under the fields; „E-mail” needs an e-mail address', async ({ page }) => {
    await page.goto(site(HOST, '/kontakt'))
    await send(page).click()
    await expect(form(page).getByLabel('Opisz krótko, po swojemu')).toBeFocused()

    await form(page).getByLabel('Opisz krótko, po swojemu').fill('Mamy 3 ekipy.')
    await form(page).getByLabel('Imię i firma').fill('E2E')
    await form(page).getByLabel('Telefon albo e-mail').fill('600 100')
    await expect(form(page).getByText('Numer ma za mało cyfr.')).toBeVisible()
    await form(page)
      .locator('label', { hasText: /^E-mail$/ })
      .click()
    await form(page)
      .getByRole('checkbox', { name: /Wyrażam zgodę/ })
      .check()
    await send(page).click()
    await expect(form(page).getByLabel('Telefon albo e-mail')).toBeFocused()
    await expect(page).not.toHaveURL(/dziekujemy/)
  })

  test('?poziom= from the price list picks care and writes the level', async ({ page }) => {
    await page.goto(site(HOST, '/kontakt?poziom=rozszerzona'))
    await expect(form(page).getByRole('radio', { name: 'Opieka lub ratunek' })).toBeChecked()
    await expect(form(page).getByLabel('Opisz krótko, po swojemu')).toHaveValue(
      'Interesuje mnie opieka — poziom Rozszerzona.',
    )
  })

  test('an empty ?projekt=1 points to the offer', async ({ page }) => {
    await page.goto(site(HOST, '/kontakt?projekt=1#formularz'))
    const box = form(page).getByRole('region', { name: 'Twój projekt' })
    await expect(box).toContainText('Twój projekt jest pusty.')
    await expect(box.getByRole('link', { name: 'pełnej oferty' })).toHaveAttribute(
      'href',
      '/rozwiazania',
    )
  })

  test('99b: „Twój projekt” goes with the inquiry as solutions, then the list is cleared', async ({
    page,
  }) => {
    await newVisitor(page)
    await withProject(page, PROJECT)
    const name = `E2E Twój projekt SW11a ${Date.now()}`
    await page.goto(site(HOST, '/kontakt?projekt=1#formularz'))
    const box = form(page).getByRole('region', { name: 'Twój projekt' })
    await expect(box.getByRole('listitem')).toHaveCount(2)
    await expect(box).toContainText('Razem (netto)')
    await expect(box).toContainText('299 zł/mies.')
    // The topic follows the first item; the description becomes optional.
    await expect(form(page).getByRole('radio', { name: 'Strona', exact: true })).toBeChecked()
    await expect(form(page).getByLabel('Dodaj kilka słów o firmie (opcjonalnie)')).toBeVisible()

    await form(page).getByLabel('Imię i firma').fill(name)
    await form(page).getByLabel('Telefon albo e-mail').fill('e2e-projekt@example.test')
    await form(page)
      .getByRole('checkbox', { name: /Wyrażam zgodę/ })
      .check()
    await page.waitForTimeout(FORM_MIN_FILL_MS + 500)
    await send(page).click()
    await expect(page).toHaveURL(/\/dziekujemy\?nr=PKS-\d{4}-\d{4,}$/)
    expect(await page.evaluate(() => localStorage.getItem('pk-project'))).toBe('[]')

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
        type: 'list',
        topics: ['strona'],
        preferredContact: 'phone',
        message: 'Twój projekt (Strona): Strona firmowa z panelem, Opieka nad stroną i systemem',
      })
      const items = record?.items as { nameSnapshot: string; solution: number | null }[]
      expect(items.map((item) => item.nameSnapshot)).toEqual([
        'Strona firmowa z panelem',
        'Opieka nad stroną i systemem',
      ])
      expect(items.every((item) => typeof item.solution === 'number')).toBe(true)
    } finally {
      if (record) await api(page, 'DELETE', `/api/inquiries/${record.id}`)
    }
  })
})

test.describe('Software /kontakt on a phone', () => {
  test.use({ ...devices['iPhone 13'] })

  for (const width of [360, 390, 414]) {
    test(`fits ${width} px: no sideways scroll, the form before „Co dalej”`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await withProject(page, PROJECT)
      await page.goto(site(HOST, '/kontakt?projekt=1#formularz'))
      await expect(form(page).getByRole('region', { name: 'Twój projekt' })).toBeVisible()
      const sizes = await page.evaluate(() => ({
        page: Math.max(document.scrollingElement!.scrollWidth, window.innerWidth),
        view: document.documentElement.clientWidth,
      }))
      expect(sizes.page).toBeLessThanOrEqual(sizes.view)
      const formTop = await form(page).locator('form').boundingBox()
      const nextTop = await page.locator('#co-dalej-h').boundingBox()
      expect(formTop!.y).toBeLessThan(nextTop!.y)
    })
  }

  test('touch targets of the talk ways and hints are at least 44 px high', async ({ page }) => {
    await page.goto(site(HOST, '/kontakt'))
    const heights = await form(page)
      .locator('fieldset label, button[aria-pressed]')
      .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().height))
    expect(heights.length).toBeGreaterThan(0)
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(44)
  })
})
