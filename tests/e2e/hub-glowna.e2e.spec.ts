import { expect, test } from '@playwright/test'

import { hydrated, site } from './helpers'

// pro-kom.eu home page (H2, spec §6.1, board 01 `Main.dc.html`): sections from `HubSettings.home`,
// the rail with anchors, the line scene tabs, „Dobierz” and „Co zrobić, gdy…”. Needs `pnpm seed`
// (tenant `prokom` with its texts, plans and help).
const HUB = 'prokom.localhost'

/** Sections every seeded hub shows (news only with posts, brands with data — not listed). */
const SECTIONS = ['start', 'linie', 'dobierz', 'narzedzia', 'pomoc', 'wspolpraca', 'zasieg']
const MORE = ['pytania', 'kontakt']

test.describe('pro-kom.eu — home page sections (spec §6.1)', () => {
  test('every section has its anchor and heading; the rail leads to them', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site(HUB))
    for (const id of [...SECTIONS, ...MORE]) {
      const section = page.locator(`section#${id}`)
      await expect(section, id).toHaveCount(1)
      await expect(
        section.getByRole('heading', { level: id === 'start' ? 1 : 2 }).first(),
      ).toBeVisible()
    }
    // No placeholders of the shell are left once the texts are in the panel.
    await expect(page.locator('.pk-home > .pk-wrap > section.min-h-\\[40vh\\]')).toHaveCount(0)

    const link = page.locator('a.srail__item[href="#pomoc"]')
    await expect(link).toHaveCount(1)
    await hydrated(link)
    // The folded rail clips its labels (`clip-path`): a pointer click could land elsewhere.
    await link.evaluate((anchor: HTMLAnchorElement) => anchor.click())
    await expect(page.locator('section#pomoc')).toBeInViewport()
  })

  test('the scene tabs switch the line panel', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site(HUB, '/#linie'))
    const tabs = page.locator('#linie').getByRole('tab')
    await hydrated(tabs.nth(1))
    await tabs.nth(1).click()
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'false')
  })

  test('„Dobierz” shows the plan of the chosen persona', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site(HUB, '/#dobierz'))
    const section = page.locator('#dobierz')
    const personas = section.locator('.pk-choose__list button')
    await expect(personas.first()).toHaveAttribute('aria-pressed', 'true')
    const title = section.locator('.pk-plan h3')
    const before = await title.textContent()
    await hydrated(personas.nth(1))
    await personas.nth(1).click()
    await expect(personas.nth(1)).toHaveAttribute('aria-pressed', 'true')
    await expect(personas.first()).toHaveAttribute('aria-pressed', 'false')
    await expect(title).not.toHaveText(before ?? '')
    // Every line card of the plan leads to the line's own site.
    const cards = section.locator('.pk-plan__grid a')
    expect(await cards.count()).toBeGreaterThan(0)
    for (const href of await cards.evaluateAll((links) => links.map((a) => a.getAttribute('href'))))
      expect(href).toMatch(/^https?:\/\//)
  })

  test('„Co zrobić, gdy…” shows the steps and the phone of the chosen situation', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site(HUB, '/#pomoc'))
    const section = page.locator('#pomoc')
    const situations = section.locator('.pk-help__list button')
    expect(await situations.count()).toBeGreaterThanOrEqual(5)
    await hydrated(situations.nth(2))
    await situations.nth(2).click()
    await expect(section.locator('.pk-help__panel h3')).toHaveText(
      (await situations.nth(2).textContent()) ?? '',
    )
    await expect(section.locator('.pk-help__steps li')).toHaveCount(3)
    await expect(section.locator('.pk-help__panel a[href^="tel:"]')).toHaveCount(1)
  })

  test('FAQ opens the first question; contact topics open the contact page', async ({ page }) => {
    await page.goto(site(HUB, '/#pytania'))
    const questions = page.locator('#pytania details')
    await expect(questions.first()).toHaveAttribute('open', '')
    await expect(questions.nth(1)).not.toHaveAttribute('open', '')
    // The tokens of the answers are filled from the panel.
    await expect(page.locator('#pytania .pk-faq__list')).not.toContainText('{')
    const jsonLd = await page.locator('#pytania script[type="application/ld+json"]').textContent()
    expect(jsonLd).toContain('FAQPage')
    expect(jsonLd).not.toMatch(/\{(telefon|adres|godziny)\}/)
    const topics = page.locator('#kontakt .pk-topic')
    expect(await topics.count()).toBeGreaterThanOrEqual(4)
    const href = await topics.first().getAttribute('href')
    expect(href).toMatch(/^\/kontakt\?temat=.+#formularz$/)
    // The topic is one of the contact form's chips: opening the link picks it.
    await page.goto(site(HUB, href ?? '/kontakt'))
    await expect(page.locator('#formularz [aria-pressed="true"]').first()).toBeVisible()
  })
})

test.describe('pro-kom.eu — home page on a phone (spec §9)', () => {
  for (const width of [360, 390]) {
    test(`no sideways scroll at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto(site(HUB))
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }
})
