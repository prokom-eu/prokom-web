import { expect, test } from '@playwright/test'

import { site } from './helpers'

// pro-kom.eu `/wspolpraca` (H4-2, spec §6.6) is a v1.1 page: until `HubSettings.pages.cooperation`
// is switched on it answers 404 and nothing links to it (spec §2.2). Checked in the browser with
// the flag on before switching it on in the panel.
const HUB = 'prokom.localhost'

test.describe('pro-kom.eu — /wspolpraca behind its flag (spec §2.2, §6.6)', () => {
  test('answers 404 while the page is off, and the B2B page does not link to it', async ({
    page,
  }) => {
    const response = await page.goto(site(HUB, '/wspolpraca'))
    expect(response?.status()).toBe(404)
    await page.goto(site(HUB, '/inwestycje-i-dostawy'))
    await expect(page.locator('a[href^="/wspolpraca"]')).toHaveCount(0)
  })

  test('is not a page of the line domains', async ({ page }) => {
    const response = await page.goto(site('instalacje.localhost', '/wspolpraca'))
    expect(response?.status()).toBe(404)
  })
})
