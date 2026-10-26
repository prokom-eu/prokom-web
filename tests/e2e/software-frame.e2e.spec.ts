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

/** Puts solutions on the list as a card's „+ Do projektu” does (`pk-project`). */
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
    // The first element of each item: the hidden mega panel sits in the „Oferta” item too.
    const items = mainNav(page).locator(':scope > ul > li > :first-child')
    await expect(items).toHaveText([
      'Oferta',
      'Kreator60 s',
      'Darmowy audyt',
      'O firmie',
      'Aktualności',
      'Kontakt',
    ])
    await expect(mainNav(page).getByRole('link', { name: /Kreator/ })).toHaveAttribute(
      'href',
      '/dobierz',
    )
    const lines = page.getByRole('navigation', { name: 'Linie PRO-KOM' })
    await expect(lines.getByRole('link')).toHaveText(['PRO-KOM Biznes', 'Instalacje'])
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
    await expect(panel.getByRole('link', { name: 'Budowlanka i ekipy' })).toBeVisible()
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
    await expect(
      panel.getByRole('link', { name: 'Wyślij do bezpłatnej wyceny →' }),
    ).toHaveAttribute('href', '/kontakt?projekt=1')

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
  test('link columns, contact and company data', async ({ page }) => {
    await page.goto(site(HOST, SUBPAGE))
    const footer = page.locator('footer')
    for (const name of ['Usługi', 'Firma', 'Kontakt']) {
      await expect(footer.getByRole('heading', { name, exact: true })).toBeVisible()
    }
    await expect(footer.getByRole('link', { name: 'Dla branż' })).toHaveAttribute(
      'href',
      '/dla-branz',
    )
    await expect(footer).toContainText('Rabka-Zdrój · Zakopane · zdalnie w całej Polsce')
    // The line's own contact from its site settings (seed), never the package (spec. §3.4).
    await expect(footer.getByRole('link', { name: 'software@example.test' })).toHaveAttribute(
      'href',
      'mailto:software@example.test',
    )
    await expect(footer.locator('a[href^="tel:"]')).toHaveCount(1)
    await expect(footer).toContainText(/NIP \d{10}/)
    await expect(footer.getByRole('link', { name: 'PRO-KOM Biznes →' })).toHaveAttribute(
      'href',
      'https://prokombiznes.pl',
    )
    await expect(
      footer.getByRole('navigation', { name: 'Informacje prawne' }).getByRole('link'),
    ).toHaveText(['Polityka prywatności', 'Mapa strony'])
  })
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
