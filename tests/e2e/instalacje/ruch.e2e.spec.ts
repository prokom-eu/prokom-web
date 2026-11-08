import { expect, type Page, test } from '@playwright/test'

import { site } from '../helpers'

// I-M (audit before staging §3): motion of the Instalacje line — the shared system of
// `motion.css` plus `sites/instalacje/ruch.css`. With reduced motion the colours still change
// (the theme), nothing moves. Data from `pnpm seed` (the home page with its `instHome` block).
const HOST = 'instalacje.localhost'
const DESKTOP = { width: 1440, height: 1000 }

/** Names of our animations running on the page (shared `sw-*` and the line's own). */
const OURS =
  /^(sw-[a-z-]+|inst-(grow-x|unfold|zkback|megain|sheet-up|fade|gor-[a-z]+|proc-[a-z]+|plan-in|ev-swap))$/
const running = (page: Page) =>
  page.evaluate(() =>
    document
      .getAnimations()
      .map((animation) => (animation as CSSAnimation).animationName ?? '')
      .filter(Boolean),
  )

/** The computed animation of the first element matching the selector. */
const animationOf = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((element) => getComputedStyle(element).animationName)

const openMega = async (page: Page) => {
  const button = page
    .locator('[data-site-header]')
    .getByRole('button', { name: 'Usługi', exact: true })
  // Retried until the page is hydrated (before that nothing listens to the pointer).
  await expect(async () => {
    await page.mouse.move(700, 950)
    await button.hover()
    await expect(page.getByRole('region', { name: 'Usługi' })).toBeVisible({ timeout: 500 })
  }).toPass()
}

test.describe('Instalacje motion', () => {
  test.use({ viewport: DESKTOP })

  test('the tab pill flows under the chosen hero object', async ({ page }) => {
    await page.goto(site(HOST))
    const tabs = page.locator('#start .hotabs')
    const pill = tabs.locator('.inst-pill')
    await expect(pill).toHaveCount(1)
    await tabs.getByRole('tab').nth(2).click()
    const chosen = tabs.locator('[aria-selected="true"]')
    // Its target place: the chosen tab's box in the list's own coordinates.
    await expect
      .poll(async () => {
        const [style, box] = await Promise.all([
          pill.evaluate((element) => (element as HTMLElement).style.translate),
          chosen.evaluate((element) => {
            const tab = element as HTMLElement
            return `${tab.offsetLeft}px ${tab.offsetTop}px`
          }),
        ])
        return style === box
      })
      .toBe(true)
    // The chosen tab lets the pill show through.
    await expect(chosen).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  })

  test('the mega menu items come in one after another', async ({ page }) => {
    await page.goto(site(HOST))
    await openMega(page)
    expect(await animationOf(page, '.imega:not([hidden]) .megac a')).toBe('sw-reveal')
  })

  test('an FAQ plus turns into a × when its answer opens', async ({ page }) => {
    await page.goto(site(HOST, '/monitoring'))
    const faq = page.locator('#faq details.fq').nth(1)
    await faq.locator('summary').click()
    await expect(faq).toHaveAttribute('open', '')
    await expect(faq.locator('summary > svg')).toHaveCSS('rotate', '45deg')
  })
})

test.describe('Instalacje motion with reduced motion', () => {
  test.use({ viewport: DESKTOP, contextOptions: { reducedMotion: 'reduce' } })

  test('the theme changes its colours at once, without the circle', async ({ page }) => {
    await page.goto(site(HOST))
    // L1-I: the shared theme toggle of the capsule.
    const toggle = page.locator('[data-site-header]').getByRole('button', { name: 'Tryb ciemny' })
    // Retried until the page is hydrated (before that the click is lost).
    await expect(async () => {
      if ((await toggle.getAttribute('aria-pressed')) !== 'true') await toggle.click()
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark', { timeout: 500 })
    }).toPass()
    await expect(page.locator('html')).not.toHaveAttribute('data-theme-reveal')
    expect((await running(page)).filter((name) => OURS.test(name))).toEqual([])
  })

  test('the mega menu, an FAQ answer and the page do not move', async ({ page }) => {
    await page.goto(site(HOST, '/monitoring'))
    await openMega(page)
    expect(await animationOf(page, '.imega:not([hidden]) .megac a')).toBe('none')
    await page.keyboard.press('Escape')
    const faq = page.locator('#faq details.fq').nth(1)
    await faq.locator('summary').click()
    await expect(faq).toHaveAttribute('open', '')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
    expect((await running(page)).filter((name) => OURS.test(name))).toEqual([])
  })
  test('the care plans and the charger photo switch without moving (RUNDA-V5 §11)', async ({
    page,
  }) => {
    await page.goto(site(HOST, '/serwis'))
    const level = page.getByRole('group', { name: 'Poziom opieki' })
    await expect(async () => {
      await level.getByRole('button', { name: 'Pełna opieka' }).click()
      await expect(page.locator('#plany .plan.on')).toContainText('Pełna opieka', { timeout: 500 })
    }).toPass()
    expect((await running(page)).filter((name) => OURS.test(name))).toEqual([])
    expect(
      await page.locator('#plany .plan.on').evaluate((el) => getComputedStyle(el).translate),
    ).toBe('none')

    await page.goto(site(HOST, '/ladowarki-ev'))
    const model = page.locator('.evco').getByRole('group', { name: 'Model' })
    await expect(async () => {
      await model.getByRole('button', { name: 'CC City' }).click()
      await expect(model.getByRole('button', { name: 'CC City' })).toHaveAttribute(
        'aria-pressed',
        'true',
        { timeout: 500 },
      )
    }).toPass()
    expect((await running(page)).filter((name) => OURS.test(name))).toEqual([])
  })

  test('the mountain band and the process axis stand still, drawn in full (RUNDA-V5 §5–§6)', async ({
    page,
  }) => {
    await page.goto(site(HOST))
    await page.locator('#gory').scrollIntoViewIfNeeded()
    await expect(page.locator('#gory .gorsnow')).toBeHidden()
    await page.locator('#proces').scrollIntoViewIfNeeded()
    expect((await running(page)).filter((name) => OURS.test(name))).toEqual([])
    // Every node is filled without the scroll-driven animation.
    const fills = await page
      .locator('#proces .procn')
      .evaluateAll((nodes) => nodes.map((n) => getComputedStyle(n, '::before').opacity))
    expect(fills).toEqual(['1', '1', '1', '1', '1', '1'])
  })
})
