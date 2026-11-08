import { expect, type Page, test } from '@playwright/test'

import { site } from '../helpers'

// I5: the home hero „Twój obiekt na żywo” (spec §5.1, KOMPONENTY §3, MOBILE-APLIKACJA §6/§10);
// round v5 (RUNDA-V5 §1): new heading, the „Na żywo” status in the dock from 1024 px. The layout
// in six window sizes: hero-uklad.e2e.spec.ts.
// Data from `pnpm seed` (`seed:instalacje` publishes the home page with its `instHome` block).
// Reduced motion: the autoplay waits, so the hero stays in its starting state.
const HOST = 'instalacje.localhost'
const DESKTOP = { width: 1440, height: 1000 }
const hero = (page: Page) => page.locator('#start')

async function open(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const response = await page.goto(site(HOST))
  // ADR-023: the hero's widgets hydrate from their own chunks; a key before that is lost.
  await page.waitForLoadState('networkidle')
  return response
}

test.describe('Instalacje home hero', () => {
  test.use({ viewport: DESKTOP })

  test('the heading and the lead are in the server HTML, with the page SEO', async ({
    page,
    browser,
  }) => {
    // Without JavaScript: the text column comes from the server (SEO, LCP from the h1).
    const noJs = await browser.newContext({ javaScriptEnabled: false })
    const plain = await noJs.newPage()
    await plain.goto(site(HOST))
    await expect(plain.locator('h1')).toContainText('Twój inteligentny obiekt')
    await expect(plain.locator('#start .lead')).toContainText('Wybierz obiekt obok')
    await noJs.close()

    const response = await open(page)
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveText(
      'Monitoring, alarmy, Wi-Fi i smart home na Podhalu. Twój inteligentny obiekt na żywo.',
    )
    await expect(page).toHaveTitle(
      'Monitoring, alarmy, Wi-Fi, smart home Podhale | PRO-KOM Instalacje',
    )
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description?.length ?? 999).toBeLessThanOrEqual(155)
  })

  test('starts as in the prototype: guesthouse at night, cameras and Wi-Fi', async ({ page }) => {
    await open(page)
    await expect(hero(page)).toHaveAttribute('data-hx-time', 'night')
    await expect(page.getByRole('tab', { name: 'Pensjonat' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByRole('button', { name: 'Noc' })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('.hxdst b')).toHaveText('Na żywo · Pensjonat · Noc')
    await expect(page.locator('.hxdtx')).toContainText('Osobna sieć dla gości')
    await expect(page.locator('.hxstat')).toBeHidden()
    await expect(page.locator('.pip')).toBeVisible()
    await expect(hero(page).getByRole('link', { name: 'Zaplanuj instalację' })).toHaveAttribute(
      'href',
      '/zaplanuj#obiekt=pens&uslugi=kam,wifi',
    )
  })

  test('object, time of day and installations change the scene, the panel and the link', async ({
    page,
  }) => {
    await open(page)
    await page.getByRole('tab', { name: 'Dom', exact: true }).click()
    await page.getByRole('button', { name: 'Zima' }).click()
    await expect(hero(page)).toHaveAttribute('data-hx-time', 'winter')
    await expect(page.locator('.hxdst b')).toHaveText('Na żywo · Dom · Zima')
    await expect(page.locator('.flk')).toHaveCount(90)

    const chips = page.getByRole('group', { name: 'Instalacje widoczne na obiekcie' })
    await chips.getByRole('button', { name: /Kamery/ }).click()
    await expect(page.locator('.pip')).toHaveCount(0)
    await chips.getByRole('button', { name: /Smart home Ampio/ }).click()
    await expect(chips.getByRole('button', { name: /Smart home Ampio/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(page.locator('.hxdtx')).toContainText('Na zewnątrz −12°')
    await expect(chips.getByRole('link', { name: 'Zaplanuj taki zestaw →' })).toHaveAttribute(
      'href',
      '/zaplanuj#obiekt=dom&uslugi=wifi,smart',
    )

    // The dock has no „Pokaż wszystko” (RUNDA-V5 §1.3): it stays in the phone layout.
    await expect(chips.getByRole('button', { name: 'Pokaż wszystko' })).toBeHidden()
    for (const name of ['Alarm', 'Domofon i dostęp', 'Ładowarka EV', 'Nagłośnienie', 'Ekrany'])
      await chips.getByRole('button', { name: new RegExp(name) }).click()
    await expect(page.locator('.hxdst em')).toHaveText('+5')
  })

  test('the object tabs move with the arrow keys', async ({ page }) => {
    await open(page)
    await page.getByRole('tab', { name: 'Pensjonat' }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('tab', { name: 'Hotel' })).toBeFocused()
    await expect(page.getByRole('tab', { name: 'Hotel' })).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('End')
    await expect(page.getByRole('tab', { name: 'Firma' })).toBeFocused()
    await page.keyboard.press('Home')
    await expect(page.getByRole('tab', { name: 'Dom', exact: true })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  test('plays by itself without reduced motion and stops at the first touch', async ({ page }) => {
    await page.goto(site(HOST))
    await expect(page.locator('.hxdst em')).toBeVisible({ timeout: 6000 })
    await expect(page.locator('.hoprog')).toBeVisible()
    await page.getByRole('button', { name: 'Dzień' }).click()
    await expect(page.locator('.hoprog')).toHaveCount(0)
    const status = await page.locator('.hxdst').innerText()
    await page.mouse.move(0, 0)
    await page.waitForTimeout(2600)
    expect(await page.locator('.hxdst').innerText()).toBe(status)
  })

  // P2-11 (WCAG 2.2.2): a visible pause stops the autoplay and its progress bar.
  test('the pause button stops the autoplay and the progress bar', async ({ page }) => {
    await page.goto(site(HOST))
    await page.waitForLoadState('networkidle')
    const pause = page.getByRole('button', { name: 'Wstrzymaj pokaz' })
    await expect(pause).toHaveAttribute('aria-pressed', 'false')
    await pause.click()
    await expect(pause).toHaveAttribute('aria-pressed', 'true')
    // Away from the hero: hover would pause it anyway — only the button keeps it stopped.
    await page.mouse.move(0, 0)
    await page.locator('h1').evaluate((h1) => (h1 as HTMLElement).blur())
    const read = () =>
      page.evaluate(() => ({
        status: document.querySelector('.hxdst')?.textContent ?? '',
        tab: document.querySelector('.hotab.on')?.textContent ?? '',
        bar: getComputedStyle(document.querySelector('.hoprog')!).transform,
      }))
    const before = await read()
    await page.waitForTimeout(3000)
    expect(await read()).toEqual(before)
    await pause.click()
    await expect(pause).toHaveAttribute('aria-pressed', 'false')
  })

  // P2-11: where there is no room for the camera preview, a camera point opens it; Esc closes it.
  test('Esc closes the camera preview opened from a camera point', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(site(HOST))
    await page.waitForLoadState('networkidle')
    const point = page.locator('#hx-scena [role="button"]').first()
    await point.focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('.pip')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('.pip')).toBeHidden()
    await expect(point).toBeFocused()
  })
})

test.describe('Instalacje home hero on a phone', () => {
  for (const width of [360, 390, 414]) {
    // P2-12 (audit 06.11): the first screen is the H1, the lead and the buttons; the scene comes
    // under them and the whole hero stays well under two screens (was ~2.5).
    test(`no horizontal scroll at ${width} px, H1, lead and buttons first`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await open(page)
      const scroll = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(scroll).toBe(width)
      const scene = await page.locator('.hxbld').boundingBox()
      const heading = await page.locator('h1').boundingBox()
      expect(scene && heading && heading.y < scene.y).toBe(true)
      const lastButton = await page.locator('.hxt .btn').last().boundingBox()
      expect((lastButton?.y ?? 9999) + (lastButton?.height ?? 0)).toBeLessThanOrEqual(844)
      const hero = await page.locator('#start').boundingBox()
      expect(hero?.height ?? 9999).toBeLessThanOrEqual(844 * 1.8)
    })
  }

  test('time buttons and chips are touch targets of at least 44 px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await open(page)
    for (const target of await page.locator('.hmode, .hchip, .hotab').all()) {
      const box = await target.boundingBox()
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
    }
  })
})
