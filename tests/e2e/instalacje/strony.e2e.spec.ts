import { expect, type Page, test } from '@playwright/test'

import { site } from '../helpers'
import { INST_HOST, INST_PAGES } from './pages'

// Every page of the Instalacje line (`pages.ts`): the checks of spec §10 that hold for any page.
// Phone checks (360/390/414, touch targets, header, bottom bar): telefon.e2e.spec.ts (I14).
// Page-specific behaviour stays in the page's own spec. Data from `pnpm seed`.
const HOST = INST_HOST
const PAGES = INST_PAGES

// Known exceptions, each with its open question in docs/stan/STAN-instalacje.md.
// TODO(krystian): the home title has 66 characters (SEO §2.2: ≤ 65) — shorten it in the panel.
const LONG_TITLE_OK = new Set(['/'])

// „[SZEF: …]”, „[CENA]”, „[TELEFON]” — notes of the prototype for the owner.
const PLACEHOLDER = /\[[A-ZĄĆĘŁŃÓŚŹŻ][A-ZĄĆĘŁŃÓŚŹŻ ]{2,}[:\]]/

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
      // `textContent`, not `innerText`: closed FAQ answers (`<details>`) and folded sections are
      // in the HTML but not in `innerText` (audit before staging, P1 2).
      const allText = await page.locator('main').evaluate((main) => main.textContent ?? '')
      expect(allText).not.toMatch(PLACEHOLDER)
      // No lists of sources on the page (spec §2): a line that is only the heading „Źródła”.
      // Sentences may start with the word (Nagłośnienie: „Źródła trafiają do miksera…”,
      // „Źródła muzyki”, „Źródła i mikrofony” — sound sources, not references).
      expect(text).not.toMatch(/^\s*Źródła\s*:?\s*$/m)
      const jsonLd = await page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((els) => els.map((e) => e.textContent ?? ''))
      for (const block of jsonLd) {
        expect(() => JSON.parse(block)).not.toThrow()
        // Google reads structured data too (FAQPage answers).
        expect(block).not.toMatch(PLACEHOLDER)
      }
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

// I13: the footer's legal links and `llms.txt` (SEO §2.4).
test.describe('Instalacje legal links and llms.txt', () => {
  test('the footer links the three legal pages', async ({ page }) => {
    await open(page, '/')
    const footer = page.locator('footer')
    for (const href of ['/polityka-prywatnosci', '/cookies', '/dostepnosc']) {
      await expect(footer.locator(`a[href="${href}"]`).first()).toBeVisible()
    }
  })

  test('llms.txt lists the services and the contact, only on the Instalacje domain', async ({
    request,
  }) => {
    const response = await request.get(site(HOST, '/llms.txt'))
    expect(response.status()).toBe(200)
    const text = await response.text()
    expect(text.startsWith('# PRO-KOM Instalacje')).toBe(true)
    expect(text).toContain('/monitoring')
    expect(text).not.toMatch(/\[SZEF|\d+\s?zł/)
    expect((await request.get(site('biznes.localhost', '/llms.txt'))).status()).toBe(404)
  })
})
