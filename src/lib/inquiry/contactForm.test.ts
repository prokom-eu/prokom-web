import { describe, expect, it } from 'vitest'

import { CONSENT_CLAUSE } from './consent'
import {
  buildSoftwareContactBody,
  checkSoftwareContactRequired,
  type SoftwareContactValues,
  talkWayFor,
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

  describe('/kontakt (SW11a)', () => {
    it('sends „Twój projekt” as a `list` of solutions, the description optional', () => {
      const body = buildSoftwareContactBody(
        { ...values, message: '', items: ['strona-wizytowka', 'opieka'] },
        { href, formToken: 't' },
      )
      expect(body).toMatchObject({
        type: 'list',
        topics: ['system'],
        items: [
          { slug: 'strona-wizytowka', quantity: 1 },
          { slug: 'opieka', quantity: 1 },
        ],
      })
      expect(parseInquiryInput(body, 'software').success).toBe(true)
      expect(checkSoftwareContactRequired({ ...values, message: '', items: ['opieka'] })).toEqual(
        {},
      )
    })

    it('stays a `contact` with an empty list', () => {
      const body = buildSoftwareContactBody({ ...values, items: [] }, { href, formToken: 't' })
      expect(body.type).toBe('contact')
      expect(body).not.toHaveProperty('items')
    })

    it('sends the way to talk; „E-mail” needs an e-mail address', () => {
      const body = buildSoftwareContactBody(
        { ...values, preferredContact: 'meeting' },
        { href, formToken: 't' },
      )
      expect(body).toMatchObject({ preferredContact: 'meeting' })
      expect(parseInquiryInput(body, 'software').success).toBe(true)
      expect(
        checkSoftwareContactRequired({
          ...values,
          contact: '+48 600 100 200',
          preferredContact: 'email',
        }),
      ).toEqual({ contact: true })
    })
  })

  describe('the way to talk before the customer picks one (SW11a, z przeglądu)', () => {
    it('follows what was typed: an e-mail address → e-mail, else phone', () => {
      expect(talkWayFor(null, 'anna@example.com')).toBe('email')
      expect(talkWayFor(null, '600 100 200')).toBe('phone')
      expect(talkWayFor(null, '')).toBe('phone')
    })

    it('keeps the customer’s own choice', () => {
      expect(talkWayFor('meeting', 'anna@example.com')).toBe('meeting')
      expect(talkWayFor('phone', 'anna@example.com')).toBe('phone')
    })
  })
})
