import type { Payload } from 'payload'

import faqPackage from '../../../seed/prokomsoftware/faq.json'
import { HOME_SLUG } from '../../lib/pages/slug'
import {
  BUILT_HOME_SECTIONS,
  HOME_ORDER_V24,
  HOME_SECTIONS,
  type HomeSectionValue,
} from '../../lib/software/homeSections'
import type { Page } from '../../payload-types'
import { mergeLayout } from '../layout'

/**
 * Start page of the Software tenant (SW5): the blocks in the v24 order `HOME_ORDER_V24` (ZMIANY-v24
 * §4; until SWA2 the package's `homeOrder`; decision SWD1 D2 — the order lives only in the blocks). A section gets
 * its block once its component exists; later sessions add theirs to `BUILT_HOME_SECTIONS` and the
 * seed inserts the new block in its place, leaving blocks edited in the panel as they are.
 */

type Block = NonNullable<Page['layout']>[number]

/** Hero and intent tiles — texts of the board `Main` (HTML, not in the package files). */
export const SW_HERO: Extract<Block, { blockType: 'swHero' }> = {
  blockType: 'swHero',
  eyebrow: 'Rabka-Zdrój · zdalnie w całej Polsce',
  title: 'Strony i programy dla firm.',
  titleAccent: 'Zobaczysz, zanim zapłacisz.',
  lead: 'Opowiadasz, jak pracujecie. W 5–7 dni dostajesz podgląd do klikania oraz **cenę i termin na piśmie**. Strona, system do zleceń albo aplikacja na telefon. Firma z Rabki-Zdroju, od 2004 r.',
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
      href: '/rozwiazania?kategoria=strony',
    },
    {
      title: 'Chcę system, który ogarnie firmę',
      text: 'Zlecenia, grafik, klienci, magazyn, rozliczenia. Koniec z Excelem, kartkami i SMS-ami.',
      icon: 'panel',
      href: '/dobierz?potrzeba=prog',
    },
    {
      title: 'Mam program, ale czegoś mu brakuje',
      text: 'Dobudujemy moduł, panel albo aplikację do programu, za który już płacisz. Nic nie wyrzucasz.',
      icon: 'plug',
      href: '/rozwiazania?sytuacja=brakuje-czegos',
    },
    {
      title: 'Chcę aplikację na telefon',
      text: 'iOS i Android z jednego kodu. Dla klientów albo dla ludzi w terenie, także bez zasięgu.',
      icon: 'phone',
      href: '/rozwiazania?kategoria=aplikacje',
    },
  ],
}

/**
 * FAQ of the start page (spec. §4 pkt 11) — the shared block in the Software look; heading of v24
 * (`TRESCI-v24` § s_8, no lead: the form stands next to it), the 6 questions from `faq.json` →
 * `homeFaq` (`[OPIEKA OD]` is filled on render).
 */
export const SW_FAQ: Extract<Block, { blockType: 'faq' }> = {
  blockType: 'faq',
  eyebrow: 'Pytania',
  heading: 'Zanim napiszesz',
  items: faqPackage.homeFaq.map(({ q, a }) => ({ question: q, answer: a })),
}

/**
 * Contact block of the start page (spec. §4 pkt 12) — heading, the line under it („side title”)
 * and the button of v24 (`TRESCI-v24` § s_8); the promises, audit card and side text are shown by
 * the v23 look only (no empty „najbliższy wolny termin”, ZMIANY-v23 §2).
 */
export const SW_CONTACT: Extract<Block, { blockType: 'swContact' }> = {
  blockType: 'swContact',
  eyebrow: 'Kontakt',
  title: 'Napisz po swojemu',
  sideTitle: 'Odpowiadamy w ciągu [CZAS ODPOWIEDZI]. Zawsze człowiek.',
  sideText:
    'Po krótkiej rozmowie dostajesz: szkic rozwiązania, zakres, cenę i termin. Bez zobowiązań.',
  promises: [
    { text: 'Odpowiadamy w ciągu [CZAS ODPOWIEDZI]' },
    { text: 'Spotkanie w Rabce-Zdroju, u Ciebie w firmie albo online' },
  ],
  auditTitle: 'Masz już stronę?',
  auditHref: '/audyt',
  auditText: 'Zrób darmowy audyt: szybkość, telefon, Google i AI. Raport w 2 dni robocze.',
  phoneCaption: '[GODZINY]',
  topicsLabel: 'Czego dotyczy sprawa?',
  messageLabel: 'Opisz krótko, po swojemu',
  messagePlaceholder: 'np. Mamy 3 ekipy, zlecenia idą SMS-em, a protokoły piszemy na kartkach…',
  nameLabel: 'Imię i firma',
  namePlaceholder: 'Anna, Twoja Firma',
  contactLabel: 'E-mail albo telefon',
  contactPlaceholder: 'jak mamy się odezwać?',
  submit: 'Wyślij wiadomość',
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
  order: readonly string[] = HOME_ORDER_V24,
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
