import { expect, test } from '@playwright/test'

import { site } from './helpers'

// BIZ-1 PR 1 (docs/zadania/prokombiznes-0611.md §5.2): icons on /opieka-it (D13), no sideways
// scroll on bundle pages (D11), KSeF post without the 450 zł sentence (D17).

test.describe('Biznes — twarde zasady (paczka 0611)', () => {
  test('/opieka-it: every area tab has a drawn icon and the console stays clean', async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    await page.goto(site('biznes.localhost', '/opieka-it'))
    const tabs = page.locator('#zakres').getByRole('tab')
    await expect(tabs).toHaveCount(8)
    await expect(tabs.filter({ hasText: 'Sieć i Wi-Fi' })).toHaveCount(1)
    for (let i = 0; i < 8; i++) {
      const path = tabs.nth(i).locator('svg path').first()
      // A hard space inside `d` makes the browser drop the path: its box is then empty.
      expect(await path.evaluate((el) => (el as SVGPathElement).getBBox().width)).toBeGreaterThan(0)
    }
    expect(errors.filter((text) => /path|attribute d/i.test(text))).toEqual([])
  })

  for (const width of [360, 390]) {
    test(`bundle pages fit ${width} px without scrolling sideways`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto(site('biznes.localhost', '/zestawy'))
      const hrefs = await page
        .locator('main a[href^="/zestawy/"]')
        .evaluateAll((links) => [...new Set(links.map((a) => a.getAttribute('href') ?? ''))])
      expect(hrefs.length).toBeGreaterThan(0)
      for (const href of hrefs) {
        await page.goto(site('biznes.localhost', href))
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
        expect(scrollWidth, href).toBeLessThanOrEqual(width)
      }
    })
  }

  test('the KSeF post drops the 450 zł sentence and says how the relief is settled', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost', '/aktualnosci'))
    const post = page.locator('main a[href^="/aktualnosci/"]').filter({ hasText: /KSeF/ }).first()
    await page.goto(site('biznes.localhost', (await post.getAttribute('href')) ?? '/aktualnosci'))
    const text = await page.locator('main').innerText()
    expect(text).not.toMatch(/450\s?zł/)
    expect(text).toContain('w deklaracji VAT')
  })
})
