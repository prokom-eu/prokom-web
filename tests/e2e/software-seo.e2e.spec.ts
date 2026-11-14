import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// SEO etap 1 (Software): the place in the titles, the solution pages linked, schema.org and
// `llms.txt`. Data from `pnpm seed`.
const HOST = 'software.localhost'

/** Every JSON-LD node of the page, `@graph` flattened. */
async function jsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
  return blocks.flatMap((block) => {
    const data = JSON.parse(block) as Record<string, unknown>
    return Array.isArray(data['@graph']) ? (data['@graph'] as Record<string, unknown>[]) : [data]
  })
}

test.describe('Software SEO etap 1', () => {
  test('a solution page names Rabka-Zdrój and points its service to the organization', async ({
    page,
  }) => {
    await page.goto(site(HOST, '/rozwiazania/strona-wizytowka'))
    await expect(page).toHaveTitle('Strona wizytówka — Rabka-Zdrój i Podhale | PRO-KOM Software')
    const nodes = await jsonLd(page)
    const service = nodes.find((node) => node['@type'] === 'Service')
    expect(service?.provider).toMatchObject({ '@id': expect.stringMatching(/\/#organization$/) })
    expect(nodes.some((node) => node['@type'] === 'ProfessionalService')).toBe(true)
  })

  test('the start page: its title, WebSite with the offer search, solution links to pages', async ({
    page,
  }) => {
    await page.goto(site(HOST, '/'))
    await expect(page).toHaveTitle(
      'Strony internetowe i systemy — Rabka, Podhale | PRO-KOM Software',
    )
    const website = (await jsonLd(page)).find((node) => node['@type'] === 'WebSite')
    expect(JSON.stringify(website)).toContain('/rozwiazania?q={search_term_string}')
    // Links to solutions lead search engines to the pages, not to the noindex offer window.
    const hrefs = await page
      .locator('a[href^="/rozwiazania"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''))
    expect(hrefs.filter((href) => href.includes('?rozwiazanie='))).toEqual([])
    expect(hrefs.some((href) => /^\/rozwiazania\/[a-z0-9-]+$/.test(href))).toBe(true)
  })

  test('the price list has its breadcrumbs for search engines', async ({ page }) => {
    await page.goto(site(HOST, '/cennik'))
    const crumbs = (await jsonLd(page)).find((node) => node['@type'] === 'BreadcrumbList')
    expect(JSON.stringify(crumbs)).toContain('Strona główna')
  })

  test('llms.txt: who we are, where (Rabka, Podhale, Małopolska, Poland), the offer with prices', async ({
    page,
  }) => {
    const response = await page.goto(site(HOST, '/llms.txt'))
    expect(response?.status()).toBe(200)
    expect(response?.headers()['content-type']).toContain('text/plain')
    const text = await page.locator('body').innerText()
    expect(text.startsWith('# PRO-KOM Software')).toBe(true)
    expect(text).toContain('cała Małopolska')
    expect(text).toContain('/rozwiazania/strona-wizytowka')
    expect(text).toMatch(/od [\d\s]+zł netto/)
  })
})
