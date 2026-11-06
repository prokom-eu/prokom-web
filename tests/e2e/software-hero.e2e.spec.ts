import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { setTheme, site } from './helpers'

// SWA2a (ZMIANY-v24 §4.1–4.1a): the v24 hero of the Software start page — the word of the H1, the
// tiles (tabs), the 3D carousel of mock-ups, the caption with the price of the solution.
const HOST = 'software.localhost'
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

const hero = (page: Page) => page.locator('#start')
const word = (page: Page) => hero(page).locator('.hx-word')
const tabs = (page: Page) => hero(page).getByRole('tab')
const active = (page: Page) => hero(page).locator('.hx-win[data-rank="r0"]')

test.describe('Software hero v24', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('a tile switches the word, the mock-up and the caption (price from Solutions)', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(site(HOST))
    await expect(hero(page).getByRole('heading', { level: 1 })).toContainText('Zrobimy Ci')
    await expect(tabs(page)).toHaveCount(7)
    await expect(word(page)).toHaveText('stronę wizytówkę.')

    await tabs(page).nth(4).click()
    await expect(tabs(page).nth(4)).toHaveAttribute('aria-selected', 'true')
    await expect(word(page)).toHaveText('stronę restauracji.')
    await expect(active(page)).toContainText('Karczma Pod Lipą')
    const caption = hero(page).locator('.hx-cap')
    await expect(caption).toContainText('Restauracja')
    await expect(caption).toContainText(/od [\d\s]+zł/)
    await expect(caption.getByRole('link')).toHaveAttribute(
      'href',
      '/rozwiazania?rozwiazanie=strona-dla-restauracji-lub-baru',
    )
  })

  test('arrow keys move between the tiles', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(site(HOST))
    await tabs(page).first().focus()
    await page.keyboard.press('ArrowLeft')
    await expect(tabs(page).nth(6)).toBeFocused()
    await expect(word(page)).toHaveText('automatyzacje i AI.')
    await page.keyboard.press('Home')
    await expect(word(page)).toHaveText('stronę wizytówkę.')
  })

  test('the clock changes the slide every 4.2 s, not while pointed at', async ({ page }) => {
    await page.clock.install()
    await page.goto(site(HOST))
    await expect(word(page)).toHaveText('stronę wizytówkę.')
    // Off the hero (over the header): the clock runs.
    await page.mouse.move(700, 30)
    await page.clock.fastForward(4300)
    await expect(word(page)).toHaveText('stronę firmową.')
    await hero(page).locator('.hx-cmd').hover()
    await page.clock.fastForward(9000)
    await expect(word(page)).toHaveText('stronę firmową.')
  })

  test('the side windows are in 3D, the rest hidden; nothing is cut in the active one', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(site(HOST))
    const box = await active(page).boundingBox()
    expect(Math.round(box?.width ?? 0)).toBe(760)
    await expect(hero(page).locator('.hx-win[data-rank="rx"]')).toHaveCount(4)
    const stage = await active(page).locator('.mk-stage').boundingBox()
    expect(Math.abs((stage?.width ?? 0) - 760)).toBeLessThan(1)
  })

  test('no hydration errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    await page.goto(site(HOST))
    await expect(word(page)).toBeVisible()
    expect(errors.filter((text) => /hydrat/i.test(text))).toEqual([])
  })

  for (const theme of ['dark', 'light'] as const) {
    test(`no axe violations in the hero (${theme})`, async ({ page }) => {
      await setTheme(page, theme, { reducedMotion: 'reduce' })
      await page.goto(site(HOST))
      const result = await new AxeBuilder({ page }).include('#start').withTags(WCAG).analyze()
      expect(result.violations).toEqual([])
    })
  }
})
