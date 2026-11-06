import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { setTheme, site } from './helpers'

// SWA1b (PRZEKAZANIE-v24 §3.1, ZMIANY-v24 §8): the v24 foundation on `/_software` — headings,
// primitives and every mock-up. Nothing in a mock-up is cut off, the stage scales to its box, the
// page passes axe in both themes and a phone does not scroll sideways.
const HOST = 'software.localhost'
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

const cases = (page: Page) => page.locator('[data-mockup-case]')

test.describe('/_software — v24 foundation', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('every kind and variant is drawn, scaled to its box', async ({ page }) => {
    await page.goto(site(HOST, '/_software'))
    // 14 sites + 14 phones + 4 panels + 4 flows + care + before = 38.
    await expect(cases(page)).toHaveCount(38)
    const scale = await cases(page)
      .first()
      .locator('.mk')
      .evaluate((box) => {
        const stage = box.querySelector('.mk-stage') as HTMLElement
        return {
          width: box.getBoundingClientRect().width,
          stage: stage.getBoundingClientRect().width,
        }
      })
    expect(Math.abs(scale.stage - scale.width)).toBeLessThan(1)
  })

  test('nothing in a mock-up is cut off (ZMIANY-v24 §8 „nic się nie ucina”)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(site(HOST, '/_software'))
    const problems = await page.evaluate(() => {
      const found: string[] = []
      for (const item of document.querySelectorAll('[data-mockup-case]')) {
        const name = item.lastElementChild?.textContent ?? ''
        for (const title of item.querySelectorAll<HTMLElement>('.mk-title')) {
          if (title.scrollHeight > title.clientHeight + 1) found.push(`${name}: title`)
        }
        const hero = item.querySelector('.mk-hero')?.getBoundingClientRect()
        for (const part of item.querySelectorAll('.mk-copy, .mk-widget')) {
          if (hero && part.getBoundingClientRect().bottom > hero.bottom + 0.5)
            found.push(`${name}: ${part.className}`)
        }
        // Phone screens (the phone kind, the phone over a site): hero and buttons stay inside.
        for (const screen of item.querySelectorAll('.mk-screen')) {
          const box = screen.getBoundingClientRect()
          for (const part of screen.querySelectorAll(
            '.mk-screen-hero > div, .mk-screen-body > span',
          )) {
            const rect = part.getBoundingClientRect()
            if (rect.height > 0 && rect.bottom > box.bottom + 0.5)
              found.push(`${name}: phone ${part.textContent?.slice(0, 24)}`)
          }
        }
        const frame = item.querySelector('.mk-frame')?.getBoundingClientRect()
        for (const row of item.querySelectorAll('.mk-list-row, .mk-log, .mk-feature')) {
          if (frame && row.getBoundingClientRect().bottom > frame.bottom + 0.5)
            found.push(`${name}: ${row.textContent?.slice(0, 24)}`)
        }
      }
      return found
    })
    expect(problems).toEqual([])
  })

  for (const theme of ['dark', 'light'] as const) {
    test(`no axe violations (${theme})`, async ({ page }) => {
      await setTheme(page, theme, { reducedMotion: 'reduce' })
      await page.goto(site(HOST, '/_software'))
      // Mock-ups are decorative pictures of sample firms in their own brand colours (ADR-015 v24
      // pkt 4, `aria-hidden`); axe still measures text contrast inside them, so they are left out.
      const result = await new AxeBuilder({ page })
        .exclude('[data-mockup]')
        .withTags(WCAG)
        .analyze()
      expect(result.violations).toEqual([])
    })
  }

  test('the segment switches with aria-pressed', async ({ page }) => {
    await page.goto(site(HOST, '/_software'))
    const group = page.getByRole('group', { name: 'Widok podglądu' })
    await group.getByRole('button', { name: 'System' }).click()
    await expect(group.getByRole('button', { name: 'System' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(group.getByRole('button', { name: 'Strona' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })
})

test.describe('/_software on a phone', () => {
  test.use({ viewport: { width: 360, height: 780 } })

  test('no sideways scroll at 360 px', async ({ page }) => {
    await page.goto(site(HOST, '/_software'))
    await expect(cases(page).first()).toBeVisible()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
})

test('/_software is not on the other lines', async ({ page }) => {
  const response = await page.goto(site('biznes.localhost', '/_software'))
  expect(response?.status()).toBe(404)
})
