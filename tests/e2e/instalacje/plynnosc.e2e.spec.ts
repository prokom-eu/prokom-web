import { expect, type Page, test } from '@playwright/test'

import { site } from '../helpers'
import { INST_HOST, INST_PAGES } from './pages'

// Smoothness and battery (report 11.11.2026): animations run only where they can be seen —
// off screen they stand (`PauseOffscreen` + `[data-off]` in ruch.css), and with reduced motion
// nothing loops anywhere. Data from `pnpm seed`.

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

const scrollTo = (page: Page, where: 'top' | 'middle' | 'bottom') =>
  page.evaluate((to) => {
    const max = document.documentElement.scrollHeight
    window.scrollTo(0, to === 'top' ? 0 : to === 'middle' ? max / 2 : max)
  }, where)

test.describe('Instalacje animations off screen', () => {
  test.use({ viewport: DESKTOP })

  test('the home hero stands once it is scrolled away, and moves again when back', async ({
    page,
  }) => {
    await page.goto(site(INST_HOST))
    await expect.poll(() => runningIn(page, '#start')).toBeGreaterThan(0)
    await scrollTo(page, 'bottom')
    await expect.poll(() => runningIn(page, '#start')).toBe(0)
    await expect(page.locator('#start')).toHaveAttribute('data-off', '')
    await scrollTo(page, 'top')
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
      for (const where of ['top', 'middle', 'bottom'] as const) {
        await scrollTo(page, where)
        await expect.poll(() => runningIn(page)).toBe(0)
      }
    })
  }
})
