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

    // The menu sheet opens from the bottom bar and closes with Esc (all closing ways:
    // shell.e2e.spec.ts). First, so the page is hydrated before the scroll checks.
    const bar = page.getByRole('navigation', { name: 'Szybka nawigacja' })
    await bar.getByRole('button', { name: 'Więcej' }).click()
    const sheet = page.getByRole('dialog')
    await expect(sheet).toBeVisible()
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
