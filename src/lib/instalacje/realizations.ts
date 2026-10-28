type ConsentState = { _status?: 'draft' | 'published' | null; clientConsent?: boolean | null }

/**
 * A realization names a real client, so it goes public only with the client's consent
 * (ADR-I002 §2). True = the save would publish (or keep published) a realization without it.
 * A save that does not send the status or the consent keeps the stored one (a partial REST or
 * Local API update has no `_status`).
 */
export function publishWithoutConsent(data: ConsentState, stored?: ConsentState): boolean {
  if ((data._status ?? stored?._status) !== 'published') return false
  const consent = data.clientConsent ?? stored?.clientConsent
  return consent !== true
}
