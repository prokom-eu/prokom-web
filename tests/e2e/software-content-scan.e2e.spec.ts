import { expect, test } from '@playwright/test'

import { COMPETITORS, EXTRA_PATHS, findNames, sitemapPaths } from '../../scripts/content-scan.mjs'
import { site } from './helpers'

// SW12 (spec. §10 pkt 10): no competitor names on any page of the Software site — every address
// of its sitemap plus /dziekujemy and a 404. Placeholders are visible locally and on staging on
// purpose; they are checked with `node scripts/content-scan.mjs <staging>` before production.
const HOST = 'software.localhost'

test('no competitor names on the Software pages', async ({ request }) => {
  test.setTimeout(120_000)
  const sitemap = await request.get(site(HOST, '/sitemap.xml'))
  expect(sitemap.ok()).toBe(true)
  const paths = [...new Set([...sitemapPaths(await sitemap.text()), ...EXTRA_PATHS])]
  expect(paths.length).toBeGreaterThan(20)
  const found: string[] = []
  for (const path of paths) {
    const html = await (await request.get(site(HOST, path))).text()
    for (const name of findNames(html, COMPETITORS)) found.push(`${path}: ${name}`)
  }
  expect(found).toEqual([])
})
