/**
 * The privacy clause shown next to the consent checkbox (ADR-003). Every inquiry stores the
 * version it was accepted with, so changing the text means a new `version` here — git keeps
 * the old wording for the record.
 */
export const CONSENT_CLAUSE = {
  version: '2026-10-17',
  // TODO(krystian): final wording from the privacy policy (administrator, purpose, retention,
  // rights) — confirm with the boss before the first production release.
  text:
    'Wyrażam zgodę na przetwarzanie moich danych osobowych przez PRO-KOM Tadeusz Wójciak ' +
    'w celu odpowiedzi na to zapytanie. Szczegóły w polityce prywatności.',
} as const

/** Promise made to the customer in the confirmation e-mail. */
// TODO(krystian): confirm the response time with the boss (per line, if it differs).
export const RESPONSE_TIME = 'w ciągu 1 dnia roboczego'

/** Words of the clause that link to the policy (`linkInText`); keep them in the text. */
export const PRIVACY_POLICY_LINK_TEXT = 'polityce prywatności'

/** Same path on every domain; the page itself is a `Pages` entry of each site. */
// TODO(krystian): create the privacy policy page on every site before production (404 until then).
export const PRIVACY_POLICY_PATH = '/polityka-prywatnosci'

/** Optional marketing consent, separate from the one needed to answer (ADR-003). */
// TODO(krystian): wording to confirm with the boss (channels: e-mail, phone).
export const MARKETING_CONSENT_TEXT =
  'Chcę otrzymywać od PRO-KOM informacje o nowościach i promocjach (zgoda dobrowolna, ' +
  'można ją wycofać w każdej chwili).'

/** Under the button of the Biznes inquiry forms (K4-FINAL §1 and §5: only confirmed promises). */
export const INQUIRY_ADMIN_NOTE =
  'Oddzwaniamy w ciągu 60 minut w godzinach pracy. Dane wykorzystamy tylko do przygotowania ' +
  'oferty; administrator: PRO-KOM Tadeusz Wójciak, Rabka-Zdrój.'
