import { expect, test } from '@playwright/test'

import { site } from './helpers'

// Matches src/seed/tenants.ts (run `pnpm seed` before the e2e tests).
// Every line's home page has its own hero (B7 `seedBiznesHome`, SW5 `seedSoftwareHome`, I5
// `seedInstalacjeHome`). `title`: the start page's own SEO title, by default the site name.
// `markers`: content from the panel only that tenant has (hero, its settings' e-mail, the
// Software mega menu card) — searched in the whole HTML of the other domains, RSC payload too.
const TENANTS = [
  {
    host: 'biznes.localhost',
    name: 'PRO-KOM Biznes',
    // `\s`: a hard space after „i” (K4-FINAL §1); a regex sees the raw text.
    h1: /^Kasy, komputery i\sprogramy dla firm\./,
    // No one-letter word: the H1 has hard spaces after them (K4-FINAL §1). Not „programy dla
    // firm.”: Software's H1 v23 („Strony i programy dla firm.”) has it too.
    markers: ['Kasy, komputery'],
  },
  {
    host: 'instalacje.localhost',
    name: 'PRO-KOM Instalacje',
    title: 'Monitoring, alarmy, Wi-Fi, smart home Podhale | PRO-KOM Instalacje',
    h1: /Twój obiekt na żywo\.$/,
    // The line's e-mail from the panel (the seed writes the real contact over the sample one,
    // boss 01.11.2026) and a text of the home page.
    markers: ['kontakt@prokominstalacje.pl', 'Wybierz obiekt obok'],
  },
  {
    host: 'software.localhost',
    name: 'PRO-KOM Software',
    // The start page's full SEO title from the seed (SW12b, `src/seed/software/seo.ts`).
    title: 'Strony i systemy dla firm — Rabka-Zdrój | PRO-KOM Software',
    h1: 'Strony i programy dla firm. Zobaczysz, zanim zapłacisz.',
    // SWV2: the seed gives Software its real contact (ZMIANY-v23 §1) over the sample one.
    markers: [
      'kontakt@prokomsoftware.pl',
      'Strony, systemy i aplikacje dla firm z Podhala',
      'Zobaczysz, zanim zapłacisz',
    ],
  },
]

test.describe('tenant isolation', () => {
  for (const tenant of TENANTS) {
    test(`${tenant.host} shows only its own tenant`, async ({ page }) => {
      const response = await page.goto(site(tenant.host))
      expect(response?.status()).toBe(200)
      await expect(page.locator('h1')).toHaveText(tenant.h1)
      await expect(page).toHaveTitle(tenant.title ?? tenant.name)

      // Content of the other tenants: nowhere in the HTML, hidden panels and RSC payload too.
      const html = await page.content()
      for (const marker of tenant.markers) expect(html, 'own marker').toContain(marker)
      for (const other of TENANTS.filter((t) => t !== tenant)) {
        for (const marker of other.markers) expect(html).not.toContain(marker)
      }

      // Their names: links to the other PRO-KOM lines are part of the frame by design
      // (Software: „PRO-KOM Biznes” in the top bar and footer, spec. §3.0, §3.4) — also in the
      // RSC payload. So names are checked in the visible text without those links, the <head>
      // (metadata) and the structured data.
      const text = await page.locator('body').evaluate((body: HTMLElement) => {
        let visible = body.innerText
        for (const link of body.querySelectorAll<HTMLElement>(
          'a[href^="https://prokom"], a[href^="https://pro-kom"]',
        ))
          visible = visible.replaceAll(link.innerText, '')
        return visible
      })
      const head = await page.locator('head').innerHTML()
      const jsonLd = (
        await page.locator('script[type="application/ld+json"]').allTextContents()
      ).join()
      for (const other of TENANTS.filter((t) => t !== tenant)) {
        expect(text).not.toContain(other.name)
        expect(head).not.toContain(other.name)
        expect(jsonLd).not.toContain(other.name)
      }
    })
  }
})

test.describe('cross-tenant paths', () => {
  // Review of S3: /<other domain> once rendered the other tenant through the [domain] segment.
  test('another domain in the path does not show that tenant', async ({ page }) => {
    const response = await page.goto(site('instalacje.localhost', '/biznes.localhost'))
    expect(response?.status()).toBe(404)
    expect(await page.content()).not.toContain('PRO-KOM Biznes')
  })

  test('the same trick on an unknown domain → 404', async ({ page }) => {
    const response = await page.goto(site('nieznana.localhost', '/biznes.localhost'))
    expect(response?.status()).toBe(404)
    expect(await page.content()).not.toContain('PRO-KOM Biznes')
  })
})

test.describe('unknown domains', () => {
  for (const host of ['nieznana.localhost', 'localhost']) {
    test(`${host} → 404`, async ({ page }) => {
      const response = await page.goto(site(host))
      expect(response?.status()).toBe(404)
      const html = await page.content()
      for (const tenant of TENANTS) {
        expect(html).not.toContain(tenant.name)
      }
    })
  }
})

test.describe('panel only on the panel domain', () => {
  for (const path of ['/admin', '/admin/login', '/api/users', '/api/tenants', '/api/graphql']) {
    test(`${path} on a site domain → 404`, async ({ page }) => {
      const response = await page.goto(site('biznes.localhost', path))
      expect(response?.status()).toBe(404)
    })
  }

  test('admin panel renders on panel.localhost', async ({ page }) => {
    const response = await page.goto('/admin')
    expect(response?.status()).toBe(200)
    // Fresh database shows "create first user", otherwise the login form; both have an email field.
    await expect(page.locator('input[name="email"]')).toBeVisible()
  })

  test('panel root redirects to the admin panel', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/admin/)
  })

  // Floor plans (K3.1) and ready bundles (K3c, internal notes inside) are read by the pages with
  // the tenant filter, never through the API. `page`, not `request`: only the browser resolves
  // `*.localhost`.
  test('floor plans and bundles are not public through the API', async ({ page }) => {
    for (const collection of ['floor-plans', 'bundles']) {
      expect((await page.goto(site('biznes.localhost', `/api/${collection}`)))?.status()).toBe(404)
      expect((await page.goto(`/api/${collection}`))?.status()).toBe(403)
    }
  })

  test('panel domain does not serve site pages', async ({ page }) => {
    const response = await page.goto('/kontakt')
    expect(response?.status()).toBe(404)
  })
})
