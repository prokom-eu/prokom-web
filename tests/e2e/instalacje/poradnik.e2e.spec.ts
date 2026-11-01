import { expect, type Page, test } from '@playwright/test'

import { site } from '../helpers'

// I12: the guide `/poradnik` and its RODO post (data from `pnpm seed`).
const HOST = 'instalacje.localhost'

async function open(page: Page, path: string) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const response = await page.goto(site(HOST, path))
  expect(response?.status()).toBe(200)
}

test.describe('Instalacje guide', () => {
  test.use({ viewport: { width: 1440, height: 1000 } })

  test('the featured post leads to /poradnik/<slug>, chips filter the cards', async ({ page }) => {
    await open(page, '/poradnik')
    await expect(page.locator('.prfeat')).toHaveAttribute('href', '/poradnik/monitoring-a-rodo')
    await expect(page.locator('.prc2')).toHaveCount(10)
    await page.getByRole('button', { name: 'Energia' }).click()
    await expect(page.locator('.prc2')).toHaveCount(1)
    await expect(page.locator('.prc2')).toHaveAttribute('href', '/ladowarki-ev#formalnosci')
  })

  test('the RODO post: table of contents, legal sentence, self-check, Article', async ({
    page,
  }) => {
    await open(page, '/poradnik/monitoring-a-rodo')
    await expect(page.locator('h1')).toContainText('Monitoring w pensjonacie a RODO')
    await expect(page.locator('.toc a')).toHaveCount(9)
    await expect(page.locator('.prose')).toContainText('To nie jest porada prawna.')
    await expect(page.locator('.qz')).toContainText('2 z 7')
    const checks = page.locator('.qz .chk')
    for (const index of [1, 3, 4, 5, 6]) await checks.nth(index).click()
    await expect(page.locator('.qz')).toContainText('Wygląda dobrze.')
    const types = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((els) => els.map((e) => JSON.parse(e.textContent ?? '{}')['@type']))
    expect(types.flat()).toEqual(expect.arrayContaining(['Article', 'BreadcrumbList']))
  })

  test('a post of another line or an unknown slug is a 404', async ({ page }) => {
    const response = await page.goto(site(HOST, '/poradnik/nie-ma-takiego'))
    expect(response?.status()).toBe(404)
    const other = await page.goto(site('biznes.localhost', '/poradnik/monitoring-a-rodo'))
    expect(other?.status()).toBe(404)
  })
})
