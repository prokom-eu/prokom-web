import { expect, test, type Page } from '@playwright/test'

import { site } from './helpers'

// SW5: start page of the Software line, part 1 (spec. §4 pkt 1–4, 7; §3.3 section rail). Data
// from `pnpm seed`: the home page blocks in the order of `homeOrder`, texts in
// `SoftwareSettings.home`, areas and solutions of the package.
const HOST = 'software.localhost'

const areaTabs = (page: Page) =>
  page.getByRole('tablist', { name: 'Obszary oferty' }).getByRole('tab')
const areaPanel = (page: Page) => page.locator('#oferta').getByRole('tabpanel')
const modules = (page: Page) =>
  page.getByRole('group', { name: 'Moduły Twojego systemu' }).getByRole('button')

test.describe('Software start page', () => {
  test('sections in the order of the blocks, hero with the H1', async ({ page }) => {
    await page.goto(site(HOST))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Strony, systemy i aplikacje szyte pod Twoją firmę.',
    )
    const ids = await page
      .locator('main section[id]')
      .evaluateAll((sections) => sections.map((section) => section.id))
    expect(ids).toEqual(['start', 'oferta', 'popularne', 'dobierz'])
    await expect(
      page.locator('#start').getByRole('link', { name: /Dobierz rozwiązanie/ }),
    ).toHaveAttribute('href', '/#dobierz')
    await expect(page.locator('#start')).toContainText('Odpowiadamy w ciągu 1 dnia roboczego')
  })

  test('four intent tiles lead to the catalog and the wizard', async ({ page }) => {
    await page.goto(site(HOST))
    const tiles = page.locator('#start ul').last().getByRole('link')
    await expect(tiles).toHaveCount(4)
    await expect(tiles.nth(0)).toHaveAttribute('href', '/rozwiazania?kategoria=strony')
    await expect(tiles.nth(1)).toHaveAttribute('href', '/dobierz?potrzeba=prog')
  })

  test('„Twój system”: modules switch, „Chcę taki system” adds one project item', async ({
    page,
  }) => {
    // No self-assembling with reduced motion: the default three modules stay.
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(site(HOST))
    await expect(modules(page)).toHaveCount(7)
    await expect(modules(page).and(page.locator('[aria-pressed="true"]'))).toHaveCount(3)

    await modules(page).filter({ hasText: 'Asystent AI' }).click()
    await expect(modules(page).filter({ hasText: 'Asystent AI' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(page.locator('#start')).toContainText('4moduływłasny system firmy')

    await page.getByRole('button', { name: 'Chcę taki system' }).click()
    await expect(page.getByRole('button', { name: '✓ W Twoim projekcie' })).toBeVisible()
    const stored = await page.evaluate(() => localStorage.getItem('pk-project'))
    expect(JSON.parse(stored ?? '[]')).toContainEqual({
      id: 'build-www-zlec-app-ai',
      name: 'system z 4 modułów',
    })
  })

  test('areas: tabs with arrows, a price, switching itself until picked', async ({ page }) => {
    await page.clock.install()
    await page.goto(site(HOST))
    await expect(areaTabs(page)).toHaveCount(8)
    await expect(areaTabs(page).first()).toHaveAttribute('aria-selected', 'true')
    await expect(areaPanel(page).getByRole('heading', { level: 3 })).toHaveText(
      'Strony internetowe',
    )
    await expect(areaPanel(page)).toContainText('od 999 zł')

    // Every 5,5 s the next area (pointer outside the section).
    await page.mouse.move(0, 0)
    await page.clock.runFor(5600)
    await expect(areaTabs(page).nth(1)).toHaveAttribute('aria-selected', 'true')

    // Picked by keyboard: stops for good.
    await areaTabs(page).nth(1).focus()
    await page.keyboard.press('ArrowRight')
    await expect(areaTabs(page).nth(2)).toHaveAttribute('aria-selected', 'true')
    await expect(areaTabs(page).nth(2)).toBeFocused()
    await page.keyboard.press('End')
    await expect(areaTabs(page).last()).toHaveAttribute('aria-selected', 'true')
    await page.mouse.move(0, 0)
    await page.locator('body').click({ position: { x: 1, y: 1 } })
    await page.clock.runFor(12_000)
    await expect(areaTabs(page).last()).toHaveAttribute('aria-selected', 'true')
  })

  test('areas do not switch themselves with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.clock.install()
    await page.goto(site(HOST))
    // The section first, then the time: the clock only runs once the tabs are on the page.
    await expect(areaTabs(page)).toHaveCount(8)
    await page.mouse.move(0, 0)
    await page.clock.runFor(12_000)
    await expect(areaTabs(page).first()).toHaveAttribute('aria-selected', 'true')
  })

  test('12 rzeczy: tabs filter the cards, a card expands', async ({ page }) => {
    await page.goto(site(HOST))
    const section = page.locator('#popularne')
    const cards = section.getByTestId('popular-card')
    await expect(cards).toHaveCount(12)
    await expect(section).toContainText('12 pozycji · kliknij kartę, żeby rozwinąć')

    await section.getByRole('tab', { name: /Systemy/ }).click()
    await expect(cards).toHaveCount(4)
    await expect(section).toContainText('4 pozycje')

    const first = cards.first()
    await first.getByRole('button', { name: 'CRM dla małej i średniej firmy' }).click()
    await expect(first).toContainText('Co dostajesz')
    await expect(section).toContainText('Opieka i rozwój')
    await expect(section).toContainText('od 149 zł / mies.')
  })

  test('the wizard is a section of the page, its title an h2', async ({ page }) => {
    await page.goto(site(HOST))
    const wizard = page.locator('#dobierz')
    await expect(wizard.getByRole('heading', { level: 2 })).toHaveText(
      'Kliknij kilka razy. Zobacz, co dla Ciebie zbudujemy.',
    )
    await expect(wizard.getByRole('heading', { level: 3 }).first()).toBeVisible()
  })

  test('section rail above 1400 px, hidden below', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(site(HOST))
    const rail = page.getByRole('navigation', { name: 'Na tej stronie' })
    await expect(rail.getByRole('link')).toHaveText([
      'Start',
      'Oferta',
      'Najczęściej zamawiane',
      'Dobierz rozwiązanie',
    ])
    await expect(rail).toBeVisible()
    await page.setViewportSize({ width: 1400, height: 900 })
    await expect(rail).toBeHidden()
  })
})

test.describe('Software start page on a phone', () => {
  for (const width of [390, 360]) {
    test(`fits ${width} px: no sideways scroll, intents without texts`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await page.goto(site(HOST))
      const scroll = await page.evaluate(() => document.scrollingElement?.scrollWidth)
      expect(scroll).toBe(width)
      const intent = page.locator('#start ul').last().getByRole('link').first()
      await expect(intent.locator('span').last()).toBeHidden()
      // Touch targets of the sections ≥ 44 px.
      for (const target of [
        modules(page).first(),
        areaTabs(page).first(),
        page.locator('#popularne').getByRole('tab').first(),
      ]) {
        const box = await target.boundingBox()
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
      }
      // 12 rzeczy as a carousel: a card is 84% wide, the next one peeks in.
      const card = await page.getByTestId('popular-card').first().boundingBox()
      expect(card?.width ?? 0).toBeLessThan(width * 0.9)
    })
  }
})
