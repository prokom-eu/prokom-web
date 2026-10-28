import { describe, expect, it } from 'vitest'

import { CONSENT_CLAUSE } from './consent'
import {
  buildSoftwareContactBody,
  checkSoftwareContactRequired,
  type SoftwareContactValues,
} from './contactForm'
import { parseInquiryInput } from './schema'
import { SOFTWARE_TOPIC_LABELS } from './types'

const values: SoftwareContactValues = {
  topic: 'system',
  message: 'Mamy 3 ekipy, zlecenia idą SMS-em.',
  name: 'Anna, Twoja Firma',
  contact: 'anna@example.com',
  consent: true,
  website: '',
}

const href = 'https://software.localhost/?utm_source=google&gclid=x#kontakt'

describe('Software contact form (SW8b)', () => {
  it('asks for the description, the name, a usable contact and the consent', () => {
    expect(checkSoftwareContactRequired(values)).toEqual({})
    expect(
      Object.keys(
        checkSoftwareContactRequired({
          ...values,
          message: ' ',
          name: '',
          contact: 'jutro',
          consent: false,
        }),
      ),
    ).toEqual(['message', 'name', 'contact', 'consent'])
  })

  it('sends a `contact` inquiry with the topic, accepted by the Software schema', () => {
    const body = buildSoftwareContactBody(values, { href, formToken: 't' })
    expect(body).toMatchObject({
      type: 'contact',
      topics: ['system'],
      email: 'anna@example.com',
      name: 'Anna, Twoja Firma',
      source: { url: 'https://software.localhost/', utmSource: 'google' },
      consent: { accepted: true, clauseVersion: CONSENT_CLAUSE.version },
    })
    expect(body).not.toHaveProperty('phone')
    expect(parseInquiryInput(body, 'software').success).toBe(true)
  })

  it('stores a phone number as the phone, and no topic when none is picked', () => {
    const body = buildSoftwareContactBody(
      { ...values, topic: null, contact: '+48 600 100 200' },
      { href, formToken: 't' },
    )
    expect(body).toMatchObject({ phone: '+48 600 100 200', topics: [] })
    expect(parseInquiryInput(body, 'software').success).toBe(true)
  })

  it('names the topics as the spec does (spec. §7)', () => {
    expect(Object.values(SOFTWARE_TOPIC_LABELS)).toEqual([
      'Strona',
      'System lub panel',
      'Aplikacja mobilna',
      'Rozbudowa',
      'Opieka lub ratunek',
      'Audyt',
    ])
  })
})
