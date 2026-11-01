import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../../src/lib/inquiry/spam'
import { api, loginAsAdmin, site, tenantId } from '../helpers'

// I16a: the page for architects `/dla-architektow` (block `instArchitects`, ADR-I005): the house
// cross-section (views, layers, hotspots, the card) and the tabs of the sections. Data from
// `pnpm seed` (`seed:instalacje` gives the page its block and the 20 „Nowe rozwiązania”, 12 of them
// published). I16b: checklist, numbers, „Nowe rozwiązania”, developers, law.
const HOST = 'instalacje.localhost'

// I16c: the three forms (saved in `Inquiries` with their category), FAQ, the home teaser, links.
// Own client address per run: the inquiry limit keys on `X-Real-IP` (see software-home spec).
const clientIp = `198.19.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`

async function inquiry(page: Page, name: string) {
  await loginAsAdmin(page)
  const { json } = await api(
    page,
    'GET',
    `/api/inquiries?where[name][equals]=${encodeURIComponent(name)}&depth=0`,
  )
  return (json.docs as Record<string, unknown>[])[0]
}

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

    await page.locator('#hero').getByRole('tab', { name: 'Przed tynkami' }).click()
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

    await page.locator('#hero').getByRole('tab', { name: 'Wszystkie instalacje' }).focus()
    await page.keyboard.press('ArrowLeft')
    await expect(page.locator('#hero').getByRole('tab', { name: 'Przed tynkami' })).toBeFocused()
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
    await page
      .locator('#dla-ciebie')
      .getByRole('tab', { name: /Deweloper/ })
      .click()
    await expect(page.locator('#dla-ciebie [role="tabpanel"]')).toContainText(
      'Zakres dla dewelopera',
    )

    await page
      .locator('#etapy')
      .getByRole('tab', { name: /Wykończenie/ })
      .click()
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

  test('the checklist: 20 items for a house, ticks kept in the browser', async ({ page }) => {
    await open(page)
    const list = page.locator('#checklista')
    await expect(list.locator('.arckt .h3')).toHaveText('20 rzeczy do przewidzenia')
    await list.locator('.arci').first().click()
    await expect(list.locator('.arckp span')).toHaveText('1 / 20')
    // Another object clears the ticks; fewer systems, fewer items.
    await list.getByRole('button', { name: 'Apartament, mieszkanie' }).click()
    await expect(list.locator('.arckp span')).toHaveText(/^0 \//)
    await list.locator('.arci').first().click()
    await page.reload()
    await expect(list.getByRole('button', { name: 'Apartament, mieszkanie' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(list.locator('.arckp span')).toHaveText(/^1 \//)
  })

  test('„Nowe rozwiązania”: filter with counts, previous/next within it', async ({ page }) => {
    await open(page)
    const news = page.locator('#nowosci')
    await news
      .locator('.arnf')
      .getByRole('button', { name: /^Obraz/ })
      .click()
    await expect(news.locator('.arnxpos')).toHaveText(/^1 \/ \d+$/)
    const count = await news.locator('.arnwi').count()
    await news.getByRole('button', { name: 'Następne rozwiązanie' }).click()
    await expect(news.locator('.arnxpos')).toHaveText(`2 / ${count}`)
    await expect(news.locator('.arnxd .eye')).toHaveText('Obraz')
    // Unconfirmed cards (drafts with the boss's note) are not on the page.
    await expect(news).not.toContainText('Głośniki pod gładzią')
  })

  test('developers and law: tabs, no price promise, the legal note', async ({ page }) => {
    await open(page)
    const dev = page.locator('#deweloperzy')
    await dev.getByRole('tab', { name: 'Garaż i parking' }).click()
    await expect(dev.getByRole('tabpanel')).toContainText('Elzab EcoPower')
    await expect(dev).toContainText('Nie obiecujemy, że smart home podniesie cenę lokalu')
    await expect(page.locator('#przepisy')).toContainText('To nie jest porada prawna. Stan na')
    await expect(page.locator('#przepisy .arprc2')).toHaveCount(8)
  })

  test('a card published in the panel shows; one with a marker cannot be published', async ({
    page,
    context,
  }) => {
    await loginAsAdmin(page)
    const tenant = await tenantId(page, 'instalacje')
    const title = `E2E rozwiązanie ${Date.now()}`
    const card = {
      tenant,
      title,
      category: 'wifi',
      type: 'Nowość',
      description: 'Karta dodana przez test e2e.',
      params: [{ label: 'Parametr', value: '1 m' }],
      planItems: [{ text: 'Kabel do szafy' }],
      places: [{ name: 'Dom' }],
      order: 999,
    }
    const marked = await api(page, 'POST', '/api/inst-arch-news', {
      ...card,
      description: 'Opis [SZEF: do potwierdzenia]',
      _status: 'published',
    })
    expect(marked.status).toBe(400)

    const created = await api(page, 'POST', '/api/inst-arch-news', {
      ...card,
      _status: 'published',
    })
    expect(created.status).toBe(201)
    const id = (created.json.doc as { id: number }).id
    try {
      const visitor = await context.newPage()
      await visitor.emulateMedia({ reducedMotion: 'reduce' })
      await visitor.goto(site(HOST, '/dla-architektow'))
      await expect(visitor.locator('#nowosci .arnwi', { hasText: title })).toHaveCount(1)
    } finally {
      await api(page, 'DELETE', `/api/inst-arch-news/${id}`)
    }
  })

  test('„Wyślij rzuty”: asks for what is missing, saves „Architekci · projekt”', async ({
    page,
  }) => {
    await page.setExtraHTTPHeaders({ 'X-Real-IP': clientIp })
    const name = `E2E Architekt ${Date.now()}`
    await open(page)
    const form = page.locator('#wyslij form')
    const send = form.getByRole('button', { name: 'Wyślij do opiekuna' })
    await send.click()
    await expect(form.getByRole('alert')).toContainText('Podaj imię')
    await form.getByLabel('Imię i nazwisko').fill(name)
    await send.click()
    await expect(form.getByRole('alert')).toContainText('numer telefonu')
    await form.getByLabel('Telefon').fill('600 100 200')
    await form.getByRole('button', { name: 'Deweloper' }).click()
    await form.getByLabel('Pracownia lub firma').fill('Pracownia E2E')
    await form.getByLabel('Link do rzutów').fill('https://example.test/rzuty')
    await form.locator('label.consent input').check()
    await page.waitForTimeout(FORM_MIN_FILL_MS + 500)
    await send.click()
    const status = page.locator('#wyslij [role="status"]')
    await expect(status).toContainText('Mamy Twoje zgłoszenie')
    await expect(status).toContainText('Deweloper · Projekt budowlany · Dom')

    const record = await inquiry(page, name)
    try {
      expect(record).toMatchObject({
        line: 'instalacje',
        type: 'contact',
        category: 'Architekci · projekt',
        company: 'Pracownia E2E',
        phone: '600 100 200',
      })
      expect(String(record?.message)).toContain('Link do rzutów: https://example.test/rzuty')
    } finally {
      if (record) await api(page, 'DELETE', `/api/inquiries/${record.id}`)
    }
  })

  test('checklist PDF and news: e-mail without a phone, separate commercial consent', async ({
    page,
  }) => {
    await page.setExtraHTTPHeaders({ 'X-Real-IP': clientIp })
    const stamp = Date.now()
    await open(page)
    const pdf = page.locator('#checklista form')
    await pdf.getByLabel('Imię', { exact: true }).fill(`E2E PDF ${stamp}`)
    await pdf.getByLabel('E-mail', { exact: true }).fill('pdf@pracownia.test')
    await pdf.locator('label.consent input').check()
    const news = page.locator('#nowosci form')
    await news.getByLabel('Imię', { exact: true }).fill(`E2E Nowości ${stamp}`)
    await news.getByLabel('E-mail', { exact: true }).fill('news@pracownia.test')
    const consents = news.locator('label.consent input')
    await consents.nth(0).check()
    // The commercial consent is separate and never pre-ticked (spec §2.7).
    await expect(consents.nth(1)).not.toBeChecked()
    await page.waitForTimeout(FORM_MIN_FILL_MS + 500)
    await news.getByRole('button', { name: 'Zapisz pracownię' }).click()
    await expect(news.getByRole('alert')).toContainText('informacje handlowe')
    await consents.nth(1).check()
    await news.getByRole('button', { name: 'Zapisz pracownię' }).click()
    await expect(page.locator('#nowosci [role="status"]')).toContainText('Zapisane')
    await pdf.getByRole('button', { name: 'Wyślij PDF' }).click()
    await expect(page.locator('#checklista [role="status"]')).toContainText('Wysłane')

    const pdfRecord = await inquiry(page, `E2E PDF ${stamp}`)
    const newsRecord = await inquiry(page, `E2E Nowości ${stamp}`)
    try {
      expect(pdfRecord).toMatchObject({
        category: 'Architekci · checklista PDF',
        email: 'pdf@pracownia.test',
        marketingConsent: false,
      })
      expect(String(pdfRecord?.message)).toContain('Obiekt: Dom jednorodzinny')
      expect(newsRecord).toMatchObject({
        category: 'Architekci · nowości',
        email: 'news@pracownia.test',
        marketingConsent: true,
      })
    } finally {
      for (const r of [pdfRecord, newsRecord]) {
        if (r) await api(page, 'DELETE', `/api/inquiries/${r.id}`)
      }
    }
  })

  test('FAQ, no contact section without a name in the panel, sections in order', async ({
    page,
  }) => {
    await open(page)
    await expect(page.locator('#faq details')).toHaveCount(10)
    // The seed leaves the contact person empty (the boss's data, spec §9).
    await expect(page.locator('#opiekun')).toHaveCount(0)
    const ids = await page.locator('main section[id]').evaluateAll((els) => els.map((e) => e.id))
    expect(ids.indexOf('instalacje')).toBeLessThan(ids.indexOf('nowosci'))
    expect(ids.indexOf('faq')).toBeLessThan(ids.indexOf('wyslij'))
    const types = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((els) => els.map((e) => JSON.parse(e.textContent || '{}')['@type'] as string))
    expect(types).toEqual(
      expect.arrayContaining(['Service', 'BreadcrumbList', 'FAQPage', 'ItemList']),
    )
  })

  test('the home teaser and links from other pages lead here', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(site(HOST, '/'))
    const teaser = page.locator('#architekci')
    await expect(teaser.locator('.ars.compact')).toHaveCount(1)
    await expect(teaser.locator('.arlayers')).toHaveCount(0)
    await expect(
      teaser.getByRole('link', { name: 'Współpraca dla architektów →' }),
    ).toHaveAttribute('href', '/dla-architektow')
    for (const path of ['/monitoring', '/dla-kogo/deweloperzy']) {
      await page.goto(site(HOST, path))
      await expect(page.locator('#powiazane a[href="/dla-architektow"]')).toHaveCount(1)
    }
    await page.goto(site(HOST, '/dla-kogo/dom'))
    await expect(page.locator('#powiazane a[href="/dla-architektow"]')).toHaveCount(0)
  })
})
