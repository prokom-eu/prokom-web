import { expect, test } from '@playwright/test'

import { site } from './helpers'

// Runda 18.11 (D4): ALSEN — PRO-KOM is an authorised partner of the network. Its own group
// „Sieci partnerskie” next to the producers' authorisations (never counted in them), the logo
// and a link to alsen.pl in a new tab. Record from `pnpm seed` (`src/seed/biznes/alsen.ts`).
const biznes = (path: string) => site('biznes.localhost', path)
const ALSEN_LINK = 'a[href="https://www.alsen.pl/"]'

test.describe('Biznes: ALSEN, sieć partnerska (runda 1811, D4)', () => {
  test('the hero bar shows ALSEN apart from the four producers', async ({ page }) => {
    await page.goto(biznes('/'))
    const bar = page.locator('#start [data-auth-bar]')
    await expect(
      bar.getByRole('list', { name: 'Uprawnienia producentów' }).getByRole('listitem'),
    ).toHaveCount(4)
    const network = bar.getByRole('list', { name: 'Sieci partnerskie' })
    await expect(network.getByRole('img', { name: 'ALSEN' })).toBeVisible()
    await expect(network).toContainText('Autoryzowany partner')
    const link = network.locator(ALSEN_LINK)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', /noopener/)
  })

  test('/marki has the row „Sieci partnerskie”, not a brand tile', async ({ page }) => {
    await page.goto(biznes('/marki'))
    await expect(page.locator('[data-auth-cards] > li')).toHaveCount(4)
    const row = page.locator('[data-marki-networks]')
    await expect(row).toContainText('Sieci partnerskie')
    await expect(row).toContainText('Autoryzowany partner')
    await expect(row.locator(ALSEN_LINK)).toHaveAttribute('target', '_blank')
    await expect(page.locator('[data-others-grid]')).not.toContainText('ALSEN')
    await expect(page.locator('a[href="/marki/alsen"]')).toHaveCount(0)
  })

  test('/o-firmie shows ALSEN next to the authorisations; the producers stay four', async ({
    page,
  }) => {
    await page.goto(biznes('/o-firmie'))
    await expect(page.locator('[data-auth-logo]')).toHaveCount(4)
    await expect(page.locator('[data-network-logo]')).toContainText('sieć partnerska')
    await expect(page.locator('#marki [data-networks]').locator(ALSEN_LINK)).toBeVisible()
  })

  test('llms.txt names the status', async ({ request }) => {
    const text = await (await request.get(biznes('/llms.txt'))).text()
    expect(text).toContain('Autoryzowany partner ALSEN')
  })
})
