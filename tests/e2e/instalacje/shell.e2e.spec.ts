import { expect, type Page, test } from '@playwright/test'

import { site } from '../helpers'

// I3: the shell of the Instalacje line (spec §4, MOBILE-APLIKACJA §2–§4, §10). Data from
// `pnpm seed` (services and objects published by `seed:instalacje`). Service and object pages
// come in later sessions: their addresses answer 404 inside the shell, which is enough here.
const HOST = 'instalacje.localhost'
const DESKTOP = { width: 1440, height: 1000 }
const PHONE = { width: 390, height: 844 }

const sheet = (page: Page) => page.getByRole('dialog', { name: 'Menu' })
const bottomBar = (page: Page) => page.getByRole('navigation', { name: 'Szybka nawigacja' })

test.describe('Instalacje desktop header', () => {
  test.use({ viewport: DESKTOP })

  test('mega menu: hover, the pointer crosses to an item, the click works', async ({ page }) => {
    await page.goto(site(HOST))
    const button = page.getByRole('button', { name: 'Usługi', exact: true })
    const panel = page.getByRole('region', { name: 'Usługi' })
    await button.hover()
    await expect(panel).toBeVisible()
    await expect(button).toHaveAttribute('aria-expanded', 'true')

    // Through the gap between the button and the panel (the bridge), slowly, like a hand.
    const item = panel.getByRole('link').first()
    const href = await item.getAttribute('href')
    const box = await item.boundingBox()
    if (!box) throw new Error('no menu item box')
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 25 })
    await expect(panel).toBeVisible()
    await item.click()
    await expect(page).toHaveURL(new RegExp(`${href}$`))
    await expect(panel).toBeHidden()
  })

  test('closes after the pointer leaves, and on Esc back to its button', async ({ page }) => {
    await page.goto(site(HOST))
    const button = page.getByRole('button', { name: 'Dla kogo', exact: true })
    const panel = page.getByRole('region', { name: 'Dla kogo' })
    await button.hover()
    await expect(panel).toBeVisible()
    await page.mouse.move(700, 900)
    await expect(panel).toBeHidden()

    await button.focus()
    await page.keyboard.press('Enter')
    await expect(panel).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
    await expect(button).toBeFocused()
  })

  test('a click toggles; Tab stays inside the open panel', async ({ page }) => {
    await page.goto(site(HOST))
    const button = page.getByRole('button', { name: 'Usługi', exact: true })
    const panel = page.getByRole('region', { name: 'Usługi' })
    await button.focus()
    await page.keyboard.press('Enter')
    await expect(panel).toBeVisible()

    const stops = await panel.locator('a[href], button').count()
    for (let i = 0; i < stops + 1; i++) await page.keyboard.press('Tab')
    await expect(button).toBeFocused()

    await page.waitForTimeout(700)
    await button.click()
    await expect(panel).toBeHidden()
  })

  test('marks the section of the page and has „Dla architektów”', async ({ page }) => {
    await page.goto(site(HOST, '/realizacje'))
    await expect(page.getByRole('navigation', { name: 'Główne menu' })).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Realizacje', exact: true }).first(),
    ).toHaveAttribute('aria-current', 'page')
    await expect(page.getByRole('link', { name: 'Dla architektów' }).first()).toHaveAttribute(
      'href',
      '/dla-architektow',
    )
  })

  test('theme switch remembers the choice and moves the browser bar colour', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto(site(HOST))
    await page.getByRole('button', { name: 'Włącz ciemny motyw' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(page.locator('meta[name="theme-color"]').first()).toHaveAttribute(
      'content',
      '#101412',
    )
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(page.getByRole('button', { name: 'Włącz jasny motyw' })).toBeVisible()
  })
})

test.describe('Instalacje phone shell', () => {
  test.use({ viewport: PHONE, hasTouch: true })

  test('bottom bar: five items, Start active on the start page, „Dla kogo” on an object', async ({
    page,
  }) => {
    await page.goto(site(HOST))
    const bar = bottomBar(page)
    await expect(bar.getByRole('link').or(bar.getByRole('button'))).toHaveCount(5)
    await expect(bar.getByRole('link', { name: 'Start' })).toHaveAttribute('aria-current', 'page')
    await expect(bar.getByRole('link', { name: 'Zaplanuj' })).toHaveAttribute('href', '/zaplanuj')

    // `/dla-kogo/<obiekt>` has no route before I10 (generic 404 outside the shell); the section
    // address itself answers 404 inside the shell.
    await page.goto(site(HOST, '/dla-kogo'))
    await expect(bottomBar(page).getByRole('button', { name: 'Dla kogo' })).toHaveClass(/act/)
  })

  for (const [tab, pressed] of [
    ['Usługi', 'Usługi'],
    ['Dla kogo', 'Dla kogo'],
    ['Więcej', 'Więcej'],
  ] as const) {
    test(`the sheet opens on „${tab}” and closes with ×`, async ({ page }) => {
      await page.goto(site(HOST))
      await bottomBar(page).getByRole('button', { name: tab }).click()
      await expect(sheet(page)).toBeVisible()
      await expect(sheet(page).getByRole('button', { name: pressed, exact: true })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      // The page under the sheet does not scroll (the effect, not only the class).
      const overflow = () =>
        page.evaluate(() => getComputedStyle(document.documentElement).overflow)
      await expect.poll(overflow).toBe('hidden')
      await sheet(page).getByRole('button', { name: 'Zamknij' }).click()
      await expect(sheet(page)).toBeHidden()
      await expect(page.locator('html')).not.toHaveClass(/pk-lock/)
    })
  }

  test('the sheet closes with the backdrop, Esc and „back”', async ({ page }) => {
    await page.goto(site(HOST))
    const open = () => bottomBar(page).getByRole('button', { name: 'Usługi' }).click()

    await open()
    await expect(sheet(page)).toBeVisible()
    await page.mouse.click(200, 20)
    await expect(sheet(page)).toBeHidden()

    await open()
    await expect(sheet(page)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(sheet(page)).toBeHidden()

    await open()
    await expect(sheet(page)).toBeVisible()
    await page.goBack()
    await expect(sheet(page)).toBeHidden()
    await expect(page).toHaveURL(site(HOST))
  })

  test('a link in the sheet leads on; „back” returns to the page, not to the sheet', async ({
    page,
  }) => {
    await page.goto(site(HOST))
    await bottomBar(page).getByRole('button', { name: 'Więcej' }).click()
    await sheet(page)
      .getByRole('link', { name: /Realizacje/ })
      .click()
    await expect(page).toHaveURL(site(HOST, '/realizacje'))
    await expect(sheet(page)).toBeHidden()
    await page.goBack()
    await expect(page).toHaveURL(site(HOST))
    await expect(sheet(page)).toBeHidden()
  })

  test('„Zaplanuj instalację” at the bottom of the sheet leads on; „back” returns to the page', async ({
    page,
  }) => {
    await page.goto(site(HOST))
    await bottomBar(page).getByRole('button', { name: 'Usługi' }).click()
    await sheet(page).getByRole('link', { name: 'Zaplanuj instalację', exact: true }).click()
    await expect(page).toHaveURL(site(HOST, '/zaplanuj'))
    await expect(sheet(page)).toBeHidden()
    await page.goBack()
    await expect(page).toHaveURL(site(HOST))
    await expect(sheet(page)).toBeHidden()
  })

  test('the header hides while scrolling down and comes back when scrolling up', async ({
    page,
  }) => {
    await page.goto(site(HOST))
    const header = page.locator('#naglowek')
    const scrollTo = (y: number) => page.evaluate((top) => window.scrollTo({ top }), y)
    // Retried until the page is hydrated (before that nothing listens to the scroll).
    await expect(async () => {
      await scrollTo(0)
      for (const y of [150, 300, 450, 600]) {
        await scrollTo(y)
        await page.waitForTimeout(50)
      }
      await expect(header).toHaveClass(/hdrh/, { timeout: 500 })
    }).toPass()
    await expect(page.locator('html')).toHaveAttribute('data-hdr-hidden', '')
    await scrollTo(400)
    await expect(header).not.toHaveClass(/hdrh/)
  })
})

test.describe('Instalacje shell layout', () => {
  for (const width of [360, 390, 414]) {
    test(`no horizontal scroll at ${width} px, the bar covers nothing at the end`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 })
      for (const path of ['/', '/monitoring']) {
        await page.goto(site(HOST, path))
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        )
        expect(overflow, path).toBeLessThanOrEqual(0)
      }
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
      const bar = await bottomBar(page).boundingBox()
      const last = await page.locator('#stopka .fbot').boundingBox()
      if (!bar || !last) throw new Error('no box')
      expect(last.y + last.height).toBeLessThanOrEqual(bar.y)
    })
  }

  test('a missing page answers 404 inside the shell', async ({ page }) => {
    const response = await page.goto(site(HOST, '/nie-ma-takiej-strony'))
    expect(response?.status()).toBe(404)
    await expect(page.locator('#naglowek')).toBeVisible()
    await expect(page.locator('#stopka')).toBeVisible()
  })
})
