import type { Payload } from 'payload'

import stronaGlowna from '../../../seed/prokomsoftware/strona-glowna.json'
import { HOME_SLUG } from '../../lib/pages/slug'
import {
  BUILT_HOME_SECTIONS,
  HOME_SECTIONS,
  type HomeSectionValue,
} from '../../lib/software/homeSections'
import type { Page } from '../../payload-types'
import { mergeLayout } from '../layout'

/**
 * Start page of the Software tenant (SW5): the blocks in the order of `strona-glowna.json` →
 * `homeOrder` (spec. §4, decision SWD1 D2 — the order lives only in the blocks). A section gets
 * its block once its component exists; later sessions add theirs to `BUILT_HOME_SECTIONS` and the
 * seed inserts the new block in its place, leaving blocks edited in the panel as they are.
 */

type Block = NonNullable<Page['layout']>[number]

/** Hero and intent tiles — texts of the board `Main` (HTML, not in the package files). */
export const SW_HERO: Extract<Block, { blockType: 'swHero' }> = {
  blockType: 'swHero',
  eyebrow: 'Rabka-Zdrój · Podhale · zdalnie w całej Polsce',
  title: 'Strony, systemy i aplikacje',
  titleAccent: 'szyte pod Twoją firmę.',
  lead: 'Opisujesz, jak pracuje Twoja firma. My pokazujemy, jak będzie wyglądać Twoja strona, system albo aplikacja, zanim zapłacisz. Potem cena i termin na piśmie. Firma z Rabki, od 2004 r.',
  primary: { label: 'Dobierz rozwiązanie', href: '/#dobierz' },
  primaryBadge: '60 s',
  secondary: { label: 'Zobacz podglądy na żywo', href: '/#podglady' },
  response: 'Odpowiadamy w ciągu **[CZAS ODPOWIEDZI]**',
  trust: [
    { text: 'Podgląd przed zakupem', icon: 'monitor' },
    { text: 'Kod i dane należą do Ciebie', icon: 'key' },
    { text: 'Firma na Podhalu od 2004', icon: 'shield' },
  ],
  intents: [
    {
      title: 'Potrzebuję strony, która sprzedaje',
      text: 'Firmowa, pensjonatu, lokalu albo landing. Szybka, w kilku językach, przygotowana pod Google.',
      icon: 'site',
      tone: 'www',
      href: '/rozwiazania?kategoria=strony',
    },
    {
      title: 'Chcę system, który ogarnie firmę',
      text: 'Zlecenia, grafik, klienci, magazyn, rozliczenia. Koniec z Excelem, kartkami i SMS-ami.',
      icon: 'panel',
      tone: 'sys',
      href: '/dobierz?potrzeba=prog',
    },
    {
      title: 'Mam program, ale czegoś mu brakuje',
      text: 'Dobudujemy moduł, panel albo aplikację do programu, za który już płacisz. Nic nie wyrzucasz.',
      icon: 'plug',
      tone: 'auto',
      href: '/rozwiazania?sytuacja=brakuje-czegos',
    },
    {
      title: 'Chcę aplikację na telefon',
      text: 'iOS i Android z jednego kodu. Dla klientów albo dla ludzi w terenie, także bez zasięgu.',
      icon: 'phone',
      tone: 'app',
      href: '/rozwiazania?kategoria=aplikacje',
    },
  ],
}

const isSection = (key: string): key is HomeSectionValue =>
  HOME_SECTIONS.some((section) => section.value === key)

/** Blocks of the start page in the package order; `intents` are part of the hero block. */
export function softwareHomeLayout(
  order: readonly string[] = stronaGlowna.homeOrder.order,
  built: readonly HomeSectionValue[] = BUILT_HOME_SECTIONS,
): Block[] {
  return order.flatMap((key): Block[] => {
    if (key === 'hero') return [structuredClone(SW_HERO)]
    if (isSection(key) && built.includes(key)) {
      return [{ blockType: 'swHomeSection', section: key }]
    }
    return []
  })
}

const identity = (block: Block) =>
  block.blockType === 'swHomeSection' ? `swHomeSection:${block.section}` : block.blockType

/** The layout after seeding: the sample page is replaced, missing Software blocks inserted. */
export function mergeSoftwareHome(
  existing: readonly Block[] | null | undefined,
  seed: readonly Block[],
): Block[] | null {
  return mergeLayout(existing, seed, {
    own: (block) => block.blockType.startsWith('sw'),
    identity,
  })
}

type Count = (name: string, result: boolean | 'updated') => void
const local = { overrideAccess: true, context: { seed: true }, depth: 0 } as const

/** Creates the published start page of the tenant, or adds the blocks it lacks. */
export async function seedSoftwareHome(payload: Payload, tenantId: number, count: Count) {
  const seed = softwareHomeLayout()
  const {
    docs: [home],
  } = await payload.find({
    collection: 'pages',
    where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: HOME_SLUG } }] },
    limit: 1,
    ...local,
  })
  if (!home) {
    await payload.create({
      collection: 'pages',
      data: {
        tenant: tenantId,
        title: 'Strona główna',
        slug: HOME_SLUG,
        layout: seed,
        _status: 'published',
      },
      ...local,
    })
    count('pages home', true)
    return
  }
  const layout = mergeSoftwareHome(home.layout, seed)
  count('pages home', layout ? 'updated' : false)
  if (!layout) return
  await payload.update({
    collection: 'pages',
    id: home.id,
    data: { layout, _status: 'published' },
    ...local,
  })
}
