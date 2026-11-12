import { expect, test } from '@playwright/test'

import { site } from './helpers'

// B3-3 (plan 0611 §7.2, audit AUDYT-GLOWNA-0611 P0.3–P0.6): the home page's title and search for
// search engines, headings of closed windows and of the wheel, product pictures with text, and
// the first card of the phone strip off the edge. Data from `pnpm seed`.

const HOST = 'biznes.localhost'

test.describe('Biznes home: SEO and accessibility (B3-3)', () => {
  test('the title has key phrases, ≤ 60 characters, not just the site name (P0.3a)', async ({
    page,
  }) => {
    await page.goto(site(HOST))
    const title = await page.title()
    expect(title).not.toBe('PRO-KOM Biznes')
    expect(title.length).toBeLessThanOrEqual(60)
    expect(title).toMatch(/Kasy fiskalne/)
  })

  test('JSON-LD: WebSite with a SearchAction to /oferta?szukaj= (P0.3b)', async ({ page }) => {
    await page.goto(site(HOST))
    const nodes = await page.$$eval('script[type="application/ld+json"]', (scripts) =>
      scripts.flatMap((script) => {
        const data: unknown = JSON.parse(script.textContent ?? 'null')
        return Array.isArray(data) ? data : [data]
      }),
    )
    const websites = nodes.filter(
      (node): node is { potentialAction?: { target?: { urlTemplate?: string } } } =>
        typeof node === 'object' &&
        node !== null &&
        (node as { '@type'?: unknown })['@type'] === 'WebSite',
    )
    expect(websites).toHaveLength(1)
    expect(websites[0]?.potentialAction?.target?.urlTemplate).toMatch(
      /\/oferta\?szukaj=\{search_term_string\}$/,
    )
  })

  test('closed windows put no H2 into the outline; the wheel centre is no heading (P0.4)', async ({
    page,
  }) => {
    await page.goto(site(HOST))
    await page.waitForLoadState('networkidle')
    // The shared search window and the menu sheet too: their titles are headings only while open.
    const closedH2 = await page.locator('dialog:not([open]) :is(h2, h3, [role="heading"])').count()
    expect(closedH2).toBe(0)
    await expect(page.locator('#start').getByRole('heading', { level: 2 })).toHaveCount(0)
    await expect(page.locator('#start .bzw-cc h2, #start .bzw-cc [role="heading"]')).toHaveCount(0)
    // The drawer keeps its name, and its title is a heading once it is open.
    await page
      .locator('#wybierane [data-card]')
      .first()
      .getByRole('button', { name: /Do zapytania|W zapytaniu/ })
      .waitFor()
    const drawer = page.locator('dialog[data-motion="drawer"]')
    await expect(drawer).toHaveAttribute('aria-labelledby', /.+/)
    await expect(drawer.locator('h2, [role="heading"]')).toHaveCount(0)
  })

  test('product pictures of „Najczęściej wybierane” and the departments have text (P0.5)', async ({
    page,
  }) => {
    await page.goto(site(HOST))
    const photos = page.locator('#wybierane [data-card] a[aria-hidden="true"] img')
    expect(await photos.count()).toBeGreaterThan(0)
    for (const alt of await photos.evaluateAll((images) =>
      images.map((image) => image.getAttribute('alt') ?? ''),
    )) {
      expect(alt.trim()).not.toBe('')
    }
    const showcase = page.locator('#oferta article img[src*="p-"]')
    expect(await showcase.count()).toBeGreaterThan(0)
    for (const alt of await showcase.evaluateAll((images) =>
      images.map((image) => image.getAttribute('alt') ?? ''),
    )) {
      expect(alt.trim()).not.toBe('')
    }
  })

  test.describe('on a phone', () => {
    test.use({ viewport: { width: 390, height: 844 } })

    test('the first card of „Najczęściej wybierane” keeps 16 px from the edge (P0.6)', async ({
      page,
    }) => {
      await page.goto(site(HOST))
      await page.waitForLoadState('networkidle')
      const first = page.locator('#wybierane ul').first().locator(':scope > li').first()
      // Down to the section only: the strip itself stays where the browser snapped it.
      await page.locator('#wybierane').scrollIntoViewIfNeeded()
      await expect.poll(async () => (await first.boundingBox())?.x ?? 0).toBeGreaterThanOrEqual(16)
    })
  })
})
