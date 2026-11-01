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
    await page.setViewportSize({ width: 390, height: 844 })
    const response = await page.goto(site(INST_HOST, path))
    expect(response?.status(), path).toBe(200)
    const failures: string[] = []
    for (const width of PHONE_WIDTHS) {
      await page.setViewportSize({ width, height: 844 })
      for (const theme of THEMES) {
        await setTheme(page, theme)
        for (const p of await auditPhone(page)) {
          if (FAILING.has(p.kind)) failures.push(`${width} ${theme} ${p.kind}: ${p.detail}`)
        }
      }
    }
    expect(failures).toEqual([])

    // The menu sheet opens from the bottom bar on every page and closes with Esc
    // (all closing ways: shell.e2e.spec.ts).
    await page.setViewportSize({ width: 390, height: 844 })
    const bar = page.getByRole('navigation', { name: 'Szybka nawigacja' })
    await bar.getByRole('button', { name: 'Więcej' }).click()
    const sheet = page.getByRole('dialog')
    await expect(sheet).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
  })
}
