import { expect, test } from '@playwright/test'

import { site } from './helpers'

// `withPayload` asks every path for the colour-scheme client hint. `Critical-CH` makes the browser
// repeat the first request of a visit to send it, which delays every first page view of a site
// (Lighthouse: ~0.6 s on a phone). Only the panel reads the hint, so the sites must not ask for it.

const CLIENT_HINT = 'sec-ch-prefers-color-scheme'

test('a site page does not ask for the colour-scheme client hint', async ({ page }) => {
  const response = await page.goto(site('biznes.localhost'))
  expect(response?.status()).toBe(200)
  // `allHeaders()`: `headers()` leaves out some headers, so a missing one would prove nothing.
  const headers = (await response?.allHeaders()) ?? {}
  expect(headers['critical-ch']).toBeUndefined()
  expect(headers['accept-ch']).toBeUndefined()
  expect(headers['vary'] ?? '').not.toContain(CLIENT_HINT)
  expect(headers['x-powered-by']).toBeUndefined()
})

test('the panel still asks for it (the admin theme follows the system)', async ({ page }) => {
  const response = await page.goto('/admin/login')
  expect(response?.status()).toBe(200)
  const headers = (await response?.allHeaders()) ?? {}
  expect(headers['accept-ch']?.toLowerCase()).toBe(CLIENT_HINT)
  expect(headers['critical-ch']?.toLowerCase()).toBe(CLIENT_HINT)
  expect(headers['x-powered-by']).toBeDefined()
})
