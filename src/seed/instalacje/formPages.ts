import Zaplanuj from '../../../seed/prokominstalacje/strony-zrzut/Zaplanuj.json'
import type { Page } from '../../payload-types'

type Block = NonNullable<Page['layout']>[number]

/**
 * Form pages built in code (I11): the seed gives their empty page its block once, with the hero
 * texts of the prototype (`zrodlo/pages/<Strona>.body.html` — the package has no hero texts for
 * them) and the band texts of the package, and publishes it. Changing this file also refreshes
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
    cta: { eyebrow: Zaplanuj.dane.ctaEye, heading: Zaplanuj.dane.ctaH, text: Zaplanuj.dane.ctaP },
  }),
}
