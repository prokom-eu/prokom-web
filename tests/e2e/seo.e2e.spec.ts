import { expect, test } from '@playwright/test'

import { api, loginAsAdmin, site, tenantId } from './helpers'

// S7 acceptance (S7b): robots and sitemap per domain, canonical and structured data,
// 301 redirects of one tenant only, the site's own 404. Runs with the default SITE_ENV=local;
// the staging rules (noindex, `Disallow: /`) are covered by Vitest (`lib/seo`).

const HOSTS = ['biznes.localhost', 'instalacje.localhost', 'software.localhost'] as const

test.describe('robots and sitemap', () => {
  for (const host of HOSTS) {
    test(`${host} serves its own robots.txt and sitemap.xml`, async ({ page }) => {
      const origin = site(host, '')

      let response = await page.goto(site(host, '/robots.txt'))
      expect(response?.status()).toBe(200)
      expect(await response?.text()).toBe(
        `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`,
      )

      response = await page.goto(site(host, '/sitemap.xml'))
      expect(response?.status()).toBe(200)
      expect(response?.headers()['content-type']).toContain('application/xml')
      const xml = (await response?.text()) ?? ''
      expect(xml).toContain(`<loc>${origin}/</loc>`)
      expect(xml).toContain(`<loc>${origin}/kontakt</loc>`)
      // Only this domain's addresses.
      for (const other of HOSTS.filter((h) => h !== host)) expect(xml).not.toContain(other)
    })
  }

  test('a draft is not in the sitemap', async ({ page }) => {
    await loginAsAdmin(page)
    const biznes = await tenantId(page, 'biznes')
    const slug = `e2e-szkic-${Date.now()}`
    const created = await api(page, 'POST', '/api/pages?draft=true', {
      tenant: biznes,
      title: 'Szkic sitemap',
      slug,
      layout: [{ blockType: 'hero', heading: 'Szkic' }],
      _status: 'draft',
    })
    expect(created.status).toBe(201)
    try {
      const response = await page.goto(site('biznes.localhost', '/sitemap.xml'))
      expect(await response?.text()).not.toContain(slug)
    } finally {
      await page.goto('/admin/login')
      await api(page, 'DELETE', `/api/pages/${(created.json.doc as { id: number }).id}`)
    }
  })
})

test.describe('page metadata', () => {
  test('canonical, indexing and organization data on a page', async ({ page }) => {
    await page.goto(site('biznes.localhost', '/kontakt'))
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      site('biznes.localhost', '/kontakt'),
    )
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      site('biznes.localhost', '/kontakt'),
    )
    // Not staging: no noindex.
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0)

    const ld = await page.locator('script[type="application/ld+json"]').first().textContent()
    const data = JSON.parse(ld ?? '{}') as { '@graph': { '@type': string; name: string }[] }
    expect(data['@graph'][0]).toMatchObject({ '@type': 'Organization', name: 'PRO-KOM Biznes' })
    expect(data['@graph'].some((node) => node['@type'] === 'LocalBusiness')).toBe(true)
  })
})

test.describe('redirects', () => {
  test('a rule answers 301 on its own domain only', async ({ page }) => {
    await loginAsAdmin(page)
    const biznes = await tenantId(page, 'biznes')
    const from = `/e2e-stara-${Date.now()}`
    const created = await api(page, 'POST', '/api/redirects', {
      tenant: biznes,
      from: `${from}/`,
      to: '/kontakt',
    })
    expect(created.status).toBe(201)
    const id = (created.json.doc as { id: number; from: string }).id
    // Stored without the trailing slash.
    expect((created.json.doc as { from: string }).from).toBe(from)

    try {
      // Right after saving — the hook clears the cached rules, no waiting for the TTL.
      const redirected: { status: number; location: string | null; cache: string | null }[] = []
      page.on('response', (response) => {
        if (response.url() === site('biznes.localhost', from)) {
          const headers = response.headers()
          redirected.push({
            status: response.status(),
            location: headers['location'],
            cache: headers['cache-control'],
          })
        }
      })
      await page.goto(site('biznes.localhost', from))
      // Chromium may add its own internal 307 hop before the request; ours is the 301.
      expect(redirected).toContainEqual({
        status: 301,
        location: site('biznes.localhost', '/kontakt'),
        cache: 'public, max-age=86400',
      })
      expect(new URL(page.url()).pathname).toBe('/kontakt')

      // The same path on another line: no rule there → its 404.
      const other = await page.goto(site('software.localhost', from))
      expect(other?.status()).toBe(404)
    } finally {
      await page.goto('/admin/login')
      await api(page, 'DELETE', `/api/redirects/${id}`)
    }
  })

  test('a rule to itself, a repeated source and a loop are rejected', async ({ page }) => {
    await loginAsAdmin(page)
    const biznes = await tenantId(page, 'biznes')
    const a = `/e2e-a-${Date.now()}`
    const b = `/e2e-b-${Date.now()}`
    expect(
      (await api(page, 'POST', '/api/redirects', { tenant: biznes, from: a, to: `${a}/` })).status,
    ).toBe(400)

    const first = await api(page, 'POST', '/api/redirects', { tenant: biznes, from: a, to: b })
    expect(first.status).toBe(201)
    try {
      // The same source again (also written with a trailing slash): readable 400, not a DB error.
      const repeated = await api(page, 'POST', '/api/redirects', {
        tenant: biznes,
        from: `${a}/`,
        to: '/kontakt',
      })
      expect(repeated.status).toBe(400)
      // The REST error names the field (the message itself is shown in the panel).
      expect(JSON.stringify(repeated.json)).toContain('Stary adres')
      // b → a would close a loop with a → b.
      const loop = await api(page, 'POST', '/api/redirects', { tenant: biznes, from: b, to: a })
      expect(loop.status).toBe(400)
      expect(JSON.stringify(loop.json)).toContain('Nowy adres')
    } finally {
      await api(page, 'DELETE', `/api/redirects/${(first.json.doc as { id: number }).id}`)
    }
  })
})

test.describe('not found', () => {
  for (const path of ['/nie-ma-takiej-strony', '/admin', '/api/users']) {
    test(`${path} shows the site's 404 inside its header and footer`, async ({ page }) => {
      const response = await page.goto(site('biznes.localhost', path))
      expect(response?.status()).toBe(404)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nie znaleziono strony')
      await expect(page.locator('header')).toBeVisible()
      await expect(page.getByRole('link', { name: 'Przejdź na stronę główną' })).toBeVisible()
    })
  }

  test('an unknown domain keeps the generic 404 without site data', async ({ page }) => {
    const response = await page.goto(site('nieznana.localhost', '/'))
    expect(response?.status()).toBe(404)
    await expect(page.locator('header')).toHaveCount(0)
  })
})
