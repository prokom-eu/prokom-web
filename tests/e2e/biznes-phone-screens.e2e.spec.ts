import { expect, test } from '@playwright/test'

import { site } from './helpers'

// Prompt 3 E5 (decyzja Krystiana 02.11 „telefon jak plansza”): below 768 px a page shows only
// the sections of its phone board App-*; the rest stays in the page and on a computer.
const biznes = (path: string) => site('biznes.localhost', path)

const PAGES = [
  { path: '/ksef', hidden: '#faq' },
  { path: '/ulga-na-kase-fiskalna', hidden: '#faq' },
  { path: '/kontakt', hidden: '#formularz' },
  { path: '/o-firmie', hidden: 'section[aria-labelledby^="lokalizacja-"]' },
] as const

for (const { path, hidden } of PAGES) {
  test(`${path}: phone without the sections the board leaves out, no sideways scroll`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(biznes(path))
    await expect(page.locator(hidden)).toHaveCount(1)
    await expect(page.locator(hidden)).toBeHidden()
    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }))
    expect(scrollWidth).toBe(innerWidth)
    // No visible link points at the hidden contact form: on a phone it leads to /zapytanie.
    const formLinks = page.locator('main a[href$="#formularz"]:visible')
    await expect(formLinks).toHaveCount(0)

    await page.setViewportSize({ width: 1440, height: 900 })
    await expect(page.locator(hidden)).toBeVisible()
  })
}

test('O firmie on a phone: „Napisz do nas” leads to the inquiry page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(biznes('/o-firmie'))
  await expect(page.getByRole('link', { name: 'Napisz do nas' })).toHaveAttribute(
    'href',
    '/zapytanie',
  )
})

test('KSeF: the button under the penalties on a phone, in the hero on a computer', async ({
  page,
}) => {
  const ask = (name: RegExp) => page.locator('main').getByRole('button', { name })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(biznes('/ksef'))
  await expect(ask(/^Przygotujcie moją firmę do KSeF$/)).toBeVisible()
  await expect(ask(/^Przygotujcie moją firmę$/)).toBeHidden()
  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(ask(/^Przygotujcie moją firmę$/)).toBeVisible()
  await expect(ask(/^Przygotujcie moją firmę do KSeF$/)).toBeHidden()
})
