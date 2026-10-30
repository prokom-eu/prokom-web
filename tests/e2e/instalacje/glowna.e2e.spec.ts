import { expect, type Page, test } from '@playwright/test'

import { site } from '../helpers'

// I5: the home hero „Twój obiekt na żywo” (spec §5.1, KOMPONENTY §3, MOBILE-APLIKACJA §6/§10).
// Data from `pnpm seed` (`seed:instalacje` publishes the home page with its `instHome` block).
// Reduced motion: the autoplay waits, so the hero stays in its starting state.
const HOST = 'instalacje.localhost'
const DESKTOP = { width: 1440, height: 1000 }
const hero = (page: Page) => page.locator('#start')

async function open(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  return page.goto(site(HOST))
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
    await expect(plain.locator('h1')).toContainText('Twój obiekt')
    await expect(plain.locator('#start .lead')).toContainText('Wybierz obiekt obok')
    await noJs.close()

    const response = await open(page)
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveText(
      'Monitoring, alarmy, Wi-Fi i smart home na Podhalu. Twój obiekt na żywo.',
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
    await expect(page.locator('.hxsh b')).toHaveText('Na żywo · Pensjonat')
    await expect(page.locator('.hxli b')).toHaveText(['Wi-Fi i sieć', 'Kamery'])
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
    await page.getByRole('tab', { name: 'Dom' }).click()
    await page.getByRole('button', { name: 'Zima' }).click()
    await expect(hero(page)).toHaveAttribute('data-hx-time', 'winter')
    await expect(page.locator('.hxsh b')).toHaveText('Na żywo · Dom')
    await expect(page.locator('.flk')).toHaveCount(90)

    const chips = page.getByRole('group', { name: 'Instalacje widoczne na obiekcie' })
    await chips.getByRole('button', { name: /Kamery/ }).click()
    await expect(page.locator('.pip')).toHaveCount(0)
    await chips.getByRole('button', { name: /Smart home Ampio/ }).click()
    await expect(chips.getByRole('button', { name: /Smart home Ampio/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(page.locator('.hxli').first()).toContainText('Na zewnątrz −12°')
    await expect(chips.getByRole('link', { name: 'Zaplanuj taki zestaw →' })).toHaveAttribute(
      'href',
      '/zaplanuj#obiekt=dom&uslugi=wifi,smart',
    )

    await chips.getByRole('button', { name: 'Pokaż wszystko' }).click()
    await expect(page.locator('.hxmore')).toContainText('+6 instalacji więcej')
    await chips.getByRole('button', { name: 'Wyłącz wszystko' }).click()
    await expect(page.locator('.hxempty')).toBeVisible()
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
    await expect(page.getByRole('tab', { name: 'Dom' })).toHaveAttribute('aria-selected', 'true')
  })

  test('plays by itself without reduced motion and stops at the first touch', async ({ page }) => {
    await page.goto(site(HOST))
    await expect(page.locator('.hxmore')).toBeVisible({ timeout: 6000 })
    await page.getByRole('button', { name: 'Dzień' }).click()
    const panel = await page.locator('.hxl').innerText()
    await page.waitForTimeout(2600)
    expect(await page.locator('.hxl').innerText()).toBe(panel)
  })
})

test.describe('Instalacje home hero on a phone', () => {
  for (const width of [360, 390, 414]) {
    test(`no horizontal scroll at ${width} px, the scene above the text`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await open(page)
      const scroll = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(scroll).toBe(width)
      const scene = await page.locator('.hxsvg').boundingBox()
      const heading = await page.locator('h1').boundingBox()
      expect(scene && heading && scene.y < heading.y).toBe(true)
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
