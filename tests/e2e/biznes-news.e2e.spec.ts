import { expect, test } from '@playwright/test'

import { site } from './helpers'

// B11a: `/aktualnosci` and the post page — one route for the lines with news (ADR-012 rozstrz. 5,
// change 22.10.2026; today Biznes only). Content from `pnpm seed`: the KSeF post from the board
// and the KSeF panel in the Biznes settings.
const LIST = '/aktualnosci'
const POST = '/aktualnosci/ksef-od-1-stycznia-2027'

type JsonLd = { '@type'?: string; [key: string]: unknown }

test.describe('Biznes news', () => {
  test('the list shows the KSeF panel, the posts and the contact form', async ({ page }) => {
    const response = await page.goto(site('biznes.localhost', LIST))
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Przepisy, terminy, programy — po ludzku.',
    )
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      site('biznes.localhost', LIST),
    )
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0)

    const panel = page.locator('#ksef')
    await expect(panel.getByTestId('ksef-days')).toHaveText(/^\d+$/)
    await expect(panel).toContainText('dni do 1 stycznia 2027')
    await expect(panel.getByRole('listitem')).toHaveCount(6)
    await expect(panel.getByRole('link', { name: 'Co się zmienia' })).toHaveAttribute('href', POST)

    const posts = page.getByRole('region', { name: 'Wpisy' })
    await posts
      .getByRole('link', {
        name: 'KSeF od 1 stycznia 2027: 6 rzeczy, które mała firma musi zrobić do grudnia',
      })
      .click()
    await expect(page).toHaveURL(site('biznes.localhost', POST))
  })

  test('a category view is noindex; an empty one says so', async ({ page }) => {
    await page.goto(site('biznes.localhost', `${LIST}?kategoria=ksef`))
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      site('biznes.localhost', LIST),
    )
    await expect(page.locator('#ksef')).toHaveCount(0)
    await expect(page.getByRole('region', { name: 'Wpisy' }).getByRole('article')).toHaveCount(1)

    await page.goto(site('biznes.localhost', `${LIST}?kategoria=kasy`))
    await expect(page.getByText('Nie ma jeszcze wpisów w tej kategorii.')).toBeVisible()
  })

  test('the post has its outline, sources, side column, products and JSON-LD', async ({ page }) => {
    const response = await page.goto(site('biznes.localhost', POST))
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'KSeF od 1 stycznia 2027: 6 rzeczy, które mała firma musi zrobić do grudnia',
    )
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      site('biznes.localhost', POST),
    )
    await expect(page.getByText('Sprawdzono 15.10.2026')).toBeVisible()
    await expect(page.getByRole('region', { name: 'W skrócie' })).toBeVisible()

    // Every h2 of the content has the anchor its outline entry points at.
    const outline = page.getByRole('navigation', { name: 'Spis treści' })
    const anchors = await outline
      .getByRole('link')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')))
    expect(anchors).toHaveLength(7)
    for (const anchor of anchors) {
      await expect(page.locator(`h2[id="${anchor?.slice(1)}"]`)).toHaveCount(1)
    }

    const sources = page.getByRole('region', { name: 'Źródła' })
    for (const href of await sources
      .getByRole('link')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')))) {
      expect(href).toMatch(/^https:\/\//)
    }

    await expect(page.getByRole('link', { name: 'Zapytaj o wdrożenie' })).toHaveAttribute(
      'href',
      `${POST}#kontakt`,
    )
    await expect(page.getByTestId('ksef-days')).toHaveText(/^\d+$/)
    const related = page.getByRole('region', { name: 'Powiązane produkty' })
    await expect(related.getByRole('article')).toHaveCount(2)
    await expect(
      page.getByRole('heading', { name: 'KSeF bez nerwów. Zróbmy to przed grudniem.' }),
    ).toBeVisible()

    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents()
    const data = scripts.map((text) => JSON.parse(text) as JsonLd)
    const article = data.find((item) => item['@type'] === 'Article')
    expect(article).toMatchObject({
      headline: 'KSeF od 1 stycznia 2027: 6 rzeczy, które mała firma musi zrobić do grudnia',
      url: site('biznes.localhost', POST),
      datePublished: '2026-10-14T00:00:00.000Z',
      author: { '@id': `${site('biznes.localhost', '')}/#organization` },
    })
    const crumbs = data.find((item) => item['@type'] === 'BreadcrumbList')
    expect(crumbs?.itemListElement).toHaveLength(3)
  })

  test('no prices, leasing or instalments on the list and the post', async ({ page }) => {
    for (const path of [LIST, POST]) {
      await page.goto(site('biznes.localhost', path))
      const text = await page.locator('main').innerText()
      expect(text, path).not.toMatch(/leasing|\braty\b|\d+[,.]\d{2}\s*zł/i)
    }
  })

  test('404 on lines without news and for unknown posts; the sitemap lists the news', async ({
    page,
  }) => {
    // Software has its own news since SW11b (`software-news-city`); a Biznes post there is 404.
    for (const url of [
      site('instalacje.localhost', LIST),
      site('instalacje.localhost', POST),
      site('software.localhost', POST),
      site('biznes.localhost', '/aktualnosci/nie-ma-takiego'),
    ]) {
      const response = await page.goto(url)
      expect(response?.status(), url).toBe(404)
    }
    const sitemap = await page.goto(site('biznes.localhost', '/sitemap.xml'))
    const xml = (await sitemap?.text()) ?? ''
    expect(xml).toContain(`<loc>${site('biznes.localhost', LIST)}</loc>`)
    expect(xml).toContain(site('biznes.localhost', POST))
    expect(xml).not.toContain('kategoria=')

    const other = await page.goto(site('instalacje.localhost', '/sitemap.xml'))
    expect((await other?.text()) ?? '').not.toContain('/aktualnosci')
  })
})
