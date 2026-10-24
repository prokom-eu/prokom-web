import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { api, loginAsAdmin, site, tenantId } from './helpers'

// B6a: product page `/produkt/[slug]` (spec. §6.2). Catalog from `pnpm seed`.
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const ERGO = '/produkt/posnet-ergo-online'

type JsonLd = { '@type'?: string; [key: string]: unknown }

test.describe('Biznes product page', () => {
  test('shows the product with breadcrumbs, canonical and JSON-LD without offers', async ({
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
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      site('biznes.localhost', ERGO),
    )

    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents()
    const data = scripts.map((text) => JSON.parse(text) as JsonLd)
    const product = data.find((item) => item['@type'] === 'Product')
    expect(product).toMatchObject({
      name: 'Posnet Ergo Online',
      brand: { '@type': 'Brand', name: 'Posnet' },
    })
    expect(JSON.stringify(product)).not.toMatch(/offers|price/i)
    const breadcrumbs = data.find((item) => item['@type'] === 'BreadcrumbList')
    // B10a: the category has its own indexed page.
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

  test('switches photos and the inquiry switch updates the counter', async ({ page }) => {
    await page.goto(site('biznes.localhost', ERGO))
    const thumbs = page.getByRole('list', { name: 'Zdjęcia' }).getByRole('button')
    await expect(thumbs.first()).toHaveAttribute('aria-pressed', 'true')
    await thumbs.nth(1).click()
    await expect(thumbs.nth(1)).toHaveAttribute('aria-pressed', 'true')

    const add = page.getByRole('button', { name: 'Dodaj do zapytania: Posnet Ergo Online' })
    // The click works once the box is hydrated.
    await expect(async () => {
      await add.click({ timeout: 1000 })
      await expect(page.getByRole('button', { name: 'Na liście: Posnet Ergo Online' })).toBeVisible(
        { timeout: 1000 },
      )
    }).toPass()
    await expect(
      page.getByRole('banner').getByRole('button', { name: /^Zapytanie/ }),
    ).toHaveAccessibleName('Zapytanie 1 pozycja')
  })

  test('a service without a photo still has a page, without WCAG violations', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/produkt/przeglad-kasy-fiskalnej'))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Przegląd kasy fiskalnej')
    const results = await new AxeBuilder({ page }).withTags(WCAG).analyze()
    expect(results.violations).toEqual([])
  })

  for (const theme of ['light', 'dark'] as const) {
    test(`axe without violations on a product with photos, ${theme} theme`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme })
      await page.goto(site('biznes.localhost', ERGO))
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
      expect(violations).toEqual([])
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

  test('„Podobne”: 4 cards of the main category and a link to all of it', async ({ page }) => {
    await page.goto(site('biznes.localhost', ERGO))
    const similar = page.getByRole('region', { name: 'Podobne' })
    await expect(similar.getByRole('article')).toHaveCount(4)
    await expect(similar.getByRole('heading', { name: 'Posnet Ergo Online' })).toHaveCount(0)
    await expect(similar.getByRole('link', { name: /^Wszystkie: Kasy fiskalne/ })).toHaveAttribute(
      'href',
      '/oferta/kasy-fiskalne',
    )
    await expect(page.getByRole('heading', { name: /Jedna lista, jeden formularz/ })).toBeVisible()
  })

  test('alternatives and „Skompletuj stanowisko” from the panel; „Dodaj wszystko” adds the rest', async ({
    page,
  }) => {
    await loginAsAdmin(page)
    const slugs = [
      'posnet-ergo-online',
      'szuflada-posnet-skl',
      'terminal-platniczy-polcard',
      'posnet-neo-online',
    ]
    const { json } = await api(
      page,
      'GET',
      `/api/products?where[slug][in]=${slugs.join(',')}&depth=0&limit=10`,
    )
    const id = Object.fromEntries(
      (json.docs as { id: number; slug: string }[]).map((doc) => [doc.slug, doc.id]),
    )
    const ergo = id['posnet-ergo-online']!
    const before = (await api(page, 'GET', `/api/products/${ergo}?depth=0`)).json as {
      fitsWith?: number[] | null
      alternatives?: number[] | null
    }
    const patched = await api(page, 'PATCH', `/api/products/${ergo}`, {
      fitsWith: [id['szuflada-posnet-skl'], id['terminal-platniczy-polcard']],
      alternatives: [id['posnet-neo-online']],
    })
    expect(patched.status).toBe(200)
    try {
      await page.goto(site('biznes.localhost', ERGO))
      const alternatives = page.getByRole('region', { name: 'Kiedy wybrać coś innego?' })
      await expect(alternatives.getByRole('link', { name: /Posnet Neo Online/ })).toHaveAttribute(
        'href',
        '/produkt/posnet-neo-online',
      )

      const kit = page.getByRole('region', { name: /Skompletuj stanowisko/ })
      await expect(kit.getByRole('listitem')).toHaveCount(2)
      // One added by hand first: „Dodaj wszystko” adds only the missing one.
      await expect(async () => {
        await kit
          .getByRole('button', { name: 'Do zapytania: Szuflada Posnet SKL' })
          .click({ timeout: 1000 })
        await expect(
          kit.getByRole('button', { name: 'W zapytaniu: Szuflada Posnet SKL' }),
        ).toBeVisible({ timeout: 1000 })
      }).toPass()
      const addAll = kit.getByRole('button', { name: 'Dodaj wszystko do zapytania' })
      await addAll.focus()
      await page.keyboard.press('Enter')
      const done = kit.getByRole('button', { name: 'Wszystko na liście' })
      await expect(done).toHaveAttribute('aria-disabled', 'true')
      // Focus stays on the button for keyboard and screen reader users.
      await expect(done).toBeFocused()
      await expect(
        page.getByRole('banner').getByRole('button', { name: /^Zapytanie/ }),
      ).toHaveAccessibleName('Zapytanie 2 pozycje')
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
      expect(violations).toEqual([])
    } finally {
      await page.goto('/admin/login')
      await api(page, 'PATCH', `/api/products/${ergo}`, {
        fitsWith: before.fitsWith ?? [],
        alternatives: before.alternatives ?? [],
      })
    }
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
