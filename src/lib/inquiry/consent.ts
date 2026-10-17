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
