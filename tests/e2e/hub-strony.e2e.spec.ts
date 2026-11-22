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
      // The steps of „Nasza historia” fade in: axe reads their colours once the last one is in.
      if (path === '/o-firmie') {
        await expect(page.locator('.pk-story__steps li').last()).toHaveCSS('opacity', '1')
      }
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
    // Runda 1811 D5: the Tech numbers on their own card — Rabka, Zakopane and the infoline.
    for (const name of [
      /Tech, Rabka-Zdrój: 18 541 20 55/,
      /Tech, Zakopane: 18 541 20 15/,
      /Tech, Infolinia: 883 200 151/,
    ]) {
      await expect(page.getByRole('link', { name })).toBeVisible()
    }
    await expect(
      page.getByText(/ul\. Stanisława Staszica 8, 34-500 Zakopane/).first(),
    ).toBeVisible()
    await page.goto(site(HUB, '/o-firmie'))
    await expect(page.getByText(/ul\. Stanisława Staszica 8, 34-500 Zakopane/)).toBeVisible()
  })

  test('ALSEN: its section on the home page and on /o-firmie (runda 1811 D4)', async ({ page }) => {
    await page.goto(site(HUB, '/'))
    // The premium section above „Współpraca” (19.11) — the brands card is not repeated.
    const home = page.locator('section#alsen')
    await expect(
      home.getByRole('heading', { level: 2, name: 'Autoryzowany partner ALSEN' }),
    ).toBeVisible()
    await expect(home).toContainText('Autoryzowany partner')
    await expect(home.getByRole('img', { name: 'ALSEN' })).toBeVisible()
    await expect(home.getByRole('link', { name: /Strona sieci ALSEN/ })).toHaveAttribute(
      'href',
      'https://www.alsen.pl/',
    )
    await expect(home).toContainText('ul. Orkana 16B')
    await expect(page.locator('section#alsen + section#wspolpraca')).toHaveCount(1)
    await expect(page.locator('#marki .pk-net')).toHaveCount(0)
    await page.goto(site(HUB, '/o-firmie#alsen'))
    const section = page.locator('section#alsen')
    await expect(
      section.getByRole('heading', { level: 2, name: 'Autoryzowany partner ALSEN' }),
    ).toBeVisible()
    await expect(section.getByRole('img', { name: 'ALSEN' })).toBeVisible()
  })

  test('/kontakt shows only the old e-mails switched on in the panel (runda 1811 D15)', async ({
    page,
  }) => {
    await page.goto(site(HUB, '/kontakt'))
    // The shop mailbox in use is on pro-kom.eu (Krystian 19.11); the unused pro-kom.pl one is gone.
    await expect(page.locator('main').getByText('sklep@pro-kom.eu').first()).toBeVisible()
    await expect(page.getByText('sklep@pro-kom.pl')).toHaveCount(0)
  })

  test('/kontakt: both company numbers as tiles and every mailbox in one place (Krystian 22.11)', async ({
    page,
  }) => {
    await page.goto(site(HUB, '/kontakt'))
    const calls = page.locator('[data-contact-calls]')
    await expect(calls.locator('a[href="tel:+48883200151"]')).toBeVisible()
    await expect(calls.locator('a[href="tel:+48889003889"]')).toBeVisible()
    const mails = page.locator('section#adresy-e-mail')
    for (const email of [
      'biuro@pro-kom.eu',
      'sklep@pro-kom.eu',
      'kontakt@prokombiznes.pl',
      'kontakt@prokominstalacje.pl',
      'kontakt@prokomsoftware.pl',
      'kontakt@prokomserwis.pl',
      'kontakt@prokomgaming.pl',
    ]) {
      await expect(mails.locator(`a[href="mailto:${email}"]`)).toBeVisible()
    }
  })

  test('the line sites keep their own /kontakt', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/kontakt'))
    await expect(page).toHaveTitle(/PRO-KOM Biznes/)
  })
})
