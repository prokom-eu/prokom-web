import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { site } from './helpers'

// pro-kom.eu information pages (H5-1, spec §6.8, §6.9, §6.13): `/kontakt` and `/o-firmie` on the
// shared templates inside `[slug]`, legal pages as panel pages (noindex until a lawyer accepts
// them). The line sites keep their own `/kontakt`. Needs `pnpm seed`.
const HUB = 'prokom.localhost'

test.describe('pro-kom.eu — information pages (spec §6.8–§6.13)', () => {
  for (const [path, title] of [
    ['/kontakt', 'Kontakt PRO-KOM — Rabka-Zdrój, ul. Orkana 16B'],
    ['/o-firmie', 'O firmie PRO-KOM — Rabka-Zdrój, od 2004 roku'],
  ] as const) {
    test(`${path} renders with its title and no axe violations`, async ({ page }) => {
      const response = await page.goto(site(HUB, path))
      expect(response?.status()).toBe(200)
      await expect(page).toHaveTitle(title)
      await expect(page.locator('h1')).toHaveCount(1)
      const results = await new AxeBuilder({ page }).analyze()
      expect(results.violations).toEqual([])
    })
  }

  test('legal pages exist and stay out of search', async ({ page }) => {
    for (const path of ['/polityka-prywatnosci', '/cookies', '/dostepnosc']) {
      const response = await page.goto(site(HUB, path))
      expect(response?.status(), path).toBe(200)
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    }
  })

  test('/kontakt says that only Tech works on Saturday (decision 15.11)', async ({ page }) => {
    await page.goto(site(HUB, '/kontakt'))
    await expect(page.getByText(/Czynny tylko .*Tech.*sob\. 9:00–14:00/)).toBeVisible()
  })

  test('/kontakt and /o-firmie show the landlines and the Zakopane Tech point (decision 15.11)', async ({
    page,
  }) => {
    await page.goto(site(HUB, '/kontakt'))
    await expect(page.getByRole('link', { name: /Biuro.*18 267 65 11/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Serwis.*18 541 20 55/ })).toBeVisible()
    await expect(
      page.getByText(/ul\. Stanisława Staszica 8, 34-500 Zakopane/).first(),
    ).toBeVisible()
    await page.goto(site(HUB, '/o-firmie'))
    await expect(page.getByText(/ul\. Stanisława Staszica 8, 34-500 Zakopane/)).toBeVisible()
  })

  test('the line sites keep their own /kontakt', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/kontakt'))
    await expect(page).toHaveTitle(/PRO-KOM Biznes/)
  })
})
