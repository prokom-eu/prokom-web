import { expect, type Page, test } from '@playwright/test'

import { site } from '../helpers'
import { INST_HOST, INST_PAGES } from './pages'
import {
  auditPhone,
  FAILING,
  PHONE_WIDTHS,
  type PhoneProblem,
  setTheme,
  THEMES,
} from './phone-audit'

/** One audit normally takes ~3 s. */
const AUDIT_LIMIT_MS = 45_000

/**
 * The audit with its own limit. In CI an audit of a random page sometimes never returned and
 * held the test until its 180 s timeout (08.11, cause not found yet): now it fails after 45 s,
 * goes to the retry sooner and says where it stopped and whether the page still answers.
 */
async function auditWithLimit(page: Page, width: number, where: string): Promise<PhoneProblem[]> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const limit = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      // A 1 + 1 that does not come back in 2 s means the page's main thread is blocked.
      const probe = page
        .evaluate(() => 1 + 1)
        .then(
          () => 'the page still answers',
          (error: unknown) => `the page fails: ${String(error).slice(0, 120)}`,
        )
      const blocked = new Promise<string>((done) =>
        setTimeout(() => done('the page does not answer (main thread blocked)'), 2000),
      )
      void Promise.race([probe, blocked]).then((state) =>
        reject(new Error(`Phone audit hung for ${AUDIT_LIMIT_MS / 1000} s at ${where}; ${state}.`)),
      )
    }, AUDIT_LIMIT_MS)
  })
  try {
    return await Promise.race([auditPhone(page, width), limit])
  } finally {
    clearTimeout(timer)
  }
}

// I14: MOBILE-APLIKACJA §10 on every address of the line — 360/390/414 px, light and dark.
// One test per page (widths and themes switched in place, no reload) keeps CI short. The same
// checks give the local report: docs/design/prokominstalacje/narzedzia/audyt-telefon.mjs.
test.use({ isMobile: true, hasTouch: true, contextOptions: { reducedMotion: 'reduce' } })

for (const path of INST_PAGES) {
  test(`Instalacje on a phone: ${path}`, async ({ page }) => {
    test.slow()
    // Enter at 360 px — the narrowest phone, how people arrive; the rest by resizing.
    await page.setViewportSize({ width: PHONE_WIDTHS[0], height: 844 })
    const response = await page.goto(site(INST_HOST, path))
    expect(response?.status(), path).toBe(200)

    // The menu sheet opens from the tab bar and closes with Esc (shell.e2e.spec.ts). First, so
    // the page is hydrated before the scroll checks.
    const bar = page.getByRole('navigation', { name: 'Pasek aplikacji' })
    const sheet = page.getByRole('dialog', { name: 'Menu' })
    // Retried until the page is hydrated (before that the tap is lost).
    await expect(async () => {
      await bar.getByRole('button', { name: 'Menu' }).click()
      await expect(sheet).toBeVisible({ timeout: 1000 })
    }).toPass()
    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()

    const failures: string[] = []
    for (const width of PHONE_WIDTHS) {
      await page.setViewportSize({ width, height: 844 })
      for (const theme of THEMES) {
        await setTheme(page, theme)
        for (const p of await auditWithLimit(page, width, `${path} ${width} px ${theme}`)) {
          if (FAILING.has(p.kind)) failures.push(`${width} ${theme} ${p.kind}: ${p.detail}`)
        }
      }
    }
    expect(failures).toEqual([])
  })
}

// P2-21 (audit 06.11): CLS 0,27 on `/dla-kogo/szkoly` after scrolling (a lazy widget). The page
// is scrolled down in steps; the layout shifts without input must stay under 0,1.
test('Instalacje on a phone: no layout shift while scrolling /dla-kogo/szkoly', async ({
  page,
}) => {
  // With motion on: the file runs with reduced motion, which would hide shifts of reveals.
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(site(INST_HOST, '/dla-kogo/szkoly'))
  await page.waitForLoadState('networkidle')
  const cls = await page.evaluate(async () => {
    let total = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & {
        value: number
        hadRecentInput: boolean
      })[]) {
        if (!entry.hadRecentInput) total += entry.value
      }
    }).observe({ type: 'layout-shift', buffered: true })
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return total
  })
  expect(cls).toBeLessThan(0.1)
})
