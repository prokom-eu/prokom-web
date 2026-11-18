import { expect, test, type Page } from '@playwright/test'

import { hydrated, site } from './helpers'

// WSP-M PR 3 (MOTYW-PASEK-LINII §4): the brand bar „premium” — the pill following the pointer and
// keyboard focus, the line description in a tooltip, the height unchanged. Needs `pnpm seed`.
const bar = (page: Page) => page.locator('[data-brand-bar] [data-bbar-lines]')
const pill = (page: Page) => bar(page).locator('.bbar-pill')

/**
 * Where the pill is headed and where the line is, both against the bar's line list: the pill's
 * target (`translateX` and width set by `BrandBarPill`) — not its place mid-transition.
 */
const box = (page: Page, selector: string) =>
  bar(page).evaluate((nav, sel) => {
    const el = nav.querySelector<HTMLElement>(sel)!.getBoundingClientRect()
    const pillEl = nav.querySelector<HTMLElement>('.bbar-pill')!
    const target = /translateX\(([-\d.]+)px\)/.exec(pillEl.style.transform)
    return {
      left: el.left - nav.getBoundingClientRect().left,
      width: el.width,
      pillLeft: target ? Number(target[1]) : Number.NaN,
      pillWidth: parseFloat(pillEl.style.width),
    }
  }, selector)

test.describe('brand bar (1440 px)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  for (const host of [
    'biznes.localhost',
    'instalacje.localhost',
    'software.localhost',
    'prokom.localhost',
  ]) {
    test(`${host}: 38 px high, the pill rests under the current line`, async ({ page }) => {
      await page.goto(site(host))
      await expect(page.locator('[data-brand-bar]')).toHaveCSS('height', '38px')
      await hydrated(pill(page))
      await expect(pill(page)).toHaveAttribute('data-on', '')
      await expect
        .poll(async () => {
          const b = await box(page, '.bbar-line[aria-current="page"]')
          return Math.abs(b.pillLeft - b.left) < 1 && Math.abs(b.pillWidth - b.width) < 1
        })
        .toBe(true)
      // Not the first line by accident (PRO-KOM is first): the hub is the only one there.
      if (host !== 'prokom.localhost') {
        expect((await box(page, '.bbar-line[aria-current="page"]')).left).toBeGreaterThan(20)
      }
    })
  }

  test('the pill follows the pointer and goes back; the tooltip shows the description', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost'))
    await hydrated(pill(page))
    const software = bar(page).getByRole('link', { name: 'Software' })
    // Hover again until the pill follows: on a busy CI runner the first pointer move can land
    // before the bar listens or while the header still settles (18.11, several PRs).
    await expect(async () => {
      await page.mouse.move(700, 500)
      await software.hover()
      await expect
        .poll(
          async () => {
            const b = await box(page, '.bbar-item:has(> a[href*="prokomsoftware"]) .bbar-line')
            return Math.abs(b.pillLeft - b.left) < 1
          },
          { timeout: 2000 },
        )
        .toBe(true)
    }).toPass({ timeout: 15_000 })
    // The description from the panel, after 350 ms of pointing.
    const tip = bar(page).locator('.bbar-item:has(> a[href*="prokomsoftware"]) [role="tooltip"]')
    await expect(tip).toBeVisible()
    await expect(software).toHaveAttribute('aria-describedby', (await tip.getAttribute('id'))!)

    await page.keyboard.press('Escape')
    await expect(tip).toBeHidden()
    await software.hover({ position: { x: 4, y: 4 } })
    await expect(tip).toBeVisible()

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
