import { expect, test } from '@playwright/test'

import { site } from './helpers'

// B11b: legal pages of Biznes (from `pnpm seed`, text blocks) and the HTML site map — a route of
// every line, built from the same list as its `sitemap.xml`.

test.describe('Biznes legal pages', () => {
  for (const { path, title } of [
    { path: '/polityka-prywatnosci', title: 'Polityka prywatności' },
    { path: '/cookies', title: 'Cookies' },
    { path: '/dostepnosc', title: 'Dostępność' },
  ]) {
    test(`${path} opens with breadcrumbs and its title`, async ({ page }) => {
      const response = await page.goto(site('biznes.localhost', path))
      expect(response?.status()).toBe(200)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
      const crumbs = page.getByRole('navigation', { name: 'Okruszki' })
      await expect(crumbs.locator('[aria-current="page"]')).toHaveText(title)
    })
  }

  test('the footer and the consent clause lead to existing pages', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/kontakt'))
    const consent = page.getByRole('link', { name: 'polityce prywatności' }).first()
    await expect(consent).toHaveAttribute('href', '/polityka-prywatnosci')
    const footer = page.getByRole('contentinfo')
    const hrefs: string[] = []
    for (const name of ['Mapa strony', 'Polityka prywatności', 'Cookies', 'Dostępność']) {
      hrefs.push((await footer.getByRole('link', { name, exact: true }).getAttribute('href')) ?? '')
    }
    expect(hrefs).toEqual(['/mapa-strony', '/polityka-prywatnosci', '/cookies', '/dostepnosc'])
    for (const href of hrefs) {
      const response = await page.goto(site('biznes.localhost', href))
      expect(response?.status(), href).toBe(200)
    }
  })
})

test.describe('HTML site map', () => {
  test('lists the same addresses as sitemap.xml on Biznes', async ({ page }) => {
    const response = await page.goto(site('biznes.localhost', '/mapa-strony'))
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mapa strony')
    for (const name of ['Strony', 'Oferta', 'Branże', 'Produkty i usługi', 'Aktualności']) {
      await expect(page.getByRole('main').getByRole('heading', { level: 2, name })).toBeVisible()
    }
    const links = await page
      .locator('main section a')
      .evaluateAll((items) => items.map((item) => item.getAttribute('href')))

    const sitemap = await page.goto(site('biznes.localhost', '/sitemap.xml'))
    const xml = (await sitemap?.text()) ?? ''
    const origin = site('biznes.localhost', '')
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) =>
      loc?.replace(origin, ''),
    )
    expect(new Set(links)).toEqual(new Set(locs))
    expect(locs).toContain('/polityka-prywatnosci')
    expect(locs).toContain('/mapa-strony')
  })

  test('on another line shows only its own pages', async ({ page }) => {
    const response = await page.goto(site('instalacje.localhost', '/mapa-strony'))
    expect(response?.status()).toBe(200)
    const text = await page.locator('main').innerText()
    expect(text).not.toContain('Produkty i usługi')
    expect(text).not.toContain('Polityka prywatności')
    await expect(page.locator('main a[href^="/oferta"], main a[href^="/aktualnosci"]')).toHaveCount(
      0,
    )
  })
})
