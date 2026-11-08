import { expect, type Locator, type Page } from '@playwright/test'

// Hydration (ADR-023: widgets load lazily). Right after `goto` the server HTML is already on
// screen, but a click or key press before React attaches its handlers does nothing. A test that
// acts once and then waits for the result fails after the whole test timeout — the main cause
// of flaky e2e in CI (08.11: search, menu, seasonal bar, hero clock). Act through these.

/** Waits until React has hydrated `target`, so its handlers (onClick, timers) are attached. */
export async function hydrated(target: Locator): Promise<void> {
  await expect
    .poll(() =>
      target.evaluate((element) =>
        Object.keys(element).some((key) => key.startsWith('__reactProps$')),
      ),
    )
    .toBe(true)
}

/** Clicks `trigger` until `shown` is visible (a click before hydration is lost). */
export async function clickUntilVisible(trigger: Locator, shown: Locator): Promise<void> {
  await expect(async () => {
    // Not again once open: a second click could be blocked by the open dialog or close it.
    if (!(await shown.isVisible())) await trigger.click({ timeout: 2000 })
    await expect(shown).toBeVisible({ timeout: 1000 })
  }).toPass()
}

/** Presses `key` until `shown` is visible (a key press before hydration is lost). */
export async function pressUntilVisible(page: Page, key: string, shown: Locator): Promise<void> {
  await expect(async () => {
    if (!(await shown.isVisible())) await page.keyboard.press(key)
    await expect(shown).toBeVisible({ timeout: 1000 })
  }).toPass()
}

// Always through the browser: Chromium resolves *.localhost itself, while Node.js (used by
// Playwright's `request`) does not on every system.
// Port from `playwright.config.ts` (`PORT` of this working folder).
export const site = (host: string, path = '/') =>
  `http://${host}:${process.env.PORT ?? 3000}${path}`

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

/**
 * The theme as a visitor gets it: the stored choice (`pk-theme`) and the system preference.
 * Biznes starts light whatever the system says (D-K4-5), so emulating the system alone no
 * longer shows its dark theme.
 */
export async function setTheme(
  page: Page,
  theme: 'light' | 'dark',
  media: Parameters<Page['emulateMedia']>[0] = {},
) {
  await page.addInitScript((value) => {
    try {
      localStorage.setItem('pk-theme', value)
    } catch {}
  }, theme)
  await page.emulateMedia({ ...media, colorScheme: theme })
}
