import { expect, test } from '@playwright/test'

import { site } from '../helpers'
import { INST_HOST, INST_PAGES } from './pages'
import { auditPhone, FAILING, PHONE_WIDTHS, setTheme, THEMES } from './phone-audit'

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
        for (const p of await auditPhone(page, width)) {
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
