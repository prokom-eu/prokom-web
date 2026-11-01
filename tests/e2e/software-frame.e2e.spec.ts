import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// SW4a: frame of the Software line — top bar, header with „Oferta ▾” and „Twój projekt”,
// footer (spec. §3.0–3.4). Data from `pnpm seed` (`seed/prokomsoftware/nawigacja.json`).
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const HOST = 'software.localhost'
/** A page of the Software line other than the start page. */
const SUBPAGE = '/dziekujemy'

const mainNav = (page: Page) => page.getByRole('navigation', { name: 'Główna' })
const projectButton = (page: Page) => page.getByRole('button', { name: /^Twój projekt/ })

/** Puts solutions on the list as a card's „+ Dodaj do wyceny” does (`pk-project`). */
async function setProject(page: Page, items: { id: string; name: string }[]) {
  await page.evaluate((value) => localStorage.setItem('pk-project', value), JSON.stringify(items))
}

const TWO = [
  { id: 'strona-firmowa-z-panelem', name: 'Strona firmowa z panelem' },
  { id: 'system-zlecen-i-grafik-ekip', name: 'System zleceń i grafik ekip' },
]

test.describe('Software header', () => {
  test('menu in the order of the panel, other lines without Tech', async ({ page }) => {
    await page.goto(site(HOST, SUBPAGE))
    // „Aktualności” only with a published post — the seed has none (SWV8 P0 #3).
    // The first element of each item: the hidden mega panel sits in the „Oferta” item too.
    const items = mainNav(page).locator(':scope > ul > li > :first-child')
    await expect(items).toHaveText([
      'Oferta',
      'Kreator60 s',
      'Darmowy audyt',
      'O firmie',
      'Kontakt',
    ])
    await expect(page.locator('a[href="/aktualnosci"]')).toHaveCount(0)
    await expect(mainNav(page).getByRole('link', { name: /Kreator/ })).toHaveAttribute(
      'href',
      '/dobierz',
    )
    const lines = page.getByRole('navigation', { name: 'Linie PRO-KOM' })
    await expect(lines.getByRole('link')).toHaveText(['Wszystkie linie PRO-KOM →'])
    await expect(lines.getByRole('link')).toHaveAttribute('href', 'https://pro-kom.eu')
    await expect(page.getByRole('link', { name: 'Bezpłatna wycena' })).toHaveAttribute(
      'href',
      '/kontakt',
    )
  })

  test('on the start page Kreator and the quote lead to its sections', async ({ page }) => {
    await page.goto(site(HOST))
    await expect(mainNav(page).getByRole('link', { name: /Kreator/ })).toHaveAttribute(
      'href',
      '#dobierz',
    )
    await expect(page.getByRole('link', { name: 'Bezpłatna wycena' })).toHaveAttribute(
      'href',
      '#kontakt',
    )
  })

  test('Oferta ▾ works from the keyboard and lists the industries', async ({ page }) => {
    await page.goto(site(HOST, SUBPAGE))
    const button = mainNav(page).getByRole('button', { name: 'Oferta' })
    await expect(button).toHaveAttribute('aria-expanded', 'false')

    await button.focus()
    await page.keyboard.press('Enter')
    const panel = page.locator(`[id="${await button.getAttribute('aria-controls')}"]`)
    await expect(panel).toBeVisible()
    await expect(panel.getByRole('link', { name: 'Strona wizytówka' })).toHaveAttribute(
      'href',
      '/rozwiazania/strona-wizytowka',
    )
    // One active industry (seed): a link in the offer card, no „Dla branż” group (SWV8 P1 #11).
    await expect(
      panel.getByRole('link', { name: 'Dla branży: Budowlanka i ekipy' }),
    ).toHaveAttribute('href', '/dla-branz/budownictwo-i-wykonczenia')
    await expect(panel.getByRole('heading', { name: 'Dla branż' })).toHaveCount(0)
    await expect(panel.getByRole('link', { name: 'Zobacz pełną ofertę →' })).toHaveAttribute(
      'href',
      '/rozwiazania',
    )

    await page.keyboard.press('Tab')
    await expect(panel.locator(':focus')).toHaveCount(1)
    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
    await expect(button).toBeFocused()
  })

  test('„Twój projekt” shows only with items, removes and clears', async ({ page }) => {
    await page.goto(site(HOST, SUBPAGE))
    await expect(mainNav(page)).toBeVisible()
    await expect(projectButton(page)).toHaveCount(0)

    await setProject(page, TWO)
    await page.reload()
    const button = projectButton(page)
    await expect(button).toContainText('2')
    await button.click()
    const panel = page.locator(`[id="${await button.getAttribute('aria-controls')}"]`)
    await expect(panel.getByRole('listitem')).toHaveText([
      /^Strona firmowa z panelem/,
      /^System zleceń i grafik ekip/,
    ])
    await expect(panel.getByRole('link', { name: 'Wyślij do wyceny →' })).toHaveAttribute(
      'href',
      '/kontakt?projekt=1#formularz',
    )

    // From the keyboard focus never falls to the page: next row's „Usuń”, then the heading.
    await panel.getByRole('button', { name: 'Usuń: Strona firmowa z panelem' }).focus()
    await page.keyboard.press('Enter')
    await expect(button).toContainText('1')
    await expect(
      panel.getByRole('button', { name: 'Usuń: System zleceń i grafik ekip' }),
    ).toBeFocused()
    await panel.getByRole('button', { name: 'Wyczyść listę' }).focus()
    await page.keyboard.press('Enter')
    // The panel stays with the empty text until closed, then the button goes away.
    await expect(panel).toContainText('Na razie pusto.')
    await expect(panel.getByRole('heading', { name: 'Twój projekt' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(projectButton(page)).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Bezpłatna wycena' })).toBeFocused()
    expect(await page.evaluate(() => localStorage.getItem('pk-project'))).toBe('[]')
  })

  test('the list is shared between tabs', async ({ page, context }) => {
    await page.goto(site(HOST, SUBPAGE))
    await expect(mainNav(page)).toBeVisible()
    const other = await context.newPage()
    await other.goto(site(HOST, SUBPAGE))
    await expect(mainNav(other)).toBeVisible()

    await setProject(page, TWO.slice(0, 1))
    // The `storage` event reaches the other tab only.
    await expect(projectButton(other)).toContainText('1')
  })

  // Manrope is wider than the board's font: the full row must still fit from 1081 px up, with
  // room to spare — fonts render a few pixels wider on Linux (CI) than on Windows.
  for (const width of [1081, 1280, 1359, 1360, 1440]) {
    test(`the full header fits its container at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto(site(HOST, SUBPAGE))
      await setProject(page, TWO)
      await page.reload()
      await expect(projectButton(page)).toBeVisible()
      // Free space of the row: its inner width minus its items and the gaps between them.
      const free = await page.locator('header').evaluate((header) => {
        const row = header.firstElementChild as HTMLElement
        const style = getComputedStyle(row)
        const inner =
          row.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
        const items = [...row.children].filter((el) => getComputedStyle(el).display !== 'none')
        const used = items.reduce((sum, el) => sum + el.getBoundingClientRect().width, 0)
        return inner - used - parseFloat(style.columnGap) * (items.length - 1)
      })
      expect(free).toBeGreaterThanOrEqual(8)
      expect(await page.evaluate(() => document.scrollingElement!.scrollWidth)).toBe(width)
    })
  }

  test('other lines keep their own header', async ({ page }) => {
    await page.goto(site('instalacje.localhost'))
    await expect(page.getByRole('link', { name: /Kreator/ })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Oferta' })).toHaveCount(0)
  })
})

test.describe('Software footer', () => {
  // v21 (SWR2): dark footer with the CTA band, three columns, the PRO-KOM lines, bottom bar.
  test('CTA band, columns, contact, PRO-KOM lines and company data', async ({ page }) => {
    // The site map ends with no CTA of its own: the footer brings the band.
    await page.goto(site(HOST, '/mapa-strony'))
    const footer = page.locator('footer')
    await expect(footer).toHaveAttribute('data-surface', 'dark')
    const band = footer.locator('[data-footer-cta]')
    await expect(
      band.getByRole('heading', { name: 'Porozmawiajmy o Twojej firmie.' }),
    ).toBeVisible()
    await expect(band.getByRole('link', { name: 'Dobierz rozwiązanie · 60 s' })).toHaveAttribute(
      'href',
      '/dobierz',
    )
    await expect(band.getByRole('link', { name: 'Bezpłatna wycena' })).toHaveAttribute(
      'href',
      '/kontakt',
    )

    for (const name of ['Oferta', 'Firma', 'Kontakt']) {
      await expect(footer.getByRole('heading', { name, exact: true })).toBeVisible()
    }
    await expect(footer.getByRole('link', { name: 'Darmowy audyt 0 zł' })).toHaveAttribute(
      'href',
      '/audyt',
    )
    await expect(footer).toContainText('Kod, domena i dane należą do Ciebie')
    await expect(footer).toContainText('Podhale, Małopolska i zdalnie w całej Polsce')
    // The line's own contact from its site settings (seed), never the package (spec. §3.4).
    // SWV2: the real contact (ZMIANY-v23 §1) — two phones, the bare number gets +48.
    await expect(footer.getByRole('link', { name: 'kontakt@prokomsoftware.pl' })).toHaveAttribute(
      'href',
      'mailto:kontakt@prokomsoftware.pl',
    )
    await expect(footer.locator('a[href^="tel:"]')).toHaveCount(2)
    await expect(footer.locator('a[href="tel:+48883200151"]')).toHaveText('883 200 151')
    // Software works only in Rabka (v23): no other salon of the company under the address.
    await expect(footer).not.toContainText(/Zakopan/i)
    await expect(footer).toContainText(/NIP \d{10}/)

    // „Jedna firma, cztery linie” (SWV8: four lines + the pro-kom.eu card) replaces the v20 cross link to Biznes.
    const lines = footer.getByRole('region', { name: 'Jedna firma, cztery linie' })
    await expect(lines.getByRole('link')).toHaveCount(5)
    await expect(lines.getByRole('link', { name: /^PRO-KOM Biznes/ })).toHaveAttribute(
      'href',
      'https://prokombiznes.pl',
    )
    await expect(lines.locator('[aria-current="true"]')).toHaveAccessibleName(/^PRO-KOM Software/)
    // SWV6: the service line is „Serwis”, not „Tech”.
    await expect(lines.getByRole('link', { name: /^PRO-KOM Serwis/ })).toHaveAttribute(
      'href',
      'https://prokomserwis.pl',
    )
    await expect(lines).not.toContainText(/\bTECH\b/i)

    await expect(
      footer.getByRole('navigation', { name: 'Informacje prawne' }).getByRole('link'),
    ).toHaveText(['Polityka prywatności', 'Mapa strony'])
    await expect(footer).toContainText('Bez ciasteczek śledzących')
    expect(await page.evaluate(() => document.scrollingElement!.scrollWidth)).toBe(
      page.viewportSize()!.width,
    )
  })

  // Every page ends with one CTA (plan §3b, decyzja 6): a page with its own drops the band.
  for (const path of ['/', '/rozwiazania', '/dobierz', SUBPAGE]) {
    test(`no CTA band where the page ends with its own CTA (${path})`, async ({ page }) => {
      await page.goto(site(HOST, path))
      const footer = page.locator('footer')
      await expect(footer.getByRole('region', { name: 'Jedna firma, cztery linie' })).toBeVisible()
      await expect(footer.locator('[data-footer-cta]')).toBeHidden()
    })
  }
})

test.describe('Software frame accessibility', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`no axe violations with the open panels (${colorScheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme })
      await page.goto(site(HOST, SUBPAGE))
      await setProject(page, TWO)
      await page.reload()

      await mainNav(page).getByRole('button', { name: 'Oferta' }).click()
      const withMega = await new AxeBuilder({ page }).withTags(WCAG).analyze()
      expect(withMega.violations).toEqual([])

      await page.keyboard.press('Escape')
      await projectButton(page).click()
      const withProject = await new AxeBuilder({ page }).withTags(WCAG).analyze()
      expect(withProject.violations).toEqual([])
    })
  }
})
