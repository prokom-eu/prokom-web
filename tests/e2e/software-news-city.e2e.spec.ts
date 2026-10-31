import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// SW11b: news in the Software look and the city pages (spec. §6.8–6.9). Data from `pnpm seed`:
// the package's post is a draft (no public posts on Software), `rabka-zdroj` is the only active
// city, the other five are inactive (`seed/prokomsoftware/miejscowosci.json`).
const HOST = 'software.localhost'

const pageWidth = (page: Page) => page.evaluate(() => document.scrollingElement!.scrollWidth)

test.describe('Software /aktualnosci', () => {
  test('the list in the Software look (no public post yet: the empty state)', async ({ page }) => {
    const response = await page.goto(site(HOST, '/aktualnosci'))
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveText('Konkretnie o stronach i systemach.')
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
    await expect(page.locator('h1')).toHaveText('Konkretnie o stronach i systemach.')
  })
})

test.describe('Software /miejscowosci/[miasto]', () => {
  test('Rabka-Zdrój: hero, who we work for, FAQ, nearby chips without links, CTA', async ({
    page,
  }) => {
    const response = await page.goto(site(HOST, '/miejscowosci/rabka-zdroj'))
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveText('Strony i systemy dla firm z Rabki-Zdroju.')
    await expect(
      page.getByRole('heading', { name: 'Dla kogo pracujemy najczęściej.' }),
    ).toBeVisible()
    await expect(page.locator('#pytania')).toContainText('Czy przyjedziecie do mnie?')
    const nearby = page.locator('section', {
      has: page.getByRole('heading', { name: 'Pracujemy też w okolicy' }),
    })
    await expect(nearby.getByRole('listitem')).toHaveCount(9)
    await expect(nearby.getByRole('link')).toHaveCount(0)
    await expect(page.locator('[data-footer-cta]')).toBeHidden()
    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(jsonLd.join('')).toContain('"areaServed"')
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
