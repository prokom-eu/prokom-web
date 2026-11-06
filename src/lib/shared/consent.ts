import { CONSENT_CLAUSE } from '../inquiry/consent'
import type { SharedCompany } from './project'

export type FormConsent = { mode: 'checkbox' | 'info'; text: string }

/**
 * The consent every shared form shows (spec §5 `ContactForm`, ADR-003, ADR-022 „Rozstrzygnięcia
 * D2-3a”). Until a decision on where the wording lives and how an information clause is recorded:
 * - the text is always the code's `CONSENT_CLAUSE` — the server stores that version, and git keeps
 *   each wording; a clause edited in the panel would be shown under a version that never had it;
 * - the mode is always the checkbox — with „info” the record would claim a consent nobody gave.
 * TODO(krystian): [prawnik] `consent.mode` / `consent.clause` from the panel — after the lawyer's
 * opinion and an ADR (versions of the wording, a legal basis stored with an information clause).
 */
export function formConsent(_panel: SharedCompany['consent']): FormConsent {
  return { mode: 'checkbox', text: CONSENT_CLAUSE.text }
}
