import type { Payload } from 'payload'

import type { ShowcaseStatus } from '../../lib/catalog/catalogIndex'
import { HOME_SLUG } from '../../lib/pages/slug'
import type { Page } from '../../payload-types'
import { factsBlocks } from './homeFacts'
import { planBlocks } from './homePlan'
import { mergeLayout } from '../layout'

/**
 * Start content of the Biznes home page (B7, spec. §4 v20). Texts 1:1 from
 * `docs/design/prokombiznes/boards/Main.dc.html`; [SZEF] points stay editable in the panel.
 * Local only, like the rest of `pnpm seed:biznes`.
 */

type HomeBlock = NonNullable<Page['layout']>[number]

/** Ids of records the seed made earlier: images by file name, brands by name. */
export type HomeRefs = {
  image: (file: string) => number | undefined
  brand: (name: string) => number | undefined
  /** By the industry's slug in the seed package (`gastro`, `handel`, …). */
  industry: (seedSlug: string) => number | undefined
}

const NO_REFS: HomeRefs = {
  image: () => undefined,
  brand: () => undefined,
  industry: () => undefined,
}

/**
 * Top of the department cards (`CatalogGroups.showcase`, ZMIANY-v20 §2.2): product pictures of
 * the board (ergo + d3, tp + srvT, nexo + goposScr, u7 + eset), status rows for services.
 */
export const GROUP_SHOWCASES: Record<
  string,
  { images: string[] } | { statuses: ShowcaseStatus[] }
> = {
  sprz: { images: ['p-posnet-ergo.webp', 'p-sunmi-d3-pro.webp'] },
  biuro: { images: ['p-lenovo-thinkpad.webp', 'p-dell-poweredge-tower.webp'] },
  prog: { images: ['p-insert-subiekt-nexo.webp', 'p-gopos-ekran.webp'] },
  bezp: { images: ['p-ubiquiti-u7.webp', 'p-eset.webp'] },
  usl: {
    statuses: [
      { label: 'Opieka IT', value: 'aktywna', tone: 'ok' },
      { label: 'Przegląd kasy', value: 'za 43 dni', tone: 'warn' },
    ],
  },
}

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

export function biznesHomeLayout(refs: HomeRefs = NO_REFS): HomeBlock[] {
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
    {
      blockType: 'bzOffer',
      eyebrow: 'Oferta',
      heading: 'Wszystko dla firmy, w pięciu działach.',
      lead: '{produkty} produktów i usług od {marki} marek. Cen nie ma na stronie: dodajesz pozycje do zapytania, a wycenę dostajesz na piśmie, pod swoją firmę.',
      catalogLabel: 'Cały katalog',
      systemsHeading: 'Systemy, które wdrażamy od początku do końca',
      systemsNote: 'Dwa autoryzowane partnerstwa i nasza usługa opieki IT',
      systems: [
        {
          // Badge = the brand's status in Partners ([SZEF]); none until set in the panel.
          partner: refs.brand('GoPOS'),
          title: 'GoPOS dla gastronomii',
          text: 'Jeden system na salę, kuchnię i dowozy. Sprzęt Sunmi i Posnet, szkolenie w lokalu i serwis w sezonie.',
          link: { label: 'Poznaj GoPOS z PRO-KOM', href: '/gopos' },
          mode: 'image',
          image: refs.image('p-gopos-zestaw.webp'),
        },
        {
          partner: refs.brand('InsERT'),
          title: 'Subiekt i programy InsERT',
          text: 'Dobieramy program, przenosimy dane i łączymy go z kasą i KSeF. Szkolimy na Twoich dokumentach.',
          link: { label: 'Który Subiekt dla mnie?', href: '/insert' },
          mode: 'image',
          image: refs.image('p-insert-subiekt-nexo.webp'),
        },
        {
          badge: 'Usługa PRO-KOM',
          title: 'Opieka IT w abonamencie',
          text: 'Informatyk na telefon w stałej opłacie: monitoring, kopie, aktualizacje i serwis. Zaczynamy od bezpłatnego przeglądu.',
          link: { label: 'Umów bezpłatny przegląd IT', href: '/opieka-it' },
          mode: 'statuses',
          statuses: [
            { label: 'Kopia danych z nocy', value: 'sprawdzona', tone: 'ok' },
            { label: 'Aktualizacje na 4 komputerach', value: 'gotowe', tone: 'ok' },
            { label: 'Przegląd kasy fiskalnej', value: 'za 43 dni', tone: 'warn' },
          ],
        },
      ],
    },
    {
      blockType: 'bzFeatured',
      eyebrow: 'Najczęściej wybierane',
      heading: 'Osiem pozycji, o które firmy pytają najczęściej.',
      lead: 'Każdą dodasz do zapytania jednym kliknięciem. Resztę oferty znajdziesz w katalogu.',
      catalogLabel: 'Cały katalog',
      offerCard: {
        eyebrow: 'Cała oferta',
        heading: 'Zobacz wszystko, co sprzedajemy, wdrażamy i serwisujemy.',
        text: 'Filtry po dziale, marce i branży. Dodajesz do zapytania, a my wyceniamy na piśmie.',
        button: { label: 'Poznaj całą ofertę', href: '/oferta' },
      },
      wizardCard: {
        eyebrow: 'Nie wiesz, od czego zacząć?',
        heading: 'Odpowiedz na 4 pytania. Dobierzemy zestaw pod Twoją firmę.',
        text: 'Rodzaj firmy, skala, potrzeby i kontakt. Zestaw trafia do nas jako zapytanie, bez rejestracji.',
        button: { label: 'Dobierz zestaw w 60 sekund', href: '/kreator' },
        steps: [
          { label: 'Branża', value: 'gastronomia' },
          { label: 'Skala', value: '2 kasy · 3 komputery' },
          { label: 'Potrzeby', value: 'dowozy, Wi-Fi, KSeF' },
          { label: 'Kontakt', value: 'imię i telefon' },
        ],
        summaryLabel: 'Twój zestaw:',
        summary: 'GoPOS · Sunmi D3 PRO · Posnet HX · terminal · Wi-Fi',
      },
    },
    ...planBlocks(refs.industry),
    ...factsBlocks(refs.brand),
  ]
}

/** The home layout after seeding (`mergeLayout` with the Biznes blocks, `bz*`). */
export function mergeHomeLayout<T extends { blockType: string }>(
  existing: readonly T[] | null | undefined,
  seed: readonly T[],
): T[] | null {
  return mergeLayout(existing, seed, { own: (block) => block.blockType.startsWith('bz') })
}

type Report = (name: string, changed: boolean) => void
const local = { overrideAccess: true, context: { seed: true }, depth: 0 } as const

/** Home page, department cards (descriptions, showcases) and the hero's trust line. */
export async function seedBiznesHome(
  payload: Payload,
  tenantId: number,
  groupIds: Map<string, number>,
  refs: HomeRefs,
  report: Report,
): Promise<void> {
  for (const [seedSlug, showcase] of Object.entries(GROUP_SHOWCASES)) {
    const id = groupIds.get(seedSlug)
    if (id === undefined) continue
    const group = await payload.findByID({ collection: 'catalog-groups', id, ...local })
    const missing = !group.showcase?.images?.length && !group.showcase?.statuses?.length
    const images =
      'images' in showcase ? showcase.images.flatMap((file) => refs.image(file) ?? []) : []
    const data =
      'images' in showcase
        ? { mode: 'images' as const, images }
        : { mode: 'statuses' as const, statuses: showcase.statuses }
    // Pictures not imported (yet): nothing to write, and no "updated" on every run.
    const empty = 'images' in showcase && images.length === 0
    report('catalog-groups showcase', missing && !empty)
    if (!missing || empty) continue
    await payload.update({ collection: 'catalog-groups', id, data: { showcase: data }, ...local })
  }

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
  const seed = biznesHomeLayout(refs)
  if (!home) {
    await payload.create({
      collection: 'pages',
      data: {
        title: 'Strona główna',
        // TODO(krystian): meta description strony głównej (SEO → Opis) — Lighthouse SEO 92 bez
        // niej (B7d); treść do panelu, seed jej nie wymyśla.
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
