import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { setTheme, site } from './helpers'

// D2-4 (plan `docs/zadania/wspolne-elementy.md` F3 pkt 4–5, spec §6.0–§6.2, §10): the shared
// Kontakt and O firmie templates on the preview pages of the 3 tenants, every slot as a frame.
// Needs `pnpm seed`.
const HOSTS = ['biznes.localhost', 'instalacje.localhost', 'software.localhost'] as const
const CONTACT_SLOTS = ['heroAside', 'afterRoutes', 'formPrefill', 'afterForm', 'beforeFaq']
const ABOUT_SLOTS = ['afterStats', 'afterRules', 'afterSteps', 'beforeVisit']

test.describe('/_wspolne/kontakt and /_wspolne/o-firmie — page templates', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  for (const host of HOSTS) {
    test(`${host}: Kontakt — H1, phone, every slot, JSON-LD`, async ({ page }) => {
      await page.goto(site(host, '/_wspolne/kontakt'))
      const root = page.locator('[data-contact-page]')
      await expect(root.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(root.locator('a[href^="tel:"]').first()).toBeVisible()
      for (const name of CONTACT_SLOTS) {
        await expect(root.locator(`[data-slot="${name}"]`)).toHaveCount(1)
      }
      // The template adds the breadcrumbs; the company and its salons come from the site layout.
      const types = await page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((nodes) => nodes.map((node) => node.textContent ?? ''))
      expect(types.some((text) => text.includes('"BreadcrumbList"'))).toBe(true)
      expect(types.some((text) => text.includes('"LocalBusiness"'))).toBe(true)
      await expect(root.locator('[data-contact-form]')).toBeVisible()
    })

    test(`${host}: O firmie — company card, stats, every slot`, async ({ page }) => {
      await page.goto(site(host, '/_wspolne/o-firmie'))
      const root = page.locator('[data-about-page]')
      await expect(root.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(root.locator('[data-company-card]')).toContainText('NIP')
      await expect(root.locator('[data-stats-strip] li').first()).toContainText('2004')
      for (const name of ABOUT_SLOTS) {
        await expect(root.locator(`[data-slot="${name}"]`)).toHaveCount(1)
      }
    })
  }

  test('„Napisz” in the hero leads to the form', async ({ page }) => {
    await page.goto(site('software.localhost', '/_wspolne/kontakt'))
    await page.locator('[data-contact-page] a[href="#formularz"]').first().click()
    await expect(page).toHaveURL(/#formularz$/)
  })

  test('`?temat=` picks the topic of the form, only one the line has (plan 0611 §8.2)', async ({
    page,
  }) => {
    const form = page.locator('[data-contact-form]')
    await page.goto(site('software.localhost', '/_wspolne/kontakt?temat=audyt#formularz'))
    await expect(form.getByRole('button', { name: 'Audyt', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await page.goto(site('software.localhost', '/_wspolne/kontakt?temat=nie-ma-takiego'))
    await expect(form.locator('[aria-pressed="true"]')).toHaveCount(0)
  })

  for (const width of [360, 390, 414]) {
    test(`no sideways scroll at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      for (const path of HOSTS.flatMap((host) => [
        site(host, '/_wspolne/kontakt'),
        site(host, '/_wspolne/o-firmie'),
      ])) {
        await page.goto(path)
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        )
        expect(overflow).toBeLessThanOrEqual(0)
      }
    })
  }

  for (const [host, theme] of HOSTS.flatMap((h) =>
    (['light', 'dark'] as const).map((t) => [h, t] as const),
  )) {
    test(`axe on both templates (${host}, ${theme})`, async ({ page }) => {
      await setTheme(page, theme)
      for (const path of ['/_wspolne/kontakt', '/_wspolne/o-firmie']) {
        await page.goto(site(host, path))
        const results = await new AxeBuilder({ page })
          .include(path.endsWith('kontakt') ? '[data-contact-page]' : '[data-about-page]')
          .analyze()
        expect(results.violations).toEqual([])
      }
    })
  }
})
