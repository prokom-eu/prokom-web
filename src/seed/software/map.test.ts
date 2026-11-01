import { existsSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import branze from '../../../seed/prokomsoftware/branze.json'
import fakty from '../../../seed/prokomsoftware/fakty.json'
import miejscowosci from '../../../seed/prokomsoftware/miejscowosci.json'
import obszary from '../../../seed/prokomsoftware/obszary.json'
import rozwiazania from '../../../seed/prokomsoftware/rozwiazania.json'
import wpisy from '../../../seed/prokomsoftware/wpisy.json'
import { homeSchema } from '../../lib/software/home'
import { navigationSchema } from '../../lib/software/navigation'
import { notFoundSchema, thanksSchema } from '../../lib/software/pages'
import { INDUSTRY_GROUPS, WIZARD_FIRMS } from '../../lib/software/options'
import {
  includedError,
  levelCellsError,
  lowestLevelPrice,
  thumbnailError,
} from '../../lib/software/solutionRules'
import { softwareWizardSchema } from '../../lib/software/wizard'
import {
  HOME_SECTION_TEXTS,
  REBUILD_BUTTON,
  homeWithPriceTokens,
  homeWithSections,
} from './homeExtras'
import {
  areaData,
  cityData,
  factsData,
  industriesToImport,
  industryData,
  missingFacts,
  relatedIds,
  type SeedCity,
  softwarePostData,
  softwareSettingsData,
  solutionData,
  solutionsToImport,
} from './map'

/** Fake ids: the solution's legacy id, so a test can tell which one a chip points to. */
const legacyIdOf = new Map(rozwiazania.items.map((item) => [item.slug, item.legacyId]))
const solutionId = (slug: string) => legacyIdOf.get(slug)

describe('solutions to import', () => {
  it('are the 29 solutions of the package', () => {
    expect(solutionsToImport()).toHaveLength(29)
  })

  // ADR-014 v20 pkt 2: a solution removed from the offer never reaches the database.
  it('never include a removed solution', () => {
    const removedIds = new Set(rozwiazania.removed.map((item) => item.legacyId))
    const removedSlugs = new Set(rozwiazania.removed.map((item) => item.slug))
    expect(removedSlugs.size).toBeGreaterThan(0)
    for (const item of solutionsToImport()) {
      expect(removedIds.has(item.legacyId), item.slug).toBe(false)
      expect(removedSlugs.has(item.slug), item.slug).toBe(false)
    }
  })

  it('drop an item still listed although removed (by slug or by id)', () => {
    const [removed] = rozwiazania.removed
    const items = [
      { ...rozwiazania.items[0]!, slug: removed!.slug },
      { ...rozwiazania.items[1]!, legacyId: removed!.legacyId },
      rozwiazania.items[2]!,
    ]
    expect(solutionsToImport({ ...rozwiazania, items })).toEqual([rozwiazania.items[2]])
  })
})

describe('solutionData', () => {
  const site = rozwiazania.items.find((item) => item.slug === 'strona-firmowa-z-panelem')!

  it('stores the one „od” price and term of the package (v22)', () => {
    const data = solutionData(site)
    expect(data).toMatchObject({ priceFrom: 2490, leadTime: 'od 2 tygodni', levels: [] })
    for (const field of ['prices', 'leadTimes', 'sizeNames']) expect(data).not.toHaveProperty(field)
  })

  it('maps the levels of care (monthly) and audit to the panel fields', () => {
    const care = solutionData(
      rozwiazania.items.find((item) => item.slug === 'opieka-nad-strona-i-systemem')!,
    )
    expect(care).toMatchObject({ priceMonthly: true, priceFrom: 149 })
    expect(
      care.levels?.map(({ name, price, term, recommended }) => [name, price, term, recommended]),
    ).toEqual([
      ['Podstawowa', 149, 'do końca następnego dnia roboczego', false],
      ['Rozszerzona', 299, '8 h roboczych', true],
      ['Systemy', 790, '4 h roboczych, na piśmie', false],
    ])
    expect(care.levelRows?.every((row) => row.cells?.length === 3)).toBe(true)
    const audit = solutionData(
      rozwiazania.items.find((item) => item.slug === 'audyt-strony-lub-programu')!,
    )
    expect(audit).toMatchObject({ priceMonthly: false, priceFrom: 0 })
    expect(audit.levels?.map(({ term }) => term)).toEqual([
      '2 dni robocze',
      '1 tydzień',
      '2 tygodnie',
    ])
    expect(audit.levels?.[2]?.shortName).toBe('Strona + program / dostępność')
    expect(solutionData(site).priceMonthly).toBe(false)
  })

  it('maps the texts of the offer window', () => {
    expect(solutionData(site)).toMatchObject({
      thumbnail: '/software/rozwiazania/strona-firmowa-z-panelem.svg',
      included: [
        'Do 5 podstron: oferta, realizacje, opinie, kontakt',
        'Panel do zmian i formularz prosto do Ciebie',
        'Gotowa pod Google i AI',
      ],
      moreExamples: ['więcej niż 5 podstron', 'aktualności i blog', 'kolejny język'],
      example: expect.stringContaining('Firma remontowa'),
      benefits: [],
      needs: [],
      faq: [],
    })
  })

  it('maps the card fields', () => {
    const data = solutionData(site)
    expect(data).toMatchObject({
      legacyId: 1,
      slug: 'strona-firmowa-z-panelem',
      name: 'Strona firmowa z panelem',
      category: 'strony',
      situations: ['Z'],
    })
    expect(data).not.toHaveProperty('featured')
  })

  it('maps every solution of the package', () => {
    for (const item of solutionsToImport()) expect(() => solutionData(item)).not.toThrow()
  })
})

// The v22 package is complete for the offer window (ADR-014 v22 pkt 1–4, decision SWD2 3): the
// panel does not require the texts, so this test does.
describe('solutions v22 of the package', () => {
  const items = solutionsToImport()
  const data = items.map((item) => ({ item, data: solutionData(item) }))

  it('pass the rules of the collection (price, levels, „W cenie”, table, thumbnail)', () => {
    for (const { item, data: solution } of data) {
      expect(includedError(solution.included, solution), item.slug).toBeNull()
      expect(thumbnailError(solution.thumbnail), item.slug).toBeNull()
      const levels = solution.levels ?? []
      if (levels.length > 0) expect(solution.priceFrom, item.slug).toBe(lowestLevelPrice(levels))
      for (const row of solution.levelRows ?? []) {
        expect(levelCellsError(row.cells, levels.length), `${item.slug}: ${row.label}`).toBeNull()
      }
    }
  })

  it('have a thumbnail file in public/ for every solution', () => {
    for (const { item, data: solution } of data) {
      expect(solution.thumbnail, item.slug).toBe(`/software/rozwiazania/${item.slug}.svg`)
      expect(existsSync(path.join('public', solution.thumbnail!)), item.slug).toBe(true)
    }
  })

  it('have levels only for care and audit', () => {
    const withLevels = data.filter(({ data: solution }) => (solution.levels ?? []).length > 0)
    expect(withLevels.map(({ item }) => item.slug).sort()).toEqual([
      'audyt-strony-lub-programu',
      'opieka-nad-strona-i-systemem',
    ])
  })

  it('have „Przykład z życia” and three related solutions, never themselves', () => {
    const ids = new Map(items.map((item) => [item.slug, item.legacyId]))
    for (const item of items) {
      expect(solutionData(item).example, item.slug).toBeTruthy()
      const related = relatedIds(item, (slug) => ids.get(slug))
      expect(related, item.slug).toHaveLength(3)
      expect(related, item.slug).not.toContain(item.legacyId)
    }
  })

  it('count the situations of the boards (Z 14 · R 13 · P 8)', () => {
    const count = (situation: string) =>
      items.filter((item) => item.situations.includes(situation)).length
    expect([count('Z'), count('R'), count('P')]).toEqual([14, 13, 8])
  })

  // ADR-014 v22 pkt 8: no „Na start / Standard / Pełna” anywhere in the data.
  it('never name a version', () => {
    const text = JSON.stringify({ items: rozwiazania.items, areas: obszary.items })
    expect(text).not.toMatch(/Na start|Standard|Pełna wersja/)
  })
})

describe('areaData', () => {
  it('names the icon of every area by its drawing', () => {
    const icons = Object.fromEntries(
      obszary.items.map((item) => [item.key, areaData(item, solutionId).icon]),
    )
    expect(icons).toEqual({
      www: 'site',
      sys: 'panel',
      app: 'phone',
      cal: 'cal',
      plug: 'plug',
      auto: 'bolt',
      care: 'shield',
      aud: 'search',
    })
  })

  it('links chips to solutions by slug and keeps a chip without one as text', () => {
    const www = areaData(
      obszary.items.find((item) => item.key === 'www')!,
      solutionId,
    )
    expect(www.chips?.[0]).toEqual({
      label: 'Wizytówka',
      solution: legacyIdOf.get('strona-wizytowka'),
    })
    const textOnly = obszary.items.flatMap((item) => item.chips).find((chip) => !chip.solution)
    if (textOnly) {
      const area = obszary.items.find((item) => item.chips.includes(textOnly))!
      const chip = areaData(area, solutionId).chips?.find((c) => c.label === textOnly.label)
      expect(chip).toEqual({ label: textOnly.label, solution: null })
    }
  })

  it('takes the button, prices and order, but no gradient (colour = token)', () => {
    const care = areaData(
      obszary.items.find((item) => item.key === 'care')!,
      solutionId,
    )
    expect(care).toMatchObject({
      key: 'care',
      priceFrom: 149,
      priceLabel: 'od 149 zł / mies.',
      cta: { label: expect.any(String), href: expect.stringMatching(/^\//) },
    })
    expect(care).not.toHaveProperty('gradient')
    const aud = areaData(
      obszary.items.find((item) => item.key === 'aud')!,
      solutionId,
    )
    expect(aud.priceFrom).toBe(0)
  })

  it('refuses an icon path shared by two names (mount and mountain)', () => {
    const www = obszary.items.find((item) => item.key === 'www')!
    const mountain = { ...www, icon: 'M3 20l6-10 4 6 3-4 5 8z' }
    expect(() => areaData(mountain, solutionId)).toThrow(/mount/)
  })

  it('refuses a chip pointing to a solution that is not imported', () => {
    const www = obszary.items.find((item) => item.key === 'www')!
    const broken = { ...www, chips: [{ label: 'X', solution: 'rezerwacje-online-na-stronie' }] }
    expect(() => areaData(broken, solutionId)).toThrow(/rezerwacje-online-na-stronie/)
  })
})

describe('cityData', () => {
  const rabka = miejscowosci.items.find((item) => item.slug === 'rabka-zdroj')!

  it('imports 6 cities, only Rabka-Zdrój active', () => {
    const cities = miejscowosci.items.map((item) => cityData(item, solutionId))
    expect(cities).toHaveLength(6)
    expect(cities.filter((city) => city.active).map((city) => city.slug)).toEqual(['rabka-zdroj'])
  })

  it('takes the hero badges as on the board (bold title, then text)', () => {
    expect(cityData(rabka, solutionId).hero?.badges).toEqual([
      { title: 'Salon na miejscu', text: 'przyjdź z laptopem i pomysłem' },
      { title: 'Spotkanie u Ciebie', text: 'Rabka i okolice' },
    ])
  })

  it('turns [label, href] pairs into links and q/a into question/answer', () => {
    const city = cityData(rabka, solutionId)
    expect(city.hero?.ctas?.[0]).toEqual({
      link: { label: 'Dobierz rozwiązanie · 60 s', href: '/dobierz' },
    })
    expect(city.cta?.buttons?.[1]).toEqual({
      link: { label: 'Dobierz rozwiązanie', href: '/dobierz' },
    })
    expect(city.local?.items?.[0]).toEqual({
      title: 'Spotkanie w 10 minut',
      text: expect.stringMatching(/^Salon w centrum Rabki/),
    })
    expect(city.faq?.[0]).toEqual({
      question: 'Czy przyjedziecie do mnie?',
      answer: expect.stringMatching(/^Tak\./),
    })
  })

  it('links „who” cards to solutions', () => {
    const [first] = cityData(rabka, solutionId).who?.items ?? []
    expect(first).toMatchObject({
      name: 'Pensjonaty i domy wczasowe',
      solution: legacyIdOf.get('strona-dla-hotelu-lub-pensjonatu'),
    })
  })

  it('refuses an incomplete link pair', () => {
    const broken = {
      ...rabka,
      hero: { ...rabka.hero!, ctas: [['Dobierz rozwiązanie']] },
    } as SeedCity
    expect(() => cityData(broken, solutionId)).toThrow(/incomplete link/)
  })

  it('refuses badges of a city it has not checked against the board', () => {
    const other = { ...rabka, slug: 'zakopane' }
    expect(() => cityData(other, solutionId)).toThrow(/badges/)
  })
})

describe('facts', () => {
  it('takes every key, an empty value as null', () => {
    const rows = factsData()
    expect(rows.map((row) => row.key)).toEqual(Object.keys(fakty.facts))
    expect(rows.find((row) => row.key === 'OPIEKA OD')?.value).toBe('149')
    expect(rows.find((row) => row.key === 'KWOTA')?.value).toBeNull()
  })

  it('adds only the keys missing in the panel, never changing a value there', () => {
    const stored = [{ key: 'OPIEKA OD', value: '199' }]
    const added = missingFacts(stored, factsData())
    expect(added.map((row) => row.key)).not.toContain('OPIEKA OD')
    expect(added).toHaveLength(Object.keys(fakty.facts).length - 1)
  })
})

describe('Software settings of the seed', () => {
  const settings = softwareSettingsData()

  it('pass the schemas the panel checks on save', () => {
    expect(softwareWizardSchema.safeParse(settings.wizard).error?.issues).toBeUndefined()
    expect(homeSchema.safeParse(settings.home).error?.issues).toBeUndefined()
    expect(thanksSchema.safeParse(settings.thanks).error?.issues).toBeUndefined()
    expect(notFoundSchema.safeParse(settings.notFound).error?.issues).toBeUndefined()
    expect(navigationSchema.safeParse(settings.navigation).error?.issues).toBeUndefined()
  })

  it('store the home texts without the section order (it is the order of blocks)', () => {
    expect(settings.home).not.toHaveProperty('homeOrder')
    expect(settings.home).toHaveProperty('technologies')
    expect(settings.home).toHaveProperty('popular.order')
  })

  it('add the SW5 and SW6 section headings from the board to the home texts', () => {
    expect(settings.home.sections?.areas.title).toBe('Wszystko dla firmy, w ośmiu obszarach.')
    expect(settings.home.sections?.livePreviews?.eyebrow).toBe('Podglądy na żywo · zanim zapłacisz')
    expect(settings.home.sections?.process?.stage).toBe('Etap {num} · {t}')
    expect(settings.home.sections?.popular.after.items[0]?.text).toBe('od [OPIEKA OD] zł / mies.')
    expect(settings.home.sections?.guarantees?.sayNo.title).toBe('Czasem powiemy: tego nie buduj.')
  })

  it('take the rebuild price of „Dlaczego nie WordPress” from Solutions, not from the text', () => {
    const buttons = settings.home.whyNotWordpress.cta.buttons
    expect(buttons[1]).toEqual([REBUILD_BUTTON.token, '/rozwiazania/przebudowa-starej-strony'])
    // A home saved with the package's text: only that label is swapped.
    const stored = structuredClone(settings.home)
    stored.whyNotWordpress.cta.buttons[1] = [REBUILD_BUTTON.package, '/x']
    const swapped = homeWithPriceTokens(stored)
    expect(swapped).toMatchObject({
      whyNotWordpress: { cta: { buttons: [buttons[0], [REBUILD_BUTTON.token, '/x']] } },
    })
    // Edited in the panel or already a token: left as it is.
    stored.whyNotWordpress.cta.buttons[1] = ['Przebudowa w promocji', '/x']
    expect(homeWithPriceTokens(stored)).toBeNull()
    expect(homeWithPriceTokens(settings.home)).toBeNull()
    expect(homeWithPriceTokens(null)).toBeNull()
  })

  it('add the section headings to a home saved before SW5, and only then', () => {
    const { sections, ...stored } = structuredClone(settings.home)
    const added = homeWithSections(stored, HOME_SECTION_TEXTS)
    expect(added).toEqual({ ...stored, sections })
    // Edited in the panel and complete: kept as it is.
    const edited = {
      ...stored,
      sections: { ...HOME_SECTION_TEXTS, areas: { ...HOME_SECTION_TEXTS.areas, title: 'Inny' } },
    }
    expect(homeWithSections(edited, HOME_SECTION_TEXTS)).toBeNull()
    // Saved in SW5 (no SW6 sections): only the missing ones are added, edits stay.
    const { livePreviews, process, guarantees, ...sw5 } = edited.sections
    const filled = homeWithSections({ ...stored, sections: sw5 }, HOME_SECTION_TEXTS)
    expect(filled).toEqual({ ...stored, sections: { ...sw5, livePreviews, process, guarantees } })
    // Not a home object (empty field): left to the „fill while empty” rule.
    expect(homeWithSections(null, HOME_SECTION_TEXTS)).toBeNull()
  })

  it('price the 404 tiles with the cheapest solution of their category', () => {
    const lowest = (category: string) =>
      Math.min(
        ...solutionsToImport()
          .filter((item) => item.category === category)
          .map((item) => item.priceFrom ?? Infinity),
      )
    const priceOf = (slug: string | undefined) =>
      solutionsToImport().find((item) => item.slug === slug)?.priceFrom
    const tiles = settings.notFound.places.tiles
    // `{cena:<slug>}` — a price changed in the panel changes the tile too (decyzja 10).
    const slugIn = (href: string) =>
      tiles.find((tile) => tile.href === href)?.note.match(/\{cena:([a-z0-9-]+)\}/)?.[1]
    expect(priceOf(slugIn('/rozwiazania?kategoria=strony'))).toBe(lowest('strony'))
    expect(priceOf(slugIn('/rozwiazania?kategoria=systemy'))).toBe(lowest('systemy'))
  })

  it('take the search settings as they are', () => {
    expect(settings.search.synonyms[0]).toEqual({
      phrase: 'excel',
      expansions: ['arkusz', 'tabelka', 'z excela do systemu'],
    })
    expect(settings.search.popular.length).toBeLessThanOrEqual(12)
  })
})

describe('industryData', () => {
  const industries = industriesToImport(solutionId)
  const construction = industries.find((item) => item.slug === 'budownictwo-i-wykonczenia')!

  it('imports the 12 pages in the package order, only construction active', () => {
    expect(industries.map((item) => item.slug)).toEqual(branze.pagesAtStart.map((p) => p.slug))
    expect(industries.map((item) => item.order)).toEqual(industries.map((_, index) => index + 1))
    expect(industries.filter((item) => item.active).map((item) => item.slug)).toEqual([
      'budownictwo-i-wykonczenia',
    ])
  })

  it('keeps every group and wizard kind within the lists of the catalog and the wizard', () => {
    const groups = INDUSTRY_GROUPS.map((group) => group.value as string)
    const firms = WIZARD_FIRMS.map((firm) => firm.value as string)
    for (const item of industries) {
      expect(groups).toContain(item.software?.group)
      if (item.software?.wizardFirm) expect(firms).toContain(item.software.wizardFirm)
    }
  })

  it('puts the FAQ into the shared field and the page into the Software group', () => {
    expect(construction.faq).toHaveLength(4)
    expect(construction.faq?.[0]).toEqual({
      question: branze.budowlanka.faq[0]!.q,
      answer: branze.budowlanka.faq[0]!.a,
    })
    expect(construction.software?.wizardTitle).toBe(branze.budowlanka.wizardTitle)
    expect(construction.software?.offline).toHaveLength(3)
    expect(construction.software?.moduleMap?.[0]).toEqual({
      name: 'Zlecenia i grafik',
      icon: 'cal',
      x: 50,
      y: 10,
      delay: 0,
    })
  })

  it('links problems by solution id and the cards by slug', () => {
    const [first] = construction.software?.problems ?? []
    expect(first).toMatchObject({ icon: 'chat', solution: 10, features: expect.any(Array) })
    expect(first?.cta).toEqual({
      label: 'Zobacz podgląd na żywo',
      href: '/rozwiazania/aplikacja-dla-ekip-w-terenie',
    })
    expect(construction.software?.topSolutions).toEqual(
      branze.budowlanka.solutions.map((card) => solutionId(card.solution)),
    )
  })

  it('leaves a page without content inactive, with its name, group and wizard kind only', () => {
    const transport = industries.find((item) => item.slug === 'transport')!
    expect(transport).toEqual({
      name: 'Transport',
      slug: 'transport',
      active: false,
      order: 10,
      software: { group: 'uslugi-i-transport', wizardFirm: null },
    })
  })

  it('refuses an active page without content', () => {
    const page = { ...branze.pagesAtStart[1]!, active: true }
    expect(() => industryData(page, 1, solutionId)).toThrow(/active without text/)
  })
})

describe('softwarePostData', () => {
  const [item] = wpisy.items
  const post = softwarePostData(item!, solutionId)

  it('maps the category, leads and related solutions', () => {
    expect(post.category).toBe('poradnik')
    expect(post.summary).toBe(item!.tldr)
    expect(post.seo?.description).toBe(item!.listLead)
    expect(post.relatedSolutions).toEqual(item!.relatedSolutions.map(solutionId))
  })

  it('turns the sections into headings, paragraphs and lists', () => {
    const nodes = (post.content as { root: { children: { type: string }[] } }).root.children
    expect(nodes.filter((node) => node.type === 'heading')).toHaveLength(item!.sections.length)
    expect(nodes.filter((node) => node.type === 'list')).toHaveLength(3)
  })
})
