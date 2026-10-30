import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// SW9: catalog `/rozwiazania` (spec. §5, board `Katalog`, stany 88a–b, kryterium 4). Data from
// `pnpm seed` (29 solutions of `rozwiazania.json`, the removed one not imported).
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const HOST = 'software.localhost'
const PATH = '/rozwiazania'
const REMOVED = 'rezerwacje-online-na-stronie'

const cards = (page: Page) => page.locator('article')
/** The visible count (focus target of „Wyczyść filtry”); a hidden status repeats it for readers. */
const count = (page: Page) =>
  page.locator('p[tabindex="-1"]').filter({ hasText: /^\d+ rozwiąza(nie|nia|ń) / })
const tab = (page: Page, name: RegExp) =>
  page.getByRole('group', { name: 'Kategoria' }).getByRole('button', { name })
const filters = (page: Page) => page.getByRole('complementary', { name: 'Filtry' })

test.describe('Software catalog', () => {
  test('renders every published solution on the server, none removed', async ({ page }) => {
    const response = await page.goto(site(HOST, PATH))
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Wszystko, co programujemy.',
    )
    await expect(count(page)).toHaveText('29 rozwiązań w pełnej ofercie')
    await expect(cards(page)).toHaveCount(29)
    expect(await page.content()).not.toContain(REMOVED)
  })

  test('is not on the other lines', async ({ page }) => {
    for (const host of ['biznes.localhost', 'instalacje.localhost']) {
      expect((await page.goto(site(host, PATH)))?.status()).toBe(404)
    }
  })

  test('the addresses of the menu tiles and the menu search open their view', async ({ page }) => {
    await page.goto(site(HOST, `${PATH}?kategoria=systemy`))
    await expect(tab(page, /^Systemy/)).toHaveAttribute('aria-pressed', 'true')
    await expect(cards(page)).toHaveCount(10)
    await expect(cards(page).getByText('System', { exact: true })).toHaveCount(10)
    await expect(count(page)).toHaveText(/^10 rozwiązań pasuje do Twoich filtrów$/)

    // Kryterium 4: a typo still finds it.
    await page.goto(site(HOST, `${PATH}?q=exel`))
    await expect(cards(page).first().getByRole('heading')).toHaveText('Z Excela do systemu')
  })

  test('filters write the URL, counts agree with the list, a refresh keeps the view', async ({
    page,
  }) => {
    await page.goto(site(HOST, PATH))
    const option = filters(page).getByRole('button', { name: /^Zaczynam od zera/ })
    const expected = Number((await option.textContent())?.match(/(\d+)$/)?.[1])
    await option.click()
    await expect(page).toHaveURL(/\?sytuacja=od-zera$/)
    await expect(cards(page)).toHaveCount(expected)

    await filters(page)
      .getByRole('button', { name: /^Noclegi/ })
      .click()
    await expect(page).toHaveURL(/sytuacja=od-zera&branza=noclegi$/)
    // The URL changes first, the list re-renders after: wait for it before reading a count.
    await expect(filters(page).getByRole('button', { name: /^Noclegi/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    // The switch counts the solutions with a preview under the other filters: the result with it.
    const preview = filters(page).getByRole('switch', { name: /Tylko z podglądem/ })
    const shown = Number((await preview.textContent())?.match(/\((\d+)\)/)?.[1])
    await preview.click()
    await expect(page).toHaveURL(/sytuacja=od-zera&branza=noclegi&podglad=1$/)
    await expect(cards(page)).toHaveCount(shown)
    await page.reload()
    await expect(cards(page)).toHaveCount(shown)
    await expect(filters(page).getByRole('button', { name: /^Noclegi/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await page.goBack()
    await expect(page).toHaveURL(/\?sytuacja=od-zera&branza=noclegi$/)
  })

  test('typing searches after a pause and writes the query', async ({ page }) => {
    await page.goto(site(HOST, PATH))
    await page.getByRole('searchbox', { name: 'Szukaj w ofercie' }).first().fill('grafik')
    await expect(page).toHaveURL(/\?q=grafik$/)
    await expect(count(page)).toContainText('pasuje do Twoich filtrów')
  })

  test('Back after „Wyczyść filtry” brings the search back (przegląd SW9)', async ({ page }) => {
    await page.goto(site(HOST, PATH))
    await page.getByRole('searchbox', { name: 'Szukaj w ofercie' }).first().fill('crm')
    await expect(page).toHaveURL(/\?q=crm$/)
    const found = await cards(page).count()
    await page.getByRole('button', { name: 'Wyczyść filtry' }).click()
    await expect(cards(page)).toHaveCount(29)
    await page.goBack()
    await expect(page).toHaveURL(/\?q=crm$/)
    await expect(page.getByRole('searchbox', { name: 'Szukaj w ofercie' }).first()).toHaveValue(
      'crm',
    )
    await expect(cards(page)).toHaveCount(found)
    // Not undone by the box after its pause.
    await page.waitForTimeout(600)
    await expect(page).toHaveURL(/\?q=crm$/)
  })

  test('empty result: the way to the wizard and contact, „Wyczyść filtry” back to all', async ({
    page,
  }) => {
    await page.goto(site(HOST, `${PATH}?q=qqqzzzxxx`))
    await expect(page.getByRole('heading', { name: 'Nie widzisz swojej sytuacji?' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Opisz w kreatorze' })).toHaveAttribute(
      'href',
      '/dobierz?tryb=opis',
    )
    await page.getByRole('button', { name: 'Wyczyść filtry' }).click()
    await expect(page).toHaveURL(new RegExp(`${PATH}$`))
    await expect(cards(page)).toHaveCount(29)
    await expect(count(page)).toBeFocused()
  })

  // v22 (SWR1): one „od” price and term on every card — no versions; care is per month.
  test('a card expands with its one „od” price; care is priced per month', async ({ page }) => {
    await page.goto(site(HOST, PATH))
    const firmSite = cards(page).filter({ hasText: 'Strona firmowa z panelem' })
    await expect(firmSite).toContainText(/od\s2\s490\s*zł netto/)
    await expect(firmSite).toContainText('od 2 tygodni')
    const button = page.getByRole('button', { name: 'Opieka nad stroną i systemem' })
    await button.click()
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    const card = cards(page).filter({ has: button })
    await expect(card).toContainText('od 149 zł / mies.')
    await expect(card).not.toContainText('Standard')

    // One card open at a time.
    await page.getByRole('button', { name: 'Strona firmowa z panelem' }).click()
    await expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  test('„+ Do projektu” adds to the project with a toast, again removes it', async ({ page }) => {
    await page.goto(site(HOST, PATH))
    await page.getByRole('button', { name: 'CRM dla małej i średniej firmy' }).click()
    const card = cards(page).filter({ hasText: 'CRM dla małej i średniej firmy' })
    const add = card.getByRole('button', { name: '+ Do projektu' })
    await add.click()
    await expect(
      page.getByRole('status').filter({ hasText: 'Dodano do Twojego projektu' }),
    ).toBeVisible()
    await expect(card.getByRole('button', { name: '✓ W projekcie' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(page.getByRole('button', { name: /^Twój projekt/ })).toContainText('1')
    await card.getByRole('button', { name: '✓ W projekcie' }).click()
    await expect(page.getByRole('button', { name: /^Twój projekt/ })).toHaveCount(0)
  })

  test('SEO: the plain catalog is indexed with its list, filtered views are not', async ({
    page,
  }) => {
    await page.goto(site(HOST, PATH))
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/rozwiazania$/)
    const itemList = (await page.locator('script[type="application/ld+json"]').allTextContents())
      .map((text) => JSON.parse(text) as { '@type': string; numberOfItems?: number })
      .find((data) => data['@type'] === 'ItemList')
    expect(itemList?.numberOfItems).toBe(29)

    await page.goto(site(HOST, `${PATH}?kategoria=strony`))
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/rozwiazania$/)
  })

  test('the catalog is in the sitemap of Software only, the removed solution nowhere', async ({
    page,
  }) => {
    // Through the browser: Node does not resolve `*.localhost` for `request`.
    const software = await (await page.goto(site(HOST, '/sitemap.xml')))!.text()
    expect(software).toContain('/rozwiazania</loc>')
    expect(software).not.toContain(REMOVED)
    const biznes = await (await page.goto(site('biznes.localhost', '/sitemap.xml')))!.text()
    expect(biznes).not.toContain('/rozwiazania')
  })
})

test.describe('Software catalog on the phone', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('sticky search, „Filtry (n)” and the sheet with its result count', async ({ page }) => {
    await page.goto(site(HOST, PATH))
    await expect(filters(page)).toBeHidden()
    const open = page.getByRole('button', { name: /^Filtry/ })
    await open.click()
    const sheet = page.getByRole('dialog', { name: 'Filtry' })
    const chip = sheet.getByRole('button', { name: /^Mam kilka programów/ })
    // The chip's count is the result with it on.
    const shown = Number((await chip.textContent())?.match(/(\d+)$/)?.[1])
    await chip.click()
    await sheet.getByRole('button', { name: new RegExp(`^Pokaż ${shown} rozwiąza`) }).click()
    await expect(sheet).toBeHidden()
    await expect(open).toHaveText('Filtry (1)')
    await expect(cards(page)).toHaveCount(shown)

    await page.evaluate(() => window.scrollTo(0, 1500))
    await expect(page.getByRole('searchbox', { name: 'Szukaj w ofercie' }).last()).toBeInViewport()
  })

  for (const width of [390, 360]) {
    test(`no horizontal scroll at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto(site(HOST, PATH))
      expect(await page.evaluate(() => document.scrollingElement!.scrollWidth)).toBe(width)
      await page.getByRole('button', { name: /^Filtry/ }).click()
      await expect(page.getByRole('dialog', { name: 'Filtry' })).toBeVisible()
      expect(await page.evaluate(() => document.scrollingElement!.scrollWidth)).toBe(width)
    })
  }

  test('no axe violations with the filter sheet open', async ({ page }) => {
    await page.goto(site(HOST, PATH))
    await page.getByRole('button', { name: /^Filtry/ }).click()
    await expect(page.getByRole('dialog', { name: 'Filtry' })).toBeVisible()
    expect((await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations).toEqual([])
  })
})

test.describe('Software catalog accessibility', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`no axe violations with an open card (${colorScheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme })
      await page.goto(site(HOST, PATH))
      await page.getByRole('button', { name: 'Strona firmowa z panelem' }).click()
      expect((await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations).toEqual([])
    })
  }
})
