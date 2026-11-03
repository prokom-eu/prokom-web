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

for (const path of ['/gopos', '/insert', '/opieka-it', '/automaty-vendingowe']) {
  test(`${path}: no sideways scroll on a phone`, async ({ page }) => {
    for (const width of [360, 414]) {
      await page.setViewportSize({ width, height: 844 })
      await page.goto(biznes(path))
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow, `${path} @ ${width}`).toBeLessThanOrEqual(0)
    }
  })
}

test('Opieka IT on a phone: the comparison is one row that unfolds', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(biznes('/opieka-it'))
  const row = page.getByRole('button', { name: /z\s+opieką\s+i\s+bez/i }).first()
  await expect(row).toHaveAttribute('aria-expanded', 'false')
  const panel = page.locator(`[id="${await row.getAttribute('aria-controls')}"]`)
  await expect(panel).toBeHidden()
  await expect(async () => {
    if ((await row.getAttribute('aria-expanded')) !== 'true') await row.click()
    await expect(row).toHaveAttribute('aria-expanded', 'true', { timeout: 1000 })
  }).toPass()
  await expect(panel).toBeVisible()
  // From 768 px the section is always open and the row is not there.
  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(row).toBeHidden()
})

test('Opieka IT on a computer: the folded sections are open from the start', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(biznes('/opieka-it'))
  await expect(page.getByRole('button', { name: /z\s+opieką\s+i\s+bez/i })).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 2, name: /z\s+opieką\s+i\s+bez/i })).toBeVisible()
})

for (const path of [
  '/branze/gastronomia',
  '/aktualnosci',
  '/aktualnosci/ksef-od-1-stycznia-2027',
]) {
  test(`${path}: phone without the contact form, no sideways scroll`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(biznes(path))
    // App-Branza / App-Aktualnosci / App-Wpis end without the form (the tab bar asks).
    await expect(page.locator('#kontakt')).toBeHidden()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
    await page.setViewportSize({ width: 1440, height: 900 })
    await expect(page.locator('#kontakt')).toBeVisible()
  })
}

test('a post on a phone: the sticky „Zapytaj” leads to the inquiry page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(biznes('/aktualnosci/ksef-od-1-stycznia-2027'))
  await expect(page.getByRole('link', { name: 'Zapytaj o wdrożenie' })).toHaveAttribute(
    'href',
    '/zapytanie',
  )
})
