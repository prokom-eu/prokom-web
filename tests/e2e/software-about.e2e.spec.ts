import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { setTheme, site } from './helpers'

// SWA5b: `/o-firmie` of the Software line on the shared O firmie template (spec §6.2,
// ZMIANY-v24 §9.2): texts from `SiteSettings.shared.about` (`src/seed/shared/software.ts`), the
// line's own sections in the `afterRules` slot (comparison, technical section). `/jedna-firma`
// is gone: 301 → `/o-firmie#linie`. Data from `pnpm seed`.
const HOST = 'software.localhost'
const CEIDG = 'https://www.biznes.gov.pl/pl/wyszukiwarka-firm'

const about = (page: Page) => page.locator('[data-about-page]')

test.describe('Software /o-firmie (shared template)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('hero, company card with CEIDG, stats without a badge', async ({ page }) => {
    const response = await page.goto(site(HOST, '/o-firmie'))
    expect(response?.status()).toBe(200)
    await expect(page.locator('main h1')).toHaveCount(1)
    await expect(about(page).getByRole('heading', { level: 1 })).toHaveText(
      'Nie agencja z open space’u. Firma z Rabki, od 2004 r.',
    )
    await expect(about(page)).toContainText('PRO-KOM Software to linia firmy')
    await expect(about(page).locator('a[href^="tel:"]').first()).toHaveText('883 200 151')

    const card = about(page).locator('[data-company-card]')
    await expect(card).toContainText('NIP')
    await expect(card).toContainText('7352511447')
    await expect(card).toContainText('kontakt@prokomsoftware.pl')
    await expect(card).toContainText('Na czym budujemy')
    for (const badge of ['Next.js', 'Django', 'Serwer w Polsce']) {
      await expect(card.getByRole('listitem').filter({ hasText: badge })).toHaveCount(1)
    }
    await expect(card.getByRole('link', { name: /Dane sprawdzisz w CEIDG/ })).toHaveAttribute(
      'href',
      CEIDG,
    )

    // „2004”, the line's two numbers, the lines count. „100+” is confirmed — no flag badge.
    const stats = about(page).locator('[data-stats-strip] li')
    await expect(stats.first()).toContainText('2004')
    await expect(stats.nth(1)).toContainText('100+')
    await expect(stats.nth(2)).toContainText('gotowych szablonów')
    await expect(about(page).locator('[data-stat-flag]')).toHaveCount(0)
  })

  test('rules, slots (comparison + technical section), steps, lines, verify, visit', async ({
    page,
  }) => {
    await page.goto(site(HOST, '/o-firmie'))
    await expect(about(page).getByRole('heading', { name: 'Dlaczego PRO-KOM' })).toBeVisible()
    await expect(page.locator('#dlaczego')).toContainText('Kod i dostępy są Twoje')
    await expect(page.locator('#dlaczego')).toContainText('Mówimy wprost, gdy coś się nie opłaca.')

    // `afterRules`: the comparison and the technical section, in that order, before the steps.
    const compare = page.locator('#porownanie')
    const tech = page.locator('#technologia')
    await expect(compare.getByRole('heading', { level: 2 })).toHaveText(
      'Freelancer, agencja czy PRO-KOM?',
    )
    await expect(tech).toContainText('Nie składamy stron z szablonu')
    const order = await page.evaluate(() =>
      ['#dlaczego', '#porownanie', '#technologia', '#wspolpraca', '#linie', '#sprawdz', '#wizyta']
        .map((selector) => document.querySelector(selector))
        .map((element) => (element ? element.getBoundingClientRect().top + window.scrollY : -1)),
    )
    expect(order.every((top) => top >= 0)).toBe(true)
    expect([...order].sort((a, b) => a - b)).toEqual(order)

    const steps = page.locator('#wspolpraca')
    await expect(steps.getByRole('heading', { level: 2 })).toHaveText(
      'Jak to wygląda krok po kroku',
    )
    for (const step of ['Rozmowa', 'Podgląd i wycena', 'Budowa', 'Start i opieka']) {
      await expect(steps).toContainText(step)
    }

    // The lines (the former `/jedna-firma`): Software is the current one, the others link out.
    const lines = page.locator('#linie')
    await expect(lines.getByRole('heading', { level: 2 })).toHaveText(/lini/)
    await expect(lines.locator('[data-family-line="software"]')).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(lines.locator('[data-family-line="software"]')).toContainText('Jesteś tutaj')
    await expect(lines.locator('[data-family-line="biznes"]')).toHaveAttribute(
      'href',
      'https://prokombiznes.pl',
    )

    const verify = page.locator('#sprawdz')
    await expect(verify.getByRole('heading', { level: 2 })).toHaveText(
      'Nie musisz wierzyć nam na słowo',
    )
    const cards = verify.locator('[data-verify-cards] > li')
    await expect(cards).toHaveCount(4)
    await expect(cards.nth(0).getByRole('link')).toHaveAttribute('href', CEIDG)
    await expect(cards.nth(1).getByRole('link')).toHaveAttribute('href', '/#podglady')
    await expect(cards.nth(2).getByRole('link')).toHaveAttribute('href', '/audyt')
    // „Opinie Google” has no address yet: a plain card.
    await expect(cards.nth(3)).toContainText('Opinie Google')
    await expect(cards.nth(3).getByRole('link')).toHaveCount(0)

    const visit = page.locator('#wizyta')
    await expect(visit.getByRole('heading', { level: 2 })).toHaveText(
      /^Wpadnij do nas — .*Orkana 16B, Rabka-Zdrój\.$/,
    )
    await expect(visit).toContainText('Pokażemy podglądy na dużym ekranie')
    await expect(visit.getByRole('link', { name: 'Kontakt', exact: true })).toHaveAttribute(
      'href',
      '/kontakt',
    )

    // No people, no photos (rule 01.11); the old v23 sections are gone. The address map of the
    // visit section is named after the company („Mapa: PRO-KOM Tadeusz Wójciak, …”): not a photo.
    await expect(
      page
        .locator('main')
        .getByRole('img', { name: /^(?!Mapa:)[\s\S]*(Krystian|Tadeusz|Wejście do PRO-KOM)/ }),
    ).toHaveCount(0)
    await expect(page.locator('main')).not.toContainText('Kto z Tobą pracuje')
    await expect(page.locator('main')).not.toContainText(/Zakopan/i)
    // The template has no closing CTA of its own: the „Zacznij od podglądu” band closes the page.
    await expect(page.locator('section[data-footer-cta]')).toBeVisible()
  })

  test('comparison switches the rival column', async ({ page }) => {
    await page.goto(site(HOST, '/o-firmie'))
    const section = page.locator('#porownanie')
    const table = section.getByRole('table')
    await expect(table).toContainText('rzadko, zwykle po zaliczce')
    const city = section.getByRole('button', { name: 'vs agencja z miasta' })
    await expect(async () => {
      // A click before hydration is lost — repeat until the pill is pressed.
      await city.click()
      await expect(city).toHaveAttribute('aria-pressed', 'true', { timeout: 1000 })
    }).toPass()
    await expect(table).toContainText('makiety, zwykle płatne')
    await expect(table).not.toContainText('rzadko, zwykle po zaliczce')
  })

  test('breadcrumbs JSON-LD of the template', async ({ page }) => {
    await page.goto(site(HOST, '/o-firmie'))
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join()
    expect(ld).toContain('"BreadcrumbList"')
  })

  for (const theme of ['light', 'dark'] as const) {
    test(`axe on the page (${theme})`, async ({ page }) => {
      await setTheme(page, theme, { reducedMotion: 'reduce' })
      await page.goto(site(HOST, '/o-firmie'))
      const { violations } = await new AxeBuilder({ page })
        .include('[data-about-page]')
        .exclude('[data-mockup]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(
        violations.map((v) => ({ rule: v.id, targets: v.nodes.map((n) => n.target) })),
      ).toEqual([])
    })
  }
})

test.describe('Software /jedna-firma', () => {
  test('answers 301 to /o-firmie#linie', async ({ page }) => {
    const redirected: { status: number; location: string | null }[] = []
    page.on('response', (response) => {
      if (response.url() === site(HOST, '/jedna-firma')) {
        redirected.push({ status: response.status(), location: response.headers()['location'] })
      }
    })
    await page.goto(site(HOST, '/jedna-firma'))
    // Chromium may add its own internal 307 hop before the request; ours is the 301.
    expect(redirected).toContainEqual({ status: 301, location: site(HOST, '/o-firmie#linie') })
    await expect(page).toHaveURL(site(HOST, '/o-firmie#linie'))
    await expect(page.locator('#linie')).toBeVisible()
  })
})

test.describe('Software /o-firmie on the phone', () => {
  for (const width of [360, 390]) {
    test(`fits ${width} px without sideways scroll`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await page.goto(site(HOST, '/o-firmie'))
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }

  test('comparison as cards on the phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(site(HOST, '/o-firmie'))
    const section = page.locator('#porownanie')
    await expect(section.getByRole('table')).toBeHidden()
    await expect(section.getByRole('listitem')).toHaveCount(6)
  })
})
