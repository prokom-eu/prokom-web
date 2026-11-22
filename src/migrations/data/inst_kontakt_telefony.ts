import type { SiteSetting } from '../../payload-types'

/**
 * Contact of Instalacje (Krystian 22.11.2026), frozen for the data migration
 * `inst_kontakt_telefony`: the main number without „+48” (like Biznes; `tel:` adds the code), the
 * second number of the line, no „Zgłoś awarię” link in the brand bar and no fact repeating the
 * response promise. Each field changes only
 * while it still holds the old value (or nothing, for the second number) — an edit in the panel wins.
 */

export const INST_PHONE_OLD = '+48 889 003 889'
export const INST_PHONE = '889 003 889'
export const INST_PHONE2 = '501 046 249'
export const INST_SLOT_OLD = 'Zgłoś awarię'
/** The facts bar repeated the response promise shown right under it: the fact goes. */
export const INST_FACT_OLD = { label: 'Odpowiedź', value: 'Do 24 h w dni robocze' }

type Contact = Pick<SiteSetting, 'phone' | 'phone2' | 'shared'>
type Update = { phone?: string; phone2?: string; shared?: NonNullable<SiteSetting['shared']> }

/** Fields to write on the Instalacje `SiteSettings`; `null` = nothing to change. */
export function instContactUpdate(site: Contact): Update | null {
  const update: Update = {}
  if (site.phone?.trim() === INST_PHONE_OLD) update.phone = INST_PHONE
  if (!site.phone2?.trim()) update.phone2 = INST_PHONE2
  let shared = site.shared ?? null
  if (shared && shared.brandBarSlot?.label?.trim() === INST_SLOT_OLD) {
    shared = { ...shared, brandBarSlot: { label: null, href: null } }
  }
  const facts = shared?.contact?.facts
  const repeated = (fact: { label?: string | null; value?: string | null }) =>
    fact.label?.trim() === INST_FACT_OLD.label && fact.value?.trim() === INST_FACT_OLD.value
  if (shared?.contact && facts?.some(repeated)) {
    shared = { ...shared, contact: { ...shared.contact, facts: facts.filter((f) => !repeated(f)) } }
  }
  if (shared && shared !== site.shared) update.shared = shared
  return Object.keys(update).length > 0 ? update : null
}
