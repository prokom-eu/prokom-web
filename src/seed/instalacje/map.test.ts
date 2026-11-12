import { describe, expect, it } from 'vitest'

import { unknownAnchors } from '@/lib/instalacje/anchors'
import { markerIn } from '@/lib/instalacje/archNews'

import {
  OBJECT_KEYS,
  OFFER_CATEGORIES,
  SERVICE_GROUPS,
  SERVICE_KEYS,
} from '../../lib/instalacje/options'
import {
  ANCHORS_V5,
  archNewsToImport,
  ICON_FIXES,
  mapHref,
  objectData,
  forwardSeoTitle,
  objectsToImport,
  pagesToImport,
  realizationsToImport,
  seoTitle,
  serviceData,
  servicesToImport,
  solutionsToImport,
} from './map'
import { LAW_WORDS } from '../../lib/instalacje/lawWords'
import { isInstIconName } from '../../sites/instalacje/icons'
import { withoutLaw } from './bezPrzepisow'

const ids = (prefix: number) => (key: string) => prefix + key.length // any stable fake id
const refs = { service: ids(100), object: ids(200) }

const allMapped = () =>
  JSON.stringify([
    servicesToImport().map((item) => serviceData(item, refs)),
    objectsToImport().map((item) => objectData(item, refs)),
    solutionsToImport(),
    realizationsToImport(),
    pagesToImport(),
  ])

describe('mapHref', () => {
  it('maps prototype links to public addresses and keeps the fragment', () => {
    expect(mapHref('Zaplanuj.dc.html')).toBe('/zaplanuj')
    expect(mapHref('Main.dc.html#uslugi')).toBe('/#uslugi')
    expect(mapHref('SegDom.dc.html')).toBe('/dla-kogo/dom')
    expect(mapHref('Zaplanuj.dc.html#obiekt=dom&uslugi=kam')).toBe(
      '/zaplanuj#obiekt=dom&uslugi=kam',
    )
    expect(mapHref('monitoring.html')).toBe('/monitoring')
  })

  it('leaves other links alone and refuses unknown prototype files', () => {
    expect(mapHref('/kontakt')).toBe('/kontakt')
    expect(mapHref('https://pro-kom.eu')).toBe('https://pro-kom.eu')
    expect(() => mapHref('Nieznana.dc.html')).toThrow(/Nieznana/)
  })
})

describe('seoTitle', () => {
  it('drops the site name the title template adds', () => {
    expect(seoTitle('Monitoring CCTV Rabka-Zdrój, Zakopane, Podhale | PRO-KOM')).toBe(
      'Monitoring CCTV Rabka-Zdrój, Zakopane, Podhale',
    )
    expect(seoTitle('O firmie PRO-KOM: instalacje | PRO-KOM Instalacje')).toBe(
      'O firmie PRO-KOM: instalacje',
    )
  })
})

describe('services', () => {
  const services = servicesToImport().map((item) => serviceData(item, refs))

  it('imports the 10 services, one per key, with their public slugs', () => {
    expect(services.map((s) => s.key).sort()).toEqual(SERVICE_KEYS.map((k) => k.value).sort())
    const monitoring = services.find((s) => s.key === 'kam')
    expect(monitoring?.slug).toBe('monitoring')
    expect(services.find((s) => s.key === 'scr')?.slug).toBe('ekrany')
    expect(services.find((s) => s.key === 'kd')?.slug).toBe('kontrola-dostepu')
  })

  it('fills menu, tile, offer area and page sections', () => {
    const groups = SERVICE_GROUPS.map((g) => g.value) as string[]
    for (const service of services) {
      expect(groups).toContain(service.group)
      expect(service.color).toMatch(/^#[0-9a-f]{6}$/i)
      expect(service.icon).toBeTruthy()
      expect(service.tile?.description).toBeTruthy()
      expect(service.offer?.family).toBeTruthy()
      expect(service.hero.h1a).toBeTruthy()
      expect(service.faq?.length).toBeGreaterThan(0)
      // Teletechnika (for builders) has no sample packages in the design, by design.
      if (service.key !== 'tel') expect(service.packages?.length).toBeGreaterThan(0)
      expect(service.relatedServices?.length).toBeGreaterThan(0)
      expect(service.cta?.heading).toBeTruthy()
    }
    const monitoring = services.find((s) => s.key === 'kam')
    expect(monitoring?.hero.cta?.href).toBe('/zaplanuj')
    expect(monitoring?.anchors?.[0]?.anchorId).toBe('co-dostajesz')
  })

  it('keeps a price only when it is one', () => {
    for (const service of services) {
      expect(service.tile?.priceFrom ?? '').not.toMatch(/wizji/)
      for (const pkg of service.packages ?? []) expect(pkg.price ?? '').not.toMatch(/wizji/)
    }
  })
})

describe('objects', () => {
  const objects = objectsToImport().map((item) => objectData(item, refs))

  it('imports the 12 objects with their /dla-kogo slugs', () => {
    expect(objects.map((o) => o.key).sort()).toEqual(OBJECT_KEYS.map((k) => k.value).sort())
    expect(objects.find((o) => o.key === 'pens')?.slug).toBe('pensjonaty')
    expect(objects.find((o) => o.key === 'dev')?.slug).toBe('deweloperzy')
  })

  it('maps every section of the template', () => {
    for (const object of objects) {
      expect(object.hero.h1a).toBeTruthy()
      expect(object.hotspots?.length).toBeGreaterThan(0)
      expect(object.problems?.length).toBeGreaterThan(0)
      expect(object.day?.length).toBeGreaterThan(0)
      expect(object.law).toEqual([]) // runda v6 §1.1
      expect(object.anchors?.map((a) => a.anchorId)).not.toContain('przepisy')
      expect(object.foldOnPhone?.map((f) => f.anchorId)).not.toContain('przepisy')
      expect(object.prepare?.length).toBeGreaterThan(0)
      expect(object.faq?.length).toBeGreaterThan(0)
      expect(object.relatedServices?.length).toBeGreaterThan(0)
      expect(object.seo?.title?.length).toBeLessThanOrEqual(70)
      expect(object.seo?.description?.length).toBeLessThanOrEqual(160)
    }
    const dom = objects.find((o) => o.key === 'dom')
    expect(dom?.foldOnPhone?.[0]).toEqual({ anchorId: 'problemy', maxHeight: 900 })
    expect(dom?.foldOnPhone?.[1]).toEqual({ anchorId: 'rok' })
    expect(dom?.hero.facts?.[0]?.value).toBeTruthy()
  })
})

describe('offer', () => {
  const solutions = solutionsToImport()

  it('imports 76 solutions in 10 areas with unique import ids', () => {
    expect(solutions).toHaveLength(76)
    expect(new Set(solutions.map((s) => s.serviceKey)).size).toBe(10)
    expect(new Set(solutions.map((s) => s.legacyId)).size).toBe(76)
  })

  it('uses only the offer filter categories', () => {
    const allowed = OFFER_CATEGORIES.map((c) => c.value) as string[]
    for (const solution of solutions) {
      for (const category of solution.categories) expect(allowed).toContain(category)
    }
  })
})

describe('realizations', () => {
  const realizations = realizationsToImport()

  it('imports them all with the client consent (boss 01.11), the home page ones featured', () => {
    expect(realizations).toHaveLength(11)
    expect(realizations.every((r) => r.clientConsent === true)).toBe(true)
    // The home page ones (`Main.rl`, shorter names) are the first of `Realizacje.json`.
    expect(realizations.filter((r) => r.featured).map((r) => r.title)).toEqual([
      'Blachotrapez',
      'Parafia św. Teresy',
      'Empik',
      'Restauracja „Aleksandra”',
    ])
    expect(new Set(realizations.map((r) => r.legacyId)).size).toBe(11)
  })
})

describe('pages', () => {
  const pages = pagesToImport()

  it('lists the panel pages of ADR-I002 §0 with SEO that fits the fields', () => {
    expect(pages.map((p) => p.slug).sort()).toEqual(
      [
        'monitoring',
        'alarmy',
        'kontrola-dostepu',
        'sieci-wifi',
        'teletechnika',
        'anteny',
        'smart-home',
        'naglosnienie',
        'ekrany',
        'ladowarki-ev',
        'uslugi',
        'zaplanuj',
        'kontakt',
        'serwis',
        'dla-architektow',
        'o-firmie',
        'realizacje',
        'poradnik',
      ].sort(),
    )
    for (const page of pages) {
      expect(page.seo.title.length).toBeLessThanOrEqual(70)
      expect(page.seo.title).not.toMatch(/\|/)
      expect(page.seo.description.length).toBeLessThanOrEqual(160)
    }
  })
})

describe('the whole import', () => {
  it('carries no prototype leftovers', () => {
    const text = allMapped()
    expect(text).not.toContain('[svg-path]')
    expect(text).not.toContain('.dc.html')
    expect(text).not.toMatch(/[a-z]\.html/)
    expect(text).not.toContain('ikona:')
  })
})

describe('page SEO (I11)', () => {
  it('keeps the planner title within 60 characters with the site name (P3-23)', () => {
    const page = pagesToImport().find((item) => item.slug === 'zaplanuj')
    expect(page?.seo.title).toBe('Zaplanuj instalację w 2 minuty')
    expect(`${page?.seo.title} | PRO-KOM Instalacje`.length).toBeLessThanOrEqual(60)
  })
})

describe('page SEO of the contact and service pages (I11)', () => {
  it('keeps their titles within 65 characters with the site name', () => {
    for (const slug of ['kontakt', 'serwis', 'dla-architektow']) {
      const page = pagesToImport().find((item) => item.slug === slug)
      expect(`${page?.seo.title} | PRO-KOM Instalacje`.length, slug).toBeLessThanOrEqual(65)
    }
  })
})

describe('architects’ „Nowe rozwiązania” (I16b)', () => {
  const items = archNewsToImport()

  it('imports the 20 cards in order, the unconfirmed ones as drafts with the note', () => {
    expect(items).toHaveLength(20)
    expect(items.map((i) => i.legacyId)).toEqual(items.map((_, k) => k + 1))
    const drafts = items.filter((i) => i.draft)
    expect(drafts).toHaveLength(8)
    for (const d of drafts) expect(d.data.internalNote).toMatch(/^\[SZEF/)
    expect(items.filter((i) => i.data.featured).map((i) => i.legacyId)).toEqual([1])
  })

  it('has no marker in any visible field and drawable illustrations', () => {
    for (const item of items) {
      expect(markerIn(item.data), item.data.title).toBeNull()
      expect(item.data.illustration).toMatch(/^[MmLlHhVvCcSsQqTtAaZz0-9\s.,-]+$/)
      expect(item.data.params?.length).toBeGreaterThanOrEqual(2)
    }
  })
})

describe('SEO titles (P3-23)', () => {
  it('every page title fits 60 characters with the site name', () => {
    const long = pagesToImport()
      .map((page) => `${page.seo.title} | PRO-KOM Instalacje`)
      .filter((title) => title.length > 60)
    expect(long).toEqual([])
  })

  it('every object page title fits too', () => {
    const long = objectsToImport()
      .map((item) => `${objectData(item, refs).seo?.title} | PRO-KOM Instalacje`)
      .filter((title) => title.length > 60)
    expect(long).toEqual([])
  })
})

describe('no photo promises (P0-2, audit 06.11)', () => {
  it('no mapped text asks to send photos or plans — no form takes files', () => {
    expect(allMapped()).not.toMatch(
      /wyślij zdję|prześlij rzuty|wyślesz zdjęci|możesz wysłać wcześniej|zrób zdjęcie|wystarczą zdjęcia/i,
    )
  })

  it('no mapped text has a hard date of the facts (P1-7)', () => {
    expect(allMapped()).not.toMatch(/(październik|października|październiku) 20\d\d/)
  })

  it('no page SEO names WhatsApp (decision 01.11)', () => {
    expect(JSON.stringify(pagesToImport())).not.toMatch(/whats\s?app/i)
  })
})

describe('no law (runda v6 §1.1)', () => {
  it('no mapped text names law nor points at the gone „Przepisy” sections', () => {
    const text = allMapped()
    expect(text.match(new RegExp(LAW_WORDS.source, 'gu')) ?? []).toEqual([])
    expect(text).not.toMatch(/sekcji (przepisów|„Przepisy”)/)
  })

  it('leaves out whole entries: a FAQ pair, an anchor, a fold, a chip', () => {
    expect(
      withoutLaw({
        faq: [
          ['Czy Wi-Fi dla gości wymaga rejestracji w UKE?', 'x'],
          ['Zostaje?', 'tak'],
        ],
        anc: [
          ['przepisy', 'Przepisy'],
          ['faq', 'Pytania'],
        ],
        fold: ['przepisy', 'faq'],
        kept: 'Ustawimy kadr',
      }),
    ).toEqual({
      faq: [['Zostaje?', 'tak']],
      anc: [['faq', 'Pytania']],
      fold: ['faq'],
      kept: 'Ustawimy kadr',
    })
  })
})

describe('forwardSeoTitle (P3-23 on existing databases)', () => {
  it('moves the former guide title without „RODO” (runda v6 §1.1)', () => {
    expect(
      forwardSeoTitle('Poradnik: monitoring, RODO i Wi-Fi', 'Poradnik: monitoring, alarmy i Wi-Fi'),
    ).toBe('Poradnik: monitoring, alarmy i Wi-Fi')
  })

  it('moves a former default title to the new one', () => {
    expect(
      forwardSeoTitle(
        'Alarmy i wideodomofony Rabka-Zdrój, Podhale',
        'Alarmy i wideodomofony na Podhalu',
      ),
    ).toBe('Alarmy i wideodomofony na Podhalu')
    expect(
      forwardSeoTitle(
        'Dla architektów: smart home i teletechnika',
        'Dla architektów: instalacje w projekcie',
      ),
    ).toBe('Dla architektów: instalacje w projekcie')
  })

  it('keeps a title edited in the panel, an empty one and the current one', () => {
    expect(forwardSeoTitle('Nasz własny tytuł', 'Alarmy i wideodomofony na Podhalu')).toBeNull()
    expect(forwardSeoTitle(null, 'Alarmy i wideodomofony na Podhalu')).toBeNull()
    expect(
      forwardSeoTitle('Alarmy i wideodomofony na Podhalu', 'Alarmy i wideodomofony na Podhalu'),
    ).toBeNull()
  })

  it('never moves to a title the seed does not want for that page', () => {
    expect(
      forwardSeoTitle(
        'Alarmy i wideodomofony Rabka-Zdrój, Podhale',
        'Dostęp, monitoring i sieć dla firm',
      ),
    ).toBeNull()
  })
})

describe('anchor bars changed after the prototype (RUNDA-V5 §10)', () => {
  it('point only at sections of the page', () => {
    for (const [key, anchors] of Object.entries(ANCHORS_V5)) {
      expect(
        unknownAnchors(
          key,
          (anchors ?? []).map((a) => a.anchorId),
        ),
      ).toEqual([])
    }
  })
})

describe('no claim about our own salon (runda v6 D3)', () => {
  it('no mapped text says we run it in our salon', () => {
    expect(allMapped()).not.toMatch(/naszym salonie|naszych salonach/)
  })
})

describe('icon review (runda v6 §1.5)', () => {
  it('every fixed title is in the package and every icon is in the set', () => {
    const text = allMapped()
    for (const [title, name] of Object.entries(ICON_FIXES)) {
      expect(text.includes(JSON.stringify(title)), title).toBe(true)
      expect(isInstIconName(name), name).toBe(true)
    }
  })

  it('Smart home, chargers and developers have their own icons', () => {
    const services = servicesToImport().map((item) => serviceData(item, refs))
    expect(services.find((s) => s.key === 'smart')?.icon).toBe('smart')
    expect(services.find((s) => s.key === 'ev')?.icon).toBe('ev')
    const objects = objectsToImport().map((item) => objectData(item, refs))
    expect(objects.find((o) => o.key === 'dev')?.icon).toBe('apt')
  })
})

describe('hero facts of the objects (decision 10.11)', () => {
  it('/dla-kogo/firmy shows „od 2004 / na Podhalu”, no labour cost in zł', () => {
    const firma = objectsToImport()
      .map((item) => objectData(item, refs))
      .find((o) => o.key === 'firma')
    expect(firma?.hero?.facts?.[0]).toMatchObject({ value: 'od 2004', label: 'na Podhalu' })
    expect(JSON.stringify(firma?.hero)).not.toMatch(/zł|koszt pracy/)
  })
})
