import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// SW4b: phone layer of the Software line, up to 1080 px — compact header, bottom bar, menu
// sheet and „Twój projekt” pill and sheet (spec. §3.2, §8.6; stany 80–82). Data from
// `pnpm seed` (`nawigacja.json`, `obszary.json`, solutions).
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const HOST = 'software.localhost'
const SUBPAGE = '/dziekujemy'
const PHONE = { width: 390, height: 844 }

const bar = (page: Page) => page.getByRole('navigation', { name: 'Pasek nawigacji' })
const menuSheet = (page: Page) => page.getByRole('dialog', { name: 'Menu' })
const projectSheet = (page: Page) => page.getByRole('dialog', { name: 'Twój projekt' })
const pill = (page: Page) => page.getByRole('button', { name: /^Twój projekt \d/ })

async function setProject(page: Page, items: { id: string; name: string }[]) {
  await page.evaluate((value) => localStorage.setItem('pk-project', value), JSON.stringify(items))
}

const TWO = [
  { id: 'strona-firmowa-z-panelem', name: 'Strona firmowa z panelem' },
  { id: 'system-zlecen-i-grafik-ekip', name: 'System zleceń i grafik ekip' },
]

/** Wider than the window = horizontal scroll of the page (spec. §8.6). */
const pageWidth = (page: Page) => page.evaluate(() => document.scrollingElement!.scrollWidth)

test.use({ viewport: PHONE })

test.describe('Software phone header and bottom bar', () => {
  test('compact header: logo and „Wycena” only', async ({ page }) => {
    await page.goto(site(HOST, SUBPAGE))
    const header = page.locator('header')
    await expect(header.getByRole('link', { name: 'Wycena' })).toHaveAttribute('href', '/kontakt')
    await expect(page.getByRole('navigation', { name: 'Główna' })).toBeHidden()
    await expect(page.getByRole('navigation', { name: 'Linie PRO-KOM' })).toBeHidden()
    await expect(header.getByRole('button', { name: 'Tryb ciemny' })).toBeHidden()
  })

  test('five items, the active one follows the address, Kreator leads to the section', async ({
    page,
  }) => {
    await page.goto(site(HOST))
    await expect(bar(page).locator(':scope > *')).toHaveText([
      'Start',
      'Oferta',
      'Kreator',
      'Kontakt',
      'Menu',
    ])
    await expect(bar(page).getByRole('link', { name: 'Start' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(bar(page).getByRole('link', { name: 'Kreator' })).toHaveAttribute(
      'href',
      '#dobierz',
    )

    await page.goto(site(HOST, SUBPAGE))
    await expect(bar(page).locator('[aria-current="page"]')).toHaveCount(0)
    await expect(bar(page).getByRole('link', { name: 'Kreator' })).toHaveAttribute(
      'href',
      '/dobierz',
    )
  })

  test('the bar is not on the desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site(HOST, SUBPAGE))
    await expect(page.getByRole('navigation', { name: 'Główna' })).toBeVisible()
    await expect(bar(page)).toBeHidden()
  })

  test('the bar and the project pill cover nothing at the end of the page', async ({ page }) => {
    await page.goto(site(HOST, SUBPAGE))
    await setProject(page, TWO)
    await page.reload()
    await expect(pill(page)).toBeVisible()
    await page.evaluate(() => window.scrollTo(0, document.scrollingElement!.scrollHeight))
    const footerBottom = await page
      .locator('footer')
      .evaluate((footer) => footer.getBoundingClientRect().bottom)
    const pillTop = (await pill(page).boundingBox())!.y
    const barTop = await bar(page).evaluate((nav) => nav.getBoundingClientRect().top)
    expect(footerBottom).toBeLessThanOrEqual(Math.min(pillTop, barTop))
  })
})

test.describe('Software menu sheet', () => {
  test('opens from the bar, keeps focus inside, closes on Esc back to „Menu”', async ({ page }) => {
    await page.goto(site(HOST, SUBPAGE))
    const button = bar(page).getByRole('button', { name: 'Menu' })
    await button.click()
    const sheet = menuSheet(page)
    await expect(sheet).toBeVisible()
    await expect(button).toHaveAttribute('aria-expanded', 'true')

    // A native modal dialog: the page behind is inert, Tab never reaches it.
    for (let i = 0; i < 30; i++) await page.keyboard.press('Tab')
    expect(await sheet.evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true)

    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
    await expect(button).toBeFocused()
    await expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  test('a tap on the backdrop closes it', async ({ page }) => {
    await page.goto(site(HOST, SUBPAGE))
    await bar(page).getByRole('button', { name: 'Menu' }).click()
    await expect(menuSheet(page)).toBeVisible()
    // Above the sheet (at most 92% of the screen high).
    await page.mouse.click(PHONE.width / 2, 20)
    await expect(menuSheet(page)).toBeHidden()
  })

  test('offer tiles are priced from the areas, lists and contact from the panel', async ({
    page,
  }) => {
    await page.goto(site(HOST, SUBPAGE))
    await bar(page).getByRole('button', { name: 'Menu' }).click()
    const sheet = menuSheet(page)
    await expect(sheet.getByRole('link', { name: /^Strony internetowe/ })).toContainText(
      'od 999 zł',
    )
    await expect(sheet.getByRole('link', { name: /^Systemy i panele/ })).toContainText(
      'od 2 990 zł',
    )
    await expect(sheet.getByRole('link', { name: /^Aplikacje mobilne/ })).toContainText(
      'Zapytaj o wycenę',
    )
    await expect(sheet.getByRole('link', { name: /^Dobierz rozwiązanie/ })).toHaveAttribute(
      'href',
      '/dobierz',
    )
    await expect(sheet.getByRole('link', { name: /^Darmowy audyt strony/ })).toContainText('0 zł')
    await expect(sheet.getByRole('link', { name: 'Bezpłatna wycena →' })).toHaveAttribute(
      'href',
      '/kontakt',
    )
    await expect(sheet.locator('a[href^="tel:"]')).toHaveCount(1)
  })

  test('the search hints solutions and opens the catalog with the query', async ({ page }) => {
    await page.goto(site(HOST, SUBPAGE))
    await bar(page).getByRole('button', { name: 'Menu' }).click()
    const sheet = menuSheet(page)
    const field = sheet.getByRole('searchbox', { name: 'Szukaj w ofercie' })
    await field.fill('crm')
    const hints = sheet.getByRole('list', { name: 'Podpowiedzi' })
    await expect(
      hints.getByRole('link', { name: 'CRM dla małej i średniej firmy' }),
    ).toHaveAttribute('href', '/rozwiazania/crm-dla-malej-i-sredniej-firmy')
    await expect(sheet.getByRole('status')).toContainText(/podpowied/)

    await field.press('Enter')
    await expect(page).toHaveURL(/\/rozwiazania\?q=crm$/)
  })

  test('„Wygląd strony” switches the theme and remembers it', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto(site(HOST, SUBPAGE))
    await bar(page).getByRole('button', { name: 'Menu' }).click()
    const group = menuSheet(page).getByRole('group', { name: 'Wygląd strony' })
    await expect(group.getByRole('button', { name: 'Jasny' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await group.getByRole('button', { name: 'Ciemny' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(group.getByRole('button', { name: 'Ciemny' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })
})

test.describe('Software project pill and sheet', () => {
  test('only with items; the sheet removes, clears and keeps focus', async ({ page }) => {
    await page.goto(site(HOST, SUBPAGE))
    await expect(bar(page)).toBeVisible()
    await expect(pill(page)).toHaveCount(0)

    await setProject(page, TWO)
    await page.reload()
    await expect(pill(page)).toContainText('2')
    await pill(page).click()
    const sheet = projectSheet(page)
    await expect(sheet.getByRole('listitem')).toHaveText([
      /^Strona firmowa z panelem/,
      /^System zleceń i grafik ekip/,
    ])
    await expect(
      sheet.getByRole('link', { name: 'Wyślij do bezpłatnej wyceny →' }),
    ).toHaveAttribute('href', '/kontakt?projekt=1')

    await sheet.getByRole('button', { name: 'Usuń: Strona firmowa z panelem' }).focus()
    await page.keyboard.press('Enter')
    await expect(
      sheet.getByRole('button', { name: 'Usuń: System zleceń i grafik ekip' }),
    ).toBeFocused()
    await sheet.getByRole('button', { name: 'Wyczyść listę' }).focus()
    await page.keyboard.press('Enter')
    await expect(sheet).toContainText('Na razie pusto.')
    await expect(sheet.getByRole('heading', { name: 'Twój projekt' })).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
    await expect(pill(page)).toHaveCount(0)
    await expect(page.locator('header').getByRole('link', { name: 'Wycena' })).toBeFocused()
  })
})

test('closed with × when emptied, focus goes to „Wycena”', async ({ page }) => {
  await page.goto(site(HOST, SUBPAGE))
  await setProject(page, TWO.slice(0, 1))
  await page.reload()
  await pill(page).click()
  const sheet = projectSheet(page)
  await sheet.getByRole('button', { name: 'Wyczyść listę' }).click()
  await sheet.getByRole('button', { name: 'Zamknij' }).click()
  await expect(sheet).toBeHidden()
  await expect(page.locator('header').getByRole('link', { name: 'Wycena' })).toBeFocused()
})

test.describe('Software phone layout', () => {
  for (const width of [390, 360]) {
    test(`no horizontal scroll, touch targets ≥ 44 px, text ≥ 12 px at ${width} px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto(site(HOST, SUBPAGE))
      await setProject(page, TWO)
      await page.reload()
      await expect(pill(page)).toBeVisible()
      expect(await pageWidth(page)).toBe(width)

      const sizes = await bar(page)
        .locator(':scope > *')
        .evaluateAll((items) =>
          items.map((item) => {
            const box = item.getBoundingClientRect()
            return {
              w: box.width,
              h: box.height,
              font: parseFloat(getComputedStyle(item).fontSize),
            }
          }),
        )
      for (const { w, h, font } of sizes) {
        expect(Math.min(w, h)).toBeGreaterThanOrEqual(44)
        expect(font).toBeGreaterThanOrEqual(12)
      }
      const pillBox = await pill(page).boundingBox()
      expect(pillBox!.height).toBeGreaterThanOrEqual(44)
      expect(pillBox!.x).toBeGreaterThanOrEqual(0)
      expect(pillBox!.x + pillBox!.width).toBeLessThanOrEqual(width)

      await bar(page).getByRole('button', { name: 'Menu' }).click()
      const sheet = menuSheet(page)
      await expect(sheet).toBeVisible()
      const small = await sheet.locator('a, button, input').evaluateAll((elements) =>
        elements
          .map((el) => ({
            el: el.textContent?.trim() || el.getAttribute('name'),
            box: el.getBoundingClientRect(),
          }))
          .filter(({ box }) => box.height < 44 || box.right > window.innerWidth + 0.5)
          .map(({ el }) => el),
      )
      expect(small).toEqual([])
    })
  }
})

test.describe('Software phone accessibility', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`no axe violations with the open sheets (${colorScheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme })
      await page.goto(site(HOST, SUBPAGE))
      await setProject(page, TWO)
      await page.reload()
      await expect(pill(page)).toBeVisible()
      expect((await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations).toEqual([])

      await bar(page).getByRole('button', { name: 'Menu' }).click()
      await expect(menuSheet(page)).toBeVisible()
      expect((await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations).toEqual([])
      await page.keyboard.press('Escape')

      await pill(page).click()
      await expect(projectSheet(page)).toBeVisible()
      expect((await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations).toEqual([])
    })
  }
})
