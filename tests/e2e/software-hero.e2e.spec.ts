import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { hydrated, setTheme, site } from './helpers'

// SWA2a (ZMIANY-v24 §4.1–4.1a): the v24 hero of the Software start page — the word of the H1, the
// tiles (tabs), the 3D carousel of mock-ups, the caption with the price of the solution.
const HOST = 'software.localhost'
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

const hero = (page: Page) => page.locator('#start')
const word = (page: Page) => hero(page).locator('.hx-word')
const tabs = (page: Page) => hero(page).getByRole('tab')
const active = (page: Page) => hero(page).locator('.hx-win[data-rank="r0"]')

test.describe('Software hero v24', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('a tile switches the word, the mock-up and the caption (price from Solutions)', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(site(HOST))
    await expect(hero(page).getByRole('heading', { level: 1 })).toContainText('Zrobimy Ci')
    await expect(tabs(page)).toHaveCount(8)
    await expect(word(page)).toHaveText('stronę wizytówkę.')

    await tabs(page).nth(4).click()
    await expect(tabs(page).nth(4)).toHaveAttribute('aria-selected', 'true')
    await expect(word(page)).toHaveText('stronę restauracji.')
    await expect(active(page)).toContainText('Karczma Pod Lipą')
    const caption = hero(page).locator('.hx-cap')
    await expect(caption).toContainText('Restauracja')
    await expect(caption).toContainText(/od [\d\s]+zł/)
    await expect(caption.getByRole('link')).toHaveAttribute(
      'href',
      '/rozwiazania?rozwiazanie=strona-dla-restauracji-lub-baru',
    )
  })

  test('arrow keys move between the tiles', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(site(HOST))
    // Keys work once the stage is hydrated: retried from the first tile until the arrow moves.
    await expect(async () => {
      await tabs(page).first().focus()
      await page.keyboard.press('ArrowLeft')
      await expect(tabs(page).nth(7)).toBeFocused({ timeout: 1000 })
    }).toPass()
    // The phone's short word is in the DOM too (hidden here): the visible text counts.
    await expect(word(page)).toHaveText('automatyzacje i AI.', { useInnerText: true })
    await page.keyboard.press('Home')
    await expect(word(page)).toHaveText('stronę wizytówkę.')
  })

  test('the clock changes the slide every 4.2 s, also while pointed at', async ({ page }) => {
    // AUDYT-0811 #1: pointing at the hero used to stop it all — it looked frozen.
    await page.clock.install()
    await page.goto(site(HOST))
    await expect(word(page)).toHaveText('stronę wizytówkę.')
    // The clock starts with hydration: moving time before it would change nothing.
    await hydrated(tabs(page).first())
    await hero(page).locator('.hx-flow').hover()
    await page.clock.fastForward(6000)
    await expect(word(page)).toHaveText('stronę firmową.')
    await expect(hero(page)).not.toHaveAttribute('data-paused')
  })

  test('an arrow shows the next slide and the clock rests 12 s (≥ 1080 px)', async ({ page }) => {
    // AUDYT-0811 #2.
    await page.clock.install()
    await page.goto(site(HOST))
    await hydrated(tabs(page).first())
    await hero(page).getByRole('button', { name: 'Następny slajd' }).click()
    await expect(word(page)).toHaveText('stronę firmową.')
    await expect(tabs(page).nth(1)).toHaveAttribute('aria-selected', 'true')
    await page.clock.fastForward(11000)
    await expect(word(page)).toHaveText('stronę firmową.')
    await page.clock.fastForward(1000 + 4300)
    await expect(word(page)).toHaveText('rozbudowaną stronę.')
    await hero(page).getByRole('button', { name: 'Poprzedni slajd' }).click()
    await expect(word(page)).toHaveText('stronę firmową.')
  })

  test('no arrows below 1080 px — the carousel follows the finger there', async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 800 })
    await page.goto(site(HOST))
    await expect(hero(page).getByRole('button', { name: 'Następny slajd' })).toBeHidden()
  })

  test('after a click the clock comes back 12 s later', async ({ page }) => {
    await page.clock.install()
    await page.goto(site(HOST))
    await hydrated(tabs(page).nth(2))
    await tabs(page).nth(2).click()
    await expect(word(page)).toHaveText('rozbudowaną stronę.')
    // Leave the hero, so the click does not leave a keyboard focus behind.
    await page.mouse.move(700, 30)
    // In two steps: the 4.2 s timer is set only after React re-renders the end of the rest,
    // so one long jump could pass before that timer exists (flaky 08.11, #423).
    await page.clock.fastForward(12000)
    await expect(hero(page)).not.toHaveAttribute('data-hold', '')
    await page.clock.fastForward(4300)
    await expect(word(page)).toHaveText('stronę hotelu.')
  })

  test('the side windows are in 3D, the rest hidden; nothing is cut in the active one', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    // A tall screen: the window follows the height left below the panel (AUDYT po SWA7 #2).
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto(site(HOST))
    const box = await active(page).boundingBox()
    // SWA14 §1: middle, two sides, two far ones behind the edges; the rest hidden.
    const count = await tabs(page).count()
    await expect(hero(page).locator('.hx-win[data-rank="r2"]')).toHaveCount(1)
    await expect(hero(page).locator('.hx-win[data-rank="rl2"]')).toHaveCount(1)
    await expect(hero(page).locator('.hx-win[data-rank="rx"]')).toHaveCount(count - 5)
    const stage = await active(page).locator('.mk-stage').boundingBox()
    expect(Math.abs((stage?.width ?? 0) - (box?.width ?? 0))).toBeLessThan(1)
  })

  test('a step moves the drum: no window fades out in sight (SWA14 §1)', async ({ page }) => {
    await page.goto(site(HOST))
    await hydrated(tabs(page).first())
    // Every 50 ms through a move: a window seen in the unmasked part of the stage (8–92 %) never
    // drops below 0.45 — it leaves and comes in behind the edges.
    const sample = (selector: string) =>
      page.evaluate(async (button) => {
        const deck = document.querySelector<HTMLElement>('#start .hx-deck')
        if (!deck) return ['no .hx-deck']
        const faults: string[] = []
        const check = (time: number) => {
          const box = deck.getBoundingClientRect()
          const left = box.left + box.width * 0.08
          const right = box.right - box.width * 0.08
          for (const win of deck.querySelectorAll<HTMLElement>('.hx-win')) {
            const style = getComputedStyle(win)
            if (style.visibility === 'hidden') continue
            const rect = win.getBoundingClientRect()
            const seen = Math.min(rect.right, right) - Math.max(rect.left, left)
            const opacity = Number(style.opacity)
            if (seen > 1 && opacity < 0.45) {
              faults.push(`${time} ms: ${win.dataset.rank} at ${opacity.toFixed(2)}`)
            }
          }
        }
        document.querySelector<HTMLElement>(button)?.click()
        const start = performance.now()
        while (performance.now() - start < 1000) {
          check(Math.round(performance.now() - start))
          await new Promise((resolve) => setTimeout(resolve, 50))
        }
        return faults
      }, selector)
    expect(await sample('#start .hx-arrow[data-step="next"]')).toEqual([])
    expect(await sample('#start .hx-arrow[data-step="prev"]')).toEqual([])
    expect(await sample('#start .hx-arrow[data-step="prev"]')).toEqual([])
  })

  test('no hydration errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    await page.goto(site(HOST))
    await expect(word(page)).toBeVisible()
    expect(errors.filter((text) => /hydrat/i.test(text))).toEqual([])
  })

  for (const theme of ['dark', 'light'] as const) {
    test(`no axe violations in the hero (${theme})`, async ({ page }) => {
      await setTheme(page, theme, { reducedMotion: 'reduce' })
      await page.goto(site(HOST))
      // The mock-ups are decorative pictures of sample firms (own brand colours, `aria-hidden`).
      const result = await new AxeBuilder({ page })
        .include('#start')
        .exclude('[data-mockup]')
        .withTags(WCAG)
        .analyze()
      expect(result.violations).toEqual([])
    })
  }
})

// AUDYT-0811 #0, AUDYT po SWA7 #1–#3 and AUDYT-0911 wieczór #1: where the active mock-up sits
// on the first screen. `full`: the whole window ends at that line; `half`: at least its top half
// is visible; `min`: the window is never narrower (wide screens shrink the text first).
const FIRST_SCREEN = [
  { width: 1920, height: 1080, full: 1060, min: 700 },
  { width: 1440, height: 900, full: 900, min: 560 },
  { width: 1366, height: 768, full: 768, min: 560 },
  { width: 1280, height: 720, half: true, min: 560 },
  // AUDYT-0911 noc #2: a tablet held wide uses the laptop rule (iPad Air, iPad).
  { width: 1180, height: 820, full: 820, min: 560 },
  { width: 1024, height: 768, full: 768, min: 560 },
  { width: 390, height: 844, aboveTabBar: 16 },
  { width: 412, height: 915, aboveTabBar: 16 },
  // AUDYT-0911 noc #1: short phones and 390×664 (Safari with its bars) — the window ends above
  // the tab bar; the width follows the height under the panel (`svh`).
  { width: 360, height: 640, aboveTabBar: 0 },
  { width: 375, height: 667, aboveTabBar: 0 },
  { width: 390, height: 664, aboveTabBar: 0 },
  { width: 360, height: 740, aboveTabBar: 0 },
] as const

for (const size of FIRST_SCREEN) {
  test(`the active mock-up sits on the first screen at ${size.width}×${size.height}`, async ({
    page,
  }) => {
    const { width, height } = size
    await page.setViewportSize({ width, height })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(site(HOST))
    const box = await active(page).boundingBox()
    expect(box).not.toBeNull()
    const bottom = box!.y + box!.height
    if ('min' in size) expect(box!.width).toBeGreaterThanOrEqual(size.min - 0.5)
    if ('full' in size) expect(bottom).toBeLessThanOrEqual(size.full)
    if ('half' in size) expect(box!.y).toBeLessThan(height - 0.5 * box!.height)
    if ('aboveTabBar' in size) {
      const bar = await page.locator('[data-tab-bar]').boundingBox()
      expect(bar).not.toBeNull()
      expect(bottom).toBeLessThanOrEqual(bar!.y - size.aboveTabBar)
    }
  })
}

// SWA12b (AUDYT-PROD-TELEFON §3): a phone shows one window, its caption on the window's bottom
// edge and the dots of the slides above the tab bar (no dots from 700 px down).
for (const size of [
  { width: 390, height: 844 },
  { width: 412, height: 915 },
  { width: 390, height: 664 },
  { width: 375, height: 667 },
  { width: 360, height: 640 },
]) {
  test(`one window, the caption inside it and the dots above the tab bar at ${size.width}×${size.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(size)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(site(HOST))
    const win = (await active(page).boundingBox())!
    const visibleWindows = await hero(page)
      .locator('.hx-win')
      .evaluateAll(
        (list) => list.filter((el) => getComputedStyle(el).visibility === 'visible').length,
      )
    expect(visibleWindows).toBe(1)
    const caption = (await hero(page).locator('.hx-cap').boundingBox())!
    expect(caption.y).toBeGreaterThanOrEqual(win.y)
    expect(caption.y + caption.height).toBeLessThanOrEqual(win.y + win.height)
    const bar = (await page.locator('[data-tab-bar]').boundingBox())!
    const dots = hero(page).locator('.hx-dots')
    if (size.height > 700) {
      const box = (await dots.boundingBox())!
      expect(box.y + box.height).toBeLessThanOrEqual(bar.y)
    } else {
      await expect(dots).toBeHidden()
    }
  })
}

test('the phone shows the short word of a slide in one line (SWA12b #14)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(site(HOST))
  await hydrated(tabs(page).first())
  // As a finger does: the row goes sideways first, then the last tile is tapped.
  await hero(page)
    .locator('.hx-tiles')
    .evaluate((row) => (row.scrollLeft = row.scrollWidth))
  const last = (await tabs(page).last().boundingBox())!
  await page.mouse.click(last.x + last.width / 2, last.y + last.height / 2)
  await expect(word(page)).toHaveText('automatyzacje.', { useInnerText: true })
  // The word itself (its box reserves two lines for the long words): one line high.
  const short = word(page).locator('.hx-word-short')
  const size = await short.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
  expect((await short.boundingBox())!.height).toBeLessThan(size * 1.6)
})
