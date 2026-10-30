import { expect, type Page, test } from '@playwright/test'

import { site } from '../helpers'

// I4: the first full service page (spec §5.2, KOMPONENTY §2/§4, SEO §2.3, MOBILE-APLIKACJA §10).
// Data from `pnpm seed` (`seed:instalacje` publishes the `anteny` page with its block); prices
// are off in the seed (spec §2).
const HOST = 'instalacje.localhost'
const DESKTOP = { width: 1440, height: 1000 }
const PHONE = { width: 390, height: 844 }
const SECTIONS = [
  'hero',
  'co-robimy',
  'gory',
  'multipleksy',
  'filtr-5g',
  'satelita',
  'pensjonat-tv',
  'odbior',
  'pakiety',
  'cena',
  'faq',
  'powiazane',
]

const open = (page: Page) => page.goto(site(HOST, '/anteny'))

/** `@type` of every JSON-LD block of the page (parse errors fail the test). */
async function jsonLdTypes(page: Page): Promise<string[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
  return blocks.flatMap((text) => {
    const data = JSON.parse(text) as { '@type'?: string; '@graph'?: { '@type': string }[] }
    return data['@graph'] ? data['@graph'].map((item) => item['@type']) : [data['@type'] ?? '']
  })
}

test.describe('Anteny page', () => {
  test.use({ viewport: DESKTOP })

  test('one h1, the sections of the pattern in order, SEO and structured data', async ({
    page,
  }) => {
    const response = await open(page)
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toContainText('Antena ustawiona miernikiem, nie na oko.')
    const ids = await page
      .locator('main section[id]')
      .evaluateAll((sections) => sections.map((section) => section.id))
    expect(ids).toEqual(SECTIONS)

    const title = await page.title()
    expect(title).toBe('Anteny satelitarne i DVB-T2 na Podhalu | PRO-KOM Instalacje')
    expect(title.length).toBeLessThanOrEqual(65)
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description?.length ?? 0).toBeGreaterThan(50)
    expect(description?.length ?? 999).toBeLessThanOrEqual(155)
    expect(await jsonLdTypes(page)).toEqual(
      expect.arrayContaining(['Service', 'BreadcrumbList', 'FAQPage']),
    )
  })

  test('no prices while they are off, no package markers anywhere (spec §2)', async ({ page }) => {
    await open(page)
    await expect(page.locator('#pakiety .prc')).toHaveText(
      Array(3).fill('Wycena po wizji lokalnej'),
    )
    const html = await page.content()
    expect(html).not.toMatch(/\[(CENA|TELEFON|E-MAIL|WHATSAPP|ADRES[^\]]*)\]/)
    // No „od … zł” in the packages (a fee like the TV licence elsewhere is not a price of ours).
    await expect(page.locator('#pakiety')).not.toContainText('zł')
  })

  test('the CTA band carries the service texts, the frame band hides', async ({ page }) => {
    await open(page)
    const bands = page.locator('.cta:visible')
    await expect(bands).toHaveCount(1)
    await expect(bands).toContainText('Obraz się rwie albo budujesz dom?')
  })

  test('the aiming simulator locks with the installer button', async ({ page }) => {
    await open(page)
    const widget = page.getByRole('region', { name: 'Symulator ustawiania anteny' })
    await widget.getByRole('button', { name: 'Ustaw jak instalator' }).click()
    await expect(widget.locator('.anlock')).toHaveText('LOCK')
    await expect(widget.locator('[aria-live]')).toContainText('Złapane: Hot Bird 13°E')

    await widget.getByRole('button', { name: 'Naziemna DVB-T2' }).click()
    await expect(widget.getByRole('button', { name: 'Naziemna DVB-T2' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    const mast = widget.getByRole('button', { name: 'Wyższy maszt' })
    await expect(mast).toHaveAttribute('aria-pressed', 'false')
    await widget.getByRole('button', { name: 'Ustaw jak instalator' }).click()
    await expect(mast).toHaveAttribute('aria-pressed', 'true')
    await expect(widget.locator('.anlock')).toHaveText('LOCK')
  })

  test('the TV quiz answers from the reception test', async ({ page }) => {
    await open(page)
    const quiz = page.locator('#multipleksy')
    const answer = quiz.getByRole('button', { name: 'Tak, obraz i dźwięk' })
    await answer.click()
    await expect(answer).toHaveAttribute('aria-pressed', 'true')
    await expect(quiz.locator('.tvres[aria-live]')).toContainText(
      'Telewizor jest gotowy na DVB-T2/HEVC',
    )
  })

  test('the LTE/5G filter switch changes the spectrum', async ({ page }) => {
    await open(page)
    const section = page.locator('#filtr-5g')
    const toggle = section.getByRole('button', { name: 'Bez filtra' })
    await toggle.click()
    await expect(section.getByRole('button', { name: 'Filtr LTE/5G włączony' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(section.locator('.spec')).toHaveClass(/\bf\b/)
  })

  test('related services and objects link to their pages', async ({ page }) => {
    await open(page)
    const related = page.locator('#powiazane')
    await expect(related.locator('.relc')).toHaveCount(3)
    await expect(related.getByRole('link', { name: /Sieci i Wi-Fi/ })).toHaveAttribute(
      'href',
      '/sieci-wifi',
    )
    await expect(related.locator('.relsegc').first()).toHaveAttribute(
      'href',
      /^\/dla-kogo\/[a-z-]+$/,
    )
  })

  test('the page is not on another line', async ({ page }) => {
    const response = await page.goto(site('biznes.localhost', '/anteny'))
    expect(response?.status()).toBe(404)
  })
})

test.describe('Anteny page on a phone', () => {
  test.use({ viewport: PHONE })

  for (const width of [360, 390, 414]) {
    test(`no horizontal scroll at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await open(page)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      )
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }

  test('a folded section stays in the HTML and opens with its button', async ({ page }) => {
    await open(page)
    const section = page.locator('#gory')
    await expect(section).toHaveAttribute('data-fo', '0')
    await expect(section).toContainText('Burze')
    const button = section.getByRole('button', { name: 'Pokaż całą sekcję' })
    const box = await button.boundingBox()
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
    await button.click()
    await expect(section).toHaveAttribute('data-fo', '1')
    await expect(section.getByRole('button', { name: 'Zwiń sekcję' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  test('quiz answers are touch targets of at least 44 px', async ({ page }) => {
    await open(page)
    const heights = await page
      .locator('#multipleksy .zksg')
      .evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().height))
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(44)
  })

  test('the anchor bar leaves no gap when the header hides (MOBILE-APLIKACJA §10)', async ({
    page,
  }) => {
    await open(page)
    const bar = page.getByRole('navigation', { name: 'Sekcje strony' })
    const scrollTo = (y: number) => page.evaluate((top) => window.scrollTo({ top }), y)
    // Retried until the page is hydrated (before that nothing listens to the scroll).
    await expect(async () => {
      await scrollTo(0)
      for (const y of [1600, 1800, 2000, 2200]) {
        await scrollTo(y)
        await page.waitForTimeout(50)
      }
      await expect(page.locator('html')).toHaveAttribute('data-hdr-hidden', '', { timeout: 500 })
    }).toPass()
    await expect(async () => {
      const box = await bar.boundingBox()
      expect(box?.y ?? 99).toBeLessThanOrEqual(1)
    }).toPass()
  })
})
