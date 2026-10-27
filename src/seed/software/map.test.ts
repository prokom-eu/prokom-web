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
import { formatPrice } from '../../lib/software/price'
import { softwareWizardSchema } from '../../lib/software/wizard'
import {
  areaData,
  cardGradientKey,
  cityData,
  factsData,
  industriesToImport,
  industryData,
  missingFacts,
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

  it('stores prices and terms per size only (priceFrom and leadTime are computed)', () => {
    const data = solutionData(site)
    expect(data.prices).toEqual({ start: 2490, std: 3390, full: 5490 })
    expect(data.leadTimes).toEqual({ start: '2 tygodnie', std: '3 tygodnie', full: '4–5 tygodni' })
    expect(data).not.toHaveProperty('priceFrom')
    expect(data).not.toHaveProperty('leadTime')
  })

  // The package has no such fields: the care levels are only in its price note (SW9).
  it('marks the care prices as monthly with the levels of the package', () => {
    const care = rozwiazania.items.find((item) => item.slug === 'opieka-nad-strona-i-systemem')!
    expect(solutionData(care)).toMatchObject({
      priceMonthly: true,
      sizeNames: { start: 'Podstawowa', std: 'Standard', full: 'Systemy' },
    })
    expect(solutionData(site)).toMatchObject({
      priceMonthly: false,
      sizeNames: { start: null, std: null, full: null },
    })
  })

  it('maps the card fields and the „12 rzeczy” card', () => {
    const data = solutionData(site)
    expect(data).toMatchObject({
      legacyId: 1,
      slug: 'strona-firmowa-z-panelem',
      name: 'Strona firmowa z panelem',
      category: 'strony',
      situations: ['Z', 'R'],
      cardGradient: null,
      featured: { name: 'Strona firmowa', tag: 'PANEL TREŚCI' },
    })
    expect(data.featured?.features).toHaveLength(3)
  })

  it('leaves the „12 rzeczy” card empty for a solution without one', () => {
    const plain = rozwiazania.items.find((item) => !item.featuredName)!
    expect(solutionData(plain).featured).toEqual({
      name: null,
      tag: null,
      lead: null,
      features: [],
    })
  })

  it('maps every solution of the package', () => {
    for (const item of solutionsToImport()) expect(() => solutionData(item)).not.toThrow()
  })
})

describe('cardGradientKey', () => {
  it('maps the CSS gradients of the package to the card keys', () => {
    expect(cardGradientKey('135deg, #F3B07C, #F7D9B5')).toBe('peach')
    expect(cardGradientKey('135deg, #D8C3A8, #A38363')).toBe('sand')
    expect(cardGradientKey('135deg, #BFD9CF, #7FA898')).toBe('sage')
    expect(cardGradientKey(null)).toBeNull()
  })

  it('refuses an unknown gradient instead of losing it', () => {
    expect(() => cardGradientKey('90deg, #000, #fff')).toThrow(/gradient/)
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

  it('keep the 404 tile prices equal to the lowest start price of their category', () => {
    const lowest = (category: string) =>
      Math.min(
        ...solutionsToImport()
          .filter((item) => item.category === category)
          .map((item) => item.prices.start ?? Infinity),
      )
    const tiles = settings.notFound.places.tiles
    const note = (href: string) => tiles.find((tile) => tile.href === href)?.note
    // Panel text with a plain space; `formatPrice` groups with a no-break space.
    const zl = (price: number) => `od ${formatPrice(price).replace(/ /g, ' ')} zł netto`
    expect(note('/rozwiazania?kategoria=strony')).toBe(zl(lowest('strony')))
    expect(note('/rozwiazania?kategoria=systemy')).toBe(zl(lowest('systemy')))
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
