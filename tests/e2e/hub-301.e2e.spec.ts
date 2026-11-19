import { expect, test } from '@playwright/test'

import { PROKOM_REDIRECTS } from '../../src/seed/prokom/redirects'
import { site } from './helpers'

// H6-2: every address of the old pro-kom.eu answers 301 to its target (seed `seed:prokom`).
const HOST = 'prokom.localhost'

test('old pro-kom.eu addresses: 301 to the new target', async ({ request }) => {
  for (const { from, to } of PROKOM_REDIRECTS) {
    const response = await request.get(site(HOST, from), { maxRedirects: 0 })
    expect(response.status(), from).toBe(301)
    const location = response.headers()['location'] ?? ''
    // A hub target may carry an anchor (`/o-firmie#alsen`, runda 1811 D4).
    const url = new URL(location, site(HOST, '/'))
    expect(to.startsWith('/') ? url.pathname + url.hash : location, from).toBe(to)
  }
})
