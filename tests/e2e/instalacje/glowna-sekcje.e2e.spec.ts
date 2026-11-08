import { expect, type Page, test } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../../src/lib/inquiry/spam'
import { api, loginAsAdmin, site } from '../helpers'

// I6: the home sections below the hero (KOMPONENTY §3, spec §5.1/§6, MOBILE-APLIKACJA §10).
// Data from `pnpm seed`: realizations published with the clients' consent (boss 01.11.2026).
const HOST = 'instalacje.localhost'
const SECTIONS = [
  'start',
  'dla-kogo',
  'uslugi',
  'realizacje',
  'gory',
  'proces',
  'serwis',
  'faq',
  'zaplanuj',
]

// Own client address per run: the inquiry limit keys on `X-Real-IP` (see software-home spec).
const clientIp = `198.19.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`

async function open(page: Page, path = '/') {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  return page.goto(site(HOST, path))
}

test.describe('Instalacje home sections', () => {
  test.use({ viewport: { width: 1440, height: 1000 } })

  test('sections in the order of the design, no placeholders, structured data', async ({
    page,
  }) => {
    await open(page)
    const ids = await page.locator('main section[id]').evaluateAll((els) => els.map((e) => e.id))
    expect(ids.filter((id) => SECTIONS.includes(id))).toEqual(SECTIONS)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('.ut2')).toHaveCount(10)
    await expect(page.locator('.obc')).toHaveCount(12)
    await expect(page.locator('#realizacje .rl')).toHaveCount(4)
    // Runda v6 D2: every card has a photo (featured first, then others with photos).
    await expect(page.locator('#realizacje .rl:not(:has(img))')).toHaveCount(0)
    expect(await page.locator('main').innerText()).not.toMatch(/\[[A-ZĄĆĘŁŃÓŚŹŻ ]{3,}[:\]]/)
    const types = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((els) => els.map((e) => JSON.parse(e.textContent ?? '{}')['@type']))
    expect(types).toEqual(expect.arrayContaining(['WebSite', 'FAQPage']))
  })

  // P2-15 (audit 06.11, decision 08.11): „Pokaż na żywo” on none of the cards — the hero has
  // scenes for 6 of 14 objects; the card itself links to the object page.
  test('no „Pokaż na żywo” on the „Dla kogo” cards', async ({ page }) => {
    await open(page)
    await expect(page.locator('#dla-kogo .obc').first()).toBeVisible()
    await expect(page.locator('#dla-kogo').getByText('Pokaż na żywo')).toHaveCount(0)
  })

  test('Podhale cards have scenes and the process says what you get (RUNDA-V5 §5–§6)', async ({
    page,
  }) => {
    await open(page)
    const cards = page.locator('#gory .gor')
    await expect(cards).toHaveCount(6)
    await expect(cards.locator('.gsc svg')).toHaveCount(6)
    await expect(cards.first().locator('.gorfact')).toContainText('−28,5°C')
    const steps = page.locator('#proces .procs')
    await expect(steps).toHaveCount(6)
    await expect(steps.locator('.procg')).toHaveCount(6)
    await expect(steps.last().locator('.procg')).toContainText(/\d+ mies\. gwarancji na montaż/)
    await expect(page.locator('#proces .proctr a')).toHaveAttribute('href', '/zaplanuj')
  })

  // Runda v6 §1.6: with motion the axis plays once on entering the screen and ends full.
  test('the process axis plays once and ends with every node and segment filled', async ({
    page,
  }) => {
    await page.goto(site(HOST, '/'))
    const axis = page.locator('#proces .procw')
    await expect(axis).toHaveAttribute('data-ready', '1')
    await axis.scrollIntoViewIfNeeded()
    await expect(axis).toHaveAttribute('data-on', '1')
    await expect
      .poll(() =>
        axis
          .locator('.procn')
          .evaluateAll((nodes) => nodes.map((n) => getComputedStyle(n, '::before').opacity)),
      )
      .toEqual(['1', '1', '1', '1', '1', '1'])
    await expect
      .poll(() =>
        axis
          .locator('.procs:not(:last-child)')
          .evaluateAll((items) => items.map((i) => getComputedStyle(i, '::after').transform)),
      )
      .toEqual(Array(5).fill('none'))
  })

  // Review of PR3a: on a low screen the tall vertical axis is never 35 % visible — it starts by
  // its position on the screen, so the cards do not stay hidden.
  test('on a low screen the vertical axis still plays and shows every card', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 })
    await page.goto(site(HOST, '/'))
    const axis = page.locator('#proces .procw')
    await axis.scrollIntoViewIfNeeded()
    await page.mouse.wheel(0, 300)
    await expect(axis).toHaveAttribute('data-on', '1')
    await expect
      .poll(() =>
        axis
          .locator('.procc')
          .evaluateAll((cards) => cards.map((c) => getComputedStyle(c).opacity)),
      )
      .toEqual(Array(6).fill('1'))
  })

  // Round v5 (RUNDA-V5 §2): logos instead of names, served through next/image.
  test('the brand band shows 11 logos with their names in alt', async ({ page }) => {
    await open(page)
    const logos = page.locator('.trust .brand img')
    await expect(logos).toHaveCount(11)
    await expect(page.getByRole('img', { name: 'Logo Hikvision' })).toBeVisible()
    await page.locator('.trust').scrollIntoViewIfNeeded()
    // Lazy images: wait until every logo is loaded instead of one read right after the scroll.
    await expect
      .poll(() =>
        logos.evaluateAll((els) =>
          els.every(
            (img) =>
              (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0,
          ),
        ),
      )
      .toBe(true)
    // P1-6 (audit 06.11): every logo is drawn ≥ 24 px tall (11 columns gave Hikvision ~10 px).
    // The proportion from the width/height attributes — known before the file arrives.
    const heights = await logos.evaluateAll((els) =>
      els.map((el) => {
        const img = el as HTMLImageElement
        const box = img.getBoundingClientRect()
        const ratio = Number(img.getAttribute('width')) / Number(img.getAttribute('height'))
        return Math.min(box.height, box.width / ratio)
      }),
    )
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(24)
    // Runda v6 §1.7.3: always in the brand's colours, all tiles of one width.
    const looks = await logos.evaluateAll((els) =>
      els.map((el) => `${getComputedStyle(el).filter} ${getComputedStyle(el).opacity}`),
    )
    expect(new Set(looks)).toEqual(new Set(['none 1']))
    const widths = await page
      .locator('.trust .brand')
      .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().width)))
    expect(new Set(widths).size).toBe(1)
  })

  // RUNDA-V5 §3: the whole card leads to the object page, not only „Zobacz rozwiązania”.
  test('a „Dla kogo” card is one link to its object page', async ({ page }) => {
    await open(page)
    const card = page.locator('.obc', { hasText: 'Kościół' })
    await expect(card.getByRole('link')).toHaveCount(1)
    // The title's link lies over the whole card: a click where the description is hits it.
    await card.locator('.obd').click({ force: true })
    await expect(page).toHaveURL(/\/dla-kogo\/[a-z-]+$/)
  })

  test('the shared side rail marks the section in view, from 1400 px only (L1-I)', async ({
    page,
  }) => {
    await open(page)
    const rail = page.locator('[data-site-rail]')
    await page.locator('#proces').scrollIntoViewIfNeeded()
    await expect(rail.locator('[aria-current="location"]')).toHaveAttribute('href', '#proces')
    await page.setViewportSize({ width: 1399, height: 900 })
    await expect(rail).toBeHidden()
  })

  test('the quick plan form asks in order, then saves an inquiry of this line', async ({
    page,
  }) => {
    await page.setExtraHTTPHeaders({ 'X-Real-IP': clientIp })
    const name = `E2E glowna I6 ${Date.now()}`
    await open(page, '/#zaplanuj')
    const form = page.locator('#zaplanuj')
    const send = form.getByRole('button', { name: 'Zamów oddzwonienie' })
    await send.click()
    await expect(form.getByRole('alert')).toHaveText('Zaznacz przynajmniej jedną instalację.')

    await form.getByRole('button', { name: /Monitoring/ }).click()
    await form.getByRole('button', { name: 'Pensjonat lub apartamenty' }).click()
    await form.getByRole('button', { name: 'Zakopane' }).click()
    await expect(form.locator('.zktl')).toContainText('Zakopane i Tatry')
    await send.click()
    await expect(form.getByRole('alert')).toHaveText(/Podaj imię/)
    await form.getByLabel('Imię').fill(name)
    await form.getByLabel('Telefon').fill('600 100 200')
    await send.click()
    await expect(form.getByRole('alert')).toHaveText('Zaznacz zgodę na kontakt.')
    // The checkbox is visually hidden; its label is what people click.
    await form.locator('label.hzkcons').click()
    await expect(form.getByRole('checkbox')).toBeChecked()

    await page.waitForTimeout(FORM_MIN_FILL_MS + 500)
    await send.click()
    // The thanks replace the form and take the focus (screen readers hear them).
    await expect(form.getByText('Dziękujemy! Oddzwonimy.')).toBeFocused()
    await expect(form.locator('.hzkdone')).toContainText(/PKI-\d{4}-\d{4,}/)

    await loginAsAdmin(page)
    const { json } = await api(
      page,
      'GET',
      `/api/inquiries?where[name][equals]=${encodeURIComponent(name)}&depth=0`,
    )
    const record = (json.docs as Record<string, unknown>[])[0]
    try {
      expect(record).toMatchObject({
        line: 'instalacje',
        type: 'contact',
        category: 'Instalacje — strona główna',
        city: 'Zakopane',
        phone: '600 100 200',
      })
      expect(record?.topics).toHaveLength(1)
      // Service keys since I11 (the e-mail names them).
      expect(String((record?.topics as string[])[0])).toMatch(/^[a-z]+$/)
      expect(String(record?.message)).toContain('Strefa dojazdu: Zakopane i Tatry')
    } finally {
      if (record) await api(page, 'DELETE', `/api/inquiries/${record.id}`)
    }
  })
})

test.describe('Instalacje home sections on a phone', () => {
  for (const width of [360, 390, 414]) {
    test(`no horizontal scroll at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await open(page)
      await page.locator('#zaplanuj').scrollIntoViewIfNeeded()
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    })
  }

  test('form buttons and fields are touch targets of at least 44 px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await open(page)
    for (const target of await page
      .locator('#zaplanuj .hzkb, #zaplanuj .hzko, #zaplanuj .hzkf, #zaplanuj .hzksend')
      .all()) {
      const box = await target.boundingBox()
      expect(box?.height ?? 0, await target.innerText()).toBeGreaterThanOrEqual(40)
    }
  })
})
