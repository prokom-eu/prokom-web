import { type CDPSession, expect, type Page, test } from '@playwright/test'

import { site } from '../helpers'
import { INST_HOST, INST_PAGES } from './pages'
import {
  auditPhone,
  FAILING,
  PHONE_WIDTHS,
  type PhoneProblem,
  setTheme,
  THEMES,
} from './phone-audit'

/** One audit normally takes ~3 s. */
const AUDIT_LIMIT_MS = 45_000

/**
 * Where the page's script stands: pauses it through the Chrome debugger and returns the top
 * frames with a piece of the code around each — the CI build is minified, so the code tells more
 * than the names. 08.11: the hung page did not answer at all. The debugger must be enabled before
 * the hang (`Debugger.enable` itself waits for the blocked page); a pause then interrupts even a
 * busy loop.
 */
async function blockedStack(cdp: CDPSession): Promise<string> {
  try {
    const paused = new Promise<string>((done) => {
      cdp.once('Debugger.paused', (event) => {
        void Promise.all(
          event.callFrames.slice(0, 3).map(async (frame) => {
            const { lineNumber, columnNumber = 0, scriptId } = frame.location
            const file = frame.url.split('/').slice(-2).join('/') || '(inline)'
            const { scriptSource } = await cdp
              .send('Debugger.getScriptSource', { scriptId })
              .catch(() => ({ scriptSource: '' }))
            const line = scriptSource.split('\n')[lineNumber] ?? ''
            const code = line.slice(Math.max(0, columnNumber - 120), columnNumber + 120)
            return `${frame.functionName || '(anonymous)'} ${file}:${lineNumber + 1}:${columnNumber + 1}\n      ${code}`
          }),
        ).then((frames) => done(frames.join('\n    ← ')))
      })
    })
    await cdp.send('Debugger.pause')
    return await Promise.race([
      paused,
      new Promise<string>((done) => setTimeout(() => done('(no pause within 10 s)'), 10_000)),
    ])
  } catch (error) {
    return `(debugger failed: ${String(error).slice(0, 120)})`
  } finally {
    await cdp.send('Debugger.resume').catch(() => undefined)
  }
}

/**
 * The audit with its own limit. In CI an audit of a random page sometimes never returned and
 * held the test until its 180 s timeout (08.11, cause not found yet): now it fails after 45 s,
 * goes to the retry sooner and says where it stopped and whether the page still answers.
 */
async function auditWithLimit(
  page: Page,
  cdp: CDPSession,
  width: number,
  where: string,
): Promise<PhoneProblem[]> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const limit = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      // A 1 + 1 that does not come back in 2 s means the page's main thread is blocked.
      const probe = page
        .evaluate(() => 1 + 1)
        .then(
          () => 'the page still answers',
          (error: unknown) => `the page fails: ${String(error).slice(0, 120)}`,
        )
      const blocked = new Promise<string>((done) =>
        setTimeout(() => done('the page does not answer (main thread blocked)'), 2000),
      )
      void Promise.race([probe, blocked]).then(async (state) => {
        const stack = state.includes('blocked')
          ? `\n  Script stack:\n    ${await blockedStack(cdp)}`
          : ''
        reject(
          new Error(
            `Phone audit hung for ${AUDIT_LIMIT_MS / 1000} s at ${where}; ${state}.${stack}`,
          ),
        )
      })
    }, AUDIT_LIMIT_MS)
  })
  try {
    return await Promise.race([auditPhone(page, width), limit])
  } finally {
    clearTimeout(timer)
  }
}

// I14: MOBILE-APLIKACJA §10 on every address of the line — 360/390/414 px, light and dark.
// One test per page (widths and themes switched in place, no reload) keeps CI short. The same
// checks give the local report: docs/design/prokominstalacje/narzedzia/audyt-telefon.mjs.
test.use({ isMobile: true, hasTouch: true, contextOptions: { reducedMotion: 'reduce' } })

for (const path of INST_PAGES) {
  test(`Instalacje on a phone: ${path}`, async ({ page }) => {
    test.slow()
    // Enter at 360 px — the narrowest phone, how people arrive; the rest by resizing.
    await page.setViewportSize({ width: PHONE_WIDTHS[0], height: 844 })
    // For the stack of a hung audit (blockedStack): enabled before the page has any script.
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Debugger.enable')
    const response = await page.goto(site(INST_HOST, path))
    expect(response?.status(), path).toBe(200)

    // The menu sheet opens from the tab bar and closes with Esc (shell.e2e.spec.ts). First, so
    // the page is hydrated before the scroll checks.
    const bar = page.getByRole('navigation', { name: 'Pasek aplikacji' })
    const sheet = page.getByRole('dialog', { name: 'Menu' })
    // Retried until the page is hydrated (before that the tap is lost).
    await expect(async () => {
      await bar.getByRole('button', { name: 'Menu' }).click()
      await expect(sheet).toBeVisible({ timeout: 1000 })
    }).toPass()
    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()

    const failures: string[] = []
    for (const width of PHONE_WIDTHS) {
      await page.setViewportSize({ width, height: 844 })
      for (const theme of THEMES) {
        await setTheme(page, theme)
        for (const p of await auditWithLimit(page, cdp, width, `${path} ${width} px ${theme}`)) {
          if (FAILING.has(p.kind)) failures.push(`${width} ${theme} ${p.kind}: ${p.detail}`)
        }
      }
    }
    expect(failures).toEqual([])
  })
}

// P2-21 (audit 06.11): CLS 0,27 on `/dla-kogo/szkoly` after scrolling (a lazy widget). The page
// is scrolled down in steps; the layout shifts without input must stay under 0,1.
test('Instalacje on a phone: no layout shift while scrolling /dla-kogo/szkoly', async ({
  page,
}) => {
  // With motion on: the file runs with reduced motion, which would hide shifts of reveals.
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(site(INST_HOST, '/dla-kogo/szkoly'))
  await page.waitForLoadState('networkidle')
  const cls = await page.evaluate(async () => {
    let total = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & {
        value: number
        hadRecentInput: boolean
      })[]) {
        if (!entry.hadRecentInput) total += entry.value
      }
    }).observe({ type: 'layout-shift', buffered: true })
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return total
  })
  expect(cls).toBeLessThan(0.1)
})
