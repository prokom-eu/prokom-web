import { expect, test, type Page } from '@playwright/test'

import { hydrated, site } from './helpers'

// SWA14b (SWA14-PULPIT-PLYNNOSC §3): budgets of smoothness that CI keeps. Chromium only (CDP,
// Long Animation Frames). The CI thresholds are looser than the budgets on a phone (100 ms, not
// 50 ms): the runner is slower and busier than a mid-range phone with a 4× slower CPU.
const HOST = 'software.localhost'
const PHONE = { width: 390, height: 844 }
const DESKTOP = { width: 1440, height: 900 }
/** A long frame in CI: the budget is 50 ms on a phone (§3), here one more frame of slack. */
const LONG_FRAME_MS = 100

/**
 * Properties a running CSS animation may change (§3 „Ruch — zasady wydajności”): the
 * compositor's, no layout or paint per frame.
 */
const CHEAP = ['transform', 'opacity', 'translate', 'scale', 'rotate']
/**
 * Exceptions with a reason:
 * - `sw-em`, `sw-rise-blur` (decision SWA12): the H2 highlight and the section rise with a blur,
 *   on a computer only (the phone gets flat variants);
 * - `v-arc`: the gauge of „Technologia” draws its arc once (`stroke-dashoffset` of one small SVG
 *   path, no layout) — a drawn line has no transform equivalent.
 */
const PHONE_EXCEPTIONS = ['v-arc']
const DESKTOP_EXCEPTIONS = [...PHONE_EXCEPTIONS, 'sw-em', 'sw-rise-blur']
/**
 * A state change (hover, active item, the header on scroll) may fade colours, shadows and
 * corners for ≤ 300 ms — paint, not motion. It must not change the layout: these properties.
 */
const LAYOUT =
  /^(width|height|(min|max)-(width|height)|padding|margin|top|right|bottom|left|inset|gap|font-size|border-(top|right|bottom|left)?-?width)/
/**
 * Known layout transitions in the shared zone (CapsuleShell, ADR-022): the capsule header grows
 * smaller on scroll (height, padding, the buttons' height and min-width) on a computer. A line
 * session does not change the shared zone — its own `perf/wsp-*` PR (docs/STAN.md).
 * TODO(krystian): decyzja — przebudowa kapsuły na transform w osobnym PR wsp.
 */
const SHARED_LAYOUT_EXCEPTIONS = ['.cap', '.cap-btn', '.cap-cta']
const NOT_PROPERTIES = ['offset', 'computedOffset', 'easing', 'composite']

/** CPU 4× slower (CDP): a mid-range phone on a CI runner. */
async function slowCpu(page: Page) {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
}

/** Starts collecting long animation frames (LoAF) from now on. */
async function watchFrames(page: Page) {
  await page.evaluate(() => {
    const store = window as unknown as { longFrames: number[] }
    store.longFrames = []
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) store.longFrames.push(Math.round(entry.duration))
    }).observe({ type: 'long-animation-frame', buffered: false })
  })
}

const longFrames = (page: Page) =>
  page.evaluate(() => (window as unknown as { longFrames: number[] }).longFrames)

/**
 * Running animations against the rules, as „name: property”: a CSS animation outside `CHEAP`
 * (unless its name is an exception), a transition of a layout property (unless on an element of
 * the shared header).
 */
function costlyAnimations(page: Page, exceptions: readonly string[]) {
  return page.evaluate(
    ({ cheap, skip, notProperties, layout, shared }) => {
      const layoutRule = new RegExp(layout)
      const found = new Set<string>()
      for (const animation of document.getAnimations()) {
        if (animation.playState !== 'running') continue
        const effect = animation.effect as KeyframeEffect | null
        if (!effect) continue
        if ('transitionProperty' in animation) {
          const property = (animation as CSSTransition).transitionProperty
          const target = effect.target as Element | null
          if (!layoutRule.test(property)) continue
          if (target && shared.some((selector) => target.matches(selector))) continue
          found.add(`transition: ${property}`)
          continue
        }
        const name = 'animationName' in animation ? (animation as CSSAnimation).animationName : ''
        if (skip.includes(name)) continue
        for (const frame of effect.getKeyframes()) {
          for (const key of Object.keys(frame)) {
            if (notProperties.includes(key) || cheap.includes(key)) continue
            found.add(`${name || 'script'}: ${key}`)
          }
        }
      }
      return [...found].sort()
    },
    {
      cheap: CHEAP,
      skip: [...exceptions],
      notProperties: NOT_PROPERTIES,
      layout: LAYOUT.source,
      shared: SHARED_LAYOUT_EXCEPTIONS,
    },
  )
}

/**
 * Scrolls the page from the hero down to the footer in steps (400 px every 120 ms, like a long
 * swipe), and samples the running animations at each step.
 */
async function scrollToFooter(page: Page, exceptions: readonly string[]) {
  const costly = new Set<string>()
  for (let step = 0; step < 200; step += 1) {
    const done = await page.evaluate(() => {
      window.scrollBy({ top: 400, behavior: 'instant' })
      return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
    })
    await page.waitForTimeout(120)
    for (const item of await costlyAnimations(page, exceptions)) costly.add(item)
    if (done) break
  }
  return [...costly].sort()
}

test.describe('Software — budgets of smoothness (SWA14 §3)', () => {
  test('phone: no long frame while scrolling from the hero to the footer, cheap motion only', async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: PHONE, hasTouch: true, isMobile: true })
    const page = await context.newPage()
    await page.goto(site(HOST, '/'))
    await hydrated(page.locator('.hx-tile').first())
    // The first screen (loading, hydration) is outside the budget: frames count from here.
    await page.waitForLoadState('networkidle')
    await slowCpu(page)
    await watchFrames(page)
    const costly = await scrollToFooter(page, PHONE_EXCEPTIONS)
    const frames = (await longFrames(page)).filter((duration) => duration > LONG_FRAME_MS)
    expect(frames, 'long frames (ms) while scrolling').toEqual([])
    expect(costly, 'running animations outside transform/opacity').toEqual([])
    await context.close()
  })

  test('computer: cheap motion only while scrolling (SWA12 exceptions: sw-em, sw-rise-blur)', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP)
    await page.goto(site(HOST, '/'))
    await hydrated(page.locator('.hx-tile').first())
    await page.waitForLoadState('networkidle')
    expect(await scrollToFooter(page, DESKTOP_EXCEPTIONS)).toEqual([])
  })

  test('the offer window opens without a long frame: render ≤ 100 ms, entry 240 ms', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP)
    await page.goto(site(HOST, '/rozwiazania'))
    await hydrated(page.getByRole('group', { name: 'Kategoria' }).getByRole('button').first())
    const opener = page.locator('a.v-card').first()
    // A pointer over the card first, as before any click: it fetches the window's chunk.
    await opener.hover()
    await page.waitForLoadState('networkidle')
    await watchFrames(page)
    const { shown, full } = await page.evaluate(async () => {
      document.querySelector<HTMLElement>('a.v-card')?.click()
      const start = performance.now()
      let shown = -1
      while (performance.now() - start < 1500) {
        await new Promise(requestAnimationFrame)
        const panel = document.querySelector('dialog.sw-offer-panel[open]')
        if (!panel) continue
        if (shown < 0) shown = performance.now() - start
        const style = getComputedStyle(panel)
        if (style.opacity === '1' && (style.scale === 'none' || style.scale === '1')) {
          return { shown, full: performance.now() - start }
        }
      }
      return { shown, full: -1 }
    })
    // ≤ 300 ms on the target = one render frame (budget 80 ms, CI 100 ms) + the 240 ms entry
    // (+ up to 60 ms: the entry starts a frame after `showModal()`, its end is read on a frame).
    // Checked apart: the CI runner's render time varies. Measured 13.11: ~31 + ~285 ms.
    expect(full).toBeGreaterThan(0)
    expect(shown).toBeLessThanOrEqual(100)
    expect(full - shown).toBeLessThanOrEqual(240 + 60)
    await page.waitForTimeout(300)
    const frames = (await longFrames(page)).filter((duration) => duration > LONG_FRAME_MS)
    expect(frames, 'long frames (ms) after the click').toEqual([])
  })

  test('JavaScript of the start page before any interaction stays within the budget', async ({
    page,
  }) => {
    // The budget is of the production build: `next dev` ships unminified chunks.
    test.skip(process.env.E2E_SERVER !== 'start', 'JS budget only on the production build')
    await page.setViewportSize(PHONE)
    await page.goto(site(HOST, '/'))
    await page.waitForLoadState('networkidle')
    // Chunks fetched when the browser is idle come later: a pause, then quiet again (else 22 or
    // 29 files from run to run).
    await page.waitForTimeout(2000)
    await page.waitForLoadState('networkidle')
    // Compressed bytes of the scripts loaded without a touch (docs/jakosc.md, „Budżety Software”):
    // by the file, not `initiatorType` — a `<link rel="preload">` script counts as „link”.
    const bytes = await page.evaluate(() =>
      (performance.getEntriesByType('resource') as PerformanceResourceTiming[])
        .filter((entry) => /\/_next\/static\/.+\.js(\?|$)/.test(entry.name))
        .reduce((sum, entry) => sum + entry.encodedBodySize, 0),
    )
    test.info().annotations.push({ type: 'js-bytes', description: String(bytes) })
    expect(bytes).toBeLessThanOrEqual(JS_BUDGET_BYTES)
  })
})

/**
 * 271 631 B (gzip, 29 files of `/_next/static/`, preloads included) measured 13.11.2026 on the
 * production build of SWA14 (a, b, c), plus 5 % — the same number in docs/jakosc.md
 * („Budżety płynności Software”).
 */
const JS_BUDGET_BYTES = 285_200
