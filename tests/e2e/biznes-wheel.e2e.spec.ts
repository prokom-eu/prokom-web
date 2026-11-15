import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { setTheme, site } from './helpers'

// Runda 1411 (board `Main.dc.html`): the department wheel of the Biznes hero — five departments
// with three products each (all photos), shown from 1080 px, one tooltip above everything; a
// product bubble picks its department, the core links to the three products; switching every
// 6.5 s also under the pointer; the round pause button and keyboard focus stop it. Data from
// `pnpm seed` (`wheel1411.ts`).

const AUTO_MS = 6500

const wheel = (page: Page) => page.locator('#start .bzw')
const tabs = (page: Page) => page.getByRole('tablist', { name: 'Działy oferty' }).getByRole('tab')
const bubbles = (page: Page) =>
  page.getByRole('list', { name: 'Przykładowe produkty działów' }).getByRole('button')
// The hero's own button: the home page has another pause (brand strips, B2-3a).
const pauseButton = (page: Page) =>
  page.locator('#start').getByRole('button', { name: /animację koła$/ })

/** The wheel island is lazy (ADR-023): wait until it answers clicks. */
async function ready(page: Page) {
  await expect(async () => {
    await tabs(page).nth(1).click()
    await expect(tabs(page).nth(1)).toHaveAttribute('aria-selected', 'true', { timeout: 1000 })
  }).toPass()
  await tabs(page).first().click()
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
  test('15 photo bubbles, 3 a department; a bubble picks its department', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await ready(page)
    await pauseButton(page).click()
    await expect(bubbles(page)).toHaveCount(15)
    await expect(tabs(page)).toHaveCount(5)
    // Every bubble a photo (runda 1411: no icons, KSeF is a picture too).
    await expect(page.locator('#start .bzw-bub img')).toHaveCount(15)
    await expect(page.locator('#start .bzw-glyph')).toHaveCount(0)

    // Each bubble in the middle of the window first, then clicked at its centre.
    for (const [i, group] of [
      [12, 4],
      [7, 2],
      [0, 0],
    ] as const) {
      const bubble = bubbles(page).nth(i)
      await bubble.scrollIntoViewIfNeeded()
      await bubble.click()
      await expect(tabs(page).nth(group)).toHaveAttribute('aria-selected', 'true')
      await expect(bubble).toHaveAttribute('aria-pressed', 'true')
    }
  })

  test('the core names the department’s three products and links to them, no count', async ({
    page,
  }) => {
    await page.goto(site('biznes.localhost'))
    await ready(page)
    await pauseButton(page).click()
    const core = page.locator('#start').getByRole('tabpanel')
    await expect(core).toContainText('Dział 1 z 5')
    await expect(core).not.toContainText(/pozycj|poz\./)
    const names = core.getByRole('list').getByRole('link')
    await expect(names).toHaveCount(3)
    await expect(names.first()).toHaveText('Posnet Ergo Online')
    const hrefs = await names.evaluateAll((els) => els.map((el) => el.getAttribute('href')!))
    const statuses = await page.evaluate(
      (list) => Promise.all(list.map((href) => fetch(href).then((r) => r.status))),
      hrefs,
    )
    expect(statuses.every((status) => status === 200)).toBe(true)
    // The service department: KSeF, fiskalizacja and the Opieka IT page.
    await tabs(page).nth(4).click()
    await expect(names).toHaveCount(3)
    await expect(names.last()).toHaveAttribute('href', '/opieka-it')
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
          await tabs(page).nth(i).click()
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
      await expect(tip).toContainText((await bubble.getAttribute('aria-label'))!.split(' — ')[0]!)
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
    // A click starts the 6.5 s from zero; the pointer then rests on a bubble.
    await tabs(page).first().click()
    await bubbles(page).first().hover()
    await expect(tabs(page).nth(1)).toHaveAttribute('aria-selected', 'true', {
      timeout: AUTO_MS + 2000,
    })

    await pauseButton(page).click()
    await expect(pauseButton(page)).toHaveAccessibleName('Wznów animację koła')
    await expect(pauseButton(page)).toHaveAttribute('aria-pressed', 'true')
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
    await expect(core).toContainText('Dział 5 z 5')
    await expect(core).not.toContainText(/pozycj/)
    await expect(core.getByRole('link', { name: /Zobacz dział/ })).toHaveAttribute(
      'href',
      /^\/oferta\?grupa=/,
    )
    await page.waitForTimeout(AUTO_MS + 1000)
    await expect(tabs(page).nth(4)).toHaveAttribute('aria-selected', 'true')
  })

  test('out of view the wheel stops switching', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await ready(page)
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight }))
    await expect(wheel(page)).toHaveAttribute('data-hold', '')
    await page.waitForTimeout(AUTO_MS + 1000)
    await expect(tabs(page).first()).toHaveAttribute('aria-selected', 'true')
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
