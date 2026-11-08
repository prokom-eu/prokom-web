import { expect, test } from '@playwright/test'

import { site } from './helpers'

// Decision D10 (06.11.2026): no WhatsApp on any line — no wa.me link and no „WhatsApp” word
// in the HTML of the home page, the contact page and one category page. Data from `pnpm seed`.
const PAGES: Record<string, string[]> = {
  'biznes.localhost': ['/', '/kontakt', '/oferta/kasy-fiskalne'],
  'instalacje.localhost': ['/', '/kontakt', '/monitoring'],
  'software.localhost': ['/', '/kontakt', '/rozwiazania'],
}

for (const [host, paths] of Object.entries(PAGES)) {
  for (const path of paths) {
    test(`${host}${path} — no WhatsApp`, async ({ page }) => {
      const response = await page.goto(site(host, path))
      expect(response?.status()).toBe(200)
      const html = await page.content()
      expect(html).not.toMatch(/wa\.me/i)
      expect(html).not.toMatch(/whats\s?app/i)
    })
  }
}
