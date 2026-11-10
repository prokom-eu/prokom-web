import { expect, test, type Page } from '@playwright/test'

import { hydrated, site } from './helpers'

// SWA12a (AUDYT-PROD-TELEFON §1–§2): a phone after the production start — endless motion only on
// the screen, and the offer sheet at one height that scrolls by a finger. Data from `pnpm seed`.
const HOST = 'software.localhost'
const PHONE = { width: 390, height: 844 }

test.use({ viewport: PHONE, hasTouch: true, isMobile: true })

/**
 * A finger moving up by `distance` px from (x, y): raw touch events (CDP, Chromium only) — the
 * synthetic scroll gesture of CDP does not scroll in headless Chromium, these do.
 */
async function swipe(page: Page, x: number, y: number, distance: number) {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
  for (let step = 1; step <= 12; step++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x, y: y - (distance * step) / 12 }],
    })
    await page.waitForTimeout(16)
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await cdp.detach()
}

test.describe('Software on a phone — motion and the offer sheet', () => {
  test('endless animations run only near the screen', async ({ page }) => {
    await page.goto(site(HOST, '/'))
    await hydrated(page.locator('.hx-tile').first())
    // Two screens below the hero.
    await page.evaluate(() => {
      const hero = document.querySelector('.hx')!.getBoundingClientRect()
      window.scrollTo({
        top: hero.bottom + window.scrollY + 2 * window.innerHeight,
        behavior: 'instant',
      })
    })
    // Every endless animation that still runs belongs to something on (or right by) the screen.
    // A part skipped by `content-visibility` keeps its last style: its style is computed first.
    await expect
      .poll(() =>
        page.evaluate(() =>
          document
            .getAnimations()
            .filter((animation) => {
              const effect = animation.effect as KeyframeEffect | null
              if (!effect?.target || effect.getTiming().iterations !== Infinity) return false
              void getComputedStyle(effect.target, effect.pseudoElement).animationPlayState
              if (animation.playState !== 'running') return false
              const box = effect.target.getBoundingClientRect()
              return box.bottom < -200 || box.top > window.innerHeight + 200
            })
            .map((animation) => (animation as CSSAnimation).animationName),
        ),
      )
      .toEqual([])
  })

  test('the offer sheet opens at one height and scrolls by a finger, from the top too', async ({
    page,
  }) => {
    await page.goto(site(HOST, '/rozwiazania?rozwiazanie=strona-wizytowka'))
    const dialog = page.getByRole('dialog', { name: 'Strona wizytówka', exact: true })
    await expect(dialog).toBeVisible()
    // Measured where the sheet stops, not while it slides up (the mock-ups loop forever).
    await dialog.evaluate((element) =>
      Promise.all(
        element
          .getAnimations({ subtree: true })
          .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
          .map((animation) => animation.finished),
      ),
    )
    const box = (await dialog.boundingBox())!
    // 92svh at once (no 70 % stop) and standing on the bottom edge.
    expect(box.height).toBeGreaterThan(PHONE.height * 0.9)
    expect(Math.round(box.y + box.height)).toBe(PHONE.height)

    // A finger in the middle of the sheet scrolls its content; the height stays.
    await swipe(page, PHONE.width / 2, box.y + box.height * 0.6, 400)
    await expect.poll(() => dialog.evaluate((element) => element.scrollTop)).toBeGreaterThan(150)
    expect((await dialog.boundingBox())!.height).toBeCloseTo(box.height, 0)

    // A gesture started on the top bar (the tabs), not on the handle, scrolls too: only the
    // handle takes the touch for itself.
    const before = await dialog.evaluate((element) => element.scrollTop)
    const tabs = (await dialog.locator('[data-sheet-top]').boundingBox())!
    await swipe(page, PHONE.width / 2, tabs.y + tabs.height - 12, 300)
    await expect
      .poll(() => dialog.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(before + 100)
    expect((await dialog.boundingBox())!.height).toBeCloseTo(box.height, 0)
  })
})
