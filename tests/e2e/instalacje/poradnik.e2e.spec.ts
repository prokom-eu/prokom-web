import { expect, type Page, test } from '@playwright/test'

import { site } from '../helpers'

// I12, INST-6 PR5 (runda v6 §3): the guide `/poradnik` and its posts (data from `pnpm seed`).
const HOST = 'instalacje.localhost'

async function open(page: Page, path: string) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const response = await page.goto(site(HOST, path))
  expect(response?.status()).toBe(200)
}

async function jsonLdTypes(page: Page) {
  return page.locator('script[type="application/ld+json"]').evaluateAll((els) =>
    // A script holds one object, an array of them (`JsonLd` with a list) or a `@graph`.
    els.flatMap((e) => {
      const data = JSON.parse(e.textContent ?? '{}') as unknown
      const nodes = (Array.isArray(data) ? data : [data]) as Record<string, unknown>[]
      return nodes
        .flatMap((n) => [n, ...((n['@graph'] as Record<string, unknown>[]) ?? [])])
        .map((n) => n['@type'])
    }),
  )
}

test.describe('Instalacje guide', () => {
  test.use({ viewport: { width: 1440, height: 1000 } })

  test('the hub: no „Przepisy”, the category filter works without JavaScript', async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto(site(HOST, '/poradnik'))
    const chips = page.getByRole('navigation', { name: 'Kategoria poradnika' })
    await expect(chips.getByRole('link', { name: 'Przepisy' })).toHaveCount(0)
    await expect(page.locator('.prfeat')).toHaveAttribute('href', /^\/poradnik\/[a-z0-9-]+$/)
    // 9 posts (the featured one once) and 6 short answers.
    await expect(page.locator('.prc2:visible')).toHaveCount(14)
    await expect(page.locator('.prc2:visible').first()).toContainText('czytania')
    await chips.getByRole('link', { name: 'Ładowarki' }).click()
    await expect(page).toHaveURL(/#kat-ladowarki$/)
    await expect(page.locator('.prfeat')).toBeHidden()
    const shown = page.locator('.prc2:visible')
    await expect(shown).toHaveCount(2)
    for (const card of await shown.all())
      await expect(card).toHaveAttribute('data-cat', 'ladowarki')
    await context.close()
  })

  test('the camera post: new address, contents, checklist, FAQ, planner, structured data', async ({
    page,
  }) => {
    // Runda v6 D1: the former address moves for good.
    const old = await page.request.get(site(HOST, '/poradnik/monitoring-a-rodo'), {
      maxRedirects: 0,
    })
    expect([301, 308]).toContain(old.status())
    expect(old.headers()['location']).toMatch(/\/poradnik\/kamery-w-pensjonacie$/)

    await open(page, '/poradnik/kamery-w-pensjonacie')
    await expect(page.locator('h1')).toHaveText(
      'Kamery w pensjonacie: gdzie je powiesić i jak ustawić',
    )
    await expect(page.locator('main')).not.toContainText('RODO')
    await expect(page.locator('.toc a')).toHaveCount(13)
    await expect(page.locator('.qz')).toContainText('2 z 7')
    await expect(page.locator('.prfaq details')).toHaveCount(5)
    await expect(page.locator('article a.btn')).toHaveAttribute('href', /^\/zaplanuj\?opis=/)
    expect(await jsonLdTypes(page)).toEqual(
      expect.arrayContaining(['Article', 'BreadcrumbList', 'FAQPage']),
    )
  })

  test('„Z Poradnika” on a service page links to its posts', async ({ page }) => {
    await open(page, '/monitoring')
    const block = page.locator('#z-poradnika')
    await expect(block.locator('.prc2')).toHaveCount(3)
    await expect(block.locator('.prc2').first()).toHaveAttribute('href', /^\/poradnik\//)
  })

  test('a post of another line or an unknown slug is a 404', async ({ page }) => {
    const response = await page.goto(site(HOST, '/poradnik/nie-ma-takiego'))
    expect(response?.status()).toBe(404)
    const other = await page.goto(site('biznes.localhost', '/poradnik/kamery-w-pensjonacie'))
    expect(other?.status()).toBe(404)
  })
})
