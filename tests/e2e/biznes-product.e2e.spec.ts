import AxeBuilder from '@axe-core/playwright'
import { expect, test, type APIRequestContext, type Page } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../src/lib/inquiry/spam'
import { api, loginAsAdmin, site, tenantId } from './helpers'

// Product page 2.0 `/produkt/[slug]` (spec. §6.2, K31-ZMIANY §4, §7, §13.5, §13.7; K31b).
// Catalog from `pnpm seed`.
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const ERGO = '/produkt/posnet-ergo-online'
const THINKBOOK = '/produkt/lenovo-thinkbook-14-g8-g9'
const MAILPIT = 'http://localhost:8025/api/v1'

type JsonLd = { '@type'?: string; [key: string]: unknown }

async function jsonLd(page: Page): Promise<JsonLd[]> {
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents()
  return scripts.map((text) => JSON.parse(text) as JsonLd)
}

/** The first „Dodaj do zapytania” of the page (hero), once the page is hydrated. */
async function addToInquiry(page: Page, name: string) {
  const add = page.getByRole('button', { name: `Dodaj do zapytania: ${name}` }).first()
  await expect(async () => {
    await add.click({ timeout: 1000 })
    await expect(
      page.getByRole('button', { name: `Na liście zapytania: ${name} — usuń` }).first(),
    ).toBeVisible({ timeout: 1000 })
  }).toPass()
}

async function mailText(request: APIRequestContext, query: string): Promise<string> {
  const search = await request.get(`${MAILPIT}/search`, { params: { query } })
  const [message] = ((await search.json()) as { messages: { ID: string }[] }).messages
  if (!message) return ''
  const full = await request.get(`${MAILPIT}/message/${message.ID}`)
  return ((await full.json()) as { Text: string }).Text
}

test.describe('Biznes product page 2.0', () => {
  test('hero, breadcrumbs, canonical and JSON-LD: ProductGroup, FAQPage, VideoObject, no offers', async ({
    page,
  }) => {
    const response = await page.goto(site('biznes.localhost', ERGO))
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Posnet Ergo Online')
    const crumbs = page.getByRole('navigation', { name: 'Okruszki' })
    await expect(crumbs.getByRole('link', { name: 'Kasy fiskalne' })).toHaveAttribute(
      'href',
      '/oferta/kasy-fiskalne',
    )
    // One canonical per card: `?wersja=` only picks the configurator.
    await page.goto(site('biznes.localhost', `${ERGO}?wersja=x`))
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      site('biznes.localhost', ERGO),
    )

    const data = await jsonLd(page)
    const group = data.find((item) => item['@type'] === 'ProductGroup')
    expect(group).toMatchObject({
      name: 'Posnet Ergo Online',
      brand: { '@type': 'Brand', name: 'Posnet' },
      url: site('biznes.localhost', ERGO),
    })
    const variants = group?.hasVariant as { url: string }[]
    expect(variants.length).toBeGreaterThanOrEqual(2)
    for (const variant of variants) expect(variant.url).toContain(`${ERGO}?wersja=`)
    expect(JSON.stringify(data)).not.toMatch(/offers|"price/i)
    expect(data.find((item) => item['@type'] === 'FAQPage')).toBeDefined()
    expect(data.find((item) => item['@type'] === 'VideoObject')).toMatchObject({
      embedUrl: expect.stringMatching(/^https:\/\/www\.youtube-nocookie\.com\/embed\//),
    })
    const breadcrumbs = data.find((item) => item['@type'] === 'BreadcrumbList')
    expect(breadcrumbs?.itemListElement).toEqual([
      expect.objectContaining({ position: 1, item: site('biznes.localhost', '/') }),
      expect.objectContaining({ position: 2, item: site('biznes.localhost', '/oferta') }),
      expect.objectContaining({
        position: 3,
        name: 'Kasy fiskalne',
        item: site('biznes.localhost', '/oferta/kasy-fiskalne'),
      }),
      expect.objectContaining({ position: 4, item: site('biznes.localhost', ERGO) }),
    ])
  })

  test('the section bar lists only existing sections; photos switch; the add updates the counter', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost', ERGO))
    const bar = page.getByRole('navigation', { name: 'Sekcje produktu' })
    await expect(bar.getByRole('link')).toContainText(['Przegląd', 'Opis', 'Wybierz wersję'])
    for (const link of await bar.getByRole('link').all()) {
      const id = (await link.getAttribute('href'))!.slice(1)
      await expect(page.locator(`[id="${id}"]`), id).toHaveCount(1)
    }

    const thumbs = page.getByRole('list', { name: 'Zdjęcia' }).getByRole('button')
    await expect(thumbs.first()).toHaveAttribute('aria-pressed', 'true')
    await thumbs.nth(1).click()
    await expect(thumbs.nth(1)).toHaveAttribute('aria-pressed', 'true')

    await addToInquiry(page, 'Posnet Ergo Online')
    await expect(
      page.getByRole('banner').getByRole('button', { name: /^Zapytanie/ }),
    ).toHaveAccessibleName('Zapytanie 1 pozycja')
  })

  test('every photo is reachable on a desktop: arrows and the „+N” thumbnail', async ({ page }) => {
    await page.goto(site('biznes.localhost', THINKBOOK))
    const counter = page.getByText(/^\d+ \/ \d+$/)
    const total = Number((await counter.textContent())!.split('/')[1])
    expect(total).toBeGreaterThan(5)
    const next = page.getByRole('button', { name: 'Następne zdjęcie' })
    await expect(async () => {
      await next.click({ timeout: 1000 })
      await expect(counter).toHaveText(`2 / ${total}`, { timeout: 1000 })
    }).toPass()
    await page.getByRole('button', { name: 'Poprzednie zdjęcie' }).click()
    await expect(counter).toHaveText(`1 / ${total}`)
    // „+N” shows the 5th photo, then walks on through the hidden ones.
    const more = page.getByRole('button', { name: /^\+\d+ — zdjęcie 5/ })
    await more.click()
    await expect(counter).toHaveText(`5 / ${total}`)
    await more.click()
    await expect(counter).toHaveText(`6 / ${total}`)
  })

  test('the video loads YouTube only after „▶” (ADR-016)', async ({ page }) => {
    const youtube: string[] = []
    page.on('request', (request) => {
      if (/youtube|ytimg|googlevideo/.test(new URL(request.url()).hostname)) {
        youtube.push(request.url())
      }
    })
    await page.goto(site('biznes.localhost', ERGO))
    const video = page.getByRole('region', { name: 'Zobacz w działaniu' })
    await video.scrollIntoViewIfNeeded()
    await page.waitForLoadState('networkidle')
    expect(youtube).toEqual([])
    await expect(video.locator('iframe')).toHaveCount(0)

    await video.getByRole('button', { name: /^Odtwórz film:/ }).click()
    await expect(video.locator('iframe')).toHaveAttribute(
      'src',
      /^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{11}\?autoplay=1&rel=0&playsinline=1$/,
    )
  })

  test('configurator: a ready configuration fills the options; the version is the note of the inquiry and of the mail', async ({
    page,
    request,
  }) => {
    const marker = `E2E Wersja ${Date.now()}`
    await page.setExtraHTTPHeaders({
      'X-Real-IP': `10.${[0, 0, 0].map(() => Math.floor(Math.random() * 250)).join('.')}`,
    })
    await page.goto(site('biznes.localhost', THINKBOOK))
    const name = (await page.getByRole('heading', { level: 1 }).textContent())!.trim()
    const configurator = page.getByRole('region', { name: 'Wybierz wersję' })
    const summary = configurator.getByRole('complementary', { name: 'Twoja konfiguracja' })
    const preset = configurator.getByRole('button', { name: /^Biuro/ })
    await expect(async () => {
      await preset.click({ timeout: 1000 })
      await expect(preset).toHaveAttribute('aria-pressed', 'true', { timeout: 1000 })
    }).toPass()
    await expect(summary).toContainText('16 GB')
    await expect(summary).toContainText(/Wybrano [1-9] z \d+/)
    // „Doradźcie” for the screen: the office sees what the visitor left to us.
    await configurator
      .getByRole('group', { name: 'Ekran' })
      .getByRole('button', { name: 'Doradźcie' })
      .click()
    // „Twoja wersja” in the hero follows the choice.
    await expect(page.getByText('Twoja wersja').first()).toBeVisible()

    await summary.getByRole('button', { name: `Dodaj do zapytania: ${name}` }).click()
    const note = await page.evaluate(
      () => (JSON.parse(localStorage.getItem('pk-cart') ?? '[]') as { uwaga?: string }[])[0]?.uwaga,
    )
    expect(note).toMatch(/^Wersja: Biuro · /)
    expect(note).toContain('Pamięć RAM: 16 GB')
    expect(note).toContain('Ekran: doradźcie')

    await page.goto(site('biznes.localhost', '/zapytanie'))
    const contact = page.getByRole('region', { name: 'Dane do kontaktu' })
    await contact.getByLabel(/^Imię/).fill(marker)
    await contact.getByRole('textbox', { name: /^Telefon/ }).fill('600 100 200')
    await contact.getByLabel(/Wyrażam zgodę/).check()
    await page.waitForTimeout(FORM_MIN_FILL_MS + 500)
    await contact.getByRole('button', { name: /^Wyślij zapytanie/ }).click()
    await expect(
      page.getByRole('status').filter({ hasText: 'Dziękujemy — mamy Twoją listę.' }),
    ).toBeVisible()

    await loginAsAdmin(page)
    const { json } = await api(
      page,
      'GET',
      `/api/inquiries?where[name][equals]=${encodeURIComponent(marker)}&depth=0`,
    )
    const record = (json.docs as { id: number; items: { note?: string }[] }[])[0]
    try {
      expect(record?.items[0]?.note).toBe(note)
      await expect
        .poll(() => mailText(request, `"${marker}"`), { timeout: 15_000 })
        .toContain('uwaga: Wersja: Biuro · ')
    } finally {
      if (record) await api(page, 'DELETE', `/api/inquiries/${record.id}`)
    }
  })

  test('?wersja= picks the model; „W tej karcie” does the same', async ({ page }) => {
    await page.goto(site('biznes.localhost', `${THINKBOOK}?wersja=g9-ahp`))
    const configurator = page.getByRole('region', { name: 'Wybierz wersję' })
    await expect(configurator.getByRole('button', { name: /^G9 AHP —/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await page.getByRole('button', { name: 'G8 IRL (Intel)' }).click()
    await expect(configurator.getByRole('button', { name: /^G8 IRL —/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(new URL(page.url()).searchParams.get('wersja')).toBe('g8-irl')
  })

  test('the family: the same series, 4 cards without the product, „Cała oferta Lenovo”', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost', THINKBOOK))
    const family = page.getByRole('region', { name: 'Inne z rodziny ThinkBook' })
    await expect(family.getByRole('article')).toHaveCount(4)
    await expect(family.getByRole('link', { name: 'Lenovo ThinkBook 14 G8 / G9' })).toHaveCount(0)
    await expect(family.getByRole('link', { name: 'Cała oferta Lenovo' })).toHaveAttribute(
      'href',
      /\/oferta\?marka=lenovo/,
    )
  })

  test('sources: producers only, with the date; none for a service without them', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost', THINKBOOK))
    const sources = page.getByRole('region', { name: 'Skąd są te informacje' })
    await expect(sources).toContainText(/sprawdzono \d{2}\.\d{2}\.\d{4}/)
    for (const link of await sources.getByRole('link').all()) {
      const host = new URL((await link.getAttribute('href'))!).hostname
      expect(host, host).toMatch(/(^|\.)lenovo\.com$/)
    }
    // Our service, no producer behind it (K31-ZMIANY §4 pkt 9).
    await page.goto(site('biznes.localhost', '/produkt/serwis-komputerow-dla-firm'))
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('region', { name: 'Skąd są te informacje' })).toHaveCount(0)
    await expect(
      page
        .getByRole('navigation', { name: 'Sekcje produktu' })
        .getByRole('link', { name: 'Źródła' }),
    ).toHaveCount(0)
  })

  test('„Do tego zwykle dobierają” shows the products of „pasuje do” from the panel', async ({
    page,
  }) => {
    await loginAsAdmin(page)
    const { json } = await api(
      page,
      'GET',
      '/api/products?where[slug][in]=posnet-ergo-online,szuflada-posnet-skl&depth=0&limit=5',
    )
    const id = Object.fromEntries(
      (json.docs as { id: number; slug: string }[]).map((doc) => [doc.slug, doc.id]),
    )
    const ergo = id['posnet-ergo-online']!
    const before = (await api(page, 'GET', `/api/products/${ergo}?depth=0`)).json as {
      fitsWith?: number[] | null
    }
    expect(
      (await api(page, 'PATCH', `/api/products/${ergo}`, { fitsWith: [id['szuflada-posnet-skl']] }))
        .status,
    ).toBe(200)
    try {
      await page.goto(site('biznes.localhost', ERGO))
      const suggestions = page.getByRole('region', { name: 'Do tego zwykle dobierają' })
      await expect(
        suggestions.getByRole('link', { name: 'Szuflada kasowa Posnet SKL' }),
      ).toHaveAttribute('href', '/produkt/szuflada-posnet-skl')
    } finally {
      await page.goto('/admin/login')
      await api(page, 'PATCH', `/api/products/${ergo}`, { fitsWith: before.fitsWith ?? [] })
    }
  })

  for (const width of [360, 390, 414]) {
    test(`no horizontal scroll at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto(site('biznes.localhost', THINKBOOK))
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }

  test('a service without a photo still has a page, without WCAG violations', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/produkt/przeglad-kasy-fiskalnej'))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Przegląd kasy fiskalnej')
    const results = await new AxeBuilder({ page }).withTags(WCAG).analyze()
    expect(results.violations).toEqual([])
  })

  for (const theme of ['light', 'dark'] as const) {
    test(`axe without violations on a card with a configurator, ${theme} theme`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: theme })
      await page.goto(site('biznes.localhost', THINKBOOK))
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
      expect(
        violations.map((v) => ({ rule: v.id, targets: v.nodes.map((n) => n.target) })),
      ).toEqual([])
    })
  }

  test('unknown slug, malformed slug and another site answer 404', async ({ page }) => {
    for (const url of [
      site('biznes.localhost', '/produkt/nie-ma-takiego'),
      site('biznes.localhost', '/produkt/%20Zle'),
      site('instalacje.localhost', ERGO),
      site('software.localhost', ERGO),
    ]) {
      const response = await page.goto(url)
      expect(response?.status(), url).toBe(404)
    }
  })

  test('a draft product has no page and is not in the sitemap', async ({ page }) => {
    await loginAsAdmin(page)
    const biznes = await tenantId(page, 'biznes')
    const { json } = await api(
      page,
      'GET',
      `/api/catalog-categories?where[slug][equals]=kasy-fiskalne&where[tenant][equals]=${biznes}&depth=0`,
    )
    const [category] = json.docs as { id: number }[]
    const slug = `e2e-szkic-produktu-${Date.now()}`
    const created = await api(page, 'POST', '/api/products?draft=true', {
      tenant: biznes,
      slug,
      name: 'Szkic produktu',
      kind: 'device',
      categories: [category!.id],
      _status: 'draft',
    })
    expect(created.status).toBe(201)
    try {
      const response = await page.goto(site('biznes.localhost', `/produkt/${slug}`))
      expect(response?.status()).toBe(404)
      const sitemap = await page.goto(site('biznes.localhost', '/sitemap.xml'))
      expect(await sitemap?.text()).not.toContain(slug)
    } finally {
      await page.goto('/admin/login')
      await api(page, 'DELETE', `/api/products/${(created.json.doc as { id: number }).id}`)
    }
  })

  test('a card „Do sprawdzenia” has a page, but noindex, no FAQPage and no place in the site maps', async ({
    page,
  }) => {
    // K3 (K3a-2): Samsung OM is „do-sprawdzenia”, Posnet Ergo „gotowe”.
    const review = '/produkt/samsung-om'
    const response = await page.goto(site('biznes.localhost', review))
    expect(response?.status()).toBe(200)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /follow/)
    expect((await jsonLd(page)).find((item) => item['@type'] === 'FAQPage')).toBeUndefined()

    await page.goto(site('biznes.localhost', ERGO))
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0)

    const sitemap = await page.goto(site('biznes.localhost', '/sitemap.xml'))
    const xml = (await sitemap?.text()) ?? ''
    expect(xml).toContain(site('biznes.localhost', ERGO))
    expect(xml).not.toContain(review)
    await page.goto(site('biznes.localhost', '/mapa-strony'))
    await expect(page.locator(`a[href="${review}"]`)).toHaveCount(0)
    await expect(page.locator(`a[href="${ERGO}"]`)).toHaveCount(1)
  })

  test('the Biznes sitemap lists the catalog and products, other sites do not', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost', '/sitemap.xml'))
    const biznes = await page.content()
    expect(biznes).toContain(site('biznes.localhost', '/oferta'))
    expect(biznes).toContain(site('biznes.localhost', ERGO))

    await page.goto(site('instalacje.localhost', '/sitemap.xml'))
    expect(await page.content()).not.toContain('/produkt/')
  })
})
