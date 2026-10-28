import { describe, expect, it } from 'vitest'

import { publishWithoutConsent } from './realizations'

describe('publishWithoutConsent', () => {
  it('refuses publishing without the client consent', () => {
    expect(publishWithoutConsent({ _status: 'published', clientConsent: false })).toBe(true)
    expect(publishWithoutConsent({ _status: 'published' })).toBe(true)
  })

  it('allows publishing with the consent', () => {
    expect(publishWithoutConsent({ _status: 'published', clientConsent: true })).toBe(false)
  })

  it('allows drafts without the consent', () => {
    expect(publishWithoutConsent({ _status: 'draft', clientConsent: false })).toBe(false)
    expect(publishWithoutConsent({ clientConsent: false })).toBe(false)
  })

  it('takes the consent of the stored document when the save does not send it', () => {
    expect(publishWithoutConsent({ _status: 'published' }, { clientConsent: true })).toBe(false)
  })

  it('refuses unticking the consent of a published realization', () => {
    expect(
      publishWithoutConsent(
        { _status: 'published', clientConsent: false },
        { _status: 'published', clientConsent: true },
      ),
    ).toBe(true)
  })

  it('takes the status of the stored document when the save does not send it', () => {
    expect(
      publishWithoutConsent(
        { clientConsent: false },
        { _status: 'published', clientConsent: true },
      ),
    ).toBe(true)
    expect(
      publishWithoutConsent({ clientConsent: false }, { _status: 'draft', clientConsent: true }),
    ).toBe(false)
  })
})
