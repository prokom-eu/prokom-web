import type { Payload } from 'payload'

import type { ShowcaseStatus } from '../../lib/catalog/catalogIndex'
import { HOME_SLUG } from '../../lib/pages/slug'
import type { Page } from '../../payload-types'
import type { IconName } from '../../lib/catalog/options'
import { factsBlocks } from './homeFacts'
import {
  K4_BRANDS,
  K4_FEATURED,
  K4_HERO,
  K4_TRUST_LINE,
  OLD_TRUST_LINE,
  upgradeHomeK4,
} from './homeK4'
import { nextDescription } from './description'
import { planBlocks } from './homePlan'
import { upgradeHomePlan } from './homePlanK31d'
import { upgradeHomeV150 } from './homeV150'
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
export const HOME_TRUST_LINE = K4_TRUST_LINE

/** SEO → Opis of the home page (audit 01.11.2026; ≤ 155 characters, unique on the site). */
export const HOME_DESCRIPTION =
  'Kasy fiskalne, komputery, programy i opieka IT dla firm z Podhala i Małopolski. Dobór, wdrożenie i serwis z Rabki-Zdroju.'

export function biznesHomeLayout(refs: HomeRefs = NO_REFS): HomeBlock[] {
  return [
    {
      blockType: 'bzHero',
      pill: 'Rabka-Zdrój · Podhale · Małopolska',
      // v150 (K36 §1): the texts of the board.
      heading: K4_HERO.heading,
      headingAccent: K4_HERO.headingAccent,
      lead: K4_HERO.lead,
      cta: { ...K4_HERO.cta },
      showPhone: true,
      trustItems: K4_HERO.trustItems.map((item) => ({
        icon: item.icon as IconName,
        text: item.text,
      })),
      wheelHint: 'Kliknij dział, żeby zobaczyć, co do niego należy',
      planLinkLabel: 'Zobacz plan Twojej firmy ↓',
    },
    {
      blockType: 'bzNeeds',
    },
    {
      blockType: 'bzOffer',
      eyebrow: 'Oferta',
      // v150 (board `#s4-dz`); the label gets „· 5 działów · N pozycji” on the page.
      heading: 'Kasy, komputery, programy, sieć i serwis',
      lead: 'Sprzęt, programy i usługi od {marki} marek. Każdy dział z doborem, wdrożeniem i serwisem. Cen nie ma na stronie: dodajesz pozycje do zapytania, a wycenę przygotujemy pod Twoją firmę.',
      catalogLabel: 'Cała oferta',
      // Board `#s4-dz`: the sixth tile (hard space after a one-letter word, K4-FINAL §1).
      searchEyebrow: 'Nie wiesz, w którym dziale szukać?',
      searchHeading: 'Wpisz, czego potrzebujesz, a znajdziemy to za\u00a0Ciebie.',
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
          // K4-FINAL §1: no pricing model of the IT care („Zakres ustalamy w umowie”).
          title: 'Stała opieka IT',
          text: 'Informatyk na telefon: monitoring, kopie, aktualizacje i serwis. Zakres ustalamy w umowie. Zaczynamy od bezpłatnego przeglądu.',
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
      blockType: 'partners',
      // v150 (K36 §1): the brands section after the departments.
      heading: K4_BRANDS.heading,
      lead: K4_BRANDS.lead,
    },
    {
      blockType: 'bzFeatured',
      eyebrow: 'Najczęściej wybierane',
      // v150 (K35 7a): the texts of the board.
      heading: K4_FEATURED.heading,
      lead: K4_FEATURED.lead,
      catalogLabel: K4_FEATURED.catalogLabel,
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
    // Empty, or still the pre-K4 wording (K4-FINAL §1: „Autoryzowany serwis/partner”).
    const missing = !settings.biznes?.trustLine || settings.biznes.trustLine === OLD_TRUST_LINE
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
        slug: HOME_SLUG,
        seo: { description: HOME_DESCRIPTION },
        layout: seed,
        tenant: tenantId,
        _status: 'published',
      },
      ...local,
    })
    report('pages home', true)
    return
  }
  const merged = mergeHomeLayout(home.layout, seed)
  // K4c: the v150 texts and order in a page the seed made earlier (`homeK4.ts`).
  const k4 = upgradeHomeK4(merged ?? home.layout) ?? merged
  // PR 3b: the v150 texts below the hero, without „Jedna firma czy pięć” and the news.
  const v150 = upgradeHomeV150(k4 ?? home.layout, seed) ?? k4
  // K31d′: the plan 2.0 texts and the scenes of the industry tiles.
  const layout = upgradeHomePlan(v150 ?? home.layout) ?? v150
  const seo = nextDescription(home.seo?.description, HOME_DESCRIPTION)
  report('pages home', layout !== null || seo !== null)
  if (layout || seo) {
    await payload.update({
      collection: 'pages',
      id: home.id,
      data: {
        ...(layout && { layout, _status: 'published' as const }),
        ...(seo && { seo: { ...home.seo, description: seo } }),
      },
      ...local,
    })
  }
}
