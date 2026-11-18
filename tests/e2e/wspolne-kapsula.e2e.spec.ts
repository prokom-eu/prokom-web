import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// Krystian 18.11: everything of the main navigation must fit in the header capsule on every line
// and width — nothing may stick out (Instalacje's „Zaplanuj instalację” did at 1440 px).
// `CapsuleShell` gives way step by step (`data-fit`); this checks the result. Needs `pnpm seed`.

/** Free room of the capsule's row (the same sum as `capsuleFit.ts`); negative = sticks out. */
const free = (page: Page) =>
  page.locator('.cap').evaluate((cap) => {
    const style = getComputedStyle(cap)
    const items = [...cap.children].filter((el) => {
      const s = getComputedStyle(el)
      return s.display !== 'none' && s.position !== 'absolute' && s.position !== 'fixed'
    })
    const used = items.reduce((sum, el) => sum + (el as HTMLElement).offsetWidth, 0)
    const inner = cap.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
    return inner - used - (parseFloat(style.columnGap) || 0) * Math.max(0, items.length - 1) + 1
  })

const HOSTS = ['biznes.localhost', 'instalacje.localhost', 'software.localhost', 'prokom.localhost']

for (const host of HOSTS) {
  test.describe(`${host}: the header capsule holds everything`, () => {
    for (const width of [1081, 1280, 1360, 1440, 1920]) {
      test(`${width} px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 })
        await page.goto(site(host))
        // The fit runs after hydration (`CapsuleShell`): wait for it, then check.
        await expect(page.locator('.cap-wrap[data-fit-ready]')).toBeAttached({ timeout: 15_000 })
        await expect.poll(() => free(page)).toBeGreaterThanOrEqual(0)
        // The action ends inside the capsule's border.
        const inside = await page.locator('.cap').evaluate((cap) => {
          const box = cap.getBoundingClientRect()
          const cta = cap.querySelector('.cap-cta')?.getBoundingClientRect()
          return !cta || cta.right <= box.right
        })
        expect(inside).toBe(true)
        // One row of menu entries.
        const tops = await page.locator('.cap__nav .cap-link').evaluateAll((links) => [
          ...new Set(
            links
              // Entries a line hides on narrower desktops (the hub's „O firmie”) are not in the row.
              .filter((l) => (l as HTMLElement).offsetParent)
              .map((l) => Math.round(l.getBoundingClientRect().top)),
          ),
        ])
        expect(tops.length).toBeLessThanOrEqual(1)

        // Scrolled: the smaller capsule must hold everything too.
        await page.mouse.wheel(0, 900)
        await expect(page.locator('.cap-wrap[data-scrolled]')).toBeAttached()
        await expect.poll(() => free(page)).toBeGreaterThanOrEqual(0)
      })
    }
  })
}
