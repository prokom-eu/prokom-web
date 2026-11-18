import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { setTheme, site } from './helpers'

// Runda 1411 (board `Main.dc.html`): the department wheel of the Biznes hero — five departments
// with three products each (all photos), shown from 1080 px, one tooltip above everything; a
// product bubble opens its product; the core shows only the department's name and is one link to
// the department (runda 1811, D6); switching every 6.5 s also under the pointer; the round pause
// button and keyboard focus stop it. Data from `pnpm seed` (`wheel1411.ts`).

const AUTO_MS = 6500

const wheel = (page: Page) => page.locator('#start .bzw')
const tabs = (page: Page) => page.getByRole('tablist', { name: 'Działy oferty' }).getByRole('tab')
// Pointer-only shortcuts (aria-hidden, out of the Tab order): the tabs speak for them.
const bubbles = (page: Page) => page.locator('#start [data-bubbles] .bzw-bub')
// The hero's own button: the home page has another pause (brand strips, B2-3a).
const pauseButton = (page: Page) =>
  page.locator('#start').getByRole('button', { name: /animację koła$/ })

/**
 * The wheel island is lazy (ADR-023): wait until it answers the pointer. A department is picked by
 * hovering it — a click opens its page (16.11).
 */
async function ready(page: Page) {
  await expect(async () => {
    await tabs(page).nth(1).hover()
    await expect(tabs(page).nth(1)).toHaveAttribute('aria-selected', 'true', { timeout: 1000 })
  }).toPass()
  await tabs(page).first().hover()
}

/**
 * The overlap check of the prototype (`check()`): every icon, label, bubble and the core against
 * every other — circles as circles, the core as its circle — and the core text inside the core
 * with 6 px to spare. Returns the smallest gap and the list of collisions.
 */
function measure(page: Page) {
  return page.evaluate(() => {
    const root = document.querySelector('#start .bzw')!
    const boxes = [...root.querySelectorAll('.bzw-dot, .bzw-lab, .bzw-bub, .bzw-core')].map(
      (el) => ({ el, r: el.getBoundingClientRect() }),
    )
    const coreBox = boxes.find((b) => b.el.classList.contains('bzw-core'))!.r
    const cx = coreBox.left + coreBox.width / 2
    const cy = coreBox.top + coreBox.height / 2
    const cr = coreBox.width / 2
    const circle = (el: Element) =>
      el.classList.contains('bzw-bub') || el.classList.contains('bzw-dot')
    const name = (el: Element) => (el.getAttribute('aria-label') ?? el.textContent ?? '').trim()
    let min = Infinity
    const hits: string[] = []
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i]!
        const b = boxes[j]!
        const nodeA = a.el.closest('.bzw-node')
        if (nodeA && nodeA === b.el.closest('.bzw-node')) continue
        let gap: number
        const core = a.el.classList.contains('bzw-core')
          ? a
          : b.el.classList.contains('bzw-core')
            ? b
            : null
        if (core) {
          const o = core === a ? b : a
          const nx = Math.max(o.r.left, Math.min(cx, o.r.right))
          const ny = Math.max(o.r.top, Math.min(cy, o.r.bottom))
          gap = Math.hypot(nx - cx, ny - cy) - cr
        } else if (circle(a.el) !== circle(b.el)) {
          // A bubble or an icon against a label: the circle's own distance to the box.
          const c = circle(a.el) ? a : b
          const box = c === a ? b : a
          const x = c.r.left + c.r.width / 2
          const y = c.r.top + c.r.height / 2
          const nx = Math.max(box.r.left, Math.min(x, box.r.right))
          const ny = Math.max(box.r.top, Math.min(y, box.r.bottom))
          gap = Math.hypot(nx - x, ny - y) - c.r.width / 2
        } else if (circle(a.el) && circle(b.el)) {
          gap =
            Math.hypot(
              a.r.left + a.r.width / 2 - (b.r.left + b.r.width / 2),
              a.r.top + a.r.height / 2 - (b.r.top + b.r.height / 2),
            ) -
            a.r.width / 2 -
            b.r.width / 2
        } else {
          const dx = Math.max(a.r.left - b.r.right, b.r.left - a.r.right, 0)
          const dy = Math.max(a.r.top - b.r.bottom, b.r.top - a.r.bottom, 0)
          gap = dx === 0 && dy === 0 ? -1 : Math.hypot(dx, dy)
        }
        min = Math.min(min, gap)
        if (gap < 8) hits.push(`${name(a.el)} × ${name(b.el)}: ${gap.toFixed(1)}`)
      }
    }
    const radius = cr - 6
    for (const el of root.querySelectorAll('.bzw-cc > *')) {
      const q = el.getBoundingClientRect()
      for (const [x, y] of [
        [q.left, q.top],
        [q.right, q.top],
        [q.left, q.bottom],
        [q.right, q.bottom],
      ] as const) {
        if (Math.hypot(x - cx, y - cy) > radius) hits.push(`rdzeń: ${el.className}`)
      }
    }
    return { min, hits }
  })
}

test.describe('Biznes hero wheel (KOLO-HERO v3)', () => {
  test('15 photo bubbles, 3 a department; a bubble opens its product', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await ready(page)
    await pauseButton(page).click()
    await expect(bubbles(page)).toHaveCount(15)
    await expect(tabs(page)).toHaveCount(5)
    // Every bubble a photo (runda 1411: no icons, KSeF is a picture too).
    await expect(page.locator('#start .bzw-bub img')).toHaveCount(15)
    await expect(page.locator('#start .bzw-glyph')).toHaveCount(0)

    // Every bubble a link out of the tab order (the tabs and the core's link serve the keyboard).
    const hrefs = await bubbles(page).evaluateAll((els) =>
      els.map((el) => [el.tagName, el.getAttribute('href'), el.getAttribute('tabindex')]),
    )
    for (const [tag, href, tabindex] of hrefs) {
      expect(tag).toBe('A')
      expect(href).toMatch(/^\/[a-z0-9/-]+$/)
      expect(tabindex).toBe('-1')
    }
    // Clicked at its centre, a bubble opens its product.
    const bubble = bubbles(page).nth(0)
    const href = (await bubble.getAttribute('href'))!
    await bubble.scrollIntoViewIfNeeded()
    await bubble.click()
    await expect(page).toHaveURL(site('biznes.localhost', href))
  })

  test('the core: only the department’s name, the whole core links to the department', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost'))
    await ready(page)
    await pauseButton(page).click()
    const core = page.locator('#start').getByRole('tabpanel')
    const name = (await core.locator('.bzw-nm:not([data-out])').textContent())!.trim()
    // No count, no product list, no „Zobacz dział” (runda 1811, D6).
    await expect(core).not.toContainText(/Dział \d z \d|Zobacz dział|pozycj/)
    await expect(core.getByRole('list')).toHaveCount(0)
    const links = core.getByRole('link')
    await expect(links).toHaveCount(1)
    await expect(links.first()).toHaveAccessibleName(`Przejdź do działu: ${name}`)
    const href = (await links.first().getAttribute('href'))!
    expect(href).toMatch(/^\/oferta\?grupa=/)
    // The link covers the whole core circle.
    const [coreBox, linkBox] = await Promise.all([core.boundingBox(), links.first().boundingBox()])
    expect(Math.abs(coreBox!.width - linkBox!.width)).toBeLessThan(2)
    // The arrow shows only on hover.
    const arrow = core.locator('.bzw-go')
    await page.mouse.move(0, 0)
    await expect(arrow).toHaveCSS('opacity', '0')
    await links.first().hover()
    await expect(arrow).toHaveCSS('opacity', '1')
    // A click away from the name (upper part of the core) opens the department too.
    await page.mouse.click(coreBox!.x + coreBox!.width / 2, coreBox!.y + coreBox!.height * 0.2)
    await expect(page).toHaveURL(site('biznes.localhost', href))
  })

  test('the name changes with the arc: the new name lands as the arc does', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await ready(page)
    await pauseButton(page).click()
    await tabs(page).nth(3).hover()
    const core = page.locator('#start').getByRole('tabpanel')
    const label = (await tabs(page).nth(3).locator('.bzw-lab').textContent())!.trim()
    await expect(core.locator('.bzw-nm:not([data-out])')).toHaveText(label)
    // One source of state: the tab, the arc and the name move on the same pick.
    const delay = await core
      .locator('.bzw-nm:not([data-out])')
      .evaluate((el) => getComputedStyle(el).animationDelay)
    expect(delay).toBe('0.62s')
    // The name ends its 280 ms fade as the arc ends its 0.9 s sweep.
    const [duration, sweep] = await Promise.all([
      core
        .locator('.bzw-nm:not([data-out])')
        .evaluate((el) => parseFloat(getComputedStyle(el).animationDuration)),
      page
        .locator('#start .bzw-sweep')
        .evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration)),
    ])
    expect(Math.abs(0.62 + duration - sweep)).toBeLessThan(0.05)
  })

  for (const width of [1080, 1280, 1440]) {
    for (const theme of ['light', 'dark'] as const) {
      test(`no overlaps at ${width} px, ${theme}, every department`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 })
        await setTheme(page, theme)
        await page.goto(site('biznes.localhost'))
        await ready(page)
        await pauseButton(page).click()
        await wheel(page).scrollIntoViewIfNeeded()
        for (let i = 0; i < 5; i++) {
          await tabs(page).nth(i).hover()
          await page.mouse.move(0, 0)
          // Scale and colour transitions (≤ 0.9 s) settle.
          await page.waitForTimeout(1000)
          const { min, hits } = await measure(page)
          expect(hits, `dział ${i + 1}`).toEqual([])
          expect(min).toBeGreaterThanOrEqual(8)
        }
      })
    }
  }

  test('a tablet (834 px) gets no wheel: the quick start follows the hero', async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1112 })
    await page.goto(site('biznes.localhost'))
    await expect(page.locator('#start h1')).toBeVisible()
    await expect(wheel(page)).toBeHidden()
  })

  test('the tooltip of every bubble is on top of everything and inside the window', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 1000 })
    await page.goto(site('biznes.localhost'))
    await ready(page)
    await pauseButton(page).click()
    const tip = page.locator('#start .bzw-tip')
    const count = await bubbles(page).count()
    for (let i = 0; i < count; i++) {
      const bubble = bubbles(page).nth(i)
      await bubble.hover()
      await expect(tip).toHaveAttribute('data-show', '')
      await expect(tip).toContainText((await bubble.getAttribute('data-name'))!)
      const result = await tip.evaluate((el) => {
        const r = el.getBoundingClientRect()
        ;(el as HTMLElement).style.pointerEvents = 'auto'
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
        ;(el as HTMLElement).style.pointerEvents = ''
        return {
          onTop: Boolean(hit && el.contains(hit)),
          inside: r.left >= 0 && r.right <= document.documentElement.clientWidth,
        }
      })
      expect(result, `dymek ${i + 1}`).toEqual({ onTop: true, inside: true })
    }
  })

  test('keeps switching under the pointer; the pause button stops it', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await ready(page)
    // The pointer rests on a bubble; the wheel keeps switching.
    await tabs(page).first().hover()
    await bubbles(page).first().hover()
    await expect(tabs(page).nth(1)).toHaveAttribute('aria-selected', 'true', {
      timeout: AUTO_MS + 2000,
    })

    await pauseButton(page).click()
    await expect(pauseButton(page)).toHaveAccessibleName('Wznów animację koła')
    const selected = await tabs(page).evaluateAll((els) =>
      els.findIndex((el) => el.getAttribute('aria-selected') === 'true'),
    )
    await page.waitForTimeout(AUTO_MS + 1000)
    await expect(tabs(page).nth(selected)).toHaveAttribute('aria-selected', 'true')

    await pauseButton(page).click()
    await expect(pauseButton(page)).toHaveAccessibleName('Wstrzymaj animację koła')
    await expect(tabs(page).nth((selected + 1) % 5)).toHaveAttribute('aria-selected', 'true', {
      timeout: AUTO_MS + 2000,
    })
  })

  test('a department: hover shows it, a click opens its page, Enter keeps the tab', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost'))
    await ready(page)
    await pauseButton(page).click()
    const core = page.locator('#start').getByRole('tabpanel')
    await tabs(page).nth(2).hover()
    await expect(tabs(page).nth(2)).toHaveAttribute('aria-selected', 'true')
    const href = (await core
      .getByRole('link', { name: /^Przejdź do działu/ })
      .getAttribute('href'))!
    // Enter on the focused tab picks, never leaves the page.
    await tabs(page).nth(2).focus()
    await page.keyboard.press('ArrowRight')
    await expect(tabs(page).nth(3)).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(site('biznes.localhost', '/'))
    // A click on the department opens its page.
    await tabs(page).nth(2).click()
    await expect(page).toHaveURL(site('biznes.localhost', href))
  })

  test('the keyboard moves through departments and holds the wheel', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await ready(page)
    await tabs(page).first().focus()
    await page.keyboard.press('ArrowRight')
    await expect(tabs(page).nth(1)).toBeFocused()
    await expect(tabs(page).nth(1)).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('End')
    await expect(tabs(page).nth(4)).toHaveAttribute('aria-selected', 'true')
    // The wheel's own panel: the plan section has tabs too (B3-1).
    const core = page.locator('#start').getByRole('tabpanel')
    await expect(core).not.toContainText(/Dział \d z \d|pozycj/)
    // Tab goes on from the tabs to the core's link.
    await page.keyboard.press('Tab')
    const link = core.getByRole('link', { name: /^Przejdź do działu/ })
    await expect(link).toBeFocused()
    await expect(link).toHaveAttribute('href', /^\/oferta\?grupa=/)
    await expect(core.locator('.bzw-go')).toHaveCSS('opacity', '1')
    await page.waitForTimeout(AUTO_MS + 1000)
    await expect(tabs(page).nth(4)).toHaveAttribute('aria-selected', 'true')
  })

  test('out of view the wheel stops switching', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await ready(page)
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight }))
    await expect(wheel(page)).toHaveAttribute('data-hold', '')
    // The department active once the wheel left the view stays active.
    const selected = await tabs(page).evaluateAll((els) =>
      els.findIndex((el) => el.getAttribute('aria-selected') === 'true'),
    )
    await page.waitForTimeout(AUTO_MS + 1000)
    await expect(tabs(page).nth(selected)).toHaveAttribute('aria-selected', 'true')
  })

  test('reduced motion: nothing switches or floats, and no axe violations', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.goto(site('biznes.localhost'))
    await expect(tabs(page).first()).toHaveAttribute('aria-selected', 'true')
    expect(
      await page
        .locator('#start .bzw-bub-inner')
        .first()
        .evaluate((el) => getComputedStyle(el).animationName),
    ).toBe('none')
    await page.waitForTimeout(AUTO_MS + 1000)
    await expect(tabs(page).first()).toHaveAttribute('aria-selected', 'true')
    const { violations } = await new AxeBuilder({ page })
      .include('#start')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(violations.map((v) => v.id)).toEqual([])
    await context.close()
  })
})
