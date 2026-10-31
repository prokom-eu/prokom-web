import type { Payload } from 'payload'

import faqPackage from '../../../seed/prokomsoftware/faq.json'
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
  lead: 'Opowiadasz, jak pracuje Twoja firma. Pokazujemy, jak będzie wyglądać Twoja strona, system albo aplikacja, **zanim zapłacisz**. Cena i termin na piśmie. Firma z Rabki, od 2004 r.',
  primary: { label: 'Dobierz rozwiązanie', href: '/#dobierz' },
  primaryBadge: '60 s',
  secondary: { label: 'Zobacz podglądy', href: '/#podglady' },
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

/**
 * FAQ of the start page (spec. §4 pkt 11) — the shared block in the Software look; heading and
 * lead from the board `Main`, the 6 questions from `faq.json` → `homeFaq` (`[OPIEKA OD]` is
 * filled on render).
 */
export const SW_FAQ: Extract<Block, { blockType: 'faq' }> = {
  blockType: 'faq',
  eyebrow: 'Zanim napiszesz',
  heading: 'Pytania, które słyszymy najczęściej',
  lead: 'Nie ma Twojego? Zadaj je w formularzu poniżej, odpowiadamy konkretnie.',
  items: faqPackage.homeFaq.map(({ q, a }) => ({ question: q, answer: a })),
}

/**
 * Contact block of the start page (spec. §4 pkt 12) — texts of the board `Main`; promises with
 * facts (`[MIESIĄC]` is empty in the package, so that one stays hidden on production).
 */
export const SW_CONTACT: Extract<Block, { blockType: 'swContact' }> = {
  blockType: 'swContact',
  eyebrow: 'Kontakt',
  title: 'Powiedz, co Cię boli. Resztą zajmiemy się my.',
  sideTitle: 'Najpierw zobaczysz, potem zapłacisz.',
  sideText:
    'Po krótkiej rozmowie dostajesz: szkic rozwiązania, zakres, cenę i termin. Wszystko na piśmie. Bez zobowiązań.',
  promises: [
    { text: 'Odpowiadamy w ciągu [CZAS ODPOWIEDZI]' },
    { text: 'Spotkanie w Rabce, Zakopanem, u Ciebie albo online' },
    // TODO(krystian): wording not in the package — taken from spec. §13 pkt 11.
    { text: 'Najbliższy wolny termin: [MIESIĄC]' },
  ],
  auditTitle: 'Masz już stronę?',
  auditHref: '/audyt',
  auditText: 'Zrób darmowy audyt: szybkość, telefon, Google i AI. Wynik na piśmie.',
  phoneCaption: '[GODZINY]',
  topicsLabel: 'Czego dotyczy sprawa?',
  messageLabel: 'Opisz krótko, po swojemu',
  messagePlaceholder: 'np. Mamy 3 ekipy, zlecenia idą SMS-em, a protokoły piszemy na kartkach…',
  nameLabel: 'Imię i firma',
  namePlaceholder: 'Anna, Twoja Firma',
  contactLabel: 'E-mail albo telefon',
  contactPlaceholder: 'jak mamy się odezwać?',
  submit: 'Wyślij',
  alternative: 'Wolisz kliknąć niż pisać?',
  alternativeLink: { label: 'Dobierz rozwiązanie w 60 sekund', href: '/#dobierz' },
}

const isSection = (key: string): key is HomeSectionValue =>
  HOME_SECTIONS.some((section) => section.value === key)

/**
 * Blocks of the start page in the package order; `intents` are part of the hero block, `faq` is
 * the shared FAQ block, `contact` the `swContact` block.
 */
export function softwareHomeLayout(
  order: readonly string[] = stronaGlowna.homeOrder.order,
  built: readonly HomeSectionValue[] = BUILT_HOME_SECTIONS,
): Block[] {
  return order.flatMap((key): Block[] => {
    if (key === 'hero') return [structuredClone(SW_HERO)]
    if (key === 'faq') return [structuredClone(SW_FAQ)]
    if (key === 'contact') return [structuredClone(SW_CONTACT)]
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

/**
 * A start page in the v20 order (the wizard after the process, SW5–SW8b) gets the v21 order once
 * (SWR5, spec. §4): the blocks the seed knows take the seed order in the places they hold; any
 * other block stays where it is. `null` = not a v20 page (a page ordered in the panel is left).
 */
export function softwareHomeInV21Order(
  layout: readonly Block[],
  seed: readonly Block[],
): Block[] | null {
  const at = (section: string) =>
    layout.findIndex((b) => identity(b) === `swHomeSection:${section}`)
  const process = at('process')
  const wizard = at('wizard')
  if (process < 0 || wizard < 0 || process > wizard) return null
  const order = seed.map(identity)
  const slots = layout.flatMap((block, i) => (order.includes(identity(block)) ? [i] : []))
  const known = slots
    .map((i) => layout[i]!)
    .sort((a, b) => order.indexOf(identity(a)) - order.indexOf(identity(b)))
  const result = [...layout]
  slots.forEach((slot, k) => {
    result[slot] = known[k]!
  })
  return result
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
  const merged = mergeSoftwareHome(home.layout, seed)
  const layout = softwareHomeInV21Order(merged ?? home.layout ?? [], seed) ?? merged
  count('pages home', layout ? 'updated' : false)
  if (!layout) return
  await payload.update({
    collection: 'pages',
    id: home.id,
    data: { layout, _status: 'published' },
    ...local,
  })
}
