import { describe, expect, it } from 'vitest'

import { CONSENT_CLAUSE } from '../inquiry/consent'
import { formConsent } from './consent'

// D2-3a review (ADR-003): what a visitor sees must be the wording stored with the inquiry's
// version, and an information clause must not be saved as a given consent.
describe('formConsent', () => {
  it('always shows the clause from the code — the version the server stores', () => {
    const consent = formConsent({
      mode: 'checkbox',
      version: CONSENT_CLAUSE.version,
      clause: 'Inny tekst z panelu.',
    })
    expect(consent).toEqual({ mode: 'checkbox', text: CONSENT_CLAUSE.text })
  })

  it('keeps the checkbox while „info” waits for the lawyer and its own ADR', () => {
    expect(formConsent({ mode: 'info', version: null, clause: null }).mode).toBe('checkbox')
  })
})
