import { expect, test } from '@playwright/test'

import { api, hydrated, loginAsAdmin, site, tenantId } from './helpers'

// B2-3: the home page section „Zaopatrzenie firm” (ZAOPATRZENIE §8) and the brands in two
// moving strips (§9). Data from `pnpm seed` (package `strona-glowna-k4.json → zaopatrzenie`,
// both procurement pages published).

test.describe('Biznes home: Zaopatrzenie firm and the brand strips (B2-3)', () => {
  test('section right after the offer, before the brands', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const order = await page
      .locator('#oferta, #zaopatrzenie, #marki')
      .evaluateAll((elements) => elements.map((element) => element.id))
    expect(order).toEqual(['oferta', 'zaopatrzenie', 'marki'])
    const section = page.locator('#zaopatrzenie')
    await expect(section.getByRole('heading', { level: 2 })).toContainText('Dostarczymy')
    await expect(section.getByRole('heading', { level: 3 })).toHaveCount(2)
  })

  test('two cards link to the procurement pages with ?typ=&n=', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const section = page.locator('#zaopatrzenie')
    await expect(section.getByRole('link', { name: /AGD i RTV dla firm/ })).toHaveAttribute(
      'href',
      /^\/agd-rtv-dla-firm\?typ=kawalerka&n=12#zestaw$/,
    )
    await expect(section.getByRole('link', { name: /Dostawy IT dla firm/ })).toHaveAttribute(
      'href',
      /^\/dostawy-it-dla-firm\?typ=biuro&n=12#zestaw$/,
    )
    // Placeholders of the panel promise never leak into the page.
    await expect(section).not.toContainText('{callback}')
  })

  test('the calculator updates the result and the link', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    const card = page.locator('#zaopatrzenie article').first()
    const link = card.getByRole('link', { name: /AGD i RTV dla firm/ })
    const result = card.locator('.zh-res b')
    const more = card.getByRole('button', { name: 'Więcej' })
    await hydrated(more)
    const before = Number(await result.textContent())
    const perUnit = before / 12
    await more.click()
    await expect(card.locator('.zh-step output')).toHaveText('13')
    await expect(result).toHaveText(String(perUnit * 13))
    await expect(card.locator('.zh-res')).toContainText('13 lokali')
    await expect(link).toHaveAttribute('href', /typ=kawalerka&n=13/)

    const room = card.getByRole('button', { name: 'Pokój hotelowy' })
    await room.click()
    await expect(room).toHaveAttribute('aria-pressed', 'true')
    await expect(link).toHaveAttribute('href', /typ=pokoj&n=13/)
    await expect(result).not.toHaveText(String(perUnit * 13))
  })

  test('every brand of the database is a link, once in the first copies', async ({ page }) => {
    await loginAsAdmin(page)
    const biznes = await tenantId(page, 'biznes')
    const { json } = await api(
      page,
      'GET',
      // The seller's own brand (PRO-KOM) is not a strip tile, as in the prototype.
      `/api/partners?where[tenants][in]=${biznes}&where[slug][not_equals]=pro-kom&limit=0&depth=0`,
    )
    const total = json.totalDocs as number
    await page.goto(site('biznes.localhost'))
    const brands = page.locator('#marki')
    // The second copy of each strip (the loop) is `aria-hidden` and `inert`.
    const tiles = brands.locator('.zp-marq-group:not([aria-hidden]) > li > a')
    await expect(tiles).toHaveCount(total)
    for (const tile of await tiles.all()) {
      await expect(tile).toHaveAttribute('href', /^\//)
    }
    await expect(brands.locator('.zp-marq-group[aria-hidden="true"]').first()).toHaveAttribute(
      'inert',
      '',
    )
  })

  test('a strip stands under the mouse and after the pause button', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site('biznes.localhost'))
    const brands = page.locator('#marki')
    const pause = brands.getByRole('button', { name: 'Wstrzymaj animację' })
    await hydrated(pause)
    const tracks = brands.locator('.zp-marq-track')
    await tracks.first().scrollIntoViewIfNeeded()
    const transform = (i: number) =>
      tracks.nth(i).evaluate((element) => getComputedStyle(element).transform)
    // Horizontal offset of a strip (the speed eases out, so „stands” = under 1 px in 500 ms).
    const offset = (i: number) =>
      tracks.nth(i).evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m41)

    // It moves on its own…
    const start = await transform(0)
    await expect.poll(() => transform(0)).not.toBe(start)
    // …eases to a stop under the mouse (1 s), then stays still for 500 ms.
    await brands.locator('.zp-marq-view').first().hover()
    await page.waitForTimeout(1000)
    const still = await offset(0)
    await page.waitForTimeout(500)
    expect(Math.abs((await offset(0)) - still)).toBeLessThan(1)

    // One button stops both strips.
    await page.mouse.move(0, 0)
    await pause.click()
    await expect(brands.getByRole('button', { name: 'Wznów animację' })).toBeVisible()
    await page.waitForTimeout(1000)
    const paused = [await offset(0), await offset(1)]
    await page.waitForTimeout(500)
    expect(Math.abs((await offset(0)) - paused[0]!)).toBeLessThan(1)
    expect(Math.abs((await offset(1)) - paused[1]!)).toBeLessThan(1)
  })

  for (const width of [360, 390, 1024, 1440]) {
    test(`no horizontal scroll at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(site('biznes.localhost'))
      await page.locator('#marki').scrollIntoViewIfNeeded()
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }
})
