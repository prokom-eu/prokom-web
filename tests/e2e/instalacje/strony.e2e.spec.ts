import { expect, type Page, test } from '@playwright/test'

import { site } from '../helpers'

// Every finished page of the Instalacje line (plan przyspieszenia §2 p. 3): the checks of spec §10
// and MOBILE-APLIKACJA §10 that hold for any page. A session adds its pages to PAGES — nothing
// else; page-specific behaviour stays in the page's own spec. Data from `pnpm seed`.
const HOST = 'instalacje.localhost'

const PAGES = [
  '/',
  '/anteny',
  '/monitoring',
  '/alarmy',
  '/kontrola-dostepu',
  '/sieci-wifi',
  '/teletechnika',
  '/smart-home',
  '/naglosnienie',
  '/ekrany',
  '/ladowarki-ev',
  // „Dla kogo” (I10).
  ...[
    'dom',
    'apartamenty',
    'pensjonaty',
    'hotele',
    'restauracje',
    'sklepy',
    'firmy',
    'koscioly',
    'szkoly',
    'gminy',
    'deweloperzy',
    'budowy',
  ].map((slug) => `/dla-kogo/${slug}`),
  // Formularze (I11).
  '/zaplanuj',
  '/kontakt',
  '/serwis',
]

// Known exceptions, each with its open question in docs/stan/STAN-instalacje.md.
// TODO(krystian): the home title has 66 characters (SEO §2.2: ≤ 65) — shorten it in the panel.
const LONG_TITLE_OK = new Set(['/'])

async function open(page: Page, path: string) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const response = await page.goto(site(HOST, path))
  expect(response?.status(), path).toBe(200)
}

for (const path of PAGES) {
  test.describe(`Instalacje page ${path}`, () => {
    test('one h1, SEO limits, no placeholders or source lists', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 1000 })
      await open(page, path)
      await expect(page.locator('h1')).toHaveCount(1)
      const title = await page.title()
      if (!LONG_TITLE_OK.has(path)) expect(title.length, title).toBeLessThanOrEqual(65)
      const description = await page.locator('meta[name="description"]').getAttribute('content')
      expect(description?.length ?? 0, 'description').toBeGreaterThan(50)
      expect(description?.length ?? 0, 'description').toBeLessThanOrEqual(155)
      const text = await page.locator('main').innerText()
      // „[SZEF: …]”, „[CENA]”, „[TELEFON]” of the prototype must never reach a page (spec §10).
      expect(text).not.toMatch(/\[[A-ZĄĆĘŁŃÓŚŹŻ][A-ZĄĆĘŁŃÓŚŹŻ ]{2,}[:\]]/)
      // No lists of sources on the page (spec §2): a line that is only the heading „Źródła”.
      // Sentences may start with the word (Nagłośnienie: „Źródła trafiają do miksera…”,
      // „Źródła muzyki”, „Źródła i mikrofony” — sound sources, not references).
      expect(text).not.toMatch(/^\s*Źródła\s*:?\s*$/m)
      const jsonLd = await page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((els) => els.map((e) => e.textContent ?? ''))
      for (const block of jsonLd) expect(() => JSON.parse(block)).not.toThrow()
    })

    for (const width of [360, 390, 414]) {
      test(`no horizontal scroll at ${width} px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 })
        await open(page, path)
        // Scroll the whole page once: lazy and revealed parts are laid out too.
        await page.evaluate(async () => {
          for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
            window.scrollTo(0, y)
            await new Promise((r) => setTimeout(r, 30))
          }
        })
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
      })
    }

    test('buttons are touch targets of at least 40 px on a phone', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await open(page, path)
      const small = await page
        .locator('main :is(button, a.btn, [role="tab"]):visible')
        .evaluateAll((els) =>
          els
            .map((el) => ({
              text: (el.textContent ?? '').trim().slice(0, 30),
              h: el.getBoundingClientRect().height,
            }))
            .filter(({ h }) => h > 0 && h < 40),
        )
      expect(small).toEqual([])
    })
  })
}

// Routes of the line (`(instalacje)`): only on its own domain, only for a known object (I10).
test.describe('Instalacje line routes', () => {
  test('an object page is a 404 on another line and for an unknown object', async ({ page }) => {
    for (const url of [
      site('biznes.localhost', '/dla-kogo/dom'),
      site('software.localhost', '/dla-kogo/dom'),
      site(HOST, '/dla-kogo/nie-ma-takiego'),
    ]) {
      const response = await page.goto(url)
      expect(response?.status(), url).toBe(404)
    }
  })
})
