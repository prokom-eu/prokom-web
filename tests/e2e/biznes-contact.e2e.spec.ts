import { expect, test } from '@playwright/test'

import { SERVICE_AREAS } from '../../src/seed/biznes/contact'
import { site } from './helpers'

// B8c: `/kontakt` of the Biznes line from its own blocks (spec. §6.9, plansza Kontakt): data
// card from the settings, a static area diagram with links to Google Maps (no embedded map
// before cookie consent), the quick cards, the v20 form and the FAQ; LocalBusiness in JSON-LD.
// The form itself is tested in `biznes-contact-form`; axe at 360 px in `a11y`.

test.describe('Biznes /kontakt (B8c)', () => {
  test('shows the contact data, the area, the cards, the form and the FAQ', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/kontakt'))

    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveText('Kontakt i dojazd')
    await expect(page.getByRole('navigation', { name: 'Okruszki' })).toContainText('Kontakt')

    const card = page.locator('dl')
    await expect(card.getByText('Oferty i serwis')).toBeVisible()
    await expect(card.locator('a[href^="tel:"]').first()).toBeVisible()
    // The departments' channels may add more e-mails: the „E-mail” row only.
    const emailRow = card.locator('div', { has: page.getByText('E-mail', { exact: true }) })
    await expect(emailRow.locator('a[href^="mailto:"]')).toBeVisible()
    await expect(card.getByRole('rowheader').last()).toContainText('święta')

    // A link to Google Maps, never an embedded map.
    await expect(page.getByRole('link', { name: /Otwórz w Mapach Google/ })).toHaveAttribute(
      'href',
      /^https:\/\/www\.google\.com\/maps\/search\//,
    )
    await expect(page.locator('iframe')).toHaveCount(0)
    // The towns served come from the settings (seed: the board's list), not from the diagram.
    const areas = card.locator('div', { has: page.getByText('Miejscowości obsługi') })
    await expect(areas.getByRole('listitem')).toHaveCount(SERVICE_AREAS.length)

    const cards = page.getByRole('region', { name: 'Najczęstsze sprawy' })
    await expect(cards.getByRole('heading', { level: 2 })).toHaveCount(3)
    await expect(cards).not.toContainText(/zdaln/i)

    await page.getByRole('link', { name: 'Napisz do nas' }).click()
    await expect(page).toHaveURL(/#kontakt$/)
    await expect(page.locator('#kontakt form')).toBeVisible()

    const faq = page
      .locator('section', { has: page.getByRole('heading', { name: 'Dojazd, godziny, wyceny' }) })
      .locator('details')
    await expect(faq).toHaveCount(4)
    await expect(faq.first()).toContainText('Dojeżdżacie do mnie?')
  })

  test('describes the business as LocalBusiness', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/kontakt'))
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(scripts.join('\n')).toContain('"LocalBusiness"')
  })

  test('other lines keep their own contact page', async ({ page }) => {
    await page.goto(site('instalacje.localhost', '/kontakt'))
    await expect(page.locator('#formularz')).toBeVisible()
    // The Biznes contact page title; Instalacje has its own „Kontakt i dojazd” menu item (I3).
    await expect(page.getByRole('heading', { level: 1, name: 'Kontakt i dojazd' })).toHaveCount(0)
  })
})
