import { expect, type Page, test } from '@playwright/test'

import { site } from '../helpers'

// Round v5 (RUNDA-V5 §1.6): the home hero fits the first screen in six window sizes. The text,
// the object tabs, the time of day, the camera preview and the dock do not overlap; the building
// is not covered by the camera or the dock; the dock ends above the bottom of the window.
// Local check with screenshots: docs/design/prokominstalacje/narzedzia/hero-uklad.mjs.
const HOST = 'instalacje.localhost'
const SIZES = [
  [1366, 768],
  [1440, 900],
  [1536, 864],
  [1920, 1080],
  [2560, 1080],
  [4096, 1009],
] as const

type Box = { x: number; y: number; width: number; height: number }
const overlap = (a: Box, b: Box) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height

async function box(page: Page, selector: string): Promise<Box | null> {
  const element = page.locator(selector)
  if (!(await element.count()) || !(await element.isVisible())) return null
  return element.boundingBox()
}

for (const [width, height] of SIZES) {
  test(`home hero layout at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(site(HOST))
    await expect(page.locator('.hxdock')).toBeVisible()

    const parts = {
      text: await box(page, '.hxt'),
      tabs: await box(page, '.hotabs'),
      time: await box(page, '.hmodes'),
      camera: await box(page, '.pip'),
      dock: await box(page, '.hxdock'),
    }
    // `--inst-hdr-h` is a number in the tokens: the hero starts right under the header and its
    // height is the window minus exactly that chrome (review of PR 1).
    const header = await box(page, '.hdr')
    const hero = await box(page, '#start')
    expect(header && hero).toBeTruthy()
    if (header && hero) {
      expect(Math.abs(header.y + header.height - hero.y)).toBeLessThanOrEqual(1)
      const expected = Math.min(920, Math.max(640, height - hero.y))
      expect(Math.abs(hero.height - expected)).toBeLessThanOrEqual(1)
    }

    const building = await box(page, '[data-hx-building]')
    expect(building).not.toBeNull()
    // The camera stands by the right edge only with room for it (RUNDA-V5 §1.3).
    expect(Boolean(parts.camera)).toBe(height - 114 >= 700 && width >= 1280)

    const named = Object.entries(parts).filter((e): e is [string, Box] => e[1] !== null)
    for (const [name, rect] of named) {
      expect(rect.x, `${name} inside the window`).toBeGreaterThanOrEqual(0)
      expect(rect.x + rect.width, `${name} inside the window`).toBeLessThanOrEqual(width)
      expect(rect.y + rect.height, `${name} above the bottom edge`).toBeLessThanOrEqual(height)
    }
    for (let i = 0; i < named.length; i++)
      for (let j = i + 1; j < named.length; j++)
        expect(overlap(named[i][1], named[j][1]), `${named[i][0]} × ${named[j][0]}`).toBe(false)
    for (const name of ['camera', 'dock'] as const) {
      const rect = parts[name]
      if (rect && building) expect(overlap(rect, building), `building × ${name}`).toBe(false)
    }
  })
}
