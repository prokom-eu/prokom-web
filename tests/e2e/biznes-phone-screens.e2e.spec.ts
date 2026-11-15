import { expect, test } from '@playwright/test'

import { site } from './helpers'

// Prompt 3 E5, changed by D12 (decyzja Krystiana 06.11 — odwraca „telefon jak plansza” z 02.11):
// a phone shows every section of the page, long ones in a shorter form.
const biznes = (path: string) => site('biznes.localhost', path)

const PAGES = [
  { path: '/ksef', section: '#faq' },
  { path: '/ulga-na-kase-fiskalna', section: '#faq' },
  { path: '/kontakt', section: '#formularz' },
  { path: '/o-firmie', section: '#wizyta' },
] as const

for (const { path, section } of PAGES) {
  test(`${path}: the phone shows the section a computer shows, no sideways scroll`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(biznes(path))
    await expect(page.locator(section)).toHaveCount(1)
    await expect(page.locator(section)).toBeVisible()
    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }))
    expect(scrollWidth).toBe(innerWidth)
  })
}

test('O firmie on a phone: the visit card leads to the form of Kontakt (runda 1411 R6)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(biznes('/o-firmie'))
  await expect(
    page.locator('#wizyta').getByRole('link', { name: 'Napisz do nas' }),
  ).toHaveAttribute('href', '/kontakt#formularz')
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
  test(`${path}: phone ends with the help card instead of the form, no sideways scroll`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(biznes(path))
    // D12: the long form becomes one help card with the same heading (call or describe).
    await expect(page.locator('[data-phone-help]')).toBeVisible()
    await expect(page.locator('#kontakt form')).toBeHidden()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
    await page.setViewportSize({ width: 1440, height: 900 })
    await expect(page.locator('#kontakt form')).toBeVisible()
    await expect(page.locator('[data-phone-help]')).toBeHidden()
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

for (const path of ['/zestawy', '/produkt/lenovo-thinkbook-14-g8-g9']) {
  test(`${path}: no sideways scroll on a phone`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(biznes(path))
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
}

// Audyt 15.11 P2-5: no visible text under 11 px on a 360 px phone (the audit's floor; MOBILE-APLIKACJA
// §4 asks 12). Text for screen readers only (`sr-only`, clipped) does not count. Not covered: a
// child of `sr-only` larger than 1 px (`clip` is not inherited) and SVG text scaled by its viewBox.
for (const path of ['/', '/kontakt', '/oferta', '/oferta/microsoft-365-licencje']) {
  test(`${path}: no visible text under 11 px at 360 px`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    await page.goto(biznes(path))
    const small = await page.evaluate(() =>
      [...document.querySelectorAll('body *')].flatMap((element) => {
        const style = getComputedStyle(element)
        const box = element.getBoundingClientRect()
        const ownText = [...element.childNodes].some(
          (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
        )
        const hidden =
          box.width <= 1 ||
          box.height <= 1 ||
          style.visibility === 'hidden' ||
          style.display === 'none' ||
          style.clipPath === 'inset(50%)' ||
          style.clip === 'rect(0px, 0px, 0px, 0px)' ||
          // Hidden ancestors too; unlike `offsetParent`, keeps `position: fixed` (tab bar).
          !element.checkVisibility()
        if (!ownText || hidden || parseFloat(style.fontSize) >= 11) return []
        return [`${element.textContent?.trim().slice(0, 30)} (${style.fontSize})`]
      }),
    )
    expect(small).toEqual([])
  })
}

test('home: the footer lines band hides under the page own block of the lines (P2-2)', async ({
  page,
}) => {
  await page.goto(biznes('/'))
  await expect(page.locator('[data-lines-section]')).toHaveCount(1)
  await expect(page.locator('[data-lines-band]')).toBeHidden()
})
