import Kontakt from '../../../seed/prokominstalacje/strony-zrzut/Kontakt.json'
import Serwis from '../../../seed/prokominstalacje/strony-zrzut/Serwis.json'
import type { Page } from '../../payload-types'

type Block = NonNullable<Page['layout']>[number]

/**
 * Form pages built in code (I11): the seed gives their page its block once — an empty page or
 * the sample page of `pnpm seed` (`kontakt`), never one with a block of the line — with the hero
 * texts of the prototype (`zrodlo/pages/<Strona>.body.html` — the package has no hero texts for
 * them), and publishes it. No band texts for `zaplanuj`: the page has no CTA band (prototype
 * meta `cta: false`). Changing this file also refreshes
 * the seeded database CI caches by a hash of `src/seed/**` (see `servicePages.ts`).
 */
export const FORM_PAGE_BLOCKS: Record<string, () => Block> = {
  zaplanuj: () => ({
    blockType: 'instPlanner',
    hero: {
      crumb: 'Zaplanuj instalację',
      eyebrow: 'Kreator · 4 krótkie kroki · 2 minuty',
      h1a: 'Zaplanuj instalację:',
      h1b: 'monitoring, alarm, Wi-Fi, smart home na Podhalu.',
      lead: 'Powiedz, co planujesz, a resztę ustalimy na miejscu. Klikasz, zamiast pisać. Po drodze podpowiemy, na co zwrócić uwagę, a na końcu zostawiasz numer. Oddzwonimy i umówimy wizję lokalną.',
    },
  }),
  kontakt: () => ({
    blockType: 'instContact',
    hero: {
      crumb: 'Kontakt',
      eyebrow: 'Kontakt · PRO-KOM Instalacje',
      h1a: 'Kontakt:',
      h1b: 'salony w Rabce-Zdroju i Zakopanem.',
      lead: 'Zadzwoń, napisz albo wpadnij do salonu. Działamy na Podhalu i w okolicach, dalej w Małopolsce dojazd ustalamy indywidualnie. Sprawdź, w jakiej strefie jest Twój obiekt.',
    },
    cta: { eyebrow: Kontakt.dane.ctaEye, heading: Kontakt.dane.ctaH, text: Kontakt.dane.ctaP },
  }),
  serwis: () => ({
    blockType: 'instServiceDesk',
    hero: {
      crumb: 'Serwis i przeglądy',
      eyebrow: 'Serwis instalacji · Rabka-Zdrój, Zakopane, Podhale',
      h1a: 'Coś nie działa?',
      h1b: 'Zgłoś. Sprawdzimy zdalnie albo przyjedziemy.',
      lead: 'Serwisujemy kamery, alarmy, sieci, zamki, smart home, nagłośnienie, ekrany i ładowarki. Także instalacje, które montowała inna firma. Przed sezonem robimy przeglądy, żeby awarie nie trafiały się w pełnym obłożeniu.',
      facts: [
        { value: '2 salony', label: 'Rabka-Zdrój i Zakopane' },
        { value: 'zdalnie', label: 'diagnoza wielu usterek' },
        { value: 'od 2004', label: 'PRO-KOM na Podhalu' },
      ],
      tags: ['Awarie', 'Przeglądy sezonowe', 'Przejęcie instalacji', 'Umowy serwisowe'],
      cta: { text: 'Umów przegląd', href: '#plany' },
    },
    cta: { eyebrow: Serwis.dane.ctaEye, heading: Serwis.dane.ctaH, text: Serwis.dane.ctaP },
  }),
  // The architects' page (I16a, ADR-I005): hero of `Architekci.body.html`; no band (meta `cta: false`).
  'dla-architektow': () => ({
    blockType: 'instArchitects',
    hero: {
      crumb: 'Dla architektów',
      eyebrow: 'Dla architektów, projektantów wnętrz, deweloperów i wykonawców',
      h1a: 'Technika, która nie psuje projektu.',
      h1b: 'Zaplanujmy ją przed tynkami.',
      lead: 'Monitoring, sieć, smart home Ampio, dźwięk, ekrany, anteny i ładowarki. Dostajesz plan urządzeń na rzutach i wytyczne, które da się wpisać w projekt. Inwestor dostaje technikę, której nie widać, i jednego wykonawcę od koncepcji do serwisu.',
      facts: [
        { value: 'od 2004', label: 'instalacje na Podhalu' },
        { value: '10 instalacji', label: 'jeden wykonawca, jeden opiekun' },
        { value: '17 punktów', label: 'do zaplanowania w typowym domu' },
        { value: '24 miesiące', label: 'gwarancji na montaż' },
      ],
    },
  }),
}

// Blocks of the sample `kontakt` page of `pnpm seed` (`src/seed/sample.ts`).
const SAMPLE_BLOCKS = new Set(['contact', 'inquiryForm'])

/**
 * A page the seed may fill: empty, or exactly the sample page of `pnpm seed`. A page laid out
 * in the panel — with the line's block or with other blocks — is left alone.
 */
export const needsFormBlock = (layout: readonly { blockType: string }[] | null | undefined) =>
  (layout ?? []).every((block) => SAMPLE_BLOCKS.has(block.blockType))
