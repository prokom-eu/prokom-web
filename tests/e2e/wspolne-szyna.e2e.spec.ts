import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// D2-2a (plan `docs/zadania/wspolne-elementy.md`, spec §5.1, §10 pkt 3): the shared side rail on
// the preview page — as on a subpage (`/_wspolne`) and as on a home page (`?szyna=glowna`).
const rail = (page: Page) => page.locator('[data-wspolne] [data-site-rail]')

/** As a visitor does: the pointer over the folded rail's icons first, until it opens. */
async function openRail(page: Page) {
  await rail(page).hover({ position: { x: 32, y: 32 } })
  await expect
    .poll(() => rail(page).evaluate((nav) => getComputedStyle(nav).clipPath))
    .toBe('inset(0px round 22px)')
}

const scrollTo = (page: Page, id: string) =>
  page.evaluate((target) => {
    document.documentElement.style.scrollBehavior = 'auto'
    document.getElementById(target)?.scrollIntoView()
  }, id)

test.describe('/_wspolne — side rail (1440 px)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('on a subpage: „Na tej stronie” from the marked sections, the home page folded', async ({
    page,
  }) => {
    await page.goto(site('software.localhost', '/_wspolne'))
    await expect(rail(page)).toBeVisible()
    await expect(rail(page)).toHaveAttribute('aria-label', 'Sekcje strony')
    await expect(rail(page).getByRole('group', { name: 'Na tej stronie' })).toBeVisible()
    const pageLinks = rail(page).locator('.srail__list').first().getByRole('link')
    await expect(pageLinks).toHaveText(['Kapsuła', 'Mapa adresu', 'Stopka'])

    const home = rail(page).getByRole('button', { name: /Strona główna/ })
    await expect(home).toHaveAttribute('aria-expanded', 'false')
    await openRail(page)
    await home.click()
    await expect(home).toHaveAttribute('aria-expanded', 'true')
    // Home page sections from the panel, as links to the home page (spec §5.1).
    const homeLinks = rail(page).locator('.srail__list--home a')
    expect(await homeLinks.count()).toBeGreaterThan(2)
    for (const href of await homeLinks.evaluateAll((links) =>
      links.map((a) => a.getAttribute('href')),
    )) {
      expect(href).toMatch(/^\/#[a-z0-9-]+$/)
    }
  })

  test('on a home page: the current section follows the scroll (aria-current="location")', async ({
    page,
  }) => {
    await page.goto(site('software.localhost', '/_wspolne?szyna=glowna'))
    await expect(rail(page)).toHaveAttribute('aria-label', 'Sekcje strony')
    await scrollTo(page, 'wspolne-stopka')
    await expect(rail(page).locator('[aria-current="location"]')).toHaveText('Stopka')
    await scrollTo(page, 'wspolne-start')
    await expect(rail(page).locator('[aria-current="location"]')).toHaveText('Kapsuła')

    await openRail(page)
    await rail(page).getByRole('link', { name: 'Mapa adresu' }).click()
    await expect(page).toHaveURL(/#wspolne-mapa-sekcja$/)
    await expect(page.locator('#wspolne-mapa-sekcja')).toBeFocused()
  })

  test('opens from the keyboard, Esc folds it; „Szukaj” on top', async ({ page }) => {
    await page.goto(site('software.localhost', '/_wspolne'))
    const search = rail(page).getByRole('button', { name: /Szukaj/ })
    await expect(search).toHaveAttribute('aria-keyshortcuts', 'Control+K Meta+K /')
    await search.focus()
    await expect
      .poll(() => rail(page).evaluate((nav) => getComputedStyle(nav).clipPath))
      .toBe('inset(0px round 22px)')
    await page.keyboard.press('Escape')
    await expect(rail(page)).toHaveAttribute('data-collapsed', '')
    // Focus stays where it was (WCAG 2.4.3); the rail is folded around it.
    await expect(search).toBeFocused()
    await expect
      .poll(() => rail(page).evaluate((nav) => getComputedStyle(nav).clipPath))
      .toBe('inset(0px calc(100% - 64px) 0px 0px round 22px)')
  })

  test('„Do góry” comes after a screen of scrolling and takes focus to the content', async ({
    page,
  }) => {
    await page.goto(site('instalacje.localhost', '/_wspolne'))
    const up = rail(page).getByRole('button', { name: 'Do góry' })
    await expect(up).not.toHaveAttribute('data-shown')
    await scrollTo(page, 'wspolne-stopka')
    await expect(up).toHaveAttribute('data-shown', '')
    await openRail(page)
    await up.click()
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
    await expect(page.locator('#tresc')).toBeFocused()
  })

  test('the line action sits at the bottom with its link from the panel', async ({ page }) => {
    await page.goto(site('instalacje.localhost', '/_wspolne'))
    await expect(rail(page).locator('.srail__item--action')).toHaveAttribute('href', '/zaplanuj')
  })
})

test('the rail is hidden below 1400 px', async ({ page }) => {
  await page.setViewportSize({ width: 1399, height: 900 })
  await page.goto(site('software.localhost', '/_wspolne'))
  await expect(rail(page)).toBeHidden()
})
