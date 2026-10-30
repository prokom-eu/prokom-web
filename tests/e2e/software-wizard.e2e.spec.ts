import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../src/lib/inquiry/spam'
import { api, loginAsAdmin, site } from './helpers'

// SW7 / SWR4a: the wizard `/dobierz` (spec. §6.3, §7, board `Kreator`). Rules from `pnpm seed`
// (`kreator.json` v22 + the board-script rules), prices from the seeded solutions. The v22 layout
// and the paths of `stany/kreator-*` come with SWR4b — this spec keeps the SW7 checks on v22 data.
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const HOST = 'software.localhost'
const PATH = '/dobierz'

const main = (page: Page) => page.getByRole('main')
const tile = (page: Page, name: string) =>
  main(page).getByRole('button', { name: new RegExp(`^${name}`) })
const button = (page: Page, name: string | RegExp) => main(page).getByRole('button', { name })
const title = (page: Page) => main(page).getByRole('heading', { level: 2 }).first()
const price = (page: Page) => page.locator('[data-wizard-price]')
const term = (page: Page) => page.locator('[data-wizard-term]')
const send = (page: Page) => button(page, 'Wyślij mi wycenę na piśmie →')
const showResult = (page: Page) => button(page, 'Pokaż wynik →')

type Path = {
  id: string
  walk: (page: Page) => Promise<void>
  result: string
  price: RegExp
  /** Ticked „więcej” and the add-on clicked in the result, if any. */
  more?: string
  addOn?: string
}

/** The clicks of the boards 50–52, up to the result. */
const PATHS: Path[] = [
  {
    id: '50 strona pensjonatu',
    walk: async (page) => {
      await expect(tile(page, 'Strona dla firmy')).toContainText(/od 1\s999 zł/)
      await tile(page, 'Strona dla firmy').click()
      await button(page, 'Pensjonat, hotel, apartamenty').click()
      await expect(title(page)).toHaveText('Jeszcze trzy szczegóły')
      await expect(page.locator('[data-wizard-scope-price]')).toHaveText(
        /^od 1\s999 zł netto · od 2 tygodni$/,
      )
      await button(page, 'Starą stronę').click()
      await button(page, 'Rezerwacja z zaliczką online').click()
      await main(page)
        .getByLabel(/Opisz po swojemu/)
        .fill('Goście dzwonią o wolne pokoje, chcę, żeby sprawdzali sami online.')
      await showResult(page).click()
    },
    result: 'Strona dla pensjonatu lub hotelu',
    price: /^od 1\s999 zł netto$/,
    more: 'Rezerwacja z zaliczką online',
    addOn: 'Opieka nad stroną',
  },
  {
    id: '51 program zlecenia',
    walk: async (page) => {
      await tile(page, 'Program dla firmy').click()
      await button(page, /^Zlecenia na kartkach/).click()
      await expect(main(page).getByText('Plik możesz dosłać mailem po kontakcie.')).toBeVisible()
      await showResult(page).click()
    },
    result: 'System zleceń i grafik ekip',
    price: /^od 3\s490 zł netto$/,
  },
  {
    id: '52 odświeżenie',
    walk: async (page) => {
      await tile(page, 'Przebudowa starej strony').click()
      // Several answers: „Dalej” waits for the first one.
      await expect(button(page, 'Dalej →')).toHaveAttribute('aria-disabled', 'true')
      for (const issue of [
        'Wolno się ładuje',
        'Źle wygląda na telefonie',
        'Nikt jej nie znajduje',
      ]) {
        await button(page, new RegExp(`^${issue}`)).click()
      }
      await button(page, 'Dalej →').click()
      await main(page).getByLabel('Adres obecnej strony').fill('stara-firma.pl')
      await showResult(page).click()
    },
    result: 'Przebudowa starej strony',
    price: /^od 1\s499 zł netto$/,
  },
]

// Own client address per sending test (benchmark range 198.18.0.0/15, random per run): the limit
// of 5 inquiries per 10 minutes keys on `X-Real-IP` (the proxy sets it), so these sends never use
// up the limit of other specs, nor of the previous local run.
const runOctet = Math.floor(Math.random() * 250)
let clientIp = 1

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]) {
  test.describe(`Software wizard at ${viewport.width} px`, () => {
    test.use({ viewport })

    for (const path of PATHS) {
      test(`${path.id}: result, price, error and sending`, async ({ page }) => {
        await page.setExtraHTTPHeaders({ 'X-Real-IP': `198.18.${runOctet}.${clientIp++}` })
        const name = `E2E kreator SW7 ${viewport.width} ${path.id} ${Date.now()}`
        await page.goto(site(HOST, PATH))
        await path.walk(page)
        await expect(title(page)).toHaveText(path.result)
        await expect(price(page)).toHaveText(path.price)
        if (path.more) {
          await expect(page.locator('[data-wizard-to-quote]')).toContainText(path.more)
        }
        if (path.addOn) await button(page, new RegExp(`^${path.addOn}`)).click()

        if (viewport.width === 1440) {
          // The two columns of the result end together (spec. §6.3).
          const heights = await page.evaluate(() =>
            ['left', 'right'].map(
              (side) =>
                document.querySelector(`[data-wizard-column="${side}"]`)!.getBoundingClientRect()
                  .height,
            ),
          )
          expect(Math.abs(heights[0]! - heights[1]!)).toBeLessThanOrEqual(1)
        } else {
          // Phone: the preview waits under its toggle (stany/87c–d).
          const toggle = button(page, 'Pokaż podgląd projektu')
          await expect(toggle).toHaveAttribute('aria-expanded', 'false')
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth),
          ).toBeLessThanOrEqual(viewport.width)
        }

        // Errors of the board (stany/50–52-5-blad): contact first, then the consent.
        await send(page).click()
        await expect(
          main(page).getByText('Podaj telefon albo e-mail, żebyśmy mogli wysłać wycenę.').first(),
        ).toBeVisible()
        await expect(main(page).getByPlaceholder('Telefon albo e-mail')).toBeFocused()
        await expect(
          main(page).getByText('Zaznacz zgodę na kontakt w sprawie wyceny.').first(),
        ).toBeVisible()

        await main(page).getByPlaceholder('Imię').fill(name)
        await main(page).getByPlaceholder('Telefon albo e-mail').fill('e2e-kreator@example.test')
        await main(page)
          .getByRole('checkbox', { name: /Wyrażam zgodę/ })
          .check()
        await main(page).getByRole('button', { name: 'E-mail', exact: true }).click()
        // The server refuses forms sent faster than a person can fill them (spam protection).
        await page.waitForTimeout(FORM_MIN_FILL_MS + 500)
        await send(page).click()
        const success = main(page).getByRole('status').filter({ hasText: 'Wycena jest w drodze' })
        await expect(success).toContainText(/Wysłane · PKS-\d{4}-\d{4}/i)
        await expect(success).toContainText('W ciągu 1 dnia roboczego napiszemy')
        // Changing an add-on after sending keeps the card: no second inquiry by accident.
        await button(page, /^Powiadomienia SMS|^Darmowy audyt|^Aplikacja dla ekip/)
          .first()
          .click()
        await expect(success).toBeVisible()
        await expect(send(page)).toHaveCount(0)

        await loginAsAdmin(page)
        const { json } = await api(
          page,
          'GET',
          `/api/inquiries?where[name][equals]=${encodeURIComponent(name)}&depth=0`,
        )
        const record = (json.docs as Record<string, unknown>[])[0]
        try {
          expect(record).toMatchObject({
            line: 'software',
            type: 'wizard',
            email: 'e2e-kreator@example.test',
            preferredContact: 'email',
          })
          expect(record?.message).toMatch(new RegExp(`^Kreator: ${path.result}\n`))
          expect(record?.wizard).toMatchObject({ Polecamy: path.result })
          if (path.more) expect(record?.message).toContain(`+ do wyceny: ${path.more}`)
          // The result, then the added add-on (a solution of this site).
          expect(record?.items).toEqual(
            [path.result, ...(path.addOn ? [path.addOn] : [])].map(() =>
              expect.objectContaining({ nameSnapshot: expect.any(String), quantity: 1 }),
            ),
          )
          if (path.id.startsWith('52')) {
            expect(record?.auditUrl).toBe('https://stara-firma.pl/')
          }
        } finally {
          if (record) await api(page, 'DELETE', `/api/inquiries/${record.id}`)
        }
      })
    }
  })
}

test.describe('Software wizard', () => {
  test('is not on the other lines', async ({ page }) => {
    for (const host of ['biznes.localhost', 'instalacje.localhost']) {
      expect((await page.goto(site(host, PATH)))?.status(), host).toBe(404)
    }
  })

  test('„opisz po swojemu” has three steps and ends with free advice', async ({ page }) => {
    await page.goto(site(HOST, PATH))
    await button(page, /^Wolisz opisać po swojemu/).click()
    await expect(title(page)).toContainText('Opisz po swojemu')
    await expect(
      main(page)
        .getByRole('listitem')
        .filter({ hasText: /^3\s*Wynik$/ }),
    ).toHaveCount(1)
    await expect(button(page, /^3\s*Wynik/)).toBeDisabled()
    await showResult(page).click()
    await expect(title(page)).toHaveText('Rozmowa i propozycja na piśmie')
    await expect(price(page)).toHaveText('Bezpłatnie')
  })

  test('the shop hint switches a shop’s firm page to the online shop and back', async ({
    page,
  }) => {
    await page.goto(site(HOST, `${PATH}?potrzeba=firm&firma=handel`))
    await button(page, /^Chcesz sprzedawać online\?/).click()
    await expect(page.locator('[data-wizard-scope-price]')).toHaveText(
      /^od 8\s990 zł netto · od 5 tygodni$/,
    )
    await button(page, /^Wolisz stronę z ofertą/).click()
    await expect(page.locator('[data-wizard-scope-price]')).toHaveText(/^od 2\s490 zł netto/)
  })

  test('a server error is announced: its box takes the focus', async ({ page }) => {
    await page.route('**/api/inquiry', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }),
    )
    await page.goto(site(HOST, `${PATH}?potrzeba=wiz&firma=bud`))
    await showResult(page).click()
    await main(page).getByPlaceholder('Telefon albo e-mail').fill('600 100 200')
    await main(page)
      .getByRole('checkbox', { name: /Wyrażam zgodę/ })
      .check()
    await send(page).click()
    const focused = page.locator(':focus')
    await expect(focused).toHaveAttribute('tabindex', '-1')
    await expect(focused).not.toBeEmpty()
    // The form stays, nothing was sent.
    await expect(send(page)).toBeVisible()
  })

  test('55: an app has no price in the panel → „Zapytaj o wycenę”', async ({ page }) => {
    await page.goto(site(HOST, `${PATH}?potrzeba=app`))
    await button(page, /^Dla pracowników w terenie/).click()
    await showResult(page).click()
    await expect(title(page)).toHaveText('Aplikacja na telefon')
    await expect(price(page)).toHaveText('Zapytaj o wycenę')
    await expect(term(page)).toHaveText('po krótkiej rozmowie')
  })

  test('the address presets steps: ?potrzeba= and ?firma=, unknown values ignored', async ({
    page,
  }) => {
    await page.goto(site(HOST, `${PATH}?potrzeba=firm&firma=nocleg`))
    await expect(title(page)).toHaveText('Jeszcze trzy szczegóły')
    await page.goto(site(HOST, `${PATH}?firma=bud`))
    await expect(title(page)).toHaveText('Jeszcze trzy szczegóły')
    await page.goto(site(HOST, `${PATH}?tryb=opis`))
    await expect(title(page)).toContainText('Opisz po swojemu')
    await page.goto(site(HOST, `${PATH}?potrzeba=nie-ma`))
    await expect(title(page)).toHaveText('Czego potrzebujesz?')
  })

  test('54: the dark result of a CRM passes axe; the start does too', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
    await page.goto(site(HOST, `${PATH}?potrzeba=prog&firma=klienci`))
    await showResult(page).click()
    await expect(title(page)).toHaveText('CRM dla małej i średniej firmy')
    const result = await new AxeBuilder({ page }).withTags(WCAG).analyze()
    expect(
      result.violations.map((v) => ({ rule: v.id, targets: v.nodes.map((n) => n.target) })),
    ).toEqual([])
  })
})
