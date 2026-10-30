import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// SW9 + SWR3: catalog `/rozwiazania` with the offer window (spec. §5, §5.1, board `Katalog`,
// stany 88a–b and okno-90…99, kryterium 4). Data from
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
/** The offer window of one solution (`<dialog>` named after it). */
const windowOf = (page: Page, name: string) => page.getByRole('dialog', { name, exact: true })

test.describe('Software catalog', () => {
  test('renders every published solution on the server, none removed', async ({ page }) => {
    const response = await page.goto(site(HOST, PATH))
    expect(response?.status()).toBe(200)
    // v21: no count in the title (spec. §5); NBSP after the one-letter words.
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      /^Cała oferta, z\sceną i\sterminem\.$/,
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

  test('empty result: „Wyczyść filtry”, contact and the wizard; back to all', async ({ page }) => {
    await page.goto(site(HOST, `${PATH}?q=qqqzzzxxx`))
    await expect(
      page.getByRole('heading', { name: 'Nic nie pasuje do tych filtrów.' }),
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Napisz, czego szukasz' })).toHaveAttribute(
      'href',
      '/kontakt',
    )
    await expect(page.getByRole('link', { name: 'Opisz w kreatorze' })).toHaveAttribute(
      'href',
      '/dobierz?tryb=opis',
    )
    await page.getByRole('button', { name: 'Wyczyść filtry' }).first().click()
    await expect(page).toHaveURL(new RegExp(`${PATH}$`))
    await expect(cards(page)).toHaveCount(29)
    await expect(count(page)).toBeFocused()
  })

  // v22 (SWR1, SWR3): one „od” price and term on the card, no versions and no expanding part.
  test('cards show the thumbnail, the one „od” price and term; care per month', async ({
    page,
  }) => {
    await page.goto(site(HOST, PATH))
    const firmSite = cards(page).filter({ hasText: 'Strona firmowa z panelem' })
    await expect(firmSite).toContainText(/od\s2\s490\s*zł netto/)
    await expect(firmSite).toContainText('termin od 2 tygodni')
    await expect(firmSite.locator('img')).toHaveAttribute(
      'src',
      '/software/rozwiazania/strona-firmowa-z-panelem.svg',
    )
    await expect(cards(page).filter({ hasText: 'Opieka nad stroną' })).toContainText(
      'od 149 zł / mies.',
    )
    await expect(page.locator('article [aria-expanded]')).toHaveCount(0)
  })
})

test.describe('Software offer window (spec. §5.1)', () => {
  // The whole card opens it (stretched button), also while the press state is on (SWR2).
  test('a press anywhere on the card opens the window and writes ?rozwiazanie=', async ({
    page,
  }) => {
    await page.goto(site(HOST, PATH))
    const card = cards(page).filter({ hasText: 'Landing page' })
    const box = (await card.boundingBox())!
    await card.click({ position: { x: box.width - 12, y: box.height - 12 } })
    await expect(windowOf(page, 'Landing page')).toBeVisible()
    await expect(page).toHaveURL(/\?rozwiazanie=landing-page$/)
  })

  test('„W cenie”, guarantees, steps and questions; Esc closes, focus back on the card', async ({
    page,
  }) => {
    await page.goto(site(HOST, PATH))
    const opener = page.getByRole('button', { name: /^Strona firmowa z panelem/ })
    await opener.click()
    const dialog = windowOf(page, 'Strona firmowa z panelem')
    await expect(dialog.getByRole('heading', { level: 2 })).toHaveText('Strona firmowa z panelem')
    await expect(dialog).toContainText('1 / 29')
    await expect(dialog).toContainText('Do 5 podstron: oferta, realizacje, opinie, kontakt')
    await expect(dialog).toContainText(/Potrzebujesz więcej\? Np\. więcej niż 5 podstron/)
    await expect(dialog).toContainText('Wycena na piśmie, ważna 30 dni')
    await expect(dialog).toContainText('30% zaliczki, reszta po odbiorze')
    await expect(dialog.getByRole('heading', { name: 'Jak to wygląda' })).toBeVisible()
    await expect(dialog).toContainText(/Co jest w cenie od 2\s490 zł\?/)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(page).toHaveURL(new RegExp(`${PATH}$`))
    await expect(opener).toBeFocused()
  })

  test('←/→ walk the list with the counter; Back closes the window', async ({ page }) => {
    await page.goto(site(HOST, `${PATH}?kategoria=strony`))
    await page.getByRole('button', { name: /^Strona firmowa z panelem/ }).click()
    const dialog = page.locator('dialog[open]')
    await expect(dialog).toContainText('1 / 8')
    await page.keyboard.press('ArrowRight')
    await expect(page).toHaveURL(/rozwiazanie=strona-dla-hotelu-lub-pensjonatu/)
    await expect(dialog).toContainText('2 / 8')
    await page.keyboard.press('ArrowLeft')
    await expect(dialog).toContainText('1 / 8')
    await page.keyboard.press('ArrowLeft')
    await expect(dialog).toContainText('8 / 8')
    // Switching replaces the entry: one Back closes the window, the filter stays.
    await page.goBack()
    await expect(page.locator('dialog[open]')).toHaveCount(0)
    await expect(page).toHaveURL(/\?kategoria=strony$/)
  })

  test('a shared link opens the window; an unknown slug opens nothing', async ({ page }) => {
    await page.goto(site(HOST, `${PATH}?rozwiazanie=aplikacja-dla-ekip-w-terenie`))
    const dialog = windowOf(page, 'Aplikacja dla ekip w terenie')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Zapytaj o wycenę')
    await expect(dialog).toContainText('Cena i termin')
    await dialog.getByRole('button', { name: 'Zamknij' }).click()
    await expect(page).toHaveURL(new RegExp(`${PATH}$`))

    await page.goto(site(HOST, `${PATH}?rozwiazanie=nie-ma-takiego`))
    await expect(cards(page)).toHaveCount(29)
    await expect(page.locator('dialog[open]')).toHaveCount(0)
  })

  test('care: Rozszerzona chosen, a table column picks the level, the project keeps it', async ({
    page,
  }) => {
    await page.goto(site(HOST, `${PATH}?rozwiazanie=opieka-nad-strona-i-systemem`))
    const dialog = windowOf(page, 'Opieka nad stroną i systemem')
    const levels = dialog.getByRole('group', { name: 'Wybierz poziom opieki' })
    await expect(levels.getByRole('button', { name: /Rozszerzona/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(dialog).toContainText('Opieka · poziom Rozszerzona')
    await dialog
      .getByRole('table')
      .getByRole('button', { name: /^Systemy/ })
      .click()
    await expect(levels.getByRole('button', { name: /^Systemy/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(dialog).toContainText('790 zł / mies.')
    await dialog
      .getByRole('button', {
        name: 'Dodaj do wyceny: Opieka nad stroną i systemem · poziom Systemy',
      })
      .click()
    const send = dialog.getByRole('link', { name: 'Wyślij do wyceny' })
    await expect(send).toBeFocused()
    await expect(send).toHaveAttribute('href', '/kontakt?projekt=1#formularz')
    await expect(page.getByRole('button', { name: /^Twój projekt/ })).toContainText('1')
  })

  // Przegląd SWR3: a link in a window opened from a card must not be undone by a history step.
  test('a link in the window leads away (no step back over the navigation)', async ({ page }) => {
    await page.goto(site(HOST, PATH))
    await page.getByRole('button', { name: /^Strona wizytówka/ }).click()
    const dialog = windowOf(page, 'Strona wizytówka')
    await dialog.getByRole('link', { name: 'Dobierz w kreatorze' }).click()
    await expect(page).toHaveURL(/\/dobierz$/)
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/dobierz$/)
  })

  test('the arrows and × stay at the top while the window scrolls', async ({ page }) => {
    await page.goto(site(HOST, `${PATH}?rozwiazanie=opieka-nad-strona-i-systemem`))
    const dialog = windowOf(page, 'Opieka nad stroną i systemem')
    await expect(dialog).toBeVisible()
    await dialog.evaluate((element) => element.scrollTo(0, element.scrollHeight))
    await expect(dialog.getByRole('button', { name: 'Zamknij' })).toBeInViewport()
    await expect(dialog.getByRole('button', { name: 'Następne rozwiązanie' })).toBeInViewport()
  })

  test('„Dobrze łączy się z” switches the window to that solution', async ({ page }) => {
    await page.goto(site(HOST, `${PATH}?rozwiazanie=strona-firmowa-z-panelem`))
    const dialog = windowOf(page, 'Strona firmowa z panelem')
    await dialog.getByRole('button', { name: /Opieka nad stroną i systemem/ }).click()
    await expect(page).toHaveURL(/rozwiazanie=opieka-nad-strona-i-systemem$/)
    await expect(windowOf(page, 'Opieka nad stroną i systemem')).toBeVisible()
  })
})

test.describe('Software catalog, SEO and sitemap', () => {
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

    // An open window is a view of the catalog too (decyzja 1).
    await page.goto(site(HOST, `${PATH}?rozwiazanie=landing-page`))
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

    test(`the offer window is a sheet at ${width} px: no sideways scroll, 44 px targets`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto(site(HOST, `${PATH}?rozwiazanie=audyt-strony-lub-programu`))
      const dialog = windowOf(page, 'Audyt strony lub programu')
      await expect(dialog).toBeVisible()
      const box = (await dialog.boundingBox())!
      expect(Math.round(box.width)).toBe(width)
      expect(Math.round(box.y + box.height)).toBe(800)
      const sizes = await dialog.evaluate((element) => ({
        scroll: element.scrollWidth - element.clientWidth,
        small: [...element.querySelectorAll('a, button, summary')]
          .map((target) => target.getBoundingClientRect())
          .filter((rect) => rect.width > 0 && rect.height < 44).length,
      }))
      expect(sizes).toEqual({ scroll: 0, small: 0 })
      // The quick audit first: 0 zł is a price, not „Zapytaj”.
      await expect(dialog).toContainText('Audyt szybki')
      await expect(
        dialog.getByRole('button', { name: /^\+ Dodaj do wyceny|^Dodaj do wyceny/ }),
      ).toBeVisible()
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
    test(`no axe violations with the offer window open (${colorScheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme })
      await page.goto(site(HOST, `${PATH}?rozwiazanie=opieka-nad-strona-i-systemem`))
      await expect(windowOf(page, 'Opieka nad stroną i systemem')).toBeVisible()
      expect((await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations).toEqual([])
    })
  }
})
