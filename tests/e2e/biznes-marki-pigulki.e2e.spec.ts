import { expect, test } from '@playwright/test'

import { site } from './helpers'

// PREMIUM-1011 (audit 10.11 §9): in the home brand tiles the status pill („Autoryzowany serwis”,
// „We współpracy”) and the description under the logo share the bottom band — they must never be
// visible at the same time: at rest the pill, on hover the description, the pill leaving first.

const visible = (opacity: string) => Number(opacity) > 0.05

for (const width of [1440, 390]) {
  test(`brand tile: the pill and the description never overlap (${width} px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(site('biznes.localhost', '/'))
    const tile = page.locator('.zh-tile').filter({ hasText: 'Autoryzowany serwis' }).first()
    await tile.scrollIntoViewIfNeeded()
    const state = () =>
      tile.evaluate((el) => {
        const style = (selector: string) => getComputedStyle(el.querySelector(selector)!).opacity
        return { pill: style('.zh-tile-status'), info: style('.zh-tile-info') }
      })

    const rest = await state()
    expect(visible(rest.pill) && visible(rest.info)).toBe(false)

    const box = (await tile.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    // Right after the pointer comes, the description waits for the pill to leave.
    await page.waitForTimeout(80)
    const leaving = await state()
    expect(visible(leaving.pill) && visible(leaving.info)).toBe(false)

    await page.waitForTimeout(700)
    const hovered = await state()
    expect(visible(hovered.pill) && visible(hovered.info)).toBe(false)
  })
}
