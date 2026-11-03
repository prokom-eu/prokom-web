import { INQUIRY_PAGE_PATH } from '@/lib/biznes/mobileNav'
import { HOME_SLUG } from '@/lib/pages/slug'

/**
 * Sections a Biznes page leaves out below 768 px, because its phone board (App-*) has no such
 * section (decyzja Krystiana 02.11: „telefon jak plansza”). They stay in the HTML (and in the
 * FAQPage data) and on a computer; only `max-md:hidden` hides them. A rule names the block type and,
 * optionally, the section kind (`variant`).
 */
type Rule = { type: string; variant?: string }

type BlockLike = { blockType: string; variant?: string | null }

const RULES: Record<string, readonly Rule[]> = {
  // App-Start: no FAQ and no numbers.
  [HOME_SLUG]: [{ type: 'faq' }, { type: 'bzFacts' }],
  // App-KSeF: hero, quiz, steps, penalties with the button, sources.
  ksef: [{ type: 'faq' }, { type: 'bzSection', variant: 'band' }],
  // App-Ulga: hero, who may use it, steps, when to give it back, tills, sources.
  'ulga-na-kase-fiskalna': [{ type: 'faq' }, { type: 'bzSection', variant: 'band' }],
  // App-Kontakt: hero with the channels, „Z czym dzwonisz?”, the way here, about us, FAQ.
  kontakt: [
    { type: 'bzSection', variant: 'contact-form' },
    { type: 'bzSection', variant: 'lines' },
  ],
  // App-OFirmie: hero with the company data, trust cards, how we work, the lines, brands, the
  // closing band — no „Gdzie nas znaleźć”.
  'o-firmie': [{ type: 'bzLocation' }],
  // App-GoPOS: every section but the producer's numbers under the hero.
  gopos: [{ type: 'bzSection', variant: 'stats' }],
}

/** The contact form (`#formularz` on /kontakt) is not shown below 768 px. */
const FORM_LINK = /^(?:\/kontakt)?#formularz$/

/**
 * Where a link to the contact form leads on a phone: the inquiry page (same fields, works with an
 * empty list — decyzja Krystiana 02.11), so no button points at a hidden section. Other links: null.
 */
export function phoneFormHref(href: string): string | null {
  return FORM_LINK.test(href) ? INQUIRY_PAGE_PATH : null
}

export function hiddenOnPhone(slug: string, block: BlockLike): boolean {
  return (RULES[slug] ?? []).some(
    (rule) =>
      rule.type === block.blockType &&
      (rule.variant === undefined || rule.variant === block.variant),
  )
}
