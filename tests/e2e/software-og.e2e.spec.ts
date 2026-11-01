import { expect, test } from '@playwright/test'

import { site } from './helpers'

// SWV8 P0 #4: every Software page shares a link with a large image — the line's file while
// the panel has no „Obraz OG”.
const HOST = 'software.localhost'

for (const path of ['/', '/rozwiazania', '/dobierz', '/kontakt', '/miejscowosci/rabka-zdroj']) {
  test(`${path} has og:image and a large Twitter card`, async ({ page }) => {
    await page.goto(site(HOST, path))
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /\/brand\/prokom-software_og\.png$/,
    )
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200')
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    )
  })
}
