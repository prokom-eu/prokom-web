import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// ADR-007 / ADR-013: every line passes axe (WCAG 2.1 A/AA) in each of its themes, the layout
// holds at 360 px and the dark theme switch works. Seed pages: `home` and `kontakt`.
const SITES = [
  { host: 'biznes.localhost', line: 'biznes', dark: true },
  { host: 'instalacje.localhost', line: 'instalacje', dark: false },
  { host: 'software.localhost', line: 'software', dark: false },
]
const PATHS = ['/', '/kontakt']
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

async function expectNoViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
  // Rule ids and targets only, so a failure reads well in the CI log.
  expect(violations.map((v) => ({ rule: v.id, targets: v.nodes.map((n) => n.target) }))).toEqual([])
}

test.describe('accessibility (axe)', () => {
  for (const { host, line, dark } of SITES) {
    for (const path of PATHS) {
      for (const colorScheme of dark ? (['light', 'dark'] as const) : (['light'] as const)) {
        test(`${host}${path} — ${colorScheme}`, async ({ page }) => {
          await page.emulateMedia({ colorScheme })
          await page.goto(site(host, path))
          await expect(page.locator('html')).toHaveAttribute('data-line', line)
          await expectNoViolations(page)
        })
      }
    }
  }
})

test.describe('line colours', () => {
  test('each domain resolves its own accent', async ({ page }) => {
    const accents = new Set<string>()
    for (const { host } of SITES) {
      await page.goto(site(host))
      accents.add(
        await page.evaluate(() =>
          getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
        ),
      )
    }
    expect(accents.size).toBe(SITES.length)
  })
})

test.describe('phone width (360 px)', () => {
  test.use({ viewport: { width: 360, height: 740 } })

  for (const { host } of SITES) {
    for (const path of PATHS) {
      test(`${host}${path} has no horizontal scroll`, async ({ page }) => {
        await page.goto(site(host, path))
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        )
        expect(overflow).toBeLessThanOrEqual(0)
      })
    }
  }
})

test.describe('dark theme switch', () => {
  test('toggles, is announced and survives a reload (Biznes)', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto(site('biznes.localhost'))
    const toggle = page.getByRole('button', { name: 'Tryb ciemny' })
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(page.getByRole('button', { name: 'Tryb ciemny' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('is not offered on lines without a dark design', async ({ page }) => {
    await page.goto(site('instalacje.localhost'))
    await expect(page.getByRole('button', { name: 'Tryb ciemny' })).toHaveCount(0)
  })
})
