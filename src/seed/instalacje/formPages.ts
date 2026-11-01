import Kontakt from '../../../seed/prokominstalacje/strony-zrzut/Kontakt.json'
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
}

// Blocks of the sample `kontakt` page of `pnpm seed` (`src/seed/sample.ts`).
const SAMPLE_BLOCKS = new Set(['contact', 'inquiryForm'])

/**
 * A page the seed may fill: empty, or exactly the sample page of `pnpm seed`. A page laid out
 * in the panel — with the line's block or with other blocks — is left alone.
 */
export const needsFormBlock = (layout: readonly { blockType: string }[] | null | undefined) =>
  (layout ?? []).every((block) => SAMPLE_BLOCKS.has(block.blockType))
