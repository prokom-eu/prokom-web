import { expect, type Page, test } from '@playwright/test'

import { site } from '../helpers'
import { INST_HOST, INST_PAGES } from './pages'

// Smoothness and battery (report 11.11.2026): scenes are rendered only where they can be seen —
// off screen the browser skips them (`PauseOffscreen` + `[data-off]` → `content-visibility: auto`
// in ruch.css), and with reduced motion nothing loops anywhere. Data from `pnpm seed`.

const DESKTOP = { width: 1440, height: 1000 }

/** Running CSS animations (transitions end on their own) inside `selector`, or on the page. */
const runningIn = (page: Page, selector?: string) =>
  page.evaluate(
    (within) =>
      document.getAnimations().filter((animation) => {
        if (animation.playState !== 'running' || !('animationName' in animation)) return false
        const target = (animation.effect as KeyframeEffect | null)?.target
        return !within || Boolean(target?.closest(within))
      }).length,
    selector,
  )

/** Looping animations that are live — also the ones paused off screen (`data-off`). */
const looping = (page: Page) =>
  page.evaluate(
    () =>
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.playState !== 'idle' &&
            animation.playState !== 'finished' &&
            animation.effect?.getTiming().iterations === Infinity,
        ).length,
  )

const scrollTo = (page: Page, where: 'top' | 'middle' | 'bottom') =>
  page.evaluate((to) => {
    const max = document.documentElement.scrollHeight
    window.scrollTo(0, to === 'top' ? 0 : to === 'middle' ? max / 2 : max)
  }, where)

test.describe('Instalacje animations off screen', () => {
  test.use({ viewport: DESKTOP })

  test('the home hero is skipped once it is scrolled away, and moves again when back', async ({
    page,
  }) => {
    await page.goto(site(INST_HOST))
    const hero = page.locator('#start')
    // Its content is skipped by the renderer (no style, layout, paint — the loops cost nothing).
    const skipped = () =>
      hero.evaluate(
        (element) => !element.querySelector('h1')?.checkVisibility({ contentVisibilityAuto: true }),
      )
    await expect.poll(() => runningIn(page, '#start')).toBeGreaterThan(0)
    await scrollTo(page, 'bottom')
    await expect(hero).toHaveAttribute('data-off', '')
    await expect(hero).toHaveCSS('content-visibility', 'auto')
    await expect.poll(skipped).toBe(true)
    await scrollTo(page, 'top')
    // In view: no containment at all (nothing clipped), rendered and moving.
    await expect(hero).toHaveCSS('content-visibility', 'visible')
    await expect.poll(skipped).toBe(false)
    await expect.poll(() => runningIn(page, '#start')).toBeGreaterThan(0)
  })
})

const REDUCED = INST_PAGES.filter(
  (path) =>
    path === '/' ||
    path === '/monitoring' ||
    path === '/dla-architektow' ||
    path.startsWith('/dla-kogo/'),
)

test.describe('Instalacje animations with reduced motion', () => {
  test.use({ viewport: DESKTOP, contextOptions: { reducedMotion: 'reduce' } })

  for (const path of REDUCED) {
    test(`nothing loops on ${path}`, async ({ page }) => {
      await page.goto(site(INST_HOST, path))
      // Scrolled through, so the scenes loaded near the screen are there too.
      for (const where of ['top', 'middle', 'bottom'] as const) {
        await scrollTo(page, where)
        await expect.poll(() => looping(page)).toBe(0)
      }
    })
  }
})
