import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { setTheme, site } from './helpers'

// KOLO-HERO v3 (03.11): the department wheel of the Biznes hero — 19 bubbles on one ring that
// does not turn, the departments in the middle of their runs, one tooltip above everything,
// switching every 6.5 s also under the pointer; only the pause button and keyboard focus stop
// it. Data from `pnpm seed` (`kolo_hero`).

const AUTO_MS = 6500

const wheel = (page: Page) => page.locator('#start .bzw')
const tabs = (page: Page) => page.getByRole('tablist', { name: 'Działy oferty' }).getByRole('tab')
const bubbles = (page: Page) =>
  page.getByRole('list', { name: 'Przykładowe produkty działów' }).getByRole('link')
// The hero's own button: the home page has another pause (brand strips, B2-3a).
const pauseButton = (page: Page) =>
  page.locator('#start').getByRole('button', { name: /animację$/ })

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
  test('19 bubbles, each clickable at its centre and leading to a live page', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await ready(page)
    await pauseButton(page).click()
    await expect(bubbles(page)).toHaveCount(19)
    await expect(tabs(page)).toHaveCount(5)

    // Each bubble in the middle of the window first: not under the sticky header, not below it.
    const links = await bubbles(page).evaluateAll((els) =>
      els.map((el) => {
        el.scrollIntoView({ block: 'center', behavior: 'instant' })
        const r = el.getBoundingClientRect()
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
        return { href: el.getAttribute('href')!, own: Boolean(hit && el.contains(hit)) }
      }),
    )
    expect(links.filter((link) => !link.own).map((link) => link.href)).toEqual([])
    expect(links.map((link) => link.href)).toContain('/opieka-it')
    expect(links.map((link) => link.href)).toContain('/produkt/apple-iphone-18-pro?kolor=burgund')

    const statuses = await page.evaluate(
      (hrefs) => Promise.all(hrefs.map((href) => fetch(href).then((r) => r.status))),
      links.map((link) => link.href),
    )
    expect(statuses.every((status) => status === 200)).toBe(true)
  })

  test('the iPhone bubble opens the card in burgundy', async ({ page }) => {
    await page.goto(site('biznes.localhost'))
    await ready(page)
    await page.locator('#start a[href="/produkt/apple-iphone-18-pro?kolor=burgund"]').click()
    await expect(page).toHaveURL(/apple-iphone-18-pro\?kolor=burgund/)
    await expect(page.getByRole('button', { name: 'burgund', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  for (const width of [1024, 1280, 1440]) {
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
    await expect(pauseButton(page)).toHaveText('Wznów animację')
    const selected = await tabs(page).evaluateAll((els) =>
      els.findIndex((el) => el.getAttribute('aria-selected') === 'true'),
    )
    await page.waitForTimeout(AUTO_MS + 1000)
    await expect(tabs(page).nth(selected)).toHaveAttribute('aria-selected', 'true')

    await pauseButton(page).click()
    await expect(pauseButton(page)).toHaveText('Wstrzymaj animację')
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
    const core = page.getByRole('tabpanel')
    await expect(core).toContainText('Dział 5 z 5')
    await expect(core).not.toContainText(/pozycj/)
    await expect(core.getByRole('link', { name: /Zobacz dział/ })).toHaveAttribute(
      'href',
      /^\/oferta\?grupa=/,
    )
    await page.waitForTimeout(AUTO_MS + 1000)
    await expect(tabs(page).nth(4)).toHaveAttribute('aria-selected', 'true')
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
