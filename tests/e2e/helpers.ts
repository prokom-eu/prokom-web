import { expect, type Page } from '@playwright/test'

// Always through the browser: Chromium resolves *.localhost itself, while Node.js (used by
// Playwright's `request`) does not on every system.
export const site = (host: string, path = '/') => `http://${host}:3000${path}`

export type ApiResult = { status: number; json: Record<string, unknown> }

/** REST call from inside the panel page: Chromium resolves *.localhost, Node.js may not. */
export async function api(
  page: Page,
  method: string,
  path: string,
  body?: unknown,
): Promise<ApiResult> {
  return page.evaluate(
    async ({ method, path, body }) => {
      const response = await fetch(path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      })
      return { status: response.status, json: (await response.json()) as Record<string, unknown> }
    },
    { method, path, body },
  )
}

export async function loginAsAdmin(page: Page): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  if (!email || !password) throw new Error('SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD are not set.')
  await page.goto('/admin/login')
  const { status } = await api(page, 'POST', '/api/users/login', { email, password })
  expect(status).toBe(200)
}

/** Id of a seed tenant (`src/seed/tenants.ts`); needs a logged-in panel page. */
export async function tenantId(page: Page, slug: string): Promise<number> {
  const { json } = await api(page, 'GET', `/api/tenants?where[slug][equals]=${slug}&depth=0`)
  const [tenant] = json.docs as { id: number }[]
  if (!tenant) throw new Error(`Seed tenant "${slug}" not found — run pnpm seed.`)
  return tenant.id
}
