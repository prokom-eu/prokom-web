import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { api, loginAsAdmin, site, tenantId } from './helpers'

// SW11b: news in the Software look and the city pages (spec. §6.8–6.9). Data from `pnpm seed`:
// the package's post is a draft (no public posts on Software), `rabka-zdroj` is the only active
// city, the other five are inactive (`seed/prokomsoftware/miejscowosci.json`).
const HOST = 'software.localhost'

const pageWidth = (page: Page) => page.evaluate(() => document.scrollingElement!.scrollWidth)

test.describe('Software /aktualnosci', () => {
  test('the list in the Software look', async ({ page }) => {
    const response = await page.goto(site(HOST, '/aktualnosci'))
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveText('Aktualności bez lania wody.')
    await expect(page.getByRole('navigation', { name: 'Okruszki' })).toContainText('Aktualności')
  })

  test('a draft post and another line’s post are 404', async ({ page }) => {
    for (const slug of ['wordpress-czy-strona-od-zera', 'ksef-od-1-stycznia-2027']) {
      const response = await page.goto(site(HOST, `/aktualnosci/${slug}`))
      expect(response?.status(), slug).toBe(404)
    }
  })

  test('a category of another line is ignored', async ({ page }) => {
    await page.goto(site(HOST, '/aktualnosci?kategoria=kasy'))
    await expect(page.locator('h1')).toHaveText('Aktualności bez lania wody.')
  })

  test('a page that is not there is 404, not the list again', async ({ page }) => {
    for (const query of ['?strona=99', '?strona=abc', '?strona=0']) {
      const response = await page.goto(site(HOST, `/aktualnosci${query}`))
      expect(response?.status(), query).toBe(404)
    }
  })

  test('the closing CTA: the picker first, the free audit beside it', async ({ page }) => {
    await page.goto(site(HOST, '/aktualnosci'))
    const cta = page.locator('[data-final-cta]')
    await expect(cta.locator('a[href="/dobierz"]')).toHaveText('Dobierz w 60 sekund →')
    await expect(cta.locator('a[href="/audyt"]')).toBeVisible()
  })
})

test.describe('Software /aktualnosci with the seed posts', () => {
  test('featured post, reading time, a category view with its chip current', async ({ page }) => {
    await page.goto(site(HOST, '/aktualnosci'))
    const posts = page.locator('main .sw-post-featured, main .sw-post-card')
    test.skip((await posts.count()) === 0, 'no public post in this database')
    await expect(page.locator('main .sw-post-featured')).toHaveCount(1)
    await expect(page.locator('main .sw-post-meta').first()).toContainText('min czytania')
    const chips = page.getByRole('navigation', { name: 'Kategorie' })
    test.skip((await chips.count()) === 0, 'posts of one category only')
    const chip = chips.getByRole('link').nth(1)
    const href = await chip.getAttribute('href')
    await page.goto(site(HOST, href!))
    await expect(
      page.getByRole('navigation', { name: 'Kategorie' }).locator('[aria-current="page"]'),
    ).toHaveAttribute('href', href!)
    // A category view is a plain grid, no featured post.
    await expect(page.locator('main .sw-post-featured')).toHaveCount(0)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  })

  test('„Z poradnika” on /o-firmie and /kontakt: the newest posts and the link to the list', async ({
    page,
  }) => {
    await page.goto(site(HOST, '/aktualnosci'))
    const posts = await page.locator('main .sw-post-featured, main .sw-post-card').count()
    test.skip(posts === 0, 'no public post in this database')
    for (const path of ['/o-firmie', '/kontakt']) {
      await page.goto(site(HOST, path))
      const section = page.locator('#z-poradnika')
      await expect(section.getByRole('heading', { level: 2 }), path).toContainText('Piszemy o tym')
      await expect(section.locator('a[href="/aktualnosci"]'), path).toBeVisible()
      const cards = await section.locator('.sw-post-card').count()
      expect(cards, path).toBeGreaterThanOrEqual(1)
      expect(cards, path).toBeLessThanOrEqual(3)
    }
  })

  test.describe('phone', () => {
    test.use({ viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true })

    test('no sideways scroll; cards are rows; chips and cards are 44 px targets', async ({
      page,
    }) => {
      await page.goto(site(HOST, '/aktualnosci'))
      expect(await pageWidth(page)).toBeLessThanOrEqual(360)
      const cards = page.locator('main .sw-post-card')
      test.skip((await cards.count()) === 0, 'no card on the list')
      const box = await cards.first().boundingBox()
      expect(box!.height).toBeGreaterThanOrEqual(44)
      // A row: the picture beside the text, the lead hidden.
      const art = await cards.first().locator('.sw-post-card-art').boundingBox()
      expect(art!.width).toBeLessThan(100)
      await expect(cards.first().locator('.sw-post-lead')).toBeHidden()
      for (const chip of await page.locator('main .sw-chip:visible').all()) {
        expect((await chip.boundingBox())!.height).toBeGreaterThanOrEqual(44)
      }
    })
  })
})

const text = (value: string) => ({
  type: 'text',
  text: value,
  format: 0,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
})
const node = (type: string, children: object[], extra: object = {}) => ({
  type,
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
  ...extra,
})
const h2 = (value: string) => node('heading', [text(value)], { tag: 'h2' })
const p = (value: string) => node('paragraph', [text(value)], { textFormat: 0 })

test.describe('Software post (published for the test, removed after)', () => {
  test('one date, author, table of contents, audit CTA in the middle, sources, list, axe', async ({
    page,
  }) => {
    await loginAsAdmin(page)
    const software = await tenantId(page, 'software')
    const slug = `e2e-wpis-${Date.now()}`
    const created = await api(page, 'POST', '/api/posts', {
      tenant: software,
      title: 'E2E: wpis Software',
      slug,
      category: 'poradnik',
      lead: 'Wstęp wpisu testowego.',
      summary: 'Krótko o wpisie testowym.',
      // Now (a minute ago): the newest post, featured on page 1 however many the seed publishes.
      publishedAt: new Date(Date.now() - 60_000).toISOString(),
      content: {
        root: node('root', [
          h2('Pierwsza część'),
          p('Tekst pierwszej części.'),
          h2('Druga część'),
          p('Tekst drugiej części.'),
        ]),
      },
      sources: [
        {
          name: 'Źródło testowe',
          url: 'https://example.com',
          verifiedAt: '2026-10-17T12:00:00.000Z',
        },
      ],
      author: { name: 'Krystian Potaczek', role: 'PRO-KOM Software' },
      _status: 'published',
    })
    const id = (created.json.doc as { id?: number } | undefined)?.id
    try {
      expect(created.status).toBe(201)
      await page.goto(site(HOST, `/aktualnosci/${slug}`))
      await expect(page.locator('h1')).toHaveText('E2E: wpis Software')
      await expect(page.getByText('Krystian Potaczek').first()).toBeVisible()
      const toc = page.getByRole('navigation', { name: 'W tym tekście' })
      await expect(toc.getByRole('link')).toHaveCount(4)
      // The audit CTA sits between the two sections.
      const order = await page.evaluate(() => {
        const at = (selector: string) =>
          [...document.querySelectorAll('main *')].indexOf(document.querySelector(selector)!)
        return [at('#pierwsza-czesc'), at('main a[href="/audyt"]'), at('#druga-czesc')]
      })
      expect(order[0]).toBeLessThan(order[1]!)
      expect(order[1]).toBeLessThan(order[2]!)
      await expect(page.locator('#wpis-zrodla')).toContainText('Źródło testowe')
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(violations.map((v) => v.id)).toEqual([])

      await page.goto(site(HOST, '/aktualnosci'))
      await expect(page.getByRole('heading', { name: 'E2E: wpis Software' })).toBeVisible()
    } finally {
      // Back on the panel domain: the API answers there.
      await page.goto('/admin')
      if (id) await api(page, 'DELETE', `/api/posts/${id}`)
    }
  })
})

test.describe('Software /miejscowosci/[miasto]', () => {
  test('Rabka-Zdrój: hero, who we work for, FAQ, nearby chips (towns with a page link), CTA', async ({
    page,
  }) => {
    const response = await page.goto(site(HOST, '/miejscowosci/rabka-zdroj'))
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveText('Strony i systemy dla firm z Rabki-Zdroju.')
    await expect(
      page.getByRole('heading', { name: 'Dla kogo pracujemy najczęściej' }),
    ).toBeVisible()
    await expect(page.locator('#pytania')).toContainText('Czy przyjedziecie do mnie?')
    const nearby = page.locator('section', {
      has: page.getByRole('heading', { name: 'Pracujemy też w okolicy' }),
    })
    // v23: without Zakopane (Software works only in Rabka). SEO etap 2: the four towns with
    // their own page link there, the villages stay plain.
    await expect(nearby.getByRole('listitem')).toHaveCount(8)
    for (const town of ['Nowy Targ', 'Mszana Dolna', 'Limanowa', 'Nowy Sącz']) {
      await expect(nearby.getByRole('link', { name: town, exact: true })).toHaveCount(1)
    }
    await expect(nearby.getByRole('link')).toHaveCount(4)
    await expect(nearby.getByRole('link', { name: 'Nowy Targ' })).toHaveAttribute(
      'href',
      '/miejscowosci/nowy-targ',
    )
    await expect(page.locator('[data-footer-cta]')).toBeHidden()
    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(jsonLd.join('')).toContain('"areaServed"')
  })

  test('Nowy Targ has its own page: H1, local FAQ, its title (SEO etap 2)', async ({ page }) => {
    const response = await page.goto(site(HOST, '/miejscowosci/nowy-targ'))
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveText('Strony i systemy dla firm z Nowego Targu.')
    await expect(page).toHaveTitle('Strony i systemy Nowy Targ | PRO-KOM Software')
    await expect(page.locator('#pytania')).toContainText(
      'Czy przyjedziecie do nas do Nowego Targu?',
    )
    expect(await page.locator('main').innerText()).not.toMatch(/Zakopan/)
    // Back to Rabka, where the salon is: the towns link each other.
    await expect(page.getByRole('link', { name: 'Rabka-Zdrój', exact: true })).toHaveAttribute(
      'href',
      '/miejscowosci/rabka-zdroj',
    )
  })

  test('an inactive or unknown city is 404 and not in the sitemap', async ({ page, request }) => {
    for (const slug of ['zakopane', 'nie-ma-takiej']) {
      const response = await page.goto(site(HOST, `/miejscowosci/${slug}`))
      expect(response?.status(), slug).toBe(404)
    }
    const sitemap = await (await request.get(site(HOST, '/sitemap.xml'))).text()
    expect(sitemap).toContain('/miejscowosci/rabka-zdroj')
    expect(sitemap).not.toContain('/miejscowosci/zakopane')
  })

  test('is not on another line', async ({ page }) => {
    const response = await page.goto(site('biznes.localhost', '/miejscowosci/rabka-zdroj'))
    expect(response?.status()).toBe(404)
  })

  for (const width of [360, 390]) {
    test(`fits ${width} px without sideways scroll`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      for (const path of ['/miejscowosci/rabka-zdroj', '/aktualnosci']) {
        await page.goto(site(HOST, path))
        expect(await pageWidth(page), path).toBeLessThanOrEqual(width)
      }
    })
  }
})
