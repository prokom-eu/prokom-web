import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { clickUntilVisible, hydrated, setTheme, site } from './helpers'

// SWA5a: the phone layer of the Software line on the shared shell (ZMIANY-v24 §3.7,
// MOBILE-APLIKACJA §4–§5) — the compact capsule, the shared tab bar (Główna · Oferta · Kreator ·
// Kontakt · Menu) and the menu sheet with the line's list. Data from `pnpm seed`.
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const HOST = 'software.localhost'
const SUBPAGE = '/dziekujemy'
const PHONE = { width: 390, height: 844 }

const capsule = (page: Page) => page.locator('[data-site-header]')
const cta = (page: Page) => capsule(page).locator('.cap__actions > .cap-cta')
const bar = (page: Page) => page.getByRole('navigation', { name: 'Pasek aplikacji' })
const menuButton = (page: Page) => bar(page).getByRole('button', { name: 'Menu' })
const menuSheet = (page: Page) => page.getByRole('dialog', { name: 'Menu' })
/** The line's own part of the sheet (`SwSheetList`), above the shared contact card. */
const sheetList = (page: Page) => menuSheet(page).locator('[data-menu-sheet] > :first-child')
const search = (page: Page) => page.locator('[data-search-dialog]')

async function setProject(page: Page, items: { id: string; name: string }[]) {
  await page.evaluate((value) => localStorage.setItem('pk-project', value), JSON.stringify(items))
}

const TWO = [
  { id: 'strona-firmowa-z-panelem', name: 'Strona firmowa z panelem' },
  { id: 'system-zlecen-i-grafik-ekip', name: 'System zleceń i grafik ekip' },
]

/** Opens the menu sheet from the tab bar (a click before hydration is lost). */
const openMenu = (page: Page) => clickUntilVisible(menuButton(page), menuSheet(page))

/** Wider than the window = horizontal scroll of the page (spec. §8.6). */
const pageWidth = (page: Page) => page.evaluate(() => document.scrollingElement!.scrollWidth)

test.use({ viewport: PHONE })

test.describe('Software phone capsule and tab bar', () => {
  test('compact capsule: logo, „Wycena” and Menu only', async ({ page }) => {
    await page.goto(site(HOST, SUBPAGE))
    await expect(cta(page)).toHaveAttribute('href', '/kontakt')
    // The short label of the shared CTA; the long one is for wider screens.
    await expect(cta(page)).toHaveAccessibleName('Wycena')
    await expect(cta(page).locator('.cap-cta__long')).toBeHidden()
    await expect(capsule(page).getByRole('button', { name: 'Menu' })).toBeVisible()
    await expect(capsule(page).getByRole('navigation', { name: 'Menu główne' })).toBeHidden()
    await expect(capsule(page).getByRole('button', { name: 'Szukaj na stronie' })).toBeHidden()
    await expect(capsule(page).getByRole('button', { name: 'Tryb ciemny' })).toBeHidden()
    await expect(page.locator('[data-brand-bar]')).toBeHidden()
    await expect(page.locator('[data-site-rail]')).toBeHidden()
  })

  test('five items, Główna current on the start page, Kreator in the centre', async ({ page }) => {
    await page.goto(site(HOST))
    await expect(bar(page).locator(':scope > *')).toHaveCount(5)
    await expect(bar(page).getByRole('link', { name: 'Główna' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(bar(page).getByRole('link', { name: 'Oferta' })).toHaveAttribute(
      'href',
      '/rozwiazania',
    )
    const center = bar(page).locator('[data-tab-center]')
    await expect(center).toHaveText('Kreator')
    await expect(center).toHaveAttribute('href', '/dobierz')
    await expect(bar(page).getByRole('link', { name: 'Kontakt' })).toHaveAttribute(
      'href',
      '/kontakt',
    )
    await expect(menuButton(page)).toBeVisible()

    await page.goto(site(HOST, '/rozwiazania'))
    await expect(bar(page).getByRole('link', { name: 'Oferta' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(bar(page).getByRole('link', { name: 'Główna' })).not.toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  test('the centre Kreator opens the wizard', async ({ page }) => {
    await page.goto(site(HOST, SUBPAGE))
    const center = bar(page).locator('[data-tab-center]')
    await hydrated(center)
    await center.click()
    await expect(page).toHaveURL(/\/dobierz$/)
    await expect(center).toHaveAttribute('aria-current', 'page')
  })

  test('the bar is not on the desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site(HOST, SUBPAGE))
    await expect(capsule(page).getByRole('navigation', { name: 'Menu główne' })).toBeVisible()
    await expect(bar(page)).toBeHidden()
  })

  test('the bar covers nothing at the end of the page', async ({ page }) => {
    await page.goto(site(HOST, SUBPAGE))
    await expect(bar(page)).toBeVisible()
    // `instant`: Software scrolls smoothly (SWV5), the measure needs the end of the page now.
    await page.evaluate(() =>
      window.scrollTo({ top: document.scrollingElement!.scrollHeight, behavior: 'instant' }),
    )
    // The footer's last content — the legal bar — ends above the fixed bar (the shared spacer).
    const legalBottom = await page
      .locator('[data-legal-bar]')
      .evaluate((row) => row.getBoundingClientRect().bottom)
    const barTop = await bar(page).evaluate((nav) => nav.getBoundingClientRect().top)
    expect(legalBottom).toBeLessThanOrEqual(barTop)
  })
})

test.describe('Software menu sheet', () => {
  test('opens from the bar, keeps focus inside, closes on Esc back to „Menu”', async ({ page }) => {
    await page.goto(site(HOST, SUBPAGE))
    await openMenu(page)
    const sheet = menuSheet(page)

    // A native modal dialog: the page behind is inert, Tab never reaches it.
    for (let i = 0; i < 30; i++) await page.keyboard.press('Tab')
    expect(await sheet.evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true)

    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
    await expect(menuButton(page)).toBeFocused()
  })

  test('the capsule’s Menu opens the same sheet', async ({ page }) => {
    await page.goto(site(HOST, SUBPAGE))
    await clickUntilVisible(capsule(page).getByRole('button', { name: 'Menu' }), menuSheet(page))
    await expect(menuSheet(page).locator('[data-menu-sheet]')).toBeVisible()
  })

  test('a tap on the backdrop closes it', async ({ page }) => {
    await page.goto(site(HOST, SUBPAGE))
    await openMenu(page)
    // Above the sheet (at most 92% of the screen high).
    await page.mouse.click(PHONE.width / 2, 20)
    await expect(menuSheet(page)).toBeHidden()
  })

  test('the line’s pages, contact and the lines; no „Twój projekt” without items', async ({
    page,
  }) => {
    await page.goto(site(HOST, SUBPAGE))
    await openMenu(page)
    const list = sheetList(page)
    // „Aktualności” only with a published post — the seed has none (SWV8 P0 #3).
    await expect(list.getByRole('listitem')).toHaveText([
      /^Oferta/,
      /^Kreator\s*60 s$/,
      /^Darmowy audyt/,
      /^O firmie/,
      /^Kontakt/,
      /^Cennik/,
    ])
    await expect(list.getByRole('link', { name: /^Oferta/ })).toHaveAttribute(
      'href',
      '/rozwiazania',
    )
    await expect(list.getByRole('link', { name: /^Kreator/ })).toHaveAttribute('href', '/dobierz')
    await expect(list.getByRole('link', { name: /^Cennik/ })).toHaveAttribute('href', '/cennik')
    await expect(list.getByRole('link', { name: /^Twój projekt/ })).toHaveCount(0)

    const sheet = menuSheet(page)
    await expect(sheet.getByRole('link', { name: 'Zadzwoń' })).toHaveAttribute('href', /^tel:\+48/)
    await expect(
      sheet.locator('[aria-current="page"]').filter({ hasText: 'Software' }),
    ).toHaveCount(1)

    // A followed link closes the sheet over the new page.
    await list.getByRole('link', { name: /^Cennik/ }).click()
    await expect(page).toHaveURL(/\/cennik$/)
    await expect(sheet).toBeHidden()
  })

  test('„Twój projekt” with its count once the list has items', async ({ page }) => {
    await page.goto(site(HOST, SUBPAGE))
    await setProject(page, TWO)
    await page.reload()
    await openMenu(page)
    const row = sheetList(page).getByRole('link', { name: /^Twój projekt/ })
    await expect(row).toHaveAttribute('href', '/kontakt?projekt=1#formularz')
    await expect(row).toContainText('2')
    // The capsule's „Wycena” carries the count too.
    await expect(cta(page).locator('.cap-count')).toContainText('2')
  })

  test('„Szukaj na stronie” closes the sheet and opens the search window', async ({ page }) => {
    await page.goto(site(HOST, SUBPAGE))
    await openMenu(page)
    await sheetList(page).getByRole('button', { name: 'Szukaj na stronie' }).click()
    await expect(menuSheet(page)).toBeHidden()
    await expect(search(page)).toBeVisible()
    await search(page).getByRole('searchbox').fill('wizytowka')
    await expect(
      search(page)
        .getByRole('link', { name: /Strona wizytówka/ })
        .first(),
    ).toBeVisible()
  })

  // ADR-015 v24 pkt 1: dark without a choice, whatever the system says; the choice is kept.
  test('„Motyw” starts dark, switches the theme and remembers it', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto(site(HOST, SUBPAGE))
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await openMenu(page)
    const group = menuSheet(page).getByRole('group', { name: 'Motyw' })
    await group.getByRole('button', { name: 'Jasny' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await expect(group.getByRole('button', { name: 'Jasny' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })
})

// MOBILE-APLIKACJA §4–§5 (SWR2): the frame under a finger — touch emulation, taps, the sheet's
// pull down and „back”, the browser bar colour and the install manifest.
test.describe('Software frame on a touch screen', () => {
  test.use({ hasTouch: true, isMobile: true })

  test('a pull down on the top of the menu sheet closes it', async ({ page }) => {
    await page.goto(site(HOST, SUBPAGE))
    await hydrated(menuButton(page))
    await menuButton(page).tap()
    const sheet = menuSheet(page)
    await expect(sheet).toBeVisible()
    // The sheet slides up (SWV7): grab its top where it stops, not mid-way.
    await sheet.evaluate((element) =>
      Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished)),
    )
    const heading = (await sheet.getByRole('heading', { name: 'Menu' }).boundingBox())!
    const x = heading.x + heading.width / 2
    const y = heading.y + heading.height / 2
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x, y + 240, { steps: 12 })
    await page.mouse.up()
    await expect(sheet).toBeHidden()
  })

  test('„back” closes the open sheet and keeps the page', async ({ page }) => {
    await page.goto(site(HOST, SUBPAGE))
    await hydrated(menuButton(page))
    await menuButton(page).tap()
    await expect(menuSheet(page)).toBeVisible()
    await page.goBack()
    await expect(menuSheet(page)).toBeHidden()
    await expect(page).toHaveURL(new RegExp(`${SUBPAGE}$`))
  })

  test('a sheet closed with × leaves no extra history entry', async ({ page }) => {
    await page.goto(site(HOST, '/rozwiazania'))
    await page.goto(site(HOST, SUBPAGE))
    await hydrated(menuButton(page))
    await menuButton(page).tap()
    await menuSheet(page).getByRole('button', { name: 'Zamknij' }).tap()
    await expect(menuSheet(page)).toBeHidden()
    await page.goBack()
    await expect(page).toHaveURL(/\/rozwiazania$/)
  })

  test('taps answer at once: no tap highlight, no double-tap delay', async ({ page }) => {
    await page.goto(site(HOST, SUBPAGE))
    const kreator = bar(page).locator('[data-tab-center]')
    expect(await kreator.evaluate((el) => getComputedStyle(el).touchAction)).toBe('manipulation')
  })

  test('a chosen theme colours the browser bar for both system schemes', async ({ page }) => {
    await setTheme(page, 'light')
    await page.goto(site(HOST, SUBPAGE))
    await expect(page.locator('meta[name="theme-color"]')).toHaveCount(2)
    // `useThemeColor`: a theme chosen by hand wins over the system scheme of each meta.
    for (const scheme of ['light', 'dark']) {
      await expect(page.locator(`meta[name="theme-color"][media*="${scheme}"]`)).toHaveAttribute(
        'content',
        '#f4f5f1',
      )
    }
  })

  // `useThemeColor('software')` in the frame's `PhoneSignals` (MOBILE-APLIKACJA §5).
  test('the browser bar follows a theme chosen in the menu', async ({ page }) => {
    await setTheme(page, 'light')
    await page.goto(site(HOST, SUBPAGE))
    await hydrated(menuButton(page))
    await menuButton(page).tap()
    await menuSheet(page)
      .getByRole('group', { name: 'Motyw' })
      .getByRole('button', { name: 'Ciemny' })
      .tap()
    await expect(page.locator('meta[name="theme-color"][media*="light"]')).toHaveAttribute(
      'content',
      '#0b0d0c',
    )
  })

  test('the site can be installed: manifest with the Software icons', async ({ page }) => {
    // From the page: Node does not resolve *.localhost on every system (playwright.config.ts).
    await page.goto(site(HOST, SUBPAGE))
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
      'href',
      '/manifest.webmanifest',
    )
    const manifest = await page.evaluate(async () => {
      const response = await fetch('/manifest.webmanifest')
      return { status: response.status, body: (await response.json()) as unknown }
    })
    expect(manifest.status).toBe(200)
    expect(manifest.body).toMatchObject({
      short_name: 'Software',
      display: 'standalone',
      icons: expect.arrayContaining([
        expect.objectContaining({ src: '/brand/prokom-software_icon-192.png' }),
      ]),
    })
  })
})

test.describe('Software phone layout', () => {
  for (const width of [414, 390, 360]) {
    test(`no horizontal scroll, touch targets ≥ 44 px at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto(site(HOST, SUBPAGE))
      await setProject(page, TWO)
      await page.reload()
      await expect(cta(page).locator('.cap-count')).toBeVisible()
      expect(await pageWidth(page)).toBe(width)

      const sizes = await bar(page)
        .locator(':scope > :is(a, button)')
        .evaluateAll((items) =>
          items.map((item) => {
            const box = item.getBoundingClientRect()
            return { w: box.width, h: box.height }
          }),
        )
      expect(sizes).toHaveLength(5)
      for (const { w, h } of sizes) expect(Math.min(w, h)).toBeGreaterThanOrEqual(44)

      await openMenu(page)
      // The line's rows of the sheet (the shared part below has its own tests, wspolne-stopka).
      const small = await sheetList(page)
        .locator('a, button')
        .evaluateAll((elements) =>
          elements
            .map((el) => ({ el: el.textContent?.trim(), box: el.getBoundingClientRect() }))
            .filter(({ box }) => box.height < 44 || box.right > window.innerWidth + 0.5)
            .map(({ el }) => el),
        )
      expect(small).toEqual([])
    })
  }

  for (const path of ['/', '/rozwiazania', '/cennik']) {
    test(`no horizontal scroll on ${path} at 360 px`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 })
      await page.goto(site(HOST, path))
      expect(await pageWidth(page)).toBeLessThanOrEqual(360)
    })
  }
})

test.describe('Software phone accessibility', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`no axe violations with the open sheet (${colorScheme})`, async ({ page }) => {
      await setTheme(page, colorScheme)
      await page.goto(site(HOST, SUBPAGE))
      await setProject(page, TWO)
      await page.reload()
      await expect(cta(page).locator('.cap-count')).toBeVisible()
      expect((await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations).toEqual([])

      await openMenu(page)
      expect((await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations).toEqual([])
    })
  }
})
