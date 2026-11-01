import { expect, type Page, test } from '@playwright/test'

import { site } from '../helpers'

// I12: the full offer `/uslugi` and the realizations `/realizacje` (data from `pnpm seed`).
const HOST = 'instalacje.localhost'

async function open(page: Page, path: string) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const response = await page.goto(site(HOST, path))
  expect(response?.status()).toBe(200)
}

test.describe('Instalacje full offer', () => {
  test.use({ viewport: { width: 1440, height: 1000 } })

  test('lists 76 solutions in 10 areas, the search and the object filter narrow it', async ({
    page,
  }) => {
    await open(page, '/uslugi')
    await expect(page.locator('.ofa')).toHaveCount(10)
    await expect(page.locator('.ofcnt')).toContainText('Pokazujemy 76 z 76')
    // Three per area until „Pokaż wszystkie”.
    await expect(page.locator('#o-kam .ofi:visible')).toHaveCount(3)
    await page
      .locator('#o-kam')
      .getByRole('button', { name: /Pokaż wszystkie/ })
      .click()
    await expect(page.locator('#o-kam .ofi:visible')).toHaveCount(10)

    // A typo-tolerant search without Polish letters.
    await page.getByRole('searchbox', { name: 'Szukaj w ofercie' }).fill('koscioł')
    await expect(page.locator('.ofa:not(.hide)')).not.toHaveCount(0)
    await expect(page.locator('#o-snd')).toBeVisible()
    await page.getByRole('button', { name: 'Wyczyść' }).click()

    await page.getByRole('button', { name: 'Deweloper', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Deweloper', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(page.locator('#o-tel')).toBeVisible()
    await page.getByRole('button', { name: 'pokaż wszystko' }).click()
    await expect(page.locator('.ofcnt')).toContainText('Pokazujemy 76 z 76')
  })

  test('nothing found → a note with the planner link', async ({ page }) => {
    await open(page, '/uslugi')
    await page.getByRole('searchbox', { name: 'Szukaj w ofercie' }).fill('qwertyzxc')
    await expect(page.locator('#lista .note')).toContainText('Nic nie pasuje')
    await expect(page.locator('#lista .note a')).toHaveAttribute('href', '/zaplanuj')
  })
})

test.describe('Instalacje realizations', () => {
  test.use({ viewport: { width: 1440, height: 1000 } })

  test('shows the published realizations, filters by installation and object', async ({ page }) => {
    await open(page, '/realizacje')
    await expect(page.locator('.rgrid .rl:visible')).toHaveCount(6)
    await page.getByRole('button', { name: 'Pokaż wszystkie (11)' }).click()
    await expect(page.locator('.rgrid .rl:visible')).toHaveCount(11)

    await page.getByRole('button', { name: /^Anteny/ }).click()
    await expect(page.locator('.rgrid .rl:visible')).toHaveCount(1)
    await expect(page.locator('.rgrid')).toContainText('Dom prywatny')

    await page.getByRole('button', { name: /^Wszystkie/ }).click()
    await page.getByRole('button', { name: 'Kościoły' }).click()
    await expect(page.locator('.rgrid .rl:visible')).toHaveCount(3)
    expect(await page.locator('main').innerText()).not.toMatch(/\[SZEF/)
  })
})
