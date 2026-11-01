import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../src/lib/inquiry/spam'
import { api, loginAsAdmin, site } from './helpers'

// SWR4: the wizard v22 `/dobierz` (spec. §6.3, §7, ZMIANY-v21 §3, §10.3, §11.2, board `Kreator`).
// The paths of `stany/kreator-d-a…f` (desktop) and `kreator-m-a/b` (phone) with the same clicks:
// one „od” price and term, „więcej” to quote, add-ons, the error, sending and the success. Rules
// from `pnpm seed` (`kreator.json` v22 + the board-script rules), prices from the seeded solutions.
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
const scopePrice = (page: Page) => page.locator('[data-wizard-scope-price]')
const bar = (page: Page) => page.locator('[data-wizard-bar]')
const submit = (page: Page) => main(page).locator('form button[type="submit"]')
const isPhone = (page: Page) => (page.viewportSize()?.width ?? 1440) <= 1080

/** The next step: the button under the step on the desktop, the price bar on the phone. */
async function next(page: Page, desktopName: string) {
  if (isPhone(page)) await bar(page).getByRole('button').click()
  else await button(page, desktopName).click()
}

type Path = {
  id: string
  walk: (page: Page) => Promise<void>
  result: string
  price: RegExp
  term: RegExp
  /** Ticked „więcej” and the add-on added in the result, if any. */
  more?: string
  addOn?: string
}

/** The clicks of the boards d-a, d-b, d-c (and m-a on the phone), up to the result. */
const PATHS: Path[] = [
  {
    id: 'kreator-d-a pensjonat',
    walk: async (page) => {
      await expect(tile(page, 'Strona dla firmy')).toContainText(/od\s1\s999\szł/)
      await tile(page, 'Strona dla firmy').click()
      await expect(title(page)).toHaveText('Jaka to firma?')
      await button(page, 'Pensjonat, hotel, apartamenty').click()
      await expect(title(page)).toHaveText('Zakres i termin')
      await expect(scopePrice(page)).toContainText(/^od\s1\s999\szł/)
      await main(page).getByLabel('Rezerwacja z zaliczką online').check()
      await button(page, 'Nic, zaczynam od zera').click()
      await button(page, 'Przed sezonem zimowym').click()
      await expect(
        main(page)
          .getByText(/jeśli zaczniemy do\s30\slistopada\./)
          .first(),
      ).toBeVisible()
      await button(page, /^\+ Dodaj kilka słów od siebie/).click()
      await button(page, '+ chcę sam zmieniać treści').click()
      await expect(main(page).getByLabel('Kilka słów od siebie')).toHaveValue(
        'Chcę sam zmieniać treści',
      )
      if (isPhone(page)) {
        // The bar carries the live quote; the bottom tab bar steps aside (ZMIANY-v21 §10.6).
        await expect(bar(page)).toContainText(/od\s1\s999\szł/)
        await expect(page.locator('[data-tab-bar]')).toBeHidden()
      }
      await next(page, 'Pokaż wynik →')
    },
    result: 'Strona dla pensjonatu lub hotelu',
    price: /^od\s1\s999\szł$/,
    term: /^od\s2\stygodni$/,
    more: 'Rezerwacja z zaliczką online',
    addOn: 'Opieka nad stroną',
  },
  {
    id: 'kreator-d-b program',
    walk: async (page) => {
      await tile(page, 'Program dla firmy').click()
      await button(page, /^Zlecenia na kartkach/).click()
      await expect(main(page).getByText('Plik możesz dosłać mailem po kontakcie.')).toBeVisible()
      await button(page, 'Kartki i zeszyty').click()
      await expect(
        main(page)
          .getByText(/jednego modułu dla 5\sosób/)
          .first(),
      ).toBeVisible()
      await next(page, 'Pokaż wynik →')
    },
    result: 'System zleceń i grafik ekip',
    price: /^od\s3\s490\szł$/,
    term: /^od\s3\stygodni$/,
  },
  {
    id: 'kreator-d-c przebudowa',
    walk: async (page) => {
      await tile(page, 'Przebudowa starej strony').click()
      // Several answers: „Dalej” waits for the first one.
      if (!isPhone(page)) {
        await expect(button(page, 'Dalej →')).toHaveAttribute('aria-disabled', 'true')
      }
      for (const issue of [
        'Wolno się ładuje',
        'Źle wygląda na telefonie',
        'Nikt jej nie znajduje',
      ]) {
        await button(page, new RegExp(`^${issue}`)).click()
      }
      await next(page, 'Dalej →')
      await main(page).getByLabel('Adres obecnej strony').fill('stara-firma.pl')
      await expect(
        main(page)
          .getByText(/kilka rzeczy naraz/)
          .first(),
      ).toBeVisible()
      await next(page, 'Pokaż wynik →')
    },
    result: 'Przebudowa starej strony',
    price: /^od\s1\s499\szł$/,
    term: /^od\s2\stygodni$/,
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
  test.describe(`Software wizard v22 at ${viewport.width} px`, () => {
    test.use({ viewport })

    for (const path of PATHS) {
      test(`${path.id}: result, error and sending`, async ({ page }) => {
        await page.setExtraHTTPHeaders({ 'X-Real-IP': `198.18.${runOctet}.${clientIp++}` })
        const name = `E2E kreator SWR4 ${viewport.width} ${Date.now()}`
        await page.goto(site(HOST, PATH))
        await path.walk(page)
        await expect(title(page)).toHaveText(path.result)
        await expect(price(page)).toHaveText(path.price)
        await expect(term(page)).toHaveText(path.term)
        if (path.more) {
          await expect(page.locator('[data-wizard-to-quote]')).toContainText(path.more)
        }
        if (path.addOn) {
          const addOn = button(page, new RegExp(`^${path.addOn}`))
          await addOn.click()
          await expect(addOn).toHaveAttribute('aria-pressed', 'true')
        }
        // „Co od Ciebie”: the counter follows the ticks.
        await main(page)
          .getByRole('group', { name: 'Co będzie potrzebne od Ciebie' })
          .getByRole('checkbox')
          .first()
          .check()
        await expect(main(page).getByText(/^Masz 1 z \d$/)).toBeVisible()

        if (isPhone(page)) {
          // On the result the bar jumps to the quote block (stany kreator-m-a-3, 3c).
          await expect(bar(page).getByRole('button')).toHaveText('Poproś o wycenę ↓')
          await bar(page).getByRole('button').click()
          await expect(main(page).getByLabel('Imię')).toBeFocused()
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth),
          ).toBeLessThanOrEqual(viewport.width)
        }

        // The ticket sums the quote up: what goes to the quote and the add-on.
        const ticket = page.locator('[data-wizard-ticket]')
        await expect(ticket).toContainText(path.result)
        if (path.more) await expect(ticket).toContainText(`+ do wyceny: ${path.more}`)
        if (path.addOn) await expect(ticket).toContainText(`+ ${path.addOn}`)

        // The button is always active; errors at the fields (stany kreator-d-a-4-blad).
        await submit(page).click()
        await expect(main(page).getByText('Wpisz numer telefonu (9 cyfr).')).toBeVisible()
        await expect(main(page).getByLabel('Telefon', { exact: true })).toBeFocused()
        await expect(
          main(page).getByText('Zaznacz zgodę, bez niej nie możemy odpowiedzieć.'),
        ).toBeVisible()

        // „E-mail” changes the field and what it checks.
        await main(page).getByRole('button', { name: 'E-mail', exact: true }).click()
        await main(page).getByLabel('Imię').fill(name)
        await main(page).getByLabel('E-mail', { exact: true }).fill('e2e-kreator@example.test')
        await main(page)
          .getByRole('checkbox', { name: /Wyrażam zgodę/ })
          .check()
        // The server refuses forms sent faster than a person can fill them (spam protection).
        await page.waitForTimeout(FORM_MIN_FILL_MS + 500)
        await submit(page).click()
        const success = main(page).getByRole('status').filter({ hasText: 'Zgłoszenie jest u nas' })
        await expect(success).toContainText(/Wysłane · PKS-\d{4}-\d{4}/i)
        await expect(success).toContainText(`Dziękujemy, ${name}.`)
        await expect(success).toContainText('napiszemy')
        await expect(page.locator('[data-wizard-ticket]')).toContainText('przyjęta')
        // Changing an add-on after sending keeps the card: no second inquiry by accident.
        await main(page)
          .getByRole('button', { name: /^(Powiadomienia SMS|Darmowy audyt|Aplikacja dla ekip)/ })
          .first()
          .click()
        await expect(success).toBeVisible()
        await expect(submit(page)).toHaveCount(0)

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
          expect(record?.message).toMatch(new RegExp(`^Kreator: ${path.result}\\n`))
          expect(record?.wizard).toMatchObject({ 'Twoje rozwiązanie': path.result })
          if (path.more) expect(record?.message).toContain(`+ do wyceny: ${path.more}`)
          if (path.addOn) expect(record?.message).toContain(`+ dodatki: ${path.addOn}`)
          // The result, then the added add-on (a solution of this site).
          expect(record?.items).toEqual(
            [path.result, ...(path.addOn ? [path.addOn] : [])].map(() =>
              expect.objectContaining({ nameSnapshot: expect.any(String), quantity: 1 }),
            ),
          )
          if (path.id.includes('przebudowa')) {
            expect(record?.auditUrl).toBe('https://stara-firma.pl/')
          }
        } finally {
          if (record) await api(page, 'DELETE', `/api/inquiries/${record.id}`)
        }
      })
    }

    test('kreator-d-d: an app has no price → „Zapytaj o wycenę”, written quote', async ({
      page,
    }) => {
      await page.goto(site(HOST, `${PATH}?potrzeba=app`))
      await button(page, /^Dla pracowników w terenie/).click()
      await expect(title(page)).toHaveText('Zakres i termin')
      await expect(
        main(page)
          .getByText(/cenę i termin dostaniesz w\s5–7\sdni/)
          .first(),
      ).toBeVisible()
      await expect(scopePrice(page)).toHaveCount(0)
      await next(page, 'Pokaż wynik →')
      await expect(title(page)).toHaveText('Aplikacja na telefon')
      await expect(price(page)).toHaveText('Zapytaj o wycenę')
      await expect(term(page)).toHaveText('po krótkiej rozmowie')
      await expect(
        main(page)
          .getByText(/w przeglądarce telefonu/)
          .first(),
      ).toBeVisible()
    })

    test('kreator-d-e: „opisz po swojemu” has three steps and ends with free advice', async ({
      page,
    }) => {
      await page.goto(site(HOST, PATH))
      await button(page, /^Nie wiesz, co wybrać\?/).click()
      await expect(title(page)).toContainText('Opisz po swojemu')
      await main(page).getByRole('textbox').fill('Goście dzwonią o wolne pokoje.')
      if (!isPhone(page)) await expect(button(page, /^3\s*Wynik/)).toBeDisabled()
      await next(page, 'Pokaż wynik →')
      await expect(title(page)).toHaveText('Rozmowa i propozycja zakresu')
      await expect(price(page)).toHaveText('Bezpłatnie')
      await expect(main(page).getByText('„Goście dzwonią o wolne pokoje.”')).toBeVisible()
    })
  })
}

test.describe('Software wizard v22', () => {
  test('is not on the other lines', async ({ page }) => {
    for (const host of ['biznes.localhost', 'instalacje.localhost']) {
      expect((await page.goto(site(host, PATH)))?.status(), host).toBe(404)
    }
  })

  test('the shop hint switches a shop’s firm page to the online shop and back', async ({
    page,
  }) => {
    await page.goto(site(HOST, `${PATH}?potrzeba=firm&firma=handel`))
    await button(page, /^Chcesz sprzedawać online\?/).click()
    await expect(scopePrice(page)).toContainText(/^od\s8\s990\szł/)
    await expect(page.locator('[data-wizard-live]')).toContainText('Sklep internetowy')
    await button(page, /^Wolisz stronę z ofertą/).click()
    await expect(scopePrice(page)).toContainText(/^od\s2\s490\szł/)
  })

  test('a server error is announced: its box takes the focus', async ({ page }) => {
    await page.route('**/api/inquiry', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }),
    )
    await page.goto(site(HOST, `${PATH}?potrzeba=wiz&firma=bud`))
    await button(page, 'Pokaż wynik →').click()
    await main(page).getByLabel('Telefon', { exact: true }).fill('600 100 200')
    await main(page)
      .getByRole('checkbox', { name: /Wyrażam zgodę/ })
      .check()
    await submit(page).click()
    const focused = page.locator(':focus')
    await expect(focused).toHaveAttribute('tabindex', '-1')
    await expect(focused).not.toBeEmpty()
    // The form stays, nothing was sent.
    await expect(submit(page)).toBeVisible()
  })

  test('the address presets steps: ?potrzeba= and ?firma=, unknown values ignored', async ({
    page,
  }) => {
    await page.goto(site(HOST, `${PATH}?potrzeba=firm&firma=nocleg`))
    await expect(title(page)).toHaveText('Zakres i termin')
    await page.goto(site(HOST, `${PATH}?firma=bud`))
    await expect(title(page)).toHaveText('Zakres i termin')
    await page.goto(site(HOST, `${PATH}?potrzeba=prog`))
    await expect(title(page)).toHaveText('Co dziś najbardziej przeszkadza?')
    await page.goto(site(HOST, `${PATH}?tryb=opis`))
    await expect(title(page)).toContainText('Opisz po swojemu')
    await page.goto(site(HOST, `${PATH}?potrzeba=nie-ma`))
    await expect(title(page)).toHaveText('Czego potrzebujesz?')
  })

  test('kreator-d-f: the dark start, scope and result pass axe', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
    const axe = async () => {
      const result = await new AxeBuilder({ page }).withTags(WCAG).analyze()
      expect(
        result.violations.map((v) => ({ rule: v.id, targets: v.nodes.map((n) => n.target) })),
      ).toEqual([])
    }
    await page.goto(site(HOST, PATH))
    await axe()
    await page.goto(site(HOST, `${PATH}?potrzeba=firm&firma=nocleg`))
    await main(page).getByLabel('Opinie gości i galeria sezonowa').check()
    await axe()
    await button(page, 'Pokaż wynik →').click()
    await expect(title(page)).toHaveText('Strona dla pensjonatu lub hotelu')
    await axe()
  })

  test('kreator-m-b: the dark phone result passes axe, the bar hides the tab bar', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
    await page.goto(site(HOST, `${PATH}?potrzeba=prog&firma=klienci`))
    await expect(bar(page)).toBeVisible()
    await expect(page.locator('[data-tab-bar]')).toBeHidden()
    await bar(page).getByRole('button').click()
    await expect(title(page)).toHaveText('CRM dla małej i średniej firmy')
    const result = await new AxeBuilder({ page }).withTags(WCAG).analyze()
    expect(
      result.violations.map((v) => ({ rule: v.id, targets: v.nodes.map((n) => n.target) })),
    ).toEqual([])
  })
})
