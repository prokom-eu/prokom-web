import { expect, test } from '@playwright/test'

import { hydrated, site } from './helpers'

// SWA4b: `/cennik` v24 (ZMIANY-v24 §6.3). Data from `pnpm seed`: the `swPricing` block and the
// FAQ, solutions of the package (prices, levels): strony 7, przebudowa i opieka 4, systemy 13,
// automatyzacje 5.
const HOST = 'software.localhost'
const NBSP = ' '

test.describe('Software /cennik', () => {
  test('subpage hero, every solution as a price card, the groups filter, a card opens the window', async ({
    page,
  }) => {
    await page.goto(site(HOST, '/cennik'))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      // A non-breaking space after the dash (SWV9 N3).
      /^Ile to kosztuje —\sbez małego druku$/,
    )
    await expect(page.getByText(/^Wszystkie 29 rozwiązań/)).toBeVisible()

    const cards = page.locator('section[aria-labelledby="cennik-h"] a.v-card')
    await expect(cards).toHaveCount(29)
    const wizytowka = cards.filter({
      has: page.locator('.v-card-bd > b', { hasText: /^Strona wizytówka$/ }),
    })
    await expect(wizytowka).toContainText(`od${NBSP}999${NBSP}zł`)

    const groups = page.getByRole('group', { name: 'Grupy cennika' })
    await hydrated(groups.getByRole('button', { name: /^Wszystko/ }))
    await groups.getByRole('button', { name: /^Przebudowa i opieka · 4$/ }).click()
    await expect(cards).toHaveCount(4)

    await cards.first().click()
    await expect(
      page.getByRole('dialog', { name: 'Przebudowa starej strony', exact: true }),
    ).toBeVisible()
    // The window keeps no address here (the phone's „back” closes it).
    await expect(page).toHaveURL(/\/cennik$/)
  })

  test('care levels from the solution, each asking the contact form with its level', async ({
    page,
  }) => {
    await page.goto(site(HOST, '/cennik'))
    const care = page.locator('#opieka')
    // DOM order; on the phone CSS puts the recommended one first (tested below).
    await expect(care.getByRole('heading', { level: 3 })).toHaveText([
      'Podstawowa',
      'Rozszerzona',
      'Systemy',
    ])
    await expect(care).toContainText(`299${NBSP}zł`)
    await expect(care).toContainText('Polecamy')
    const ask = care.getByRole('link', { name: 'Zapytaj o opiekę Rozszerzoną →' })
    await expect(ask).toHaveAttribute('href', '/kontakt?poziom=rozszerzona')
    await ask.click()
    await expect(page).toHaveURL(/\/kontakt\?poziom=rozszerzona$/)
    // SWA5b: the shared form; the level joins the message at sending (software-contact).
    await expect(page.locator('[data-contact-page] [data-contact-form]')).toBeVisible()
  })

  test('audit kinds and the FAQ; the page ends with the footer band (no CTA of its own)', async ({
    page,
  }) => {
    await page.goto(site(HOST, '/cennik'))
    await expect(page.locator('#audyt')).toContainText(`990${NBSP}zł`)
    await expect(page.locator('#faq')).toContainText('Co oznacza cena „od”?')
    await expect(page.locator('[data-footer-cta]')).toBeVisible()
  })
})

test.describe('Software /cennik on a phone', () => {
  // Touch phone emulation in Chromium (`devices[...]` would switch the browser: not in a group).
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

  for (const width of [360, 390, 414]) {
    test(`fits ${width} px: no sideways scroll, the recommended care level first`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 })
      await page.goto(site(HOST, '/cennik'))
      const sizes = await page.evaluate(() => ({
        page: Math.max(document.scrollingElement!.scrollWidth, window.innerWidth),
        view: document.documentElement.clientWidth,
      }))
      expect(sizes.page).toBeLessThanOrEqual(sizes.view)
      const levels = page.locator('#opieka').getByRole('heading', { level: 3 })
      const tops = await levels.evaluateAll((elements) =>
        elements.map((element) => [element.textContent, element.getBoundingClientRect().top]),
      )
      const first = [...tops].sort((a, b) => Number(a[1]) - Number(b[1]))[0]
      expect(first?.[0]).toBe('Rozszerzona')
    })
  }
})
