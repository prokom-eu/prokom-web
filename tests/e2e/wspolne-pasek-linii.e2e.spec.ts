import { expect, test, type Page } from '@playwright/test'

import { hydrated, site } from './helpers'

// WSP-M PR 3 (MOTYW-PASEK-LINII §4): the brand bar „premium” — the pill following the pointer and
// keyboard focus, the line description in a tooltip, the height unchanged. Needs `pnpm seed`.
const bar = (page: Page) => page.locator('[data-brand-bar] [data-bbar-lines]')
const pill = (page: Page) => bar(page).locator('.bbar-pill')

/** Left edge and width of an element relative to the bar's line list. */
const box = (page: Page, selector: string) =>
  bar(page).evaluate((nav, sel) => {
    const el = nav.querySelector<HTMLElement>(sel)!
    const pillEl = nav.querySelector<HTMLElement>('.bbar-pill')!
    return {
      left: el.offsetLeft,
      width: el.offsetWidth,
      pillLeft: new DOMMatrix(getComputedStyle(pillEl).transform).m41,
      pillWidth: pillEl.offsetWidth,
    }
  }, selector)

test.describe('brand bar (1440 px)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  for (const host of ['biznes.localhost', 'instalacje.localhost', 'software.localhost']) {
    test(`${host}: 38 px high, the pill rests under the current line`, async ({ page }) => {
      await page.goto(site(host))
      await expect(page.locator('[data-brand-bar]')).toHaveCSS('height', '38px')
      await hydrated(pill(page))
      await expect(pill(page)).toHaveAttribute('data-on', '')
      await expect
        .poll(async () => {
          const b = await box(page, '.bbar-line[aria-current="page"]')
          return Math.abs(b.pillLeft - b.left) < 1 && b.pillWidth === b.width
        })
        .toBe(true)
    })
  }

  test('the pill follows the pointer and goes back; the tooltip shows the description', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost'))
    await hydrated(pill(page))
    const software = bar(page).getByRole('link', { name: 'Software' })
    await software.hover()
    await expect
      .poll(async () => {
        const b = await box(page, '.bbar-item:has(> a[href*="prokomsoftware"]) .bbar-line')
        return Math.abs(b.pillLeft - b.left) < 1
      })
      .toBe(true)
    // The description from the panel, after 350 ms of pointing.
    const tip = bar(page).locator('.bbar-item:has(> a[href*="prokomsoftware"]) [role="tooltip"]')
    await expect(tip).toBeVisible()
    await expect(software).toHaveAttribute('aria-describedby', (await tip.getAttribute('id'))!)

    await page.mouse.move(700, 500)
    await expect
      .poll(async () => {
        const b = await box(page, '.bbar-line[aria-current="page"]')
        return Math.abs(b.pillLeft - b.left) < 1
      })
      .toBe(true)
    await expect(tip).toBeHidden()
  })

  test('keyboard focus moves the pill and shows the tooltip at once', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await hydrated(pill(page))
    const prokom = bar(page).getByRole('link', { name: 'PRO-KOM' })
    // Tab from the top (skip link first): real keyboard focus, so `:focus-visible` applies.
    await expect(async () => {
      await page.keyboard.press('Tab')
      await expect(prokom).toBeFocused({ timeout: 200 })
    }).toPass()
    await expect(
      bar(page).locator('.bbar-item:has(> a[href*="pro-kom.eu"]) [role="tooltip"]'),
    ).toBeVisible()
    await expect
      .poll(async () => {
        const b = await box(page, '.bbar-item:has(> a[href*="pro-kom.eu"]) .bbar-line')
        return Math.abs(b.pillLeft - b.left) < 1
      })
      .toBe(true)
  })
})
