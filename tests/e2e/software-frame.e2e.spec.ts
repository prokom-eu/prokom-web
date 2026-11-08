import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { clickUntilVisible, hydrated, pressUntilVisible, setTheme, site } from './helpers'

// SWA5a: the Software line on the shared shell (ZMIANY-v24 §3, ADR-022) — brand bar, header
// capsule with „Oferta ▾” and „Kreator 60 s”, „Twój projekt”, the search window, side rail from
// 1400 px, the „Zacznij od podglądu” band and the shared footer. The phone layer:
// software-mobile.e2e.spec.ts; the shared components themselves: wspolne-*.e2e.spec.ts.
// Data from `pnpm seed` (`seed/prokomsoftware/nawigacja.json`, `src/seed/shared/software.ts`).
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const HOST = 'software.localhost'
/** A page of the Software line other than the start page (ends with its own CTA). */
const SUBPAGE = '/dziekujemy'
const DESKTOP = { width: 1440, height: 900 }

const capsule = (page: Page) => page.locator('[data-site-header]')
const mainNav = (page: Page) => capsule(page).getByRole('navigation', { name: 'Menu główne' })
const offerButton = (page: Page) => mainNav(page).getByRole('button', { name: /^Oferta/ })
const mega = (page: Page) => page.locator('#oferta-mega')
/** The capsule's action — not the promo card's „Zobacz pełną ofertę” in the mega panel. */
const cta = (page: Page) => capsule(page).locator('.cap__actions > .cap-cta')
const projectButton = (page: Page) => capsule(page).getByRole('button', { name: /^Twój projekt/ })
const search = (page: Page) => page.locator('[data-search-dialog]')
const footer = (page: Page) => page.locator('[data-site-footer]')
const rail = (page: Page) => page.locator('[data-site-rail]')

/** Puts solutions on the list as a card's „+ Dodaj do wyceny” does (`pk-project`). */
async function setProject(page: Page, items: { id: string; name: string }[]) {
  await page.evaluate((value) => localStorage.setItem('pk-project', value), JSON.stringify(items))
}

const TWO = [
  { id: 'strona-firmowa-z-panelem', name: 'Strona firmowa z panelem' },
  { id: 'system-zlecen-i-grafik-ekip', name: 'System zleceń i grafik ekip' },
]

/** Opens „Oferta ▾” by a click, retried until hydrated (a click before it is lost). */
async function openMega(page: Page) {
  await expect(async () => {
    if ((await offerButton(page).getAttribute('aria-expanded')) !== 'true') {
      await offerButton(page).click({ timeout: 2000 })
    }
    await expect(mega(page)).toBeVisible({ timeout: 1000 })
  }).toPass()
}

test.describe('Software brand bar and capsule', () => {
  test.use({ viewport: DESKTOP })

  test('brand bar: the PRO-KOM lines with Software current, the audit slot and the phone', async ({
    page,
  }) => {
    await page.goto(site(HOST, SUBPAGE))
    const bar = page.locator('[data-brand-bar]')
    const lines = bar.getByRole('navigation', { name: 'Linie PRO-KOM' })
    await expect(lines.locator('[aria-current="page"]')).toHaveText(/Software/)
    await expect(bar.getByRole('link', { name: /Darmowy audyt/ })).toHaveAttribute('href', '/audyt')
    await expect(bar.locator('a[href^="tel:"]')).toContainText('883 200 151')
  })

  test('capsule: the menu of the panel, Kreator as the pill, the CTA to /kontakt', async ({
    page,
  }) => {
    await page.goto(site(HOST, '/audyt'))
    // The first element of each item: the hidden mega panel sits in the „Oferta” item too.
    // „Aktualności” only with a published post — the seed has none (SWV8 P0 #3).
    await expect(mainNav(page).locator(':scope > ul > li > :first-child')).toHaveText([
      /^Oferta/,
      /^Kreator\s*60 s$/,
      'Darmowy audyt',
      'O firmie',
      'Kontakt',
    ])
    await expect(mainNav(page).getByRole('link', { name: 'Darmowy audyt' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    const kreator = mainNav(page).locator('a.sw-cap-pill')
    await expect(kreator).toHaveAttribute('href', '/dobierz')
    await expect(kreator.locator('.sw-cap-pill__badge')).toHaveText('60 s')
    await expect(cta(page)).toHaveAttribute('href', '/kontakt')
    await expect(cta(page)).toHaveAccessibleName('Bezpłatna wycena')
    await expect(capsule(page).getByRole('button', { name: 'Tryb ciemny' })).toBeVisible()
    await expect(
      page.locator('header a[href="/aktualnosci"], footer a[href="/aktualnosci"]'),
    ).toHaveCount(0)
  })

  test('the capsule stays on screen while the page scrolls', async ({ page }) => {
    await page.goto(site(HOST, '/cennik'))
    await page.evaluate(() => window.scrollTo({ top: 1500, behavior: 'instant' }))
    await expect(capsule(page)).toHaveAttribute('data-scrolled', '')
    await expect(capsule(page)).toBeInViewport()
  })

  test('on the start page Kreator and the CTA lead to its sections', async ({ page }) => {
    await page.goto(site(HOST))
    // Anchors only after hydration (the proxy rewrites the path the server sees).
    await expect(mainNav(page).locator('a.sw-cap-pill')).toHaveAttribute('href', '#dobierz')
    await expect(cta(page)).toHaveAttribute('href', '#kontakt')
  })

  test('the Offer page marks „Oferta ▾” as current', async ({ page }) => {
    await page.goto(site(HOST, '/rozwiazania'))
    await expect(offerButton(page)).toHaveAttribute('aria-current', 'true')
  })
})

test.describe('Software „Oferta ▾”', () => {
  test.use({ viewport: DESKTOP })

  test('works from the keyboard: four groups with „od” prices, Esc returns the focus', async ({
    page,
  }) => {
    await page.goto(site(HOST, SUBPAGE))
    const button = offerButton(page)
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await expect(button).toHaveAttribute('aria-controls', 'oferta-mega')
    await hydrated(button)
    await button.focus()
    await pressUntilVisible(page, 'Enter', mega(page))
    await expect(button).toHaveAttribute('aria-expanded', 'true')

    const panel = mega(page)
    for (const group of [
      'Strony internetowe',
      'Przebudowa i opieka',
      'Systemy dla firm',
      'Automatyzacje i AI',
    ]) {
      await expect(panel.getByRole('region', { name: group })).toBeVisible()
    }
    // A solution opens its offer window in the catalog, with its „od” price from Solutions.
    const item = panel.getByRole('link', { name: /^Strona wizytówka/ })
    await expect(item).toHaveAttribute('href', '/rozwiazania?rozwiazanie=strona-wizytowka')
    await expect(item).toContainText(/od\s.*zł/)
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

  test('a hover opens it, leaving closes it; an item opens the offer window', async ({ page }) => {
    await page.goto(site(HOST, SUBPAGE))
    await expect(async () => {
      await page.mouse.move(700, 850)
      await offerButton(page).hover()
      await expect(mega(page)).toBeVisible({ timeout: 500 })
    }).toPass()
    await page.mouse.move(700, 850)
    await expect(mega(page)).toBeHidden()

    await openMega(page)
    await mega(page)
      .getByRole('link', { name: /^Strona wizytówka/ })
      .click()
    await expect(page).toHaveURL(/\/rozwiazania\?rozwiazanie=strona-wizytowka$/)
    await expect(mega(page)).toBeHidden()
  })
})

test.describe('Software search window', () => {
  test.use({ viewport: DESKTOP })

  test('the loupe opens it and a typo still finds the solution', async ({ page }) => {
    await page.goto(site(HOST, SUBPAGE))
    await clickUntilVisible(
      capsule(page).getByRole('button', { name: 'Szukaj na stronie' }),
      search(page),
    )
    const field = search(page).getByRole('searchbox', { name: 'Szukaj na stronie' })
    await expect(field).toBeFocused()
    // The offer comes from `/api/solutions-index`, fetched at the first request to search.
    await field.fill('wizytowka')
    await expect(
      search(page)
        .getByRole('link', { name: /Strona wizytówka/ })
        .first(),
    ).toHaveAttribute('href', '/rozwiazania?rozwiazanie=strona-wizytowka')
    await page.keyboard.press('Escape')
    await expect(search(page)).toBeHidden()
  })

  test('Ctrl K opens it and it finds the pages too', async ({ page }) => {
    await page.goto(site(HOST, SUBPAGE))
    await pressUntilVisible(page, 'Control+k', search(page))
    await search(page).getByRole('searchbox').fill('cenik')
    await expect(
      search(page)
        .getByRole('link', { name: /Cennik/ })
        .first(),
    ).toBeVisible()
  })
})

test.describe('Software „Twój projekt”', () => {
  test.use({ viewport: DESKTOP })

  test('shows only with items, counts on the CTA, removes and clears', async ({ page }) => {
    await page.goto(site(HOST, SUBPAGE))
    await hydrated(cta(page))
    await expect(projectButton(page)).toHaveCount(0)
    await expect(cta(page).locator('.cap-count')).toHaveCount(0)

    await setProject(page, TWO)
    await page.reload()
    const button = projectButton(page)
    await expect(button).toContainText('2')
    await expect(cta(page).locator('.cap-count')).toContainText('2')
    await hydrated(button)
    await button.click()
    const panel = page.locator(`[id="${await button.getAttribute('aria-controls')}"]`)
    await expect(panel).toBeVisible()
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
    // Focus moves to the capsule's CTA (`focusProjectFallback`).
    await expect(cta(page)).toBeFocused()
    await expect(cta(page).locator('.cap-count')).toHaveCount(0)
    expect(await page.evaluate(() => localStorage.getItem('pk-project'))).toBe('[]')
  })

  test('the list is shared between tabs', async ({ page, context }) => {
    await page.goto(site(HOST, SUBPAGE))
    await hydrated(cta(page))
    const other = await context.newPage()
    await other.setViewportSize(DESKTOP)
    await other.goto(site(HOST, SUBPAGE))
    await hydrated(cta(other))

    await setProject(page, TWO.slice(0, 1))
    // The `storage` event reaches the other tab only.
    await expect(projectButton(other)).toContainText('1')
    await expect(cta(other).locator('.cap-count')).toContainText('1')
  })

  // Manrope is wider than the board's font: the full capsule must fit from 1081 px up (the
  // cramped state 1081–1359 px shortens the CTA) — never a second row nor a sideways scroll.
  for (const width of [1081, 1280, 1359, 1360, 1440]) {
    test(`the full capsule fits at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto(site(HOST, SUBPAGE))
      await setProject(page, TWO)
      await page.reload()
      await expect(projectButton(page)).toBeVisible()
      // Free space of the row: its inner width minus its items and the gaps between them.
      const free = await capsule(page)
        .locator('.cap')
        .evaluate((row) => {
          const style = getComputedStyle(row)
          const inner =
            row.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
          const items = [...row.children].filter((el) => getComputedStyle(el).display !== 'none')
          const used = items.reduce((sum, el) => sum + el.getBoundingClientRect().width, 0)
          return inner - used - (parseFloat(style.columnGap) || 0) * (items.length - 1)
        })
      expect(free).toBeGreaterThanOrEqual(0)
      expect(await page.evaluate(() => document.scrollingElement!.scrollWidth)).toBe(width)
    })
  }

  test('other lines keep their own header', async ({ page }) => {
    await page.goto(site('instalacje.localhost'))
    await expect(page.getByRole('link', { name: /Kreator/ })).toHaveCount(0)
    await expect(page.locator('#oferta-mega')).toHaveCount(0)
  })
})

test.describe('Software side rail (≥ 1400 px)', () => {
  test.use({ viewport: DESKTOP })

  test('the start page sections, „Szukaj” and Kreator — or „Twój projekt” with items', async ({
    page,
  }) => {
    await page.goto(site(HOST))
    await expect(rail(page)).toBeVisible()
    await expect(rail(page).locator('a[href="#oferta"]')).toBeAttached()
    await expect(rail(page).locator('a[href="#kontakt"]')).toBeAttached()
    await expect(rail(page).locator('.srail__item--action')).toHaveAttribute('href', '/dobierz')

    // The folded rail shows 64 px: the button is pressed there, as a visitor would.
    const button = rail(page).getByRole('button', { name: /Szukaj/ })
    await hydrated(button)
    await button.click({ position: { x: 24, y: 24 } })
    await expect(search(page)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(search(page)).toBeHidden()

    await setProject(page, TWO)
    await page.reload()
    const action = rail(page).locator('.srail__item--action')
    await expect(action).toHaveAttribute('href', '/kontakt?projekt=1#formularz')
    await expect(action).toContainText('Twój projekt')
    await expect(action).toContainText('2')
  })

  test('hidden below 1400 px', async ({ page }) => {
    await page.setViewportSize({ width: 1399, height: 900 })
    await page.goto(site(HOST))
    await expect(rail(page)).toBeHidden()
  })
})

test.describe('Software „Zacznij od podglądu” band', () => {
  // Every page ends with one CTA (plan §3b, decyzja 6): pages without their own get the band.
  for (const path of ['/', '/dobierz', '/cennik', '/mapa-strony']) {
    test(`the band closes ${path}`, async ({ page }) => {
      await page.goto(site(HOST, path))
      const band = page.locator('section[data-footer-cta]')
      await expect(band).toBeVisible()
      await expect(band.getByRole('heading', { level: 2 })).toHaveText(
        'Zacznij od podglądu, nie od faktury.',
      )
      await expect(band.getByRole('link', { name: 'Kreator 60 s →' })).toHaveAttribute(
        'href',
        '/dobierz',
      )
      await expect(band.locator('a[href^="tel:"]')).toHaveCount(1)
    })
  }

  // A page that ends with its own CTA (`data-final-cta`) drops the band.
  for (const path of [SUBPAGE, '/audyt']) {
    test(`no band where the page ends with its own CTA (${path})`, async ({ page }) => {
      await page.goto(site(HOST, path))
      await expect(footer(page)).toBeVisible()
      await expect(page.locator('[data-footer-cta]')).toBeHidden()
    })
  }
})

test.describe('Software footer', () => {
  test.use({ viewport: DESKTOP })

  test('columns, promises, contact, the lines band and the legal bar', async ({ page }) => {
    await page.goto(site(HOST, '/mapa-strony'))
    const foot = footer(page)
    for (const heading of ['Oferta', 'Firma']) {
      await expect(foot.getByRole('navigation', { name: heading }).first()).toBeVisible()
    }
    await expect(
      foot
        .getByRole('navigation', { name: 'Firma' })
        .first()
        .getByRole('link', { name: 'Jedna firma do wszystkiego' }),
    ).toHaveAttribute('href', '/o-firmie#linie')
    await expect(
      foot
        .getByRole('navigation', { name: 'Oferta' })
        .first()
        .getByRole('link', { name: 'Cennik' }),
    ).toHaveAttribute('href', '/cennik')
    await expect(foot).toContainText('Kod, domena i dane należą do Ciebie')

    // The line's own contact from its site settings (seed), two phones with +48.
    const contact = foot.locator('[data-footer-contact]')
    await expect(contact.getByRole('link', { name: 'kontakt@prokomsoftware.pl' })).toHaveAttribute(
      'href',
      'mailto:kontakt@prokomsoftware.pl',
    )
    await expect(contact.locator('a[href="tel:+48883200151"]')).toHaveCount(1)
    await expect(contact.locator('a[href="tel:+48788986074"]')).toHaveCount(1)
    // Software works only in Rabka (v23): no other salon of the company under the address.
    await expect(foot).not.toContainText(/Zakopan/i)

    const lines = foot.locator('[data-lines-band]')
    await expect(lines.locator('[aria-current="page"]')).toHaveAttribute(
      'data-line-tile',
      'software',
    )
    await expect(lines.locator('[data-line-tile="biznes"]')).toHaveAttribute(
      'href',
      'https://prokombiznes.pl',
    )
    // SWV6: the service line is „Serwis”, not „Tech”.
    await expect(lines).not.toContainText(/\bTECH\b/i)

    const legal = foot.locator('[data-legal-bar]')
    await expect(legal.locator('[data-legal-line]')).toContainText(/NIP \d{10}/)
    const legalNav = legal.getByRole('navigation', { name: 'Informacje prawne' })
    await expect(legalNav.getByRole('link', { name: 'Polityka prywatności' })).toBeVisible()
    await expect(legalNav.getByRole('link', { name: 'Mapa strony' })).toBeVisible()
    await expect(legal).toContainText('Statystyki bez ciasteczek śledzących')
    await expect(foot).not.toContainText(/WhatsApp/i)
    expect(await page.evaluate(() => document.scrollingElement!.scrollWidth)).toBe(DESKTOP.width)
  })
})

for (const width of [1440, 1180, 1024, 768]) {
  test(`Software shell fits ${width} px without scrolling sideways`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(site(HOST))
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    )
  })
}

test.describe('Software frame accessibility', () => {
  test.use({ viewport: DESKTOP })

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`no axe violations with the open panels (${colorScheme})`, async ({ page }) => {
      await setTheme(page, colorScheme)
      await page.goto(site(HOST, SUBPAGE))
      await setProject(page, TWO)
      await page.reload()

      await openMega(page)
      const withMega = await new AxeBuilder({ page }).withTags(WCAG).analyze()
      expect(withMega.violations).toEqual([])

      await page.keyboard.press('Escape')
      await expect(mega(page)).toBeHidden()
      await clickUntilVisible(
        projectButton(page),
        page.locator(`[id="${await projectButton(page).getAttribute('aria-controls')}"]`),
      )
      const withProject = await new AxeBuilder({ page }).withTags(WCAG).analyze()
      expect(withProject.violations).toEqual([])

      await page.keyboard.press('Escape')
      await pressUntilVisible(page, 'Control+k', search(page))
      const withSearch = await new AxeBuilder({ page }).withTags(WCAG).analyze()
      expect(withSearch.violations).toEqual([])
    })
  }
})
