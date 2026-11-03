import { expect, test } from '@playwright/test'

import { site } from './helpers'

// K31d′: „Plan Twojej firmy” 2.0 (`/plan-firmy`, spec. §6.12, `k4/boards/Web-Plan*`). Scenes from
// `pnpm seed` (`seed:biznes`): 12 scenes, 186 points (`plany-k4.json`).
const biznes = (path: string) => site('biznes.localhost', path)

test.describe('Biznes plan of the company (K31d′)', () => {
  test('12 scenes with counts from the database; a scene loads its drawing', async ({ page }) => {
    const response = await page.goto(biznes('/plan-firmy'))
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Plan Twojej firmy: kliknij urządzenie i zobacz, co pasuje',
    )
    await expect(page.locator('main dl').first()).toContainText('12')
    await expect(page.locator('main dl').first()).toContainText('186')
    const scenes = page.getByRole('group', { name: 'Rodzaj firmy' }).getByRole('button')
    await expect(scenes).toHaveCount(12)
    await expect(page.locator('.fp-stage svg')).toHaveCount(1)

    const svg = page.waitForResponse((r) => r.url().includes('/api/plan-svg/biuro'))
    await scenes.filter({ hasText: 'Biuro' }).click()
    expect((await svg).status()).toBe(200)
    await expect(page.getByRole('heading', { level: 2, name: /^Biuro/ })).toBeVisible()
    await expect(page).toHaveURL(/\?scena=biuro$/)
    await expect(page.locator('.fp-stage svg')).toHaveCount(1)
  })

  test('?scena= picks the scene on load', async ({ page }) => {
    await page.goto(biznes('/plan-firmy?scena=apteka'))
    await expect(page.getByRole('heading', { level: 2, name: 'Apteka' })).toBeVisible()
  })

  test('point → popup: film only after the click, Esc, add with the plan note', async ({
    page,
  }) => {
    const youtube: string[] = []
    page.on('request', (request) => {
      if (/youtube/.test(request.url())) youtube.push(request.url())
    })
    await page.goto(biznes('/plan-firmy?scena=biuro'))
    await page.evaluate(() => localStorage.removeItem('pk-cart'))
    await page.reload()

    const point = page.locator('.fp-stage').getByRole('button', { name: /ThinkBook/ })
    await point.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { level: 2 })).toContainText('ThinkBook')
    await expect(dialog).toContainText(/\d+ z \d+/)
    expect(youtube).toEqual([])
    await expect(dialog.locator('iframe')).toHaveCount(0)

    await dialog.getByRole('button', { name: 'Dodaj do zapytania' }).click()
    await expect(dialog.getByRole('button', { name: '✓ W zapytaniu' })).toBeVisible()
    const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('pk-cart') ?? '[]'))
    expect(cart).toEqual([
      expect.objectContaining({ uwaga: expect.stringMatching(/^Plan: Biuro/) as unknown }),
    ])

    await page.keyboard.press('ArrowRight')
    await expect(dialog.getByRole('heading', { level: 2 })).not.toContainText('ThinkBook')
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('„Dodaj cały plan do zapytania” adds every product once', async ({ page }) => {
    await page.goto(biznes('/plan-firmy'))
    await page.evaluate(() => localStorage.removeItem('pk-cart'))
    await page.reload()
    const add = page.getByRole('button', { name: /Dodaj cały plan do zapytania · \d+ poz\./ })
    const count = Number((await add.textContent())?.match(/(\d+) poz\./)?.[1])
    await add.click()
    await expect
      .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('pk-cart') ?? '[]').length))
      .toBe(count)
  })

  for (const width of [360, 390, 414]) {
    test(`no horizontal scroll at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto(biznes('/plan-firmy'))
      const scroll = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(scroll).toBeLessThanOrEqual(width)
    })
  }

  test('the plan drawing is closed on other lines', async ({ request }) => {
    const response = await request.get(site('software.localhost', '/api/plan-svg/sklep'))
    expect(response.status()).toBe(404)
  })

  // ADR-023: the home page sends the products of the first scene only; the others load when picked.
  test('home page: another scene loads its products when picked', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(biznes('/'))
    await page.waitForLoadState('networkidle')
    const plan = page.locator('#plan')
    const scene = page.waitForResponse((r) => r.url().includes('/api/plan-scene/biuro'))
    await plan
      .getByRole('group', { name: 'Rodzaj firmy' })
      .getByRole('button', { name: /Biuro/ })
      .click()
    expect((await scene).status()).toBe(200)
    await expect(plan.getByRole('heading', { level: 3, name: /^Biuro/ })).toBeVisible()
    await expect(plan.locator('.fp-stage').getByRole('button', { name: /ThinkBook/ })).toBeVisible()
  })

  test('/plan-firmy has every scene in the page: picking one asks for no products', async ({
    page,
  }) => {
    const asked: string[] = []
    page.on('request', (r) => {
      if (r.url().includes('/api/plan-scene/')) asked.push(r.url())
    })
    await page.goto(biznes('/plan-firmy'))
    await page.waitForLoadState('networkidle')
    await page
      .getByRole('group', { name: 'Rodzaj firmy' })
      .getByRole('button', { name: /Biuro/ })
      .click()
    await expect(page.getByRole('heading', { level: 2, name: /^Biuro/ })).toBeVisible()
    await expect(page.locator('.fp-stage').getByRole('button', { name: /ThinkBook/ })).toBeVisible()
    expect(asked).toEqual([])
  })

  test('scene products answer only for a scene of the Biznes site', async ({ request }) => {
    expect((await request.get(biznes('/api/plan-scene/biuro'))).status()).toBe(200)
    expect((await request.get(biznes('/api/plan-scene/nie-ma-takiej'))).status()).toBe(404)
    const other = await request.get(site('software.localhost', '/api/plan-scene/biuro'))
    expect(other.status()).toBe(404)
  })
})
