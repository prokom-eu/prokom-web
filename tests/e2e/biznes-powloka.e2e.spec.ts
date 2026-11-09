import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { openInquiryDrawer, site } from './helpers'

// D3-B PR 1a (docs/zadania/prokombiznes-0611.md §8.1 pkt 1, 2, 4, 6, 7, 8): prokombiznes.pl on the
// shared shell — brand bar, header capsule with „Oferta ▾”, side rail from 1400 px, shared
// footer, bottom bar with „Zapytanie” in the centre (decyzja 08.11) and the menu sheet.
// The shared components themselves: wspolne-*.e2e.spec.ts. Data from `pnpm seed`.

const biznes = (path = '/') => site('biznes.localhost', path)
const capsule = (page: Page) => page.locator('[data-site-header]')

test.describe('Biznes shell — computer', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('brand bar: the PRO-KOM lines, Konfigurator and the Biznes phone', async ({ page }) => {
    await page.goto(biznes())
    const bar = page.locator('[data-brand-bar]')
    const lines = bar.getByRole('navigation', { name: 'Linie PRO-KOM' })
    await expect(lines.getByRole('link', { name: /Biznes/ })).toHaveAttribute('aria-current', /.+/)
    await expect(bar.getByRole('link', { name: /Konfigurator/ })).toHaveAttribute(
      'href',
      '/konfigurator',
    )
    await expect(bar.getByRole('link', { name: /889 003 889/ })).toHaveAttribute('href', /^tel:/)
  })

  test('capsule: the K4 menu from the panel, the search and „Zapytanie” with the count', async ({
    page,
  }) => {
    await page.goto(biznes('/opieka-it'))
    const nav = capsule(page).getByRole('navigation', { name: 'Menu główne' })
    await expect(nav.getByRole('listitem')).toHaveText([
      /Oferta/,
      'Marki',
      'Opieka IT',
      'GoPOS',
      'InsERT',
      'O firmie',
      'Kontakt',
    ])
    await expect(nav.getByRole('link', { name: 'Opieka IT' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(capsule(page).locator('.cap-cta')).toContainText(/Zapytanie\s*0/)
  })

  test('„Oferta ▾” opens the panel, Esc closes it and returns the focus', async ({ page }) => {
    await page.goto(biznes())
    const trigger = capsule(page).getByRole('button', { name: /^Oferta/ })
    await expect(async () => {
      await trigger.click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true', { timeout: 1000 })
    }).toPass()
    await expect(page.locator('#oferta-mega')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('#oferta-mega')).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('the loupe opens the catalog search', async ({ page }) => {
    await page.goto(biznes())
    await expect(async () => {
      await capsule(page).getByRole('button', { name: 'Szukaj w ofercie' }).click()
      await expect(page.getByRole('dialog', { name: /Szukaj/ })).toBeVisible({ timeout: 1000 })
    }).toPass()
  })

  test('„Zapytanie” in the capsule opens the inquiry drawer', async ({ page }) => {
    await page.goto(biznes('/oferta'))
    await openInquiryDrawer(
      page,
      capsule(page).locator('.cap-cta'),
      page.getByRole('dialog', { name: /^Twoje zapytanie/ }),
    )
    await expect(page).toHaveURL(/\/oferta$/)
  })

  test('side rail: the home sections from the panel and „Na tej stronie” on a subpage', async ({
    page,
  }) => {
    await page.goto(biznes())
    const rail = page.locator('[data-site-rail]')
    await expect(rail.locator('a[href="#oferta"]')).toBeAttached()
    await expect(rail.locator('a[href="#kontakt"]')).toBeAttached()
    // A subpage gets the group from three marked sections up (`data-rail-section`): GoPOS has four.
    await page.goto(biznes('/gopos'))
    await expect(rail.getByRole('group', { name: 'Na tej stronie' })).toBeAttached()
  })

  test('home page: the capsule pill follows the section being read (§8.1 pkt 2)', async ({
    page,
  }) => {
    await page.goto(biznes())
    const nav = capsule(page).getByRole('navigation', { name: 'Menu główne' })
    const marked = nav.locator('[data-spy]')
    // Section top 200 px under the window's top edge: past the rail's 40% line.
    const readAt = async (id: string) =>
      page.evaluate((anchor) => {
        const section = document.getElementById(anchor)!
        window.scrollTo({
          top: section.getBoundingClientRect().top + window.scrollY - 200,
          behavior: 'instant',
        })
      }, id)
    await readAt('zaopatrzenie')
    await expect(marked).toHaveAttribute('data-cap-key', 'oferta')
    await expect(nav.locator('.cap-pill')).toHaveAttribute('data-on', '')
    await readAt('marki')
    await expect(marked).toHaveAttribute('data-cap-key', '/marki')
    await readAt('kontakt')
    await expect(marked).toHaveAttribute('data-cap-key', '/kontakt')
    // A section no entry stands for hides the pill.
    await readAt('plan')
    await expect(marked).toHaveCount(0)
    await expect(nav.locator('.cap-pill')).not.toHaveAttribute('data-on', '')
    // Subpages keep `aria-current="page"` and have no pill.
    await page.goto(biznes('/marki'))
    await expect(nav.locator('.cap-pill')).toHaveCount(0)
    await expect(nav.getByRole('link', { name: 'Marki' })).toHaveAttribute('aria-current', 'page')
    // Back home by a client navigation: the sections arrive after the frame, the pill still works.
    await capsule(page)
      .getByRole('link', { name: /strona główna/ })
      .click()
    await expect(page).toHaveURL(biznes())
    await page.locator('#marki').waitFor()
    await readAt('marki')
    await expect(marked).toHaveAttribute('data-cap-key', '/marki')
  })

  test('footer: the panel columns, the lines band and the legal bar', async ({ page }) => {
    await page.goto(biznes())
    const footer = page.locator('[data-site-footer]')
    for (const heading of ['Oferta', 'Usługi', 'Firma']) {
      await expect(footer.getByRole('navigation', { name: heading }).first()).toBeAttached()
    }
    await expect(footer).toContainText('kontakt@prokombiznes.pl')
    await expect(footer).toContainText('Oferta skierowana do przedsiębiorców')
    await expect(footer).not.toContainText(/WhatsApp/i)
  })

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`axe passes with „Oferta ▾” open — ${colorScheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme })
      await page.goto(biznes())
      await expect(async () => {
        await capsule(page)
          .getByRole('button', { name: /^Oferta/ })
          .click()
        await expect(page.locator('#oferta-mega')).toBeVisible({ timeout: 1000 })
      }).toPass()
      const results = await new AxeBuilder({ page }).include('[data-site-header]').analyze()
      expect(results.violations).toEqual([])
    })
  }
})

for (const width of [1400, 1180, 1024, 390, 360]) {
  test(`Biznes shell fits ${width} px without scrolling sideways`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(biznes())
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    )
  })
}

test.describe('Biznes shell — phone', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('bottom bar: Główna · Oferta · Zapytanie in the centre · Kontakt · Menu', async ({
    page,
  }) => {
    await page.goto(biznes('/oferta'))
    const bar = page.getByRole('navigation', { name: 'Pasek aplikacji' })
    await expect(bar.getByRole('link', { name: /Zapytanie/ })).toHaveAttribute('href', '/zapytanie')
    await expect(bar.getByRole('link', { name: 'Oferta' })).toHaveAttribute('aria-current', 'page')
    await expect(bar.getByRole('button', { name: 'Menu' })).toBeVisible()
  })

  test('the menu sheet lists the departments with their categories', async ({ page }) => {
    await page.goto(biznes())
    await expect(async () => {
      await capsule(page).getByRole('button', { name: 'Menu' }).click()
      await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible({ timeout: 1000 })
    }).toPass()
    const sheet = page.getByRole('dialog', { name: 'Menu' })
    const department = sheet.locator('details').first()
    await department.locator('summary').click()
    await expect(department.getByRole('link').first()).toBeVisible()
  })

  for (const path of ['/', '/opieka-it', '/oferta/kasy-fiskalne']) {
    test(`the footer folds its columns and stays under 1300 px on ${path} (D15)`, async ({
      page,
    }) => {
      await page.goto(biznes(path))
      const height = await page
        .locator('[data-site-footer]')
        .evaluate((footer) => footer.getBoundingClientRect().height)
      // D15: ~2000 px with the K4 footer; the target ≤ ~900 px needs the shared footer to fold
      // its contact column and lines band on a phone (order for F, docs/STAN.md).
      expect(height).toBeLessThan(1300)
    })
  }
})

// Software is on the shared capsule too since SWA5a (its own „Oferta ▾”: software-frame).
test('Instalacje keeps its own mega menus', async ({ page }) => {
  await page.goto(site('instalacje.localhost', '/'))
  await expect(page.locator('#oferta-mega')).toHaveCount(0)
})
