import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { api, loginAsAdmin, setTheme, site } from './helpers'

// B3b, M1′: phone menu sheet, tab bar and top bar, the five-column footer and the closable seasonal bar of the
// Biznes line (spec. §3.3, §3.4, §3.6). Data from `pnpm seed`.
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

async function expectNoViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
  expect(violations.map((v) => ({ rule: v.id, targets: v.nodes.map((n) => n.target) }))).toEqual([])
}

test.describe('Biznes on a phone', () => {
  test.use({ viewport: { width: 390, height: 800 } })

  // M1′ (MOBILE-APLIKACJA §1, board `App-Menu`): the menu is a sheet from the bottom.
  test('the menu sheet works from the keyboard', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const open = page.getByRole('banner').getByRole('button', { name: 'Menu' })
    const menu = page.getByRole('dialog', { name: 'Menu' })
    // Enter works once the page is hydrated: before that the key press does nothing.
    await expect(async () => {
      await open.focus()
      await page.keyboard.press('Enter')
      await expect(menu).toBeVisible({ timeout: 1000 })
    }).toPass()

    // Departments as tiles with their counts, then the app's shortcuts.
    await expect(menu.getByRole('link', { name: /^Kasy i sprzedaż\s*\d+ pozycj/ })).toBeVisible()
    await expect(menu.getByRole('link', { name: 'Plan Twojej firmy' })).toHaveAttribute(
      'href',
      '/plan-firmy',
    )
    // Partner statuses in full wording (K4-FINAL §1), no labels of the old mega menu.
    await expect(menu.getByRole('link', { name: /^GoPOS\s*Autoryzowany partner$/ })).toBeVisible()
    await expect(menu).not.toContainText(/abonament|0 zł/i)
    // On phones the theme switch is in the menu, not in the header.
    await expect(menu.getByRole('button', { name: 'Tryb ciemny' })).toBeAttached()
    await expect(menu.getByRole('link', { name: /^Zadzwoń · / })).toHaveAttribute('href', /^tel:/)

    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await expect(open).toBeFocused()
  })

  test('the menu closes when a link is followed', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await page.getByRole('banner').getByRole('button', { name: 'Menu' }).click()
    await page
      .getByRole('dialog', { name: 'Menu' })
      .getByRole('link', { name: 'Kontakt i dojazd' })
      .click()
    await expect(page).toHaveURL(/\/kontakt$/)
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeHidden()
  })

  // The sheet's history entry is replaced by the next page: one „←” leads back.
  test('„Wstecz” after a menu link returns to the previous page at once', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/oferta'))
    await page.getByRole('banner').getByRole('button', { name: 'Menu' }).click()
    await page
      .getByRole('dialog', { name: 'Menu' })
      .getByRole('link', { name: 'Kontakt i dojazd' })
      .click()
    await expect(page).toHaveURL(/\/kontakt$/)
    await page.getByRole('banner').getByRole('link', { name: 'Wstecz' }).click()
    await expect(page).toHaveURL(/\/oferta$/)
  })

  test('the browser’s back closes the menu and stays on the page', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/oferta'))
    await page.getByRole('banner').getByRole('button', { name: 'Menu' }).click()
    const menu = page.getByRole('dialog', { name: 'Menu' })
    await expect(menu).toBeVisible()
    await page.goBack()
    await expect(menu).toBeHidden()
    await expect(page).toHaveURL(/\/oferta$/)
  })

  // M1′ (MOBILE-APLIKACJA §1): Start · Oferta · Szukaj · Zapytanie · Kontakt.
  test('the tab bar follows the address and opens the search', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const bar = page.getByRole('navigation', { name: 'Pasek aplikacji' })
    await expect(bar.getByRole('link')).toHaveText(['Start', 'Oferta', 'Zapytanie', 'Kontakt'])
    await expect(bar.getByRole('link', { name: 'Start' })).toHaveAttribute('aria-current', 'page')

    await bar.getByRole('link', { name: 'Oferta' }).click()
    await expect(page).toHaveURL(/\/oferta$/)
    await expect(bar.getByRole('link', { name: 'Oferta' })).toHaveAttribute('aria-current', 'page')
    await expect(bar.getByRole('link', { name: 'Start' })).not.toHaveAttribute('aria-current')

    await bar.getByRole('button', { name: 'Szukaj' }).click()
    await expect(page.getByRole('dialog', { name: /Szukaj/ })).toBeVisible()
  })

  test('a subpage shows „Wstecz” and its title instead of the logo', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const header = page.locator('header')
    await expect(header.getByRole('link', { name: 'Wstecz' })).toHaveCount(0)

    await page
      .getByRole('navigation', { name: 'Pasek aplikacji' })
      .getByRole('link', { name: 'Kontakt' })
      .click()
    await expect(page).toHaveURL(/\/kontakt$/)
    const back = header.getByRole('link', { name: 'Wstecz' })
    await expect(back).toBeVisible()
    const h1 = (await page.locator('main h1').first().textContent())?.trim() ?? ''
    await expect(header.getByText(h1, { exact: true })).toBeVisible()
    // After a move inside the site „Wstecz” is the browser's back.
    await back.click()
    await expect(page).toHaveURL(/biznes\.localhost:\d+\/$/)
  })

  test('a landing subpage goes one level up', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/oferta/laptopy'))
    await expect(page.locator('header').getByRole('link', { name: 'Wstecz' })).toHaveAttribute(
      'href',
      '/oferta',
    )
  })

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`axe passes with the menu open — ${colorScheme}`, async ({ page }) => {
      await setTheme(page, colorScheme)
      await page.goto(site('biznes.localhost'))
      await page.getByRole('banner').getByRole('button', { name: 'Menu' }).click()
      await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible()
      await expectNoViolations(page)
    })
  }
})

test.describe('Biznes theme (D-K4-5)', () => {
  // Keeping the choice after a reload: a11y.e2e.spec.ts („toggles, is announced and survives a reload”).
  test('starts light even when the system is dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto(site('biznes.localhost'))
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })
})

test.describe('Biznes footer', () => {
  // K4 footer (K36 §1): six columns.
  test('has the six columns and the bottom row', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const footer = page.locator('footer')
    for (const name of ['Oferta', 'Usługi', 'Systemy i tematy', 'PRO-KOM w regionie', 'Kontakt']) {
      await expect(footer.getByRole('heading', { name, exact: true })).toBeVisible()
    }
    await expect(footer.getByRole('link', { name: 'Cała oferta' })).toHaveAttribute(
      'href',
      '/oferta',
    )
    await expect(footer.getByRole('link', { name: 'Kontakt i dojazd →' })).toBeVisible()
    await expect(footer).toContainText(/NIP \d{10}/)
    // No tab bar on a desktop.
    await expect(page.getByRole('navigation', { name: 'Pasek aplikacji' })).toBeHidden()
  })

  test('has the K4 services and topics, one e-mail and only the first address', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost'))
    const footer = page.locator('footer')
    const services = footer.getByRole('navigation', { name: 'Usługi' }).getByRole('link')
    await expect(services).toHaveCount(7)
    // The seed writes card addresses by hand: each must lead to a published card or page.
    const hrefs = await services.evaluateAll((links) => links.map((a) => a.getAttribute('href')))
    for (const href of hrefs) {
      const response = await page.request.get(site('biznes.localhost', href ?? '/'))
      expect(response.status(), href ?? '').toBe(200)
    }
    await expect(
      footer.getByRole('navigation', { name: 'Systemy i tematy' }).getByRole('link').first(),
    ).toHaveText('GoPOS')
    await expect(footer).toContainText('Autoryzowany serwis Posnet i Elzab')
    // One e-mail on the whole footer: the line's inbox from its settings, not the company's.
    const mails = footer.locator('a[href^="mailto:"]')
    await expect(mails).toHaveCount(1)
    await expect(mails).toHaveAttribute('href', /^mailto:biznes@/)
    await expect(footer.locator('address')).toHaveCount(1)
  })

  test('other lines keep their own footer', async ({ page }) => {
    await page.goto(site('instalacje.localhost'))
    await expect(
      page.locator('footer').getByRole('heading', { name: 'Systemy i tematy' }),
    ).toHaveCount(0)
  })
})

test.describe('seasonal bar', () => {
  test('stays closed for its campaign and comes back with a new one', async ({ page }) => {
    await loginAsAdmin(page)
    const { json: original } = await api(page, 'GET', '/api/globals/company-data?depth=0')
    const setPromo = (campaignId: string) =>
      api(page, 'POST', '/api/globals/company-data', {
        promoBar: { text: 'Przegląd kas przed sezonem', campaignId, lines: ['biznes'] },
      })

    try {
      expect((await setPromo('e2e-a')).status).toBe(200)
      await page.goto(site('biznes.localhost'))
      const bar = page.getByRole('complementary', { name: 'Promocja' })
      await expect(bar).toBeVisible()

      await bar.getByRole('button', { name: 'Zamknij pasek promocji' }).click()
      await expect(bar).toBeHidden()
      await page.reload()
      await expect(page.getByRole('complementary', { name: 'Promocja' })).toBeHidden()

      await page.goto('/admin/login')
      expect((await setPromo('e2e-b')).status).toBe(200)
      await page.goto(site('biznes.localhost'))
      await expect(page.getByRole('complementary', { name: 'Promocja' })).toBeVisible()
    } finally {
      await page.goto('/admin/login')
      const restored = await api(page, 'POST', '/api/globals/company-data', {
        promoBar: original.promoBar ?? {},
      })
      expect(restored.status).toBe(200)
    }
  })
})

// K31b: product photos stand on the studio; a product without a photo shows its category icon —
// never an empty `<img>` (K31-ZMIANY §4.10).
test.describe('product pictures', () => {
  for (const path of [
    '/',
    '/oferta',
    '/oferta/kasy-fiskalne',
    '/produkt/posnet-ergo-online',
    // A card without a manufacturer photo (K31-ZMIANY §4.10).
    '/produkt/lenovo-thinkpad-p1-gen-9',
  ]) {
    test(`no empty or broken <img> on ${path}`, async ({ page }) => {
      await page.goto(site('biznes.localhost', path))
      await page.evaluate(async () => {
        // Lazy pictures below the fold load only when scrolled to.
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y)
          await new Promise((resolve) => setTimeout(resolve, 30))
        }
      })
      await page.waitForLoadState('networkidle')
      const broken = await page
        .locator('img')
        .evaluateAll((images) =>
          (images as HTMLImageElement[])
            .filter((img) => !img.getAttribute('src') || (img.complete && img.naturalWidth === 0))
            .map((img) => img.outerHTML.slice(0, 120)),
        )
      expect(broken).toEqual([])
    })
  }

  test('a product without a photo shows the stand-in, not an image', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/produkt/lenovo-thinkpad-p1-gen-9'))
    const note = page.getByText('Zdjęcie producenta pojawi się wkrótce.')
    await expect(note).toBeVisible()
    // The gallery stage holds the stand-in only: no <img> next to the note.
    const stage = note.locator('xpath=ancestor::div[contains(@class,"isolate")][1]')
    await expect(stage.locator('img')).toHaveCount(0)
  })
})
