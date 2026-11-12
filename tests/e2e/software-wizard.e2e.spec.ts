import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { FORM_MIN_FILL_MS } from '../../src/lib/inquiry/spam'
import { api, loginAsAdmin, site } from './helpers'

// SWA3: the wizard v3 `/dobierz` (ZMIANY-v24 §7, board `AU-kreator`): the kind decides the steps
// (site / redo / sys / auto / idk), the live card follows the choices, the result sends the answers
// and the thanks page shows the PKS number. Rules from `pnpm seed` (`src/seed/software/wizard.ts`),
// prices from the seeded solutions.
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const HOST = 'software.localhost'
const PATH = '/dobierz'

const main = (page: Page) => page.getByRole('main')
const button = (page: Page, name: string | RegExp) => main(page).getByRole('button', { name })
/** A chip or tile by its label (the ✓ / + mark and the number are hidden from the name). */
const option = (page: Page, label: string) => button(page, new RegExp(`^${label}`))
const title = (page: Page) => main(page).locator('[data-wizard-step]').getByRole('heading')
const live = (page: Page) => page.locator('[data-wizard-live]')
const submit = (page: Page) => main(page).locator('form button[type="submit"]')
const sizeQuestion = (page: Page) => main(page).getByText('Ile osób będzie z niego korzystać?')

/** Step 1 — the first click may come before hydration: repeated until the step changes. */
async function chooseKind(page: Page, label: string) {
  await expect(async () => {
    await option(page, label).click()
    await expect(title(page)).toHaveText('Jaka to firma?', { timeout: 1000 })
  }).toPass()
}

type Path = {
  group: string
  kind: string
  walk: (page: Page) => Promise<void>
  /** Live price after the walk. */
  price: RegExp
  /** Name of the item saved with the inquiry (the kind's solution), none without one. */
  item?: string
  answers: Record<string, unknown>
  auditUrl?: string
}

const PATHS: Path[] = [
  {
    group: 'site',
    kind: 'Strona firmowa',
    walk: async (page) => {
      await option(page, 'Pensjonat, hotel, apartamenty').click()
      await expect(title(page)).toHaveText('Co już masz?')
      await option(page, 'Domena').click()
      await option(page, 'Logo').click()
      // „Zaczynamy od zera” excludes the rest, and the tip follows.
      await option(page, 'Zaczynamy od zera').click()
      await expect(option(page, 'Domena')).toHaveAttribute('aria-pressed', 'false')
      await expect(live(page)).toContainText('Zaczynamy od zera? Pomożemy z domeną')
      await button(page, 'Dalej →').click()
      await expect(title(page)).toHaveText('Co strona ma umieć?')
      // SEO is in the price of every site, not an option; no team size for sites.
      await expect(main(page).getByText(/podstawowe SEO/)).toBeVisible()
      await expect(sizeQuestion(page)).toHaveCount(0)
      await option(page, 'Zapytanie o termin bez prowizji portalu').click()
      await button(page, 'Pokaż wynik →').click()
    },
    price: /^od\s2\s490\szł$/,
    item: 'Strona firmowa z panelem',
    answers: {
      Rodzaj: 'Strona firmowa',
      Branża: 'Pensjonat, hotel, apartamenty',
      'Masz już': ['Zaczynamy od zera'],
      'Ma umieć': ['Zapytanie o termin bez prowizji portalu'],
    },
  },
  {
    group: 'redo',
    kind: 'Przebudowa starej strony',
    walk: async (page) => {
      await button(page, 'Pomiń').click()
      await expect(title(page)).toHaveText('Twoja obecna strona')
      await main(page).getByLabel('Adres obecnej strony').fill('stara-firma.pl')
      await option(page, 'Nie wiem, kto ma dostępy').click()
      await expect(live(page)).toContainText('Odzyskamy dostęp do domeny')
      await button(page, 'Dalej →').click()
      await option(page, 'Nikt nie dzwoni z Google').click()
      await expect(sizeQuestion(page)).toHaveCount(0)
      await button(page, 'Pokaż wynik →').click()
    },
    price: /^od\s1\s499\szł$/,
    item: 'Przebudowa starej strony',
    answers: {
      Rodzaj: 'Przebudowa starej strony',
      'Twoja strona': ['Nie wiem, kto ma dostępy'],
      'Do poprawy': ['Nikt nie dzwoni z Google'],
    },
    auditUrl: 'https://stara-firma.pl/',
  },
  {
    group: 'sys',
    kind: 'System dla firmy',
    walk: async (page) => {
      await option(page, 'Budowlanka i remonty').click()
      await option(page, 'Gotowy program, który nie wystarcza').click()
      await expect(live(page)).toContainText('da się rozbudować')
      await button(page, 'Dalej →').click()
      await option(page, 'Czas pracy').click()
      // The team size: one answer, only in the system group.
      await expect(sizeQuestion(page)).toBeVisible()
      await option(page, '4–10 osób').click()
      await button(page, 'Pokaż wynik →').click()
    },
    price: /^od\s2\s990\szł$/,
    item: 'Z Excela do systemu',
    answers: {
      Rodzaj: 'System dla firmy',
      Branża: 'Budowlanka i remonty',
      Dziś: ['Gotowy program, który nie wystarcza'],
      'System ma': ['Czas pracy'],
      Użytkownicy: '4–10 osób',
    },
  },
  {
    group: 'auto',
    kind: 'Automatyzacje i AI',
    walk: async (page) => {
      await button(page, 'Pomiń').click()
      await expect(title(page)).toHaveText('Co ma się dziać samo?')
      await option(page, 'Odpowiedzi AI na zapytania').click()
      await option(page, 'Excel').click()
      await expect(live(page)).toContainText('Asystent AI tylko szykuje odpowiedzi')
      await expect(sizeQuestion(page)).toHaveCount(0)
      await button(page, 'Pokaż wynik →').click()
    },
    price: /^Zapytaj o wycenę$/,
    answers: {
      Rodzaj: 'Automatyzacje i AI',
      Automaty: ['Odpowiedzi AI na zapytania'],
      Programy: ['Excel'],
    },
  },
  {
    group: 'idk',
    kind: 'Nie wiem jeszcze',
    walk: async (page) => {
      await button(page, 'Pomiń').click()
      await expect(title(page)).toHaveText('Opisz po swojemu')
      await main(page)
        .getByRole('textbox', { name: 'Opisz po swojemu' })
        .fill('Zamówienia giną w mailach.')
      await option(page, 'Informatyk zniknął').click()
      await expect(sizeQuestion(page)).toHaveCount(0)
      await button(page, 'Pokaż wynik →').click()
    },
    price: /^0\szł za rozmowę$/,
    answers: { Rodzaj: 'Nie wiem jeszcze', Temat: ['Informatyk zniknął'] },
  },
]

// Own client address per sending test (benchmark range 198.18.0.0/15, random per run): the limit
// of 5 inquiries per 10 minutes keys on `X-Real-IP` (the proxy sets it), so these sends never use
// up the limit of other specs, nor of the previous local run.
const runOctet = Math.floor(Math.random() * 250)
let clientIp = 1

/** The result: errors at the fields, then sending → `/dziekujemy?nr=PKS-…`; the record checked. */
async function sendAndCheck(page: Page, path: Path, name: string) {
  await expect(title(page)).toHaveText('Gotowe. Wyślij, a odpiszemy z wyceną')
  await expect(page.locator('[data-wizard-price]')).toHaveText(path.price)
  await submit(page).click()
  await expect(main(page).getByText('Wpisz telefon albo adres e-mail.')).toBeVisible()
  await expect(main(page).getByLabel('E-mail albo telefon')).toBeFocused()
  await expect(
    main(page).getByText('Zaznacz zgodę, bez niej nie możemy odpowiedzieć.'),
  ).toBeVisible()

  await main(page).getByLabel('Coś jeszcze? Napisz po swojemu').fill('Najlepiej po 15.')
  await main(page).getByLabel('Imię i nazwa firmy').fill(name)
  await main(page).getByLabel('E-mail albo telefon').fill('e2e-kreator@example.test')
  await main(page)
    .getByRole('checkbox', { name: /Wyrażam zgodę/ })
    .check()
  // The server refuses forms sent faster than a person can fill them (spam protection).
  await page.waitForTimeout(FORM_MIN_FILL_MS + 500)
  await submit(page).click()
  await expect(page).toHaveURL(/\/dziekujemy\?nr=PKS-\d{4}-\d{4,}$/)
  await expect(page.getByTestId('inquiry-number')).toHaveText(/^PKS-\d{4}-\d{4,}$/)

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
      wizard: path.answers,
    })
    expect(record?.message).toMatch(new RegExp(`^Kreator: ${path.kind}\\n\\n`))
    expect(record?.message).toContain('Najlepiej po 15.')
    if (path.item) {
      expect(record?.items).toEqual([
        expect.objectContaining({ nameSnapshot: path.item, quantity: 1 }),
      ])
    }
    if (path.group === 'idk') expect(record?.items).toEqual([])
    if (path.auditUrl) expect(record?.auditUrl).toBe(path.auditUrl)
  } finally {
    if (record) await api(page, 'DELETE', `/api/inquiries/${record.id}`)
  }
}

test.describe('Software wizard v3 — every group to the thanks page', () => {
  for (const path of PATHS) {
    test(`${path.group}: ${path.kind}`, async ({ page }) => {
      await page.setExtraHTTPHeaders({ 'X-Real-IP': `198.18.${runOctet}.${clientIp++}` })
      await page.goto(site(HOST, PATH))
      await chooseKind(page, path.kind)
      await path.walk(page)
      await sendAndCheck(page, path, `E2E kreator v3 ${path.group} ${Date.now()}`)
    })
  }

  test('phone 390 px: no horizontal scroll, the system path sends', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.setExtraHTTPHeaders({ 'X-Real-IP': `198.18.${runOctet}.${clientIp++}` })
    await page.goto(site(HOST, PATH))
    const sys = PATHS.find((path) => path.group === 'sys')
    if (!sys) throw new Error('no system path')
    await chooseKind(page, sys.kind)
    await sys.walk(page)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    await sendAndCheck(page, sys, `E2E kreator v3 390 ${Date.now()}`)
  })
})

test.describe('Software wizard v3 — steps and links', () => {
  test('a new kind drops the answers of the old group; the step bar goes back', async ({
    page,
  }) => {
    await page.goto(site(HOST, PATH))
    await chooseKind(page, 'System dla firmy')
    await button(page, 'Pomiń').click()
    await option(page, 'Excel i arkusze').click()
    await expect(live(page)).toContainText('Excel i arkusze')
    await main(page)
      .getByRole('button', { name: /Rodzaj$/ })
      .click()
    await expect(title(page)).toHaveText('Czego potrzebujesz?')
    await option(page, 'Strona wizytówka').click()
    await expect(live(page)).not.toContainText('Excel i arkusze')
    await expect(live(page)).toContainText(/od\s999\szł/)
  })

  test('„Dalej” waits for a kind', async ({ page }) => {
    await page.goto(site(HOST, PATH))
    await expect(button(page, 'Dalej →')).toHaveAttribute('aria-disabled', 'true')
  })

  test('?firma= from the showroom, ?rodzaj=, ?tryb=opis; unknown values ignored', async ({
    page,
  }) => {
    await page.goto(site(HOST, `${PATH}?firma=bud`))
    await chooseKind(page, 'System dla firmy')
    await expect(option(page, 'Budowlanka i remonty')).toHaveAttribute('aria-pressed', 'true')
    await page.goto(site(HOST, `${PATH}?rodzaj=system`))
    await expect(title(page)).toHaveText('Jaka to firma?')
    await page.goto(site(HOST, `${PATH}?tryb=opis`))
    await expect(title(page)).toHaveText('Opisz po swojemu')
    await page.goto(site(HOST, `${PATH}?rodzaj=nie-ma&firma=kosmos`))
    await expect(title(page)).toHaveText('Czego potrzebujesz?')
  })

  test('/dobierz: one H1 in the hero, no second wizard heading, „Cztery kroki do startu”', async ({
    page,
  }) => {
    await page.goto(site(HOST, PATH))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Zobacz cenę i termin, zanim zadzwonisz.',
    )
    await expect(main(page).getByText('Policz swój projekt.')).toHaveCount(0)
    await expect(title(page)).toHaveText('Czego potrzebujesz?')
    const four = main(page).getByRole('region', { name: 'Cztery kroki do startu' })
    await expect(four.getByRole('heading', { level: 3 })).toHaveText([
      'Odpowiadamy',
      'Krótka rozmowa',
      'Podgląd i wycena',
      'Ty decydujesz',
    ])
  })

  test('the live card draws the mock-up of the choices', async ({ page }) => {
    await page.goto(site(HOST, `${PATH}?firma=gastro`))
    await chooseKind(page, 'Rozbudowana strona')
    await expect(live(page).locator('[data-mockup="site"]')).toBeVisible()
    await page.goto(site(HOST, `${PATH}?rodzaj=automatyzacje`))
    await expect(live(page).locator('[data-mockup="flow"]')).toBeVisible()
    await page.goto(site(HOST, `${PATH}?rodzaj=przebudowa`))
    await expect(live(page).locator('[data-mockup="before"]')).toBeVisible()
  })

  test('phone: the live card folds into a price bar that unfolds it (360 px)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 })
    await page.goto(site(HOST, `${PATH}?rodzaj=system&firma=bud`))
    const bar = page.locator('[data-wizard-bar]')
    await expect(bar).toContainText(/od\s2\s990\szł/)
    await expect(live(page)).toBeHidden()
    const toggle = bar.getByRole('button', { name: 'Twój projekt na żywo' })
    await expect(async () => {
      await toggle.click()
      await expect(toggle).toHaveAttribute('aria-expanded', 'true', { timeout: 1000 })
    }).toPass()
    await expect(live(page).locator('[data-mockup="dash"]')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360)
  })

  test('dark start, a question and the result pass axe', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
    const axe = async () => {
      // The glass capsule over the bright mock-up below misleads the contrast check; the capsule
      // has its own axe run at the top of the page (software-frame).
      const result = await new AxeBuilder({ page })
        .withTags(WCAG)
        .exclude('[data-site-header]')
        .analyze()
      expect(
        result.violations.map((v) => ({ rule: v.id, targets: v.nodes.map((n) => n.target) })),
      ).toEqual([])
    }
    await page.goto(site(HOST, PATH))
    await axe()
    await chooseKind(page, 'Strona firmowa')
    await button(page, 'Pomiń').click()
    await option(page, 'Logo').click()
    await axe()
    await button(page, 'Dalej →').click()
    await button(page, 'Pokaż wynik →').click()
    await expect(title(page)).toHaveText('Gotowe. Wyślij, a odpiszemy z wyceną')
    await axe()
  })
})
