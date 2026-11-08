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

  test('nothing found → the planner with the phrase in the description (RUNDA-V5 §8)', async ({
    page,
  }) => {
    await open(page, '/uslugi')
    await page.getByRole('searchbox', { name: 'Szukaj w ofercie' }).fill('basen z falami')
    await expect(page.locator('#lista .ofempty')).toContainText('Nie znaleźliśmy tego w ofercie')
    await expect(page.locator('#lista .ofempty a')).toHaveAttribute(
      'href',
      '/zaplanuj?opis=basen%20z%20falami',
    )
  })

  test('matched words are underlined, `?q=` starts the search, the filters stick', async ({
    page,
  }) => {
    await open(page, '/uslugi?q=kamera')
    await expect(page.getByRole('searchbox', { name: 'Szukaj w ofercie' })).toHaveValue('kamera')
    await expect(page.locator('#o-kam .ofi mark').first()).toBeVisible()
    await page.evaluate(() => window.scrollTo({ top: 1600, behavior: 'instant' }))
    await expect
      .poll(async () => (await page.locator('.ofsticky').boundingBox())?.y ?? -1)
      .toBeLessThan(120)
    expect((await page.locator('.ofsticky').boundingBox())?.y ?? -1).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Instalacje full offer on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('filters open in a sheet, the chosen object shows on the button', async ({ page }) => {
    await open(page, '/uslugi')
    const open_ = page.getByRole('button', { name: 'Filtry' })
    // Retried until hydrated (a click before that is lost).
    await expect(async () => {
      await open_.click()
      await expect(page.getByRole('dialog', { name: 'Rodzaj obiektu' })).toBeVisible({
        timeout: 500,
      })
    }).toPass()
    await page
      .getByRole('dialog', { name: 'Rodzaj obiektu' })
      .getByRole('button', { name: 'Deweloper', exact: true })
      .click()
    await expect(page.getByRole('dialog', { name: 'Rodzaj obiektu' })).toBeHidden()
    await expect(page.locator('.ofsf')).toHaveText('Deweloper')
    await expect(page.locator('.ofcnt')).not.toContainText('76 z 76')
    // One search field at a time: the compact one only after the hero's has scrolled away.
    await expect(page.getByRole('searchbox', { name: 'Szukaj w ofercie' })).toHaveCount(1)
    await page.evaluate(() => window.scrollTo({ top: 2000, behavior: 'instant' }))
    await expect(page.locator('.ofsticky').getByRole('searchbox')).toBeVisible()
  })
})

test.describe('Instalacje realizations', () => {
  test.use({ viewport: { width: 1440, height: 1000 } })

  test('shows the published realizations, filters by installation and object', async ({ page }) => {
    await open(page, '/realizacje')
    await expect(page.locator('.rgrid .rl:visible')).toHaveCount(6)
    // Runda v6 D2: the 3 realizations without photos (Empik, Kaplica, FitBar) are hidden.
    await page.getByRole('button', { name: 'Pokaż wszystkie (8)' }).click()
    await expect(page.locator('.rgrid .rl:visible')).toHaveCount(8)
    await expect(page.locator('.rgrid .rl:not(:has(img))')).toHaveCount(0)

    await page.getByRole('button', { name: /^Anteny/ }).click()
    await expect(page.locator('.rgrid .rl:visible')).toHaveCount(1)
    await expect(page.locator('.rgrid')).toContainText('Dom prywatny')

    await page.getByRole('button', { name: /^Wszystkie/ }).click()
    await page.getByRole('button', { name: 'Kościoły' }).click()
    await expect(page.locator('.rgrid .rl:visible')).toHaveCount(2)
    expect(await page.locator('main').innerText()).not.toMatch(/\[SZEF/)
  })

  // Round v5 (RUNDA-V5 §4): photos from pro-kom.eu (`pnpm seed`), the gallery in a <dialog>.
  test('a card with photos opens the gallery: arrows, keys, counter, Esc', async ({ page }) => {
    await open(page, '/realizacje')
    const cover = page.getByRole('button', { name: /^Blachotrapez: 17 zdjęć/ })
    await cover.click()
    const gallery = page.getByRole('dialog', { name: 'Zdjęcia: Blachotrapez' })
    await expect(gallery).toBeVisible()
    const counter = gallery.locator('.rlgc [aria-hidden="true"]')
    await expect(counter).toHaveText('1 / 17')
    await page.keyboard.press('ArrowRight')
    await expect(counter).toHaveText('2 / 17')
    // P2-18: the live region reads the photo's description with its place.
    await expect(gallery.locator('.rlgc .sr-only')).toHaveText(/^Zdjęcie 2 z 17: \S.{9,}/)
    await gallery.getByRole('button', { name: 'Poprzednie zdjęcie' }).click()
    await gallery.getByRole('button', { name: 'Poprzednie zdjęcie' }).click()
    await expect(counter).toHaveText('17 / 17')
    await expect(gallery.locator('img')).toHaveAttribute('alt', /\S{10,}/)
    await page.keyboard.press('Escape')
    await expect(gallery).toBeHidden()
    await expect(cover).toBeFocused()
    // Runda v6 D2: a realization without photos is not on the page at all.
    await page.getByRole('button', { name: 'Pokaż wszystkie (8)' }).click()
    await expect(page.locator('.rgrid')).not.toContainText('FitBar')
  })
})
