import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { setTheme, site } from './helpers'

// D2-1b (plan `docs/zadania/wspolne-elementy.md`, spec §5, §7, §10 pkt 3): the footer, the address
// map, the tab bar and the menu sheet on the preview page `/_wspolne` of each line, on seed data.
const HOSTS = ['biznes.localhost', 'instalacje.localhost', 'software.localhost'] as const

const preview = (page: Page) => page.locator('[data-wspolne]')
const footer = (page: Page) => preview(page).locator('[data-site-footer]')

test.describe('/_wspolne — footer (1440 px)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('the legal bar reads the same on the three domains, links in the fixed order', async ({
    page,
  }) => {
    const lines: string[] = []
    for (const host of HOSTS) {
      await page.goto(site(host, '/_wspolne'))
      const bar = footer(page).locator('[data-legal-bar]')
      lines.push((await bar.locator('[data-legal-line]').innerText()).trim())
      const hrefs = await bar
        .getByRole('navigation', { name: 'Informacje prawne' })
        .getByRole('link')
        .evaluateAll((links) => links.map((link) => link.getAttribute('href')))
      expect(hrefs).toEqual([
        '/polityka-prywatnosci',
        '/cookies',
        '/dostepnosc',
        '/mapa-strony',
        '#',
      ])
    }
    expect(new Set(lines).size).toBe(1)
    expect(lines[0]).toMatch(/^© \d{4} .+ · NIP \d{10}$/)
  })

  for (const host of HOSTS) {
    test(`${host}: lines band, contact from the data, route = mapsUrl`, async ({ page }) => {
      await page.goto(site(host, '/_wspolne'))
      // Seed: Gaming and Zakopane unpublished — 5 tiles (spec §10 pkt 3).
      const tiles = footer(page).locator('[data-line-tile]')
      await expect(tiles).toHaveCount(5)
      await expect(footer(page).locator('[data-line-tile="gaming"]')).toHaveCount(0)
      await expect(footer(page).locator('[data-lines-band] [aria-current="page"]')).toHaveCount(1)
      await expect(footer(page).getByText('Jesteś tutaj')).toHaveCount(1)

      const contact = footer(page).locator('[data-footer-contact]')
      await expect(contact.locator('a[href^="tel:"]').first()).toHaveAttribute(
        'href',
        /^tel:\+48\d{9}$/,
      )
      await expect(contact.locator('a[href^="mailto:"]')).toHaveCount(1)
      const route = contact.locator('[data-route]')
      await expect(route).toHaveAttribute('href', /^https:\/\/www\.google\.com\/maps\//)
      await expect(route).toHaveAttribute('target', '_blank')
      await expect(contact.getByRole('link', { name: /OpenStreetMap contributors/ })).toBeVisible()
    })
  }
})

test.describe('/_wspolne — phone', () => {
  test('Biznes: the second number in the contact column, a short footer (D15)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(site('biznes.localhost', '/_wspolne'))
    const contact = footer(page).locator('[data-footer-contact]')
    await expect(contact.getByRole('link', { name: /^Drugi numer: / })).toHaveAttribute(
      'href',
      /^tel:\+48\d{9}$/,
    )
    // ~2 000 px with the K4 footer, 1 606 px in the 0611 prototype; nothing hidden (D12).
    const height = await footer(page).evaluate((element) => element.getBoundingClientRect().height)
    expect(height).toBeLessThan(1300)
  })

  for (const width of [360, 390, 414]) {
    test(`no sideways scroll at ${width} px (Instalacje, the longest texts)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await page.goto(site('instalacje.localhost', '/_wspolne'))
      const sideways = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      )
      expect(sideways).toBe(false)
    })
  }

  for (const host of HOSTS) {
    test(`${host}: tab bar and the menu sheet (focus inside, Esc closes)`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto(site(host, '/_wspolne'))
      const bar = preview(page).getByRole('navigation', { name: 'Pasek aplikacji' })
      await expect(bar.locator(':scope > *')).toHaveCount(5)
      await expect(bar.getByRole('link', { name: 'Główna' })).toHaveAttribute('href', '/')
      await expect(bar.getByRole('link', { name: 'Kontakt' })).toHaveAttribute('href', '/kontakt')
      const center = bar.locator('[data-tab-center] > span').first()
      expect(Math.round((await center.boundingBox())?.height ?? 0)).toBe(52)

      // Footer columns fold into an accordion on the phone.
      await expect(footer(page).locator('details').first()).toBeAttached()

      const opener = preview(page).locator('.cap').getByRole('button', { name: 'Menu' })
      await opener.click()
      const sheet = page.getByRole('dialog', { name: 'Menu' })
      await expect(sheet).toBeVisible()
      await expect(sheet.locator('[data-menu-sheet]')).toBeVisible()
      await expect(sheet.getByRole('link', { name: 'Zadzwoń' })).toHaveAttribute(
        'href',
        /^tel:\+48/,
      )
      expect(await sheet.evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true)
      await page.keyboard.press('Escape')
      await expect(sheet).toBeHidden()
      await expect(opener).toBeFocused()
    })
  }

  test('the space under the page keeps the end of the footer clear of the tab bar', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(site('software.localhost', '/_wspolne'))
    const bar = await preview(page).locator('[data-tab-bar]').boundingBox()
    const spacer = await preview(page).locator('[data-tab-bar-spacer]').boundingBox()
    expect(Math.round(spacer?.height ?? 0)).toBeGreaterThanOrEqual(Math.round(bar?.height ?? 1))
  })

  test('the tab bar Menu opens the same sheet (keyboard)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(site('biznes.localhost', '/_wspolne'))
    // On the preview the line's own tab bar still lies over the shared one (until D3), so the
    // button is reached by keyboard rather than a click.
    const menu = preview(page)
      .getByRole('navigation', { name: 'Pasek aplikacji' })
      .getByRole('button', { name: 'Menu' })
    await menu.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible()
  })

  for (const theme of ['light', 'dark'] as const) {
    test(`axe on a phone with the menu sheet open (${theme})`, async ({ page }) => {
      await setTheme(page, theme)
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto(site('instalacje.localhost', '/_wspolne'))
      await preview(page).locator('.cap').getByRole('button', { name: 'Menu' }).click()
      await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible()
      const results = await new AxeBuilder({ page }).include('[data-wspolne]').analyze()
      expect(results.violations).toEqual([])
    })
  }
})

// AUDYT-0811 #6, #7: Software — „Regulamin” only in the legal bar (after the privacy policy),
// not in a column; the band „Zacznij od podglądu” sits across the footer's top edge.
test.describe('Software footer (1440 px)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('Regulamin in the legal bar, not in the columns; the band on the edge', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(site('software.localhost', '/cennik'))
    const foot = page.locator('[data-site-footer]')
    const legal = foot.getByRole('navigation', { name: 'Informacje prawne' }).getByRole('link')
    const hrefs = await legal.evaluateAll((links) => links.map((a) => a.getAttribute('href')))
    expect(hrefs.slice(0, 3)).toEqual(['/polityka-prywatnosci', '/regulamin', '/cookies'])
    await expect(foot.locator('[data-footer-column] a[href="/regulamin"]')).toHaveCount(0)

    const band = await page.locator('.sw-start-band').boundingBox()
    const edge = await foot.boundingBox()
    expect(band && edge).toBeTruthy()
    // The band ends where the footer starts; the lower half of its section is footer colour,
    // so on screen it sits half on the page, half on the footer.
    expect(Math.abs(band!.y + band!.height - edge!.y)).toBeLessThan(4)
    const split = await page
      .locator('.sw-start-sec > .v-wrap')
      .evaluate((wrap) => getComputedStyle(wrap, '::before').top)
    expect(Math.abs(parseFloat(split) - band!.height / 2)).toBeLessThan(4)
  })
})
