import { expect, type Page, test } from '@playwright/test'

import { LAW_WORDS } from '../../../src/lib/instalacje/lawWords'
import { site } from '../helpers'
import { INST_HOST, INST_PAGES } from './pages'

// Every page of the Instalacje line (`pages.ts`): the checks of spec §10 that hold for any page.
// Phone checks (360/390/414, touch targets, header, bottom bar): telefon.e2e.spec.ts (I14).
// Page-specific behaviour stays in the page's own spec. Data from `pnpm seed`.
const HOST = INST_HOST
const PAGES = INST_PAGES

// „[SZEF: …]”, „[CENA]”, „[TELEFON]” — notes of the prototype for the owner.
const FORBIDDEN =
  /WhatsApp|wa\.me|W przygotowaniu|[Ww]yślij zdjęci|[Pp]rześlij rzuty|możesz wysłać wcześniej|[Zz]rób zdjęcie|wystarczą zdjęcia|dane przykładowe|przykładowe dane/
// Runda v6 §1.1: no law on the pages. The legal pages are the firm's own duty, not content about
// law; the camera post keeps its old text until INST-6 PR5 rewrites it (decision D1).
// TODO(krystian): drop „/poradnik/monitoring-a-rodo” here once INST-6 PR5 is merged.
const LAW_EXEMPT = new Set([
  '/polityka-prywatnosci',
  '/cookies',
  '/dostepnosc',
  '/poradnik/monitoring-a-rodo',
])
const LAW_ALL = new RegExp(LAW_WORDS.source, 'gu')
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
      // P3-23 (audit 06.11): every title with the site name fits 60 characters.
      expect(title.length, title).toBeLessThanOrEqual(60)
      const description = await page.locator('meta[name="description"]').getAttribute('content')
      expect(description?.length ?? 0, 'description').toBeGreaterThan(50)
      expect(description?.length ?? 0, 'description').toBeLessThanOrEqual(155)
      const text = await page.locator('main').innerText()
      // „[SZEF: …]”, „[CENA]”, „[TELEFON]” of the prototype must never reach a page (spec §10).
      // `textContent`, not `innerText`: closed FAQ answers (`<details>`) and folded sections are
      // in the HTML but not in `innerText` (audit before staging, P1 2).
      const allText = await page.locator('main').evaluate((main) => main.textContent ?? '')
      expect(allText).not.toMatch(PLACEHOLDER)
      // Content rules (audit 06.11 P0, decisions 01.11): no WhatsApp, nothing „in preparation”,
      // no promise of sending photos or plans (no form takes files), no sample-data notes.
      expect(allText).not.toMatch(FORBIDDEN)
      expect(description ?? '').not.toMatch(FORBIDDEN)
      if (!LAW_EXEMPT.has(path)) {
        expect(allText.match(LAW_ALL) ?? [], 'law on the page').toEqual([])
        expect(`${title} ${description ?? ''}`).not.toMatch(LAW_WORDS)
        expect(allText).not.toMatch(/sekcji (przepisów|„Przepisy”)/)
      }
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

  // Audit before staging, P2 5: own title and the ways on, inside the line's frame.
  test('a missing page has its title and links to the main pages', async ({ page }) => {
    const response = await page.goto(site(HOST, '/nie-ma-takiej-strony'))
    expect(response?.status()).toBe(404)
    await expect(page).toHaveTitle(/^Nie znaleziono strony/)
    await expect(page.locator('h1')).toHaveCount(1)
    const links = page.locator('[data-not-found] a')
    for (const href of [
      '/uslugi',
      '/#dla-kogo',
      '/realizacje',
      '/zaplanuj',
      '/kontakt',
      '/poradnik',
    ]) {
      await expect(links.and(page.locator(`[href="${href}"]`))).toHaveCount(1)
    }
    // RUNDA-V5 §11: a search of the offer — a GET form that lands on `/uslugi?q=`.
    const search = page.locator('[data-not-found]').getByRole('searchbox', {
      name: 'Szukaj w ofercie',
    })
    await search.fill('kamera')
    await search.press('Enter')
    await expect(page).toHaveURL(/\/uslugi\?q=kamera$/)
    await expect(page.getByRole('searchbox', { name: 'Szukaj w ofercie' })).toHaveValue('kamera')
  })
})

// I13: the footer's legal links and `llms.txt` (SEO §2.4).
// Runda v6 §1.2: realizations only on `/realizacje` and the home page; related services show the
// scene of their home card (RUNDA-V5 §11).
test.describe('Instalacje service pages, round v5', () => {
  test('service and object pages have no realizations, related cards have scenes', async ({
    page,
  }) => {
    for (const path of [
      '/sieci-wifi',
      '/ekrany',
      '/naglosnienie',
      '/teletechnika',
      '/dla-kogo/pensjonaty',
      '/dla-architektow',
    ]) {
      await open(page, path)
      await expect(page.locator('main .rl, main .rlstrip'), path).toHaveCount(0)
      await expect(page.locator('#realizacje-n, #realizacja-t, #realizacje-s'), path).toHaveCount(0)
    }
    await open(page, '/sieci-wifi')
    await expect(page.locator('#powiazane .relsc svg').first()).toBeVisible()
    // Runda v6 §1.7.1: the scenes have their colours on service and object pages (not black).
    for (const path of ['/monitoring', '/dla-kogo/budowy']) {
      await open(page, path)
      const fill = await page
        .locator('#powiazane svg rect')
        .first()
        .evaluate((rect) => getComputedStyle(rect).fill)
      expect(fill, path).not.toBe('rgb(0, 0, 0)')
    }
  })
})

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
