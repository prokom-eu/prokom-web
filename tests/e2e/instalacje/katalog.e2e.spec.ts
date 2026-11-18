import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { setTheme, site } from '../helpers'
import { INST_HOST } from './pages'

// INST-K1 (ADR-029): the catalog of prokominstalacje.pl on the engine of Biznes — its own cards,
// texts and inquiry list; never a Biznes card on this domain. Data from `pnpm seed`
// (`seed/prokominstalacje/katalog/`).
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const PRODUCT = '/produkt/dahua-ipc-hfw2x49s-s-il'
const inst = (path: string) => site(INST_HOST, path)

test.describe('Instalacje catalog (INST-K1)', () => {
  test('/oferta: the line’s heading, cards and planner link, no Biznes text', async ({ page }) => {
    const response = await page.goto(inst('/oferta'))
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveText('Sprzęt do monitoringu, alarmów i domofonów')
    await expect(page).toHaveTitle(/\| PRO-KOM Instalacje$/)
    const main = page.locator('main')
    await expect(main.getByRole('link', { name: 'Zaplanuj instalację' }).first()).toHaveAttribute(
      'href',
      '/zaplanuj',
    )
    await expect(main).not.toContainText(/Posnet|kasa mobilna|Subiekt|konfigurator/i)
    // One kind of item: no „Sprzęt / Programy / Usługi” segment.
    await expect(main.getByRole('group', { name: 'Rodzaj' })).toHaveCount(0)
  })

  test('a product page has no price and the Instalacje service strip', async ({ page }) => {
    const response = await page.goto(inst(PRODUCT))
    expect(response?.status()).toBe(200)
    const main = page.locator('main')
    await expect(main).toContainText('Gwarancja na montaż')
    await expect(main).not.toContainText(/\d\s?zł|PLN|stanowisk i programy/)
  })

  test('a Biznes card is 404 on the Instalacje domain', async ({ page }) => {
    const response = await page.goto(inst('/produkt/posnet-ergo-online'))
    expect(response?.status()).toBe(404)
  })

  // INST-K2 (ADR-029 pkt 6): the brands of Instalacje lead to its own salons; a brand without a
  // salon here has no page — never the Biznes text of the shared brand page.
  test('/marki lists the Instalacje brands with its own copy', async ({ page }) => {
    const response = await page.goto(inst('/marki'))
    expect(response?.status()).toBe(200)
    const main = page.locator('main')
    await expect(main).toContainText('monitoring, alarmy, domofony')
    await expect(main).not.toContainText(/kas fiskalnych|Posnet/)
    await expect(main.getByRole('searchbox')).not.toHaveAttribute('placeholder', /Posnet/)
    // A brand without a salon still lists its cards: to the offer filtered by it.
    await expect(main.locator('a[href="/oferta?marka=edbak"]').first()).toBeVisible()
    await expect(main.getByRole('link', { name: /Dahua/ }).first()).toHaveAttribute(
      'href',
      '/marki/dahua',
    )
  })

  test('the Dahua salon renders; a brand without a salon is 404', async ({ page }) => {
    const salon = await page.goto(inst('/marki/dahua'))
    expect(salon?.status()).toBe(200)
    await expect(page.locator('main')).toContainText('DMSS')
    const noSalon = await page.goto(inst('/marki/edbak'))
    expect(noSalon?.status()).toBe(404)
  })

  test('the header leads to „Sprzęt”, not „Serwis” (D12)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(inst('/'))
    const header = page.locator('[data-site-header]')
    await expect(header.getByRole('link', { name: 'Sprzęt', exact: true })).toHaveAttribute(
      'href',
      '/oferta',
    )
    await expect(header.getByRole('link', { name: 'Serwis', exact: true })).toHaveCount(0)
  })

  // INST-K2 (D17): „Sprzęt i marki” on the home page — departments, salons, eight cards, the planner.
  test('the home page shows „Sprzęt i marki” with departments, salons and eight cards', async ({
    page,
  }) => {
    await page.goto(inst('/'))
    const section = page.locator('#sprzet')
    await expect(section.getByRole('heading', { level: 2 })).toContainText('Sprzęt')
    await expect(section.locator('.isp-dep')).toHaveCount(4)
    await expect(section.getByRole('link', { name: 'Dahua', exact: true })).toHaveAttribute(
      'href',
      '/marki/dahua',
    )
    await expect(section.locator('.isp-feat-list > li')).toHaveCount(8)
    await expect(section.getByRole('link', { name: 'Cały sprzęt' })).toHaveAttribute(
      'href',
      '/oferta',
    )
    await expect(section).not.toContainText(/\d\s?zł|PLN/)
  })

  for (const theme of ['light', 'dark'] as const) {
    test(`axe WCAG AA on the home „Sprzęt i marki” (${theme})`, async ({ page }) => {
      await setTheme(page, theme)
      await page.goto(inst('/'))
      await page.locator('#sprzet').scrollIntoViewIfNeeded()
      const { violations } = await new AxeBuilder({ page })
        .include('#sprzet')
        .withTags(WCAG)
        .analyze()
      expect(violations).toEqual([])
    })
  }

  test('the phone rows of „Sprzęt i marki” never scroll the page sideways', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(inst('/'))
    await page.locator('#sprzet').scrollIntoViewIfNeeded()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })

  // INST-K2 streaming: a service page leads to its equipment; streaming solutions in /uslugi.
  test('Nagłośnienie leads to the streaming equipment („Zobacz sprzęt”)', async ({ page }) => {
    await page.goto(inst('/naglosnienie'))
    const section = page.locator('#sprzet-uslugi')
    await expect(section).toContainText('Sprzęt do tej usługi')
    await expect(section.getByRole('link', { name: 'Zobacz sprzęt' })).toHaveAttribute(
      'href',
      '/oferta/streaming',
    )
    await expect(section).not.toContainText(/\d\s?zł|PLN/)
  })

  test('/uslugi lists the streaming solutions', async ({ page }) => {
    await page.goto(inst('/uslugi'))
    await expect(page.locator('main')).toContainText('Transmisje sesji rady gminy')
  })

  for (const theme of ['light', 'dark'] as const) {
    for (const path of ['/oferta', PRODUCT, '/marki', '/marki/dahua']) {
      test(`axe WCAG AA on ${path} (${theme})`, async ({ page }) => {
        await setTheme(page, theme)
        await page.goto(inst(path))
        const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
        expect(violations).toEqual([])
      })
    }
  }
})
