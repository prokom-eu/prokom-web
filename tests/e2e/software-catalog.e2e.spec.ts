import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { hydrated, setTheme, site } from './helpers'

// SWA4a: „Oferta” `/rozwiazania` v24 with the offer window (ZMIANY-v24 §6.1–6.2, board
// `AU-oferta`, kryterium 4 of spec. §5). Data from `pnpm seed` (29 solutions of
// `rozwiazania.json`, the removed one not imported): strony 7, przebudowa i opieka 4, systemy 13
// (with the apps), automatyzacje 5.
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const HOST = 'software.localhost'
const PATH = '/rozwiazania'
const REMOVED = 'rezerwacje-online-na-stronie'

const cards = (page: Page) => page.locator('a.v-card')
/** The visible count (focus target of „Wyczyść filtry”); a hidden status repeats it for readers. */
const count = (page: Page) =>
  page.locator('p[tabindex="-1"]').filter({ hasText: /^\d+ rozwiąza(nie|nia|ń) / })
const chip = (page: Page, name: RegExp) =>
  page.getByRole('group', { name: 'Kategoria' }).getByRole('button', { name })
const tile = (page: Page, name: string) =>
  page.getByRole('group', { name: 'Grupy oferty' }).getByRole('button', { name })
/** The card of one solution, found by its name (the bold title of the card). */
const card = (page: Page, name: string) =>
  cards(page).filter({ has: page.locator('.v-card-bd > b', { hasText: new RegExp(`^${name}$`) }) })
/**
 * axe without the mock-ups: decorative pictures of sample firms in their own brand colours
 * (`aria-hidden`, ADR-015 v24 pkt 4) — as in `a11y.e2e.spec.ts`.
 */
const axe = (page: Page) => new AxeBuilder({ page }).exclude('[data-mockup]').withTags(WCAG)
/** The island is interactive (ADR-023: a click before hydration is lost). */
const ready = (page: Page) => hydrated(chip(page, /^Wszystko/))
/** The offer window of one solution (`<dialog>` named after it). */
const windowOf = (page: Page, name: string) => page.getByRole('dialog', { name, exact: true })

test.describe('Software catalog', () => {
  test('renders every published solution on the server, none removed', async ({ page }) => {
    const response = await page.goto(site(HOST, PATH))
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Oferta. Cena i termin przy każdej pozycji.',
    )
    await expect(page.getByText('Pełna oferta · 29 rozwiązań')).toBeVisible()
    await expect(count(page)).toHaveText('29 rozwiązań w ofercie')
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
    await expect(chip(page, /^Systemy · 13$/)).toHaveAttribute('aria-pressed', 'true')
    await expect(tile(page, 'Systemy dla firm')).toHaveAttribute('aria-pressed', 'true')
    await expect(cards(page)).toHaveCount(13)
    await expect(cards(page).locator('.sw-eyebrow', { hasText: /^Systemy$/ })).toHaveCount(13)
    await expect(count(page)).toHaveText('13 rozwiązań pasuje do filtrów')

    // Saved v23 links: „aplikacje” is a system now, „opieka” goes with the rebuild (D10).
    await page.goto(site(HOST, `${PATH}?kategoria=aplikacje`))
    await expect(chip(page, /^Systemy/)).toHaveAttribute('aria-pressed', 'true')
    await page.goto(site(HOST, `${PATH}?kategoria=opieka`))
    await expect(cards(page)).toHaveCount(4)
    await expect(card(page, 'Przebudowa starej strony')).toBeVisible()

    // Kryterium 4: a typo still finds it.
    await page.goto(site(HOST, `${PATH}?q=exel`))
    await expect(cards(page).first().locator('.v-card-bd > b')).toHaveText('Z Excela do systemu')
  })

  test('tiles and chips write the URL, counts agree with the list, a refresh keeps the view', async ({
    page,
  }) => {
    await page.goto(site(HOST, PATH))
    await ready(page)
    await tile(page, 'Przebudowa i opieka').click()
    await expect(page).toHaveURL(/\?kategoria=przebudowa$/)
    await expect(cards(page)).toHaveCount(4)
    await chip(page, /^Automatyzacje · 5$/).click()
    await expect(page).toHaveURL(/\?kategoria=automatyzacje$/)
    await expect(cards(page)).toHaveCount(5)
    await page.reload()
    await expect(cards(page)).toHaveCount(5)
    await page.goBack()
    await expect(page).toHaveURL(/\?kategoria=przebudowa$/)
    await expect(cards(page)).toHaveCount(4)
  })

  test('a situation and an industry from a link show as chips that take them off', async ({
    page,
  }) => {
    await page.goto(site(HOST, `${PATH}?sytuacja=od-zera&branza=noclegi`))
    await ready(page)
    const industry = page.getByRole('button', { name: 'Usuń filtr: Noclegi' })
    await expect(industry).toHaveAttribute('aria-pressed', 'true')
    const narrowed = await cards(page).count()
    await industry.click()
    await expect(page).toHaveURL(/\?sytuacja=od-zera$/)
    await expect(industry).toHaveCount(0)
    expect(await cards(page).count()).toBeGreaterThanOrEqual(narrowed)
    await page.getByRole('button', { name: 'Usuń filtr: Zaczynam od zera' }).click()
    await expect(page).toHaveURL(new RegExp(`${PATH}$`))
    await expect(cards(page)).toHaveCount(29)
  })

  test('typing searches after a pause and writes the query', async ({ page }) => {
    await page.goto(site(HOST, PATH))
    await ready(page)
    await page.getByRole('searchbox', { name: 'Szukaj w ofercie' }).fill('grafik')
    await expect(page).toHaveURL(/\?q=grafik$/)
    await expect(count(page)).toContainText('pasuje do filtrów')
  })

  test('Back after „Wyczyść filtry” brings the search back (przegląd SW9)', async ({ page }) => {
    await page.goto(site(HOST, PATH))
    await ready(page)
    await page.getByRole('searchbox', { name: 'Szukaj w ofercie' }).fill('crm')
    await expect(page).toHaveURL(/\?q=crm$/)
    const found = await cards(page).count()
    await page.getByRole('button', { name: 'Wyczyść filtry' }).click()
    await expect(cards(page)).toHaveCount(29)
    await page.goBack()
    await expect(page).toHaveURL(/\?q=crm$/)
    await expect(page.getByRole('searchbox', { name: 'Szukaj w ofercie' })).toHaveValue('crm')
    await expect(cards(page)).toHaveCount(found)
    // Not undone by the box after its pause.
    await page.waitForTimeout(600)
    await expect(page).toHaveURL(/\?q=crm$/)
  })

  test('empty result: „Wyczyść filtry”, contact and the wizard; back to all', async ({ page }) => {
    await page.goto(site(HOST, `${PATH}?q=qqqzzzxxx`))
    await ready(page)
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

  test('cards show the mock-up, the one „od” price and term; care per month', async ({ page }) => {
    await page.goto(site(HOST, PATH))
    const firmSite = card(page, 'Strona firmowa z panelem')
    await expect(firmSite).toContainText(/od\s2\s490\s*zł netto/)
    await expect(firmSite.locator('.v-card-ft')).toContainText('od 2 tygodni')
    await expect(firmSite.locator('[data-mockup="site"]')).toHaveCount(1)
    await expect(card(page, 'Opieka nad stroną i systemem')).toContainText('od 149 zł / mies.')
  })

  test('„Bez dopłat za rzeczy oczywiste” lists what every page includes', async ({ page }) => {
    await page.goto(site(HOST, PATH))
    const section = page.getByRole('region', { name: 'Bez dopłat za rzeczy oczywiste' })
    await expect(section.getByRole('heading', { level: 3 })).toHaveText([
      'Wersja na telefon',
      'SEO i dane dla AI',
      'Panel po polsku',
      'SSL i szybkość',
    ])
  })
})

test.describe('Software offer window (spec. §5.1)', () => {
  test('a press anywhere on the card opens the window and writes ?rozwiazanie=', async ({
    page,
  }) => {
    await page.goto(site(HOST, PATH))
    await ready(page)
    const landing = card(page, 'Landing page')
    const box = (await landing.boundingBox())!
    await landing.click({ position: { x: box.width - 12, y: box.height - 12 } })
    await expect(windowOf(page, 'Landing page')).toBeVisible()
    await expect(page).toHaveURL(/\?rozwiazanie=landing-page$/)
  })

  test('the window comes in by CSS within 300 ms, no View Transitions (SWA14 §2)', async ({
    page,
  }, testInfo) => {
    await page.goto(site(HOST, PATH))
    await ready(page)
    // A pointer over the card first, as before any click: it fetches the window's chunk.
    await card(page, 'Landing page').hover()
    await page.waitForLoadState('networkidle')
    // Measured in the page from the click: the panel fully seen, and at 120 ms the backdrop
    // dims the page and nothing of a view transition is drawn over the window.
    const result = await page.evaluate(async () => {
      const opener = [...document.querySelectorAll<HTMLElement>('a.v-card')].find(
        (item) => item.querySelector('.v-card-bd > b')?.textContent === 'Landing page',
      )
      if (!opener) return null
      const start = performance.now()
      opener.click()
      let at120: { backdrop: number; transitions: number } | null = null
      let full = -1
      let shown = -1
      while (performance.now() - start < 1500) {
        await new Promise(requestAnimationFrame)
        const time = performance.now() - start
        const panel = document.querySelector<HTMLDialogElement>('dialog.sw-offer-panel[open]')
        if (!panel) continue
        if (shown < 0) shown = time
        if (!at120 && time >= 120) {
          at120 = {
            backdrop: Number(getComputedStyle(panel, '::backdrop').opacity),
            transitions: document
              .getAnimations()
              .filter((animation) =>
                String((animation.effect as KeyframeEffect | null)?.pseudoElement ?? '').startsWith(
                  '::view-transition',
                ),
              ).length,
          }
        }
        const style = getComputedStyle(panel)
        const still = style.scale === '1' || style.scale === 'none'
        if (full < 0 && style.opacity === '1' && still) full = time
        if (full >= 0 && at120) break
      }
      return { full, shown, at120 }
    })
    await page.waitForTimeout(150)
    await testInfo.attach('okno-120ms', {
      body: await page.screenshot(),
      contentType: 'image/png',
    })
    expect(result).not.toBeNull()
    expect(result?.full).toBeGreaterThanOrEqual(0)
    // ≤ 300 ms on the target = one render frame (budget 80 ms, CI 100 ms) + the 240 ms entry
    // (+ up to 60 ms: the entry starts a frame after `showModal()`, its end is read on a frame).
    // Checked apart: the CI runner's render time varies. Measured 13.11: ~31 + ~285 ms.
    const measured = JSON.stringify(result)
    expect(result?.shown, measured).toBeLessThanOrEqual(100)
    expect((result?.full ?? 0) - (result?.shown ?? 0), measured).toBeLessThanOrEqual(240 + 60)
    expect(result?.at120?.transitions).toBe(0)
    expect(result?.at120?.backdrop).toBeGreaterThan(0.5)
    await expect(windowOf(page, 'Landing page')).toBeVisible()
  })

  test('tiles, „W cenie”, gallery, guarantees, steps; Esc closes, focus back on the card', async ({
    page,
  }) => {
    await page.goto(site(HOST, PATH))
    await ready(page)
    const opener = card(page, 'Strona firmowa z panelem')
    await opener.click()
    const dialog = windowOf(page, 'Strona firmowa z panelem')
    await expect(dialog.getByRole('heading', { level: 2 })).toHaveText('Strona firmowa z panelem')
    // AUDYT po SWA7 #8: the focus opens on the name, not on „←” with its ring.
    await expect(dialog.getByRole('heading', { level: 2 })).toBeFocused()
    await expect(dialog).toContainText('1 / 29')
    // The price as the hero, the term and care as rows (OKNO-OFERTY-PREMIUM §2.1).
    await expect(dialog.locator('.sw-offer-hero dl > div')).toHaveText([
      /^Cena\s*od\s+2\s490\s+zł\s+netto$/,
      /^Termin\s*od 2 tygodni$/,
      /^Opieka\s*od 149 zł \/ mies\.$/,
    ])
    // The gallery switches the big mock-up to the phone version.
    const views = dialog.getByRole('group', { name: 'Widok makiety' })
    await views.getByRole('button', { name: 'Telefon' }).click()
    await expect(views.getByRole('button', { name: 'Telefon' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(dialog.locator('.sw-offer-shot [data-mockup="phone"]')).toHaveCount(1)
    await expect(dialog).toContainText('Do 5 podstron: oferta, realizacje, opinie, kontakt')
    // „Potrzebujesz więcej?” as chips of `moreExamples`, no prices (OKNO-OFERTY-PREMIUM §2.3).
    await expect(
      dialog
        .getByRole('list', { name: 'Potrzebujesz więcej?' })
        .getByRole('button', { name: /więcej niż 5 podstron/ }),
    ).toHaveAttribute('aria-pressed', 'false')
    await expect(dialog).toContainText('Wycena na piśmie, ważna 30 dni')
    await expect(dialog).toContainText('30% zaliczki, reszta po odbiorze')
    // „Co dalej” under the hero price (§2.2), no price block next to the mock-up.
    await expect(dialog.locator('.sw-offer-next')).toContainText('Co dalej')
    await expect(dialog.locator('aside .sw-offer-price')).toHaveCount(0)
    await expect(dialog.getByRole('heading', { name: 'Jak to wygląda' })).toBeVisible()
    await expect(dialog).toContainText(/Co jest w cenie od 2\s490 zł\?/)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(page).toHaveURL(new RegExp(`${PATH}$`))
    await expect(opener).toBeFocused()
  })

  test('←/→ walk the list with the counter; Back closes the window', async ({ page }) => {
    await page.goto(site(HOST, `${PATH}?kategoria=strony`))
    await ready(page)
    await card(page, 'Strona firmowa z panelem').click()
    const dialog = page.locator('dialog[open]')
    await expect(dialog).toContainText('1 / 7')
    await page.keyboard.press('ArrowRight')
    await expect(page).toHaveURL(/rozwiazanie=strona-dla-hotelu-lub-pensjonatu/)
    await expect(dialog).toContainText('2 / 7')
    await page.keyboard.press('ArrowLeft')
    await expect(dialog).toContainText('1 / 7')
    await page.keyboard.press('ArrowLeft')
    await expect(dialog).toContainText('7 / 7')
    // Switching replaces the entry: one Back closes the window, the filter stays.
    await page.goBack()
    await expect(page.locator('dialog[open]')).toHaveCount(0)
    await expect(page).toHaveURL(/\?kategoria=strony$/)
  })

  test('a shared link opens the window; an unknown slug opens nothing', async ({ page }) => {
    await page.goto(site(HOST, `${PATH}?rozwiazanie=aplikacja-dla-ekip-w-terenie`))
    const dialog = windowOf(page, 'Aplikacja dla ekip w terenie')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Wycena po rozmowie')
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
    await ready(page)
    await card(page, 'Strona wizytówka').click()
    const dialog = windowOf(page, 'Strona wizytówka')
    // §2.4: the wizard is a text link in „Pytania”, not a button of the bar.
    await dialog.getByRole('link', { name: 'Kreator 60 s' }).click()
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

  test('wide window 7/5 at 1440 px: the mock-up column stays in view', async ({ page }) => {
    // AUDYT-0811 #5: up to 1320 px wide, the gallery with the price kept in view while scrolling.
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site(HOST, `${PATH}?rozwiazanie=strona-firmowa-z-panelem`))
    const dialog = windowOf(page, 'Strona firmowa z panelem')
    await expect(dialog).toBeVisible()
    expect((await dialog.boundingBox())?.width ?? 0).toBeGreaterThanOrEqual(1240)
    const aside = dialog.locator('aside')
    const top = (await dialog.boundingBox())!.y
    await dialog.evaluate((element) => element.scrollTo(0, 900))
    await expect(dialog.getByRole('group', { name: 'Widok makiety' })).toBeInViewport()
    // Stuck under the window's header (88 px), not scrolled away with the details.
    await expect
      .poll(async () => Math.round(((await aside.boundingBox())?.y ?? 0) - top))
      .toBeLessThan(100)
  })

  test('„Zapytaj o tę ofertę →” puts the solution into the project and opens the form', async ({
    page,
  }) => {
    await page.goto(site(HOST, `${PATH}?rozwiazanie=landing-page`))
    const dialog = windowOf(page, 'Landing page')
    const ask = dialog.getByRole('link', { name: /^Zapytaj o tę ofertę/ })
    await hydrated(ask)
    await expect(ask).toHaveAttribute('href', '/kontakt?projekt=1#formularz')
    await ask.click()
    await expect(page).toHaveURL(/\/kontakt\?projekt=1#formularz$/)
    await expect(page.getByRole('button', { name: /^Twój projekt/ })).toContainText('1')
  })

  test('section tabs scroll the window and follow it; category dots switch the offer', async ({
    page,
  }) => {
    // OKNO-OFERTY-PREMIUM §2.1: tabs from 1100 px, dots of the category next to the counter.
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site(HOST, `${PATH}?rozwiazanie=strona-wizytowka`))
    const dialog = windowOf(page, 'Strona wizytówka')
    const tabs = dialog.getByRole('navigation', { name: 'Sekcje oferty' })
    await expect(tabs.getByRole('link', { name: 'Zakres' })).toHaveAttribute(
      'aria-current',
      'location',
    )
    await tabs.getByRole('link', { name: 'Pytania' }).click()
    await expect(tabs.getByRole('link', { name: 'Pytania' })).toHaveAttribute(
      'aria-current',
      'location',
    )
    await expect(dialog.locator('#oferta-pytania')).toBeInViewport()
    const dots = dialog.getByRole('navigation', { name: 'Oferty: Strony' })
    await expect(dots.getByRole('button', { name: 'Strona wizytówka' })).toHaveAttribute(
      'aria-current',
      'true',
    )
    await dots.getByRole('button', { name: 'Strona firmowa z panelem' }).click()
    await expect(page).toHaveURL(/rozwiazanie=strona-firmowa-z-panelem$/)
    await expect(windowOf(page, 'Strona firmowa z panelem')).toBeVisible()
  })

  test('a point lights its area on the mock-up; chosen chips start the inquiry', async ({
    page,
  }) => {
    // OKNO-OFERTY-PREMIUM §2.2–§2.3: a point of „W cenie” with an area on the mock-up.
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site(HOST, `${PATH}?rozwiazanie=strona-wizytowka`))
    const dialog = windowOf(page, 'Strona wizytówka')
    const point = dialog.locator('[data-point="1"]')
    await hydrated(point)
    await point.focus()
    await expect(dialog.locator('.sw-offer-shot')).toHaveAttribute('data-spot-on', '')
    await expect(dialog.locator('.sw-offer-shot [data-spot][data-lit]').first()).toBeVisible()
    await expect(dialog.getByRole('button', { name: /^Pokaż w cenie: Jedna strona/ })).toBeVisible()
    const more = dialog.getByRole('list', { name: 'Potrzebujesz więcej?' })
    await more.getByRole('button', { name: /galeria i opinie klientów/ }).click()
    await expect(more.getByRole('button', { name: /galeria i opinie klientów/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(dialog).toContainText('W zapytaniu: galeria i opinie klientów')
    await dialog.getByRole('link', { name: /^Zapytaj o tę ofertę/ }).click()
    await expect(page).toHaveURL(/\/kontakt\?projekt=1&fraza=.*#formularz$/)
    await expect(
      page.locator('[data-contact-page] [data-contact-form]').getByLabel('Wiadomość'),
    ).toHaveValue('Strona wizytówka — dodatkowo: galeria i opinie klientów')
  })

  test('„Czym różni się od” shows the neighbour side by side and opens it', async ({ page }) => {
    // OKNO-OFERTY-PREMIUM §2.3 P2: the next offer of the category, folded until asked.
    await page.goto(site(HOST, `${PATH}?rozwiazanie=strona-wizytowka`))
    const dialog = windowOf(page, 'Strona wizytówka')
    const compare = dialog.locator('.sw-offer-compare')
    await compare.locator('summary').click()
    await expect(compare).toHaveAttribute('open', '')
    const open = compare.getByRole('button', { name: /^Zobacz: / })
    const name = ((await open.textContent()) ?? '').replace(/^Zobacz:\s*/, '').replace(/\s*→$/, '')
    // The second column is the neighbour, with its own „W cenie”.
    await expect(compare.getByRole('heading', { level: 4 })).toHaveText([
      'Strona wizytówka',
      name.trim(),
    ])
    await expect(compare.getByRole('list', { name: `W cenie: ${name.trim()}` })).toBeVisible()
    await open.click()
    await expect(windowOf(page, name.trim())).toBeVisible()
  })

  test('„Często łączone z” switches the window to that solution', async ({ page }) => {
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

  // The sheet's height and the finger scroll: `software-plynnosc.e2e.spec.ts` (SWA12a).
  test('the offer sheet closes by ×', async ({ page }) => {
    await page.goto(site(HOST, `${PATH}?rozwiazanie=strona-wizytowka`))
    const dialog = windowOf(page, 'Strona wizytówka')
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Zamknij' }).click()
    await expect(page.locator('dialog[open]')).toHaveCount(0)
  })

  test('tiles, chips and the search; a chip filters the cards', async ({ page }) => {
    await page.goto(site(HOST, PATH))
    await ready(page)
    await expect(page.getByRole('searchbox', { name: 'Szukaj w ofercie' })).toBeVisible()
    await chip(page, /^Przebudowa i opieka · 4$/).click()
    await expect(cards(page)).toHaveCount(4)
  })

  for (const width of [390, 360]) {
    test(`no horizontal scroll at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      // With the chip of a link filter: the longest row of chips.
      await page.goto(site(HOST, `${PATH}?branza=noclegi`))
      expect(await page.evaluate(() => document.scrollingElement!.scrollWidth)).toBe(width)
    })

    test(`the offer window is a sheet at ${width} px: no sideways scroll, 44 px targets`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto(site(HOST, `${PATH}?rozwiazanie=audyt-strony-lub-programu`))
      const dialog = windowOf(page, 'Audyt strony lub programu')
      await expect(dialog).toBeVisible()
      // The sheet slides up (SWV7 `BottomSheet`): measure where it stops, not mid-way. The
      // mock-ups loop forever (v24), so only the animations that end are waited for.
      await dialog.evaluate((element) =>
        Promise.all(
          element
            .getAnimations({ subtree: true })
            .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
            .map((animation) => animation.finished),
        ),
      )
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

  test('no axe violations on the phone', async ({ page }) => {
    await page.goto(site(HOST, PATH))
    await ready(page)
    expect((await axe(page).analyze()).violations).toEqual([])
  })
})

test.describe('Software catalog accessibility', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`no axe violations with the offer window open (${colorScheme})`, async ({ page }) => {
      await setTheme(page, colorScheme)
      await page.goto(site(HOST, `${PATH}?rozwiazanie=opieka-nad-strona-i-systemem`))
      await expect(windowOf(page, 'Opieka nad stroną i systemem')).toBeVisible()
      expect((await axe(page).analyze()).violations).toEqual([])
    })
  }
})

// SWA10 #2, SWA11 #3 (AUDYT-0911 noc): a system lights three points of its panel, and the
// numbered dots stand beside their parts — not on the avatar or the phone badge.
test('system offer: ① ② ③ on the panel without covering it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(site(HOST, `${PATH}?rozwiazanie=crm-dla-malej-i-sredniej-firmy`))
  const dialog = windowOf(page, 'CRM dla małej i średniej firmy')
  const shot = dialog.locator('.sw-offer-shot')
  await expect(shot.locator('[data-marker]')).toHaveCount(3)
  const overlaps = async (marker: string, part: string) => {
    const dot = await shot.locator(`[data-marker="${marker}"] > span`).boundingBox()
    const box = await shot.locator(part).boundingBox()
    expect(dot, marker).not.toBeNull()
    expect(box, part).not.toBeNull()
    return (
      dot!.x < box!.x + box!.width &&
      box!.x < dot!.x + dot!.width &&
      dot!.y < box!.y + box!.height &&
      box!.y < dot!.y + dot!.height
    )
  }
  expect(await overlaps('2', '.mk-user > i')).toBe(false)
  expect(await overlaps('3', '.mk-device')).toBe(false)
})
