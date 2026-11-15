import { expect, test } from '@playwright/test'

import { api, loginAsAdmin, site, tenantId } from './helpers'

// B1b acceptance (ADR-012, rozstrzygnięcia 2 i 3): a promo campaign shows only on its lines,
// Biznes settings exist only for the Biznes tenant. Edits are reverted afterwards.

test.describe('Biznes data stays on the Biznes line', () => {
  test('a promo bar for Biznes shows on Biznes only', async ({ page }) => {
    await loginAsAdmin(page)
    const { json: original } = await api(page, 'GET', '/api/globals/company-data?depth=0')
    const text = `Kampania E2E ${Date.now()}`
    const updated = await api(page, 'POST', '/api/globals/company-data', {
      promoBar: { text, lines: ['biznes'], campaignId: 'e2e-kampania' },
    })
    expect(updated.status).toBe(200)

    try {
      await page.goto(site('biznes.localhost'))
      // Contains, not equals: the bar also has its close button (B3b).
      await expect(page.getByRole('complementary', { name: 'Promocja' })).toContainText(text)
      for (const host of ['instalacje.localhost', 'software.localhost']) {
        await page.goto(site(host))
        await expect(page.locator('body')).not.toContainText(text)
      }
    } finally {
      await page.goto('/admin/login')
      const restored = await api(page, 'POST', '/api/globals/company-data', {
        promoBar: original.promoBar ?? {},
      })
      expect(restored.status).toBe(200)
    }
  })

  test('Biznes settings are accepted only for the Biznes tenant', async ({ page }) => {
    await loginAsAdmin(page)
    const [biznes, instalacje] = await Promise.all([
      tenantId(page, 'biznes'),
      tenantId(page, 'instalacje'),
    ])
    const search = { popular: ['terminal'] }

    const refused = await api(page, 'POST', '/api/biznes-settings', { tenant: instalacje, search })
    expect(refused.status).toBe(400)

    // The seed's document (search, wizard rules — B10c) stays: other specs and the wizard need
    // it. One is created only when missing, and then removed again.
    const { json: existing } = await api(
      page,
      'GET',
      `/api/biznes-settings?where[tenant][equals]=${biznes}&depth=0`,
    )
    const [current] = existing.docs as { id: number }[]
    const created = current
      ? null
      : await api(page, 'POST', '/api/biznes-settings', { tenant: biznes, search })
    if (created) expect(created.status).toBe(201)
    const id = current?.id ?? (created?.json.doc as { id: number }).id
    try {
      // An invalid wizard is rejected with a readable message; the document stays as it was.
      const invalid = await api(page, 'PATCH', `/api/biznes-settings/${id}`, {
        wizard: { steps: [] },
      })
      expect(invalid.status).toBe(400)
    } finally {
      if (created) await api(page, 'DELETE', `/api/biznes-settings/${id}`)
    }
  })

  // The panel shows the Biznes fields from a copy of the tenant's line; the API cannot set it.
  test('the line copy in site settings always follows the tenant', async ({ page }) => {
    await loginAsAdmin(page)
    const instalacje = await tenantId(page, 'instalacje')
    const { json } = await api(
      page,
      'GET',
      `/api/site-settings?where[tenant][equals]=${instalacje}&depth=0`,
    )
    const [settings] = json.docs as { id: number }[]
    expect(settings).toBeDefined()

    const forged = await api(page, 'PATCH', `/api/site-settings/${settings?.id}`, {
      line: 'biznes',
    })
    expect(forged.status).toBe(200)
    expect((forged.json.doc as { line?: string }).line).toBe('instalacje')
  })
})
