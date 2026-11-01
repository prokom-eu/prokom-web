import { expect, test } from '@playwright/test'

import { site } from './helpers'

// B10b: industry pages `/branze/[branza]` (spec. §6.7, board `Branza`). Content from `pnpm seed`:
// gastronomia from the board, drafts of handel and noclegi; beauty and the rest are „Wkrótce”.
const GASTRO = '/branze/gastronomia'

type JsonLd = { '@type'?: string; [key: string]: unknown }

test.describe('Biznes industry page', () => {
  test('shows the industry with its sections, canonical and breadcrumbs JSON-LD', async ({
    page,
  }) => {
    const response = await page.goto(site('biznes.localhost', GASTRO))
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Restauracja, która nie gubi zamówień. Nawet w sezonie.',
    )
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      site('biznes.localhost', GASTRO),
    )
    // The way to the wizard with the business type of the industry (ADR-012 rozstrz. 8).
    await expect(
      page.getByRole('link', { name: 'Przygotuj zapytanie dla lokalu' }),
    ).toHaveAttribute('href', '/konfigurator?firma=gastro')

    const kit = page.getByRole('region', { name: 'Od sali po kuchnię w jednym systemie' })
    await expect(kit.getByRole('article')).toHaveCount(9)
    await expect(
      kit.getByRole('link', { name: 'Wszystko dla tej branży w katalogu' }),
    ).toHaveAttribute('href', '/oferta?branza=gastronomia')

    const day = page.getByRole('region', { name: 'Dzień w restauracji' })
    await expect(day.getByRole('heading', { name: '11:00 — Otwarcie' })).toBeVisible()
    await expect(page.locator('#jak-to-dziala')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Zanim zdecydujesz' })).toBeVisible()

    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents()
    const data = scripts.map((text) => JSON.parse(text) as JsonLd)
    const crumbs = data.find((item) => item['@type'] === 'BreadcrumbList')
    // „Branże” is a section of the home page: in the visible breadcrumbs only.
    expect(crumbs?.itemListElement).toEqual([
      expect.objectContaining({ position: 1, item: site('biznes.localhost', '/') }),
      expect.objectContaining({ position: 2, item: site('biznes.localhost', GASTRO) }),
    ])
    expect(data.some((item) => item['@type'] === 'FAQPage')).toBe(true)
  })

  test('„Inne branże” links the active industries and names the rest „Wkrótce”', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost', '/branze/handel'))
    const other = page.getByRole('region', { name: 'Inne branże' })
    await expect(other.getByRole('link', { name: 'Gastronomia' })).toHaveAttribute('href', GASTRO)
    await expect(other.getByRole('link', { name: /Handel/ })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(other).toContainText('Wkrótce:')
    await expect(other).toContainText('beauty i usługi')
    await expect(
      page.getByRole('link', { name: 'Przygotuj zapytanie dla sklepu' }),
    ).toHaveAttribute('href', '/konfigurator?firma=sklep')
  })

  test('no prices, leasing or instalments on the page', async ({ page }) => {
    await page.goto(site('biznes.localhost', GASTRO))
    const text = await page.locator('main').innerText()
    expect(text).not.toMatch(/leasing|\braty\b|\d+[,.]\d{2}\s*zł/i)
  })

  test('404 for „Wkrótce”, unknown slugs and other domains; the sitemap has active ones', async ({
    page,
  }) => {
    for (const url of [
      site('biznes.localhost', '/branze/beauty'),
      site('biznes.localhost', '/branze/nie-ma-takiej'),
      site('instalacje.localhost', GASTRO),
      site('software.localhost', GASTRO),
    ]) {
      const response = await page.goto(url)
      expect(response?.status(), url).toBe(404)
    }
    const sitemap = await page.goto(site('biznes.localhost', '/sitemap.xml'))
    const xml = (await sitemap?.text()) ?? ''
    expect(xml).toContain(site('biznes.localhost', GASTRO))
    expect(xml).toContain(site('biznes.localhost', '/branze/noclegi'))
    expect(xml).not.toContain('/branze/beauty')
  })
})
