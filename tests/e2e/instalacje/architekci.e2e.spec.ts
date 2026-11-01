import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

import { site } from '../helpers'

// I16a: the page for architects `/dla-architektow` (block `instArchitects`, ADR-I005): the house
// cross-section (views, layers, hotspots, the card) and the tabs of the sections. Data from
// `pnpm seed` (`seed:instalacje` gives the page its block).
const HOST = 'instalacje.localhost'

async function open(page: Page, motion: 'reduce' | 'no-preference' = 'reduce') {
  await page.emulateMedia({ reducedMotion: motion })
  const response = await page.goto(site(HOST, '/dla-architektow'))
  expect(response?.status()).toBe(200)
}

test.describe('Instalacje page for architects', () => {
  test.use({ viewport: { width: 1440, height: 1000 } })

  test('the cross-section: views, a hotspot and a layer change the card', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text())
    })
    await open(page)
    const scene = page.locator('#hero .ars')
    // Reduced motion: straight to „Wszystkie instalacje”, hotspot 1 (spec §4).
    await expect(scene).toHaveClass(/m-in/)
    await expect(page.locator('.arinfot b')).toHaveText('Kamera pod okapem')

    await page.getByRole('tab', { name: 'Przed tynkami' }).click()
    await expect(scene).toHaveClass(/m-ty/)

    await page.getByRole('button', { name: '7. Punkt Wi-Fi w suficie' }).click()
    await expect(page.locator('.arinfot b')).toHaveText('Punkt Wi-Fi w suficie')
    await expect(page.locator('.arinfo')).toContainText('PoE')

    // Switching its layer off moves the card to the first visible hotspot.
    await page.locator('.arlayers').getByRole('button', { name: 'Sieć i Wi-Fi' }).click()
    await expect(scene).toHaveClass(/off-wifi/)
    await expect(page.locator('.arinfot b')).toHaveText('Kamera pod okapem')

    await page.getByRole('button', { name: 'Następny punkt' }).click()
    await expect(page.locator('.arinfot b')).toHaveText('Wideodomofon przy furtce')
    expect(errors).toEqual([])
  })

  test('hotspots and view tabs work from the keyboard', async ({ page }) => {
    await open(page)
    await page.getByRole('button', { name: '5. Szklany panel Ampio' }).focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('.arinfot b')).toHaveText('Szklany panel Ampio')

    await page.getByRole('tab', { name: 'Wszystkie instalacje' }).focus()
    await page.keyboard.press('ArrowLeft')
    await expect(page.getByRole('tab', { name: 'Przed tynkami' })).toBeFocused()
    await expect(page.locator('#hero .ars')).toHaveClass(/m-ty/)
  })

  test('without reduced motion the scene starts on „Gotowy dom” and plays', async ({ page }) => {
    await open(page, 'no-preference')
    const scene = page.locator('#hero .ars')
    await expect(scene).toHaveClass(/m-kl/)
    await expect(scene).toHaveClass(/m-in/, { timeout: 6000 })
  })

  test('the section tabs switch their panels', async ({ page }) => {
    await open(page)
    await page.getByRole('tab', { name: /Deweloper/ }).click()
    await expect(page.locator('#dla-ciebie [role="tabpanel"]')).toContainText(
      'Zakres dla dewelopera',
    )

    await page.getByRole('tab', { name: /Wykończenie/ }).click()
    await expect(page.locator('#etapy [role="tabpanel"]')).toContainText('Montaż urządzeń')

    const services = page.locator('#instalacje [role="tablist"]')
    await services.getByRole('tab').nth(2).click()
    await expect(page.locator('#instalacje [role="tabpanel"]')).toContainText('Monitoring')
    await expect(
      page.locator('#instalacje [role="tabpanel"] a', { hasText: 'Pełna strona' }),
    ).toHaveAttribute('href', '/monitoring')
  })

  test('has no accessibility violations in the hero and the tabs', async ({ page }) => {
    await open(page)
    const { violations } = await new AxeBuilder({ page })
      .include('#hero')
      .include('#dla-ciebie')
      .include('#etapy')
      .include('#instalacje')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(violations.map((v) => v.id)).toEqual([])
  })
})
