import type { Payload } from 'payload'

import { HOME_SLUG } from '../../lib/pages/slug'
import type { Page } from '../../payload-types'

/**
 * Start content of the Biznes home page (B7, spec. §4 v20). Texts 1:1 from
 * `docs/design/prokombiznes/boards/Main.dc.html`; [SZEF] points stay editable in the panel.
 * Local only, like the rest of `pnpm seed:biznes`.
 */

type HomeBlock = NonNullable<Page['layout']>[number]

/** `KPD` of the board: what each department sells (seed slug of the group → text). */
export const GROUP_DESCRIPTIONS: Record<string, string> = {
  sprz: 'kasy, drukarki fiskalne, POS, terminale, kioski, wagi',
  biuro: 'laptopy, komputery, serwery, NAS, UPS, drukarki, ekrany',
  prog: 'GoPOS, InsERT, Comarch, Insoft, NFHotel, Microsoft 365',
  bezp: 'Wi-Fi Ubiquiti, ESET, firewall, podpis kwalifikowany',
  usl: 'opieka IT, KSeF, serwis kas, przeglądy, dofinansowania',
}

/**
 * [SZEF] trust line of the hero (`SiteSettings.biznes.trustLine`), filled only while empty.
 * The call-back promise is not seeded: a promise shows only once entered in the panel
 * (`SiteSettings` → „Obietnice”; e2e `biznes-catalog` checks the fallback without it).
 */
export const HOME_TRUST_LINE = 'Serwis Posnet i Elzab · partner GoPOS i InsERT'

export function biznesHomeLayout(): HomeBlock[] {
  return [
    {
      blockType: 'bzHero',
      pill: 'Rabka-Zdrój · Podhale · Małopolska',
      heading: 'Kasy, komputery i opieka IT.',
      headingAccent: 'Jeden telefon do wszystkiego.',
      lead: 'Dobieramy, wdrażamy i serwisujemy wszystko, na czym pracuje Twoja firma: od kasy fiskalnej po serwer. Jeden partner z Rabki zamiast kilku firm i infolinii.',
      cta: { label: 'Dobierz zestaw w 60 sekund', href: '/kreator' },
      showPhone: true,
      trustItems: [
        { icon: 'cal', text: 'Na Podhalu od 2004' },
        { icon: 'users', text: '100+ firm pod stałą opieką' },
      ],
      wheelHint: 'Kliknij dział, żeby zobaczyć, co do niego należy',
      planLinkLabel: 'Zobacz plan Twojej firmy ↓',
    },
    {
      blockType: 'bzNeeds',
      items: [
        {
          title: 'Otwieram firmę lub lokal',
          icon: 'store',
          tone: 'green',
          text: 'Kasa, terminal, program i komputery — od zera, gotowe na otwarcie.',
          href: '/kreator',
          // TODO(krystian): [SZEF] ulga 700 zł — potwierdzić w ustawie (spec. §13).
          badges: [
            { value: '700 zł', text: 'zwrotu za kasę online', tone: 'promo' },
            { value: '0 zł', text: 'terminal przez 12 mies.', tone: 'accent' },
          ],
        },
        {
          // TODO(krystian): numer wpisany w tekst i link — po zmianie telefonu linii poprawić
          // też tutaj (w panelu: Strony → Strona główna → Kafelki potrzeb).
          title: 'Coś przestało działać',
          icon: 'flash',
          tone: 'red',
          text: 'Kasa, komputer, drukarka, sieć. Zadzwoń: 889 003 889.',
          href: 'tel:+48889003889',
        },
        {
          // TODO(krystian): [SZEF] treść kafla KSeF do korekty przed publikacją (ZMIANY-v20 §5,
          // spec. §13 pkt 11); link do wpisu KSeF po B11.
          title: 'KSeF od 1 stycznia 2027',
          icon: 'doc',
          tone: 'blue',
          text: 'Program, certyfikat i uprawnienia dla księgowej — przed terminem.',
          href: '/aktualnosci',
          countdownTo: '2027-01-01T00:00:00.000Z',
        },
        {
          title: 'Stała opieka IT',
          icon: 'life',
          tone: 'violet',
          text: 'Informatyk na telefon w stałej opłacie. Zaczynamy od bezpłatnego przeglądu IT.',
          href: '/opieka-it',
          tag: '0 zł przegląd',
        },
      ],
    },
    {
      blockType: 'partners',
      heading: 'Marki, które sprzedajemy, wdrażamy i serwisujemy',
      lead: 'Najedź, żeby zatrzymać',
    },
  ]
}

/**
 * The home layout after seeding: the sample page (no Biznes block yet) is replaced; otherwise
 * the page keeps its blocks, order and duplicates (edited in the panel) and only block types it
 * lacks are inserted — right after the last block that comes before them in the seed.
 * `null` = nothing to change.
 */
export function mergeHomeLayout<T extends { blockType: string }>(
  existing: readonly T[] | null | undefined,
  seed: readonly T[],
): T[] | null {
  const current = existing ?? []
  if (!current.some((block) => block.blockType.startsWith('bz'))) return [...seed]
  const seedOrder = seed.map((block) => block.blockType)
  const layout = [...current]
  let changed = false
  seed.forEach((block, position) => {
    if (layout.some((b) => b.blockType === block.blockType)) return
    const earlier = new Set(seedOrder.slice(0, position))
    let after = -1
    layout.forEach((b, i) => {
      if (earlier.has(b.blockType)) after = i
    })
    layout.splice(after + 1, 0, block)
    changed = true
  })
  return changed ? layout : null
}

type Report = (name: string, changed: boolean) => void
const local = { overrideAccess: true, context: { seed: true }, depth: 0 } as const

/** Home page, group descriptions and the hero's trust line of the Biznes tenant. */
export async function seedBiznesHome(
  payload: Payload,
  tenantId: number,
  groupIds: Map<string, number>,
  report: Report,
): Promise<void> {
  for (const [seedSlug, description] of Object.entries(GROUP_DESCRIPTIONS)) {
    const id = groupIds.get(seedSlug)
    if (id === undefined) continue
    const group = await payload.findByID({ collection: 'catalog-groups', id, ...local })
    const missing = !group.description
    report('catalog-groups description', missing)
    if (missing) {
      await payload.update({ collection: 'catalog-groups', id, data: { description }, ...local })
    }
  }

  const {
    docs: [settings],
  } = await payload.find({
    collection: 'site-settings',
    where: { tenant: { equals: tenantId } },
    limit: 1,
    ...local,
  })
  if (settings) {
    const missing = !settings.biznes?.trustLine
    report('site-settings trust line', missing)
    if (missing) {
      await payload.update({
        collection: 'site-settings',
        id: settings.id,
        data: { biznes: { ...settings.biznes, trustLine: HOME_TRUST_LINE } },
        ...local,
      })
    }
  }

  const {
    docs: [home],
  } = await payload.find({
    collection: 'pages',
    where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: HOME_SLUG } }] },
    limit: 1,
    ...local,
  })
  const seed = biznesHomeLayout()
  if (!home) {
    await payload.create({
      collection: 'pages',
      data: {
        title: 'Strona główna',
        slug: HOME_SLUG,
        layout: seed,
        tenant: tenantId,
        _status: 'published',
      },
      ...local,
    })
    report('pages home', true)
    return
  }
  const layout = mergeHomeLayout(home.layout, seed)
  report('pages home', layout !== null)
  if (layout) {
    await payload.update({
      collection: 'pages',
      id: home.id,
      data: { layout, _status: 'published' },
      ...local,
    })
  }
}
