import { randomUUID } from 'node:crypto'

import { expect, type Page, test } from '@playwright/test'

import popularne from '../../seed/prokomsoftware/popularne.json' with { type: 'json' }
import stronaGlowna from '../../seed/prokomsoftware/strona-glowna.json' with { type: 'json' }
import technologie from '../../seed/prokomsoftware/technologie.json' with { type: 'json' }
import { api, loginAsAdmin, site, tenantId } from './helpers'

// SW2a-2 acceptance: Software settings belong to the Software line, their JSON is checked
// (shape and solution slugs), facts have unique keys, and `/dziekujemy` exists only on Software.

const unique = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`

const thanks = {
  title: 'Dziękujemy, mamy to.',
  lead: 'Twoja wiadomość trafiła prosto do zespołu PRO-KOM Software.',
  numberLabel: 'Numer zgłoszenia',
  stepsTitle: 'Co dalej',
  steps: ['**Krótka rozmowa, 30 minut**: u Ciebie, w salonie albo online.'],
  urgent: 'Pilna sprawa? Zadzwoń:',
  more: { eyebrow: 'Zanim się odezwiemy', title: 'Zobacz, jak to wygląda u innych.', cards: [] },
}

/** Home texts as the seed stores them, with the 12 cards pointing at `slugs`. */
function home(slugs: string[]) {
  const { homeOrder: _order, ...texts } = structuredClone(stronaGlowna)
  return {
    ...texts,
    technologies: technologie.layers,
    popular: { order: slugs, tabs: popularne.tabs },
  }
}

type Settings = { id: number; thanks?: unknown; home?: unknown }

/**
 * Runs `body` with the Software settings document of the tenant: the existing one (its fields
 * restored afterwards) or a new one, removed afterwards.
 */
async function withSoftwareSettings(
  page: Page,
  tenant: number,
  body: (id: number) => Promise<void>,
): Promise<void> {
  const { json } = await api(
    page,
    'GET',
    `/api/software-settings?where[tenant][equals]=${tenant}&depth=0`,
  )
  const [existing] = json.docs as Settings[]
  const created = existing ? null : await api(page, 'POST', '/api/software-settings', { tenant })
  if (created) expect(created.status).toBe(201)
  const id = existing?.id ?? (created?.json.doc as { id: number }).id
  try {
    await body(id)
  } finally {
    if (existing) {
      await api(page, 'PATCH', `/api/software-settings/${id}`, {
        thanks: existing.thanks ?? null,
        home: existing.home ?? null,
      })
    } else {
      await api(page, 'DELETE', `/api/software-settings/${id}`)
    }
  }
}

test.describe('Software settings in the panel', () => {
  test('are accepted only for the Software tenant', async ({ page }) => {
    await loginAsAdmin(page)
    const biznes = await tenantId(page, 'biznes')
    const refused = await api(page, 'POST', '/api/software-settings', { tenant: biznes })
    expect(refused.status).toBe(400)
  })

  test('JSON texts are checked: shape and solution addresses', async ({ page }) => {
    await loginAsAdmin(page)
    const software = await tenantId(page, 'software')
    const slug = `e2e-${unique()}`
    const solution = await api(page, 'POST', '/api/solutions', {
      tenant: software,
      slug,
      name: `Rozwiązanie E2E ${slug}`,
      category: 'strony',
    })
    expect(solution.status).toBe(201)
    try {
      await withSoftwareSettings(page, software, async (id) => {
        const badShape = await api(page, 'PATCH', `/api/software-settings/${id}`, {
          thanks: { ...thanks, titel: 'literówka' },
        })
        expect(badShape.status).toBe(400)

        const missing = await api(page, 'PATCH', `/api/software-settings/${id}`, {
          home: home([`${slug}-nie-ma`]),
        })
        expect(missing.status).toBe(400)
        expect(JSON.stringify(missing.json)).toContain(`${slug}-nie-ma`)

        const ok = await api(page, 'PATCH', `/api/software-settings/${id}`, { home: home([slug]) })
        expect(ok.status).toBe(200)
      })
    } finally {
      await api(page, 'DELETE', `/api/solutions/${(solution.json.doc as { id: number }).id}`)
    }
  })

  test('facts have unique keys and the navigation is checked', async ({ page }) => {
    await loginAsAdmin(page)
    const software = await tenantId(page, 'software')
    const { json } = await api(
      page,
      'GET',
      `/api/site-settings?where[tenant][equals]=${software}&depth=0`,
    )
    const [settings] = json.docs as { id: number }[]
    expect(settings).toBeDefined()
    const path = `/api/site-settings/${settings?.id}`

    const twice = await api(page, 'PATCH', path, {
      software: {
        facts: [
          { key: 'CZAS ODPOWIEDZI', value: '1 dnia roboczego' },
          { key: 'CZAS ODPOWIEDZI', value: '2 dni' },
        ],
      },
    })
    expect(twice.status).toBe(400)

    const lowercase = await api(page, 'PATCH', path, {
      software: { facts: [{ key: '[czas]', value: '1 dnia' }] },
    })
    expect(lowercase.status).toBe(400)

    const navigation = await api(page, 'PATCH', path, {
      software: { navigation: { header: [] } },
    })
    expect(navigation.status).toBe(400)
  })
  test('an editor of another tenant does not see them; the API is closed', async ({
    page,
    browser,
  }) => {
    await loginAsAdmin(page)
    const [software, biznes] = await Promise.all([
      tenantId(page, 'software'),
      tenantId(page, 'biznes'),
    ])
    await withSoftwareSettings(page, software, async (id) => {
      // Throwaway test account of the local app, removed below.
      const email = `e2e-editor-${unique()}@example.test`
      const password = randomUUID()
      const editor = await api(page, 'POST', '/api/users', {
        email,
        password,
        role: 'editor',
        tenants: [{ tenant: biznes }],
      })
      expect(editor.status).toBe(201)
      const context = await browser.newContext()
      try {
        const editorPage = await context.newPage()
        await editorPage.goto('/admin/login')
        const login = await api(editorPage, 'POST', '/api/users/login', { email, password })
        expect(login.status).toBe(200)
        const list = await api(editorPage, 'GET', '/api/software-settings?depth=0')
        expect((list.json.docs as { id: number }[]).map((doc) => doc.id)).not.toContain(id)
        expect((await api(editorPage, 'GET', `/api/software-settings/${id}`)).status).not.toBe(200)

        const anonymous = await browser.newContext()
        try {
          const anonPage = await anonymous.newPage()
          await anonPage.goto('/admin/login')
          expect((await api(anonPage, 'GET', '/api/software-settings')).status).not.toBe(200)
        } finally {
          await anonymous.close()
        }
      } finally {
        await context.close()
        await api(page, 'DELETE', `/api/users/${(editor.json.doc as { id: number }).id}`)
      }
    })
  })
})

test.describe('/dziekujemy', () => {
  test('shows the thanks texts and only a valid inquiry number on Software', async ({ page }) => {
    await loginAsAdmin(page)
    const software = await tenantId(page, 'software')
    await withSoftwareSettings(page, software, async (id) => {
      const saved = await api(page, 'PATCH', `/api/software-settings/${id}`, { thanks })
      expect(saved.status).toBe(200)

      // The site in its own tab: the panel tab keeps the panel domain for the API calls.
      const view = await page.context().newPage()
      const response = await view.goto(site('software.localhost', '/dziekujemy?nr=PKS-2026-0142'))
      expect(response?.status()).toBe(200)
      await expect(view.locator('h1')).toHaveText(thanks.title)
      await expect(view.getByTestId('inquiry-number')).toHaveText('PKS-2026-0142')
      await expect(view.locator('ol strong')).toHaveText('Krótka rozmowa, 30 minut')
      await expect(view.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)

      await view.goto(site('software.localhost', '/dziekujemy?nr=%3Cb%3Ex%3C%2Fb%3E'))
      await expect(view.getByTestId('inquiry-number')).toHaveCount(0)
    })
  })

  for (const host of ['biznes.localhost', 'instalacje.localhost']) {
    test(`on ${host} → 404`, async ({ page }) => {
      const response = await page.goto(site(host, '/dziekujemy'))
      expect(response?.status()).toBe(404)
    })
  }
})
