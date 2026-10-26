import { randomUUID } from 'node:crypto'
import { gzipSync } from 'node:zlib'

import { expect, type Page, test } from '@playwright/test'

import rozwiazania from '../../seed/prokomsoftware/rozwiazania.json' with { type: 'json' }
import { api, loginAsAdmin, site, tenantId } from './helpers'

// SW3 acceptance: `GET /api/solutions-index` serves the seeded solutions on the Software domain
// only — without the ones removed from the offer and without drafts — and follows changes made
// in the panel right away.

type IndexSolution = { slug: string; priceFrom: number | null; prices: { start?: number } }
type SolutionsIndex = {
  solutions: IndexSolution[]
  categories: { slug: string; count: number }[]
  search: { synonyms: Record<string, string[]> }
}

/** The index as the server has it now — past the browser cache (`max-age=60`, by design). */
async function readIndex(page: Page): Promise<SolutionsIndex> {
  const response = await page.goto(site('software.localhost', '/api/solutions-index'))
  expect(response?.status()).toBe(200)
  expect(response?.headers()['content-type']).toContain('application/json')
  return page.evaluate(async () => {
    const fresh = await fetch('/api/solutions-index', { cache: 'no-store' })
    return (await fresh.json()) as SolutionsIndex
  })
}

const slugsOf = (index: SolutionsIndex) => index.solutions.map((solution) => solution.slug)

test.describe('solutions index', () => {
  test('lists the seeded solutions with prices on the Software domain', async ({ page }) => {
    const index = await readIndex(page)
    const packageSlugs = new Set(rozwiazania.items.map((item) => item.slug))
    expect(index.solutions.filter((solution) => packageSlugs.has(solution.slug))).toHaveLength(29)
    expect(index.solutions.find((s) => s.slug === 'strona-firmowa-z-panelem')).toMatchObject({
      priceFrom: 2490,
      prices: { start: 2490 },
    })
    expect(index.categories.map((category) => category.slug)).toContain('opieka')
    expect(index.search.synonyms.excel).toBeTruthy()
    // SW3 acceptance: the whole index under 30 KB gzip.
    expect(gzipSync(JSON.stringify(index)).length).toBeLessThan(30 * 1024)
  })

  // ADR-014 v20 pkt 2: a solution removed from the offer is not in the index.
  test('never lists a solution removed from the offer', async ({ page }) => {
    const slugs = slugsOf(await readIndex(page))
    for (const removed of rozwiazania.removed) expect(slugs).not.toContain(removed.slug)
  })

  for (const host of ['biznes.localhost', 'instalacje.localhost', 'panel.localhost']) {
    test(`is 404 on ${host}`, async ({ page }) => {
      const response = await page.goto(site(host, '/api/solutions-index'))
      expect(response?.status()).toBe(404)
      expect(await response!.text()).not.toContain('strona-firmowa-z-panelem')
    })
  }

  test('follows publishing and deleting a solution; a draft stays out', async ({ page }) => {
    await loginAsAdmin(page)
    const software = await tenantId(page, 'software')
    const slug = `e2e-${randomUUID().slice(0, 8)}`
    const created = await api(page, 'POST', '/api/solutions?draft=true', {
      tenant: software,
      name: `Rozwiązanie E2E ${slug}`,
      slug,
      category: 'systemy',
      prices: { start: 1234 },
      _status: 'draft',
    })
    expect(created.status).toBe(201)
    const id = (created.json.doc as { id: number }).id
    const panel = page.url()
    try {
      expect(slugsOf(await readIndex(page))).not.toContain(slug)

      await page.goto(panel)
      const published = await api(page, 'PATCH', `/api/solutions/${id}`, { _status: 'published' })
      expect(published.status).toBe(200)
      const listed = (await readIndex(page)).solutions.find((s) => s.slug === slug)
      expect(listed?.priceFrom).toBe(1234)
    } finally {
      await page.goto(panel)
      expect((await api(page, 'DELETE', `/api/solutions/${id}`)).status).toBe(200)
    }
    expect(slugsOf(await readIndex(page))).not.toContain(slug)
  })
})
