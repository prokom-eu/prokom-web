import { randomUUID } from 'node:crypto'

import { expect, test } from '@playwright/test'

import { api, loginAsAdmin, tenantId } from './helpers'

// SW2a acceptance: the Software collections belong to the Software line only, their slugs and
// import ids are unique per tenant, and an editor of another tenant never sees their records.
// SW2b: industries and posts shared with Biznes carry the tenant's line, and a post takes only
// a category of its line.

const unique = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`

const solution = (tenant: number, slug: string, legacyId?: number) => ({
  tenant,
  slug,
  name: `Rozwiązanie E2E ${slug}`,
  category: 'strony',
  prices: { start: 990, std: null, full: 1990 },
  ...(legacyId !== undefined && { legacyId }),
})

const area = (tenant: number, key: string) => ({ tenant, key, name: `Obszar E2E ${key}` })

const city = (tenant: number, slug: string) => ({ tenant, slug, name: `Miejscowość E2E ${slug}` })

test.describe('Software data in the panel', () => {
  test('Software collections are accepted only for the Software tenant', async ({ page }) => {
    await loginAsAdmin(page)
    const biznes = await tenantId(page, 'biznes')
    const id = unique()

    for (const [path, data] of [
      ['/api/solutions', solution(biznes, `e2e-${id}`)],
      ['/api/solution-areas', area(biznes, 'www')],
      ['/api/cities', city(biznes, `e2e-${id}`)],
    ] as const) {
      const refused = await api(page, 'POST', path, data)
      expect(refused.status, path).toBe(400)
    }
  })

  test('slug and import id of a solution are unique in the tenant', async ({ page }) => {
    await loginAsAdmin(page)
    const software = await tenantId(page, 'software')
    const id = unique()
    // Far above the ids of the design package (1–30), so the seed never collides with it.
    const legacyId = 100_000 + (Number(id) % 1_000_000)
    const created: number[] = []
    try {
      const first = await api(
        page,
        'POST',
        '/api/solutions',
        solution(software, `e2e-${id}`, legacyId),
      )
      expect(first.status).toBe(201)
      created.push((first.json.doc as { id: number }).id)

      const sameSlug = await api(page, 'POST', '/api/solutions', solution(software, `e2e-${id}`))
      expect(sameSlug.status).toBe(400)

      const sameImportId = await api(
        page,
        'POST',
        '/api/solutions',
        solution(software, `e2e-${id}-b`, legacyId),
      )
      expect(sameImportId.status).toBe(400)

      // Solutions added in the panel have no import id — any number of them.
      for (const suffix of ['c', 'd']) {
        const withoutId = await api(
          page,
          'POST',
          '/api/solutions',
          solution(software, `e2e-${id}-${suffix}`),
        )
        expect(withoutId.status).toBe(201)
        created.push((withoutId.json.doc as { id: number }).id)
      }
    } finally {
      for (const doc of created) await api(page, 'DELETE', `/api/solutions/${doc}`)
    }
  })

  test('a city goes active only with its own heading', async ({ page }) => {
    await loginAsAdmin(page)
    const software = await tenantId(page, 'software')
    const slug = `e2e-${unique()}`

    const empty = await api(page, 'POST', '/api/cities', { ...city(software, slug), active: true })
    expect(empty.status).toBe(400)

    const filled = await api(page, 'POST', '/api/cities', {
      ...city(software, slug),
      active: true,
      hero: { title: 'Strony dla firm', lead: 'Własny tekst tej miejscowości.' },
    })
    expect(filled.status).toBe(201)
    await api(page, 'DELETE', `/api/cities/${(filled.json.doc as { id: number }).id}`)
  })

  test('an editor of another tenant does not see Software records', async ({ page, browser }) => {
    await loginAsAdmin(page)
    const [software, biznes] = await Promise.all([
      tenantId(page, 'software'),
      tenantId(page, 'biznes'),
    ])
    const id = unique()
    const records: [string, number][] = []

    // Throwaway test account of the local app, removed below.
    const email = `e2e-editor-${id}@example.test`
    const password = randomUUID()
    let editorId: number | null = null
    const context = await browser.newContext()
    try {
      for (const [path, data] of [
        ['/api/solutions', solution(software, `e2e-${id}`)],
        ['/api/cities', city(software, `e2e-${id}`)],
      ] as const) {
        const record = await api(page, 'POST', path, data)
        expect(record.status, path).toBe(201)
        records.push([path, (record.json.doc as { id: number }).id])
      }

      const editor = await api(page, 'POST', '/api/users', {
        email,
        password,
        role: 'editor',
        tenants: [{ tenant: biznes }],
      })
      expect(editor.status).toBe(201)
      editorId = (editor.json.doc as { id: number }).id

      const editorPage = await context.newPage()
      await editorPage.goto('/admin/login')
      expect((await api(editorPage, 'POST', '/api/users/login', { email, password })).status).toBe(
        200,
      )
      for (const [path, recordId] of records) {
        const list = await api(editorPage, 'GET', `${path}?depth=0&limit=100`)
        expect(list.status, path).toBe(200)
        expect((list.json.docs as { id: number }[]).map((doc) => doc.id)).not.toContain(recordId)
        expect((await api(editorPage, 'GET', `${path}/${recordId}`)).status, path).not.toBe(200)
      }

      // Anonymous: the API is closed (the site reads through the Local API).
      const anonymous = await browser.newContext()
      try {
        const anonPage = await anonymous.newPage()
        await anonPage.goto('/admin/login')
        for (const path of ['/api/solutions', '/api/solution-areas', '/api/cities']) {
          expect((await api(anonPage, 'GET', path)).status, path).not.toBe(200)
        }
      } finally {
        await anonymous.close()
      }
    } finally {
      await context.close()
      if (editorId !== null) await api(page, 'DELETE', `/api/users/${editorId}`)
      for (const [path, recordId] of records) await api(page, 'DELETE', `${path}/${recordId}`)
    }
  })

  test('an industry keeps the line of its tenant, whatever the request sends', async ({ page }) => {
    await loginAsAdmin(page)
    const software = await tenantId(page, 'software')
    const id = unique()
    const created = await api(page, 'POST', '/api/industries', {
      tenant: software,
      slug: `e2e-${id}`,
      name: `Branża E2E ${id}`,
      line: 'biznes',
      software: { group: 'noclegi', wizardFirm: 'nocleg', wizardTitle: 'W 60 sekund.' },
    })
    expect(created.status).toBe(201)
    const doc = created.json.doc as { id: number; line: string; software: { group: string } }
    try {
      expect(doc.line).toBe('software')
      expect(doc.software.group).toBe('noclegi')
    } finally {
      await api(page, 'DELETE', `/api/industries/${doc.id}`)
    }
  })

  test('a post takes only a category of its line', async ({ page }) => {
    await loginAsAdmin(page)
    const [software, biznes] = await Promise.all([
      tenantId(page, 'software'),
      tenantId(page, 'biznes'),
    ])
    const id = unique()
    // Drafts: the category check runs on every save, the content is not needed for it.
    const post = (tenant: number, category: string) => ({
      tenant,
      category,
      slug: `e2e-${category}-${id}`,
      title: `Wpis E2E ${id}`,
      _status: 'draft',
    })

    for (const [tenant, category] of [
      [biznes, 'poradnik'],
      [software, 'ksef'],
    ] as const) {
      const refused = await api(page, 'POST', '/api/posts?draft=true', post(tenant, category))
      expect(refused.status, category).toBe(400)
    }

    const accepted = await api(page, 'POST', '/api/posts?draft=true', post(software, 'poradnik'))
    expect(accepted.status).toBe(201)
    const doc = accepted.json.doc as { id: number; line: string }
    try {
      expect(doc.line).toBe('software')
      // Changing the category later is checked too.
      const changed = await api(page, 'PATCH', `/api/posts/${doc.id}?draft=true`, {
        category: 'kasy',
      })
      expect(changed.status).toBe(400)
    } finally {
      await api(page, 'DELETE', `/api/posts/${doc.id}`)
    }
  })
})
