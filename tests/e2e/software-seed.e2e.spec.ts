import { expect, test } from '@playwright/test'

import miejscowosci from '../../seed/prokomsoftware/miejscowosci.json' with { type: 'json' }
import rozwiazania from '../../seed/prokomsoftware/rozwiazania.json' with { type: 'json' }
import { api, loginAsAdmin, site, tenantId } from './helpers'

// SW3 acceptance: after `pnpm seed` the Software panel has the package v20 — 29 published
// solutions with prices, 8 areas, 6 cities (Rabka-Zdrój active), navigation, facts and the
// Software settings; a solution removed from the offer never reaches the database.

/** Ids of the package are 1–30; other e2e specs create their records far above them. */
const PACKAGE_IDS = 'where[legacyId][less_than_equal]=100'

test.describe('Software seed', () => {
  test('imports the solutions of the package, without the removed ones', async ({ page }) => {
    await loginAsAdmin(page)
    const software = await tenantId(page, 'software')
    const { json } = await api(
      page,
      'GET',
      `/api/solutions?where[tenant][equals]=${software}&${PACKAGE_IDS}&limit=100&depth=0`,
    )
    const docs = json.docs as {
      slug: string
      legacyId: number
      _status: string
      prices?: { start?: number | null }
    }[]
    expect(docs).toHaveLength(29)
    expect(docs.every((doc) => doc._status === 'published')).toBe(true)
    expect(docs.find((doc) => doc.slug === 'strona-firmowa-z-panelem')?.prices?.start).toBe(2490)

    // ADR-014 v20 pkt 2: removed from the offer = not in the database, by slug or by id.
    for (const removed of rozwiazania.removed) {
      const { json: found } = await api(
        page,
        'GET',
        `/api/solutions?where[tenant][equals]=${software}&where[or][0][slug][equals]=${removed.slug}&where[or][1][legacyId][equals]=${removed.legacyId}&draft=true&depth=0`,
      )
      expect(found.totalDocs, removed.slug).toBe(0)
    }
  })

  test('imports the areas, cities and settings', async ({ page }) => {
    await loginAsAdmin(page)
    const software = await tenantId(page, 'software')
    const inTenant = `where[tenant][equals]=${software}&limit=100&depth=0`

    const areas = await api(page, 'GET', `/api/solution-areas?${inTenant}&sort=order`)
    const areaDocs = areas.json.docs as { key: string; icon: string; chips: unknown[] }[]
    expect(areaDocs.map((area) => area.key)).toEqual([
      'www',
      'sys',
      'app',
      'cal',
      'plug',
      'auto',
      'care',
      'aud',
    ])
    expect(areaDocs[0]).toMatchObject({ icon: 'site' })

    // Only the package cities: an interrupted `software-data` run may leave an `e2e-*` city.
    const packageSlugs = miejscowosci.items.map((city) => city.slug).join(',')
    const cities = await api(page, 'GET', `/api/cities?${inTenant}&where[slug][in]=${packageSlugs}`)
    const cityDocs = cities.json.docs as { slug: string; active?: boolean }[]
    expect(cityDocs).toHaveLength(6)
    expect(cityDocs.filter((city) => city.active).map((city) => city.slug)).toEqual(['rabka-zdroj'])

    const siteSettings = await api(page, 'GET', `/api/site-settings?${inTenant}`)
    const [settings] = siteSettings.json.docs as {
      software?: { navigation?: { header?: unknown }; facts?: { key: string }[] }
    }[]
    expect(settings?.software?.navigation?.header).toBeTruthy()
    expect(settings?.software?.facts?.map((fact) => fact.key)).toContain('CZAS ODPOWIEDZI')

    const softwareSettings = await api(page, 'GET', `/api/software-settings?${inTenant}`)
    const [settingsDoc] = softwareSettings.json.docs as Record<string, unknown>[]
    for (const field of ['wizard', 'home', 'thanks', 'notFound']) {
      expect(settingsDoc?.[field], field).toBeTruthy()
    }
  })

  test('/dziekujemy shows the start texts of the seed', async ({ page }) => {
    const response = await page.goto(site('software.localhost', '/dziekujemy'))
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveText('Dziękujemy, mamy to.')
  })
})
