import { expect, test } from '@playwright/test'

import { site } from './helpers'

// pro-kom.eu `/dla-domu` (H3-3, spec §6.4) is a v1.1 page: until `HubSettings.pages.forHome` is
// switched on in the panel it answers 404 and nothing links to it (spec §2.2). The seed leaves it
// off; the page itself is checked by unit tests and in the browser with the flag on.
const HUB = 'prokom.localhost'

test.describe('pro-kom.eu — /dla-domu behind its flag (spec §2.2, §6.4)', () => {
  test('answers 404 while the page is off, and no link leads to it', async ({ page }) => {
    const response = await page.goto(site(HUB, '/dla-domu'))
    expect(response?.status()).toBe(404)
    await page.goto(site(HUB))
    await expect(page.locator('a[href="/dla-domu"]')).toHaveCount(0)
  })

  test('is not a page of the line domains', async ({ page }) => {
    const response = await page.goto(site('biznes.localhost', '/dla-domu'))
    expect(response?.status()).toBe(404)
  })
})
