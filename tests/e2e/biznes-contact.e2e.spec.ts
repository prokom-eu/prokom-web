import { expect, test } from '@playwright/test'

import { site } from './helpers'

// K4i: `/kontakt` from K4 sections (K34 §8, K4-FINAL §5, plansza Web-Kontakt): hero with the
// live status, four channels, the area map and the week of hours with today marked, „Z czym
// dzwonisz?”, the form `#formularz` with topic chips, FAQ and the other lines. The form sending
// itself is in `biznes-contact-form`.

test.describe('Biznes /kontakt (K4i)', () => {
  test('shows the hero, the channels, the week of hours, the form and the FAQ', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost', '/kontakt'))

    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toContainText('Zadzwoń, napisz')
    await expect(page.getByRole('navigation', { name: 'Okruszki' })).toContainText('Kontakt')

    await expect(page.locator('main a[href^="tel:"]').first()).toBeVisible()
    await expect(page.locator('main a[href^="mailto:biznes@"]').first()).toBeVisible()
    // Seven days, today marked in Polish time (the browser decides, the page is cached).
    const week = page.locator('main li', { hasText: /^(Poniedziałek|Niedziela)/ })
    await expect(week).toHaveCount(2)
    await expect(page.locator('main [aria-current="date"]')).toHaveCount(1)

    // Google Maps as links, never an embedded map.
    await expect(page.getByRole('link', { name: /Otwórz w Mapach Google/ })).toHaveAttribute(
      'href',
      /^https:\/\/www\.google\.com\/maps\/search\//,
    )
    await expect(page.locator('iframe')).toHaveCount(0)

    const form = page.locator('#formularz')
    await expect(form.getByRole('button', { name: 'Kasa fiskalna' })).toBeVisible()
    await form.getByRole('button', { name: 'KSeF' }).click()
    await expect(form.getByRole('button', { name: 'KSeF' })).toHaveAttribute('aria-pressed', 'true')
    await expect(form.getByRole('button', { name: /^Wyślij · 1 temat$/ })).toBeVisible()
    await expect(form.getByLabel(/^Miejscowość/)).toBeVisible()

    await expect(page.locator('#faq details')).toHaveCount(4)
    await expect(page.locator('#faq details').first()).toContainText('Dojeżdżacie do mnie?')
  })

  test('describes the business as LocalBusiness', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/kontakt'))
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(scripts.join('\n')).toContain('"LocalBusiness"')
  })

  test('no horizontal scroll on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto(site('biznes.localhost', '/kontakt'))
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test('other lines keep their own contact page', async ({ page }) => {
    await page.goto(site('instalacje.localhost', '/kontakt'))
    // Instalacje: their own contact page with the form `#napisz` (I11).
    await expect(page.locator('#napisz form')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: 'Zadzwoń, napisz' })).toHaveCount(0)
  })
})
