import { describe, expect, it } from 'vitest'

import { parseInquiryInput } from '@/lib/inquiry/schema'
import { ARCH_INQUIRY } from '@/lib/instalacje/architects'

import { INITIAL_CHECKLIST } from './architektModel'
import {
  checklistBody,
  emailError,
  INITIAL_EMAIL,
  INITIAL_PROJECT,
  newsBody,
  projectBody,
  projectError,
  projectSummary,
} from './formModel'

const send = { href: 'https://prokominstalacje.pl/dla-architektow', formToken: 't', website: '' }
const accepted = (body: unknown) => parseInquiryInput(body, 'instalacje').success

describe('„Wyślij rzuty”', () => {
  const filled = {
    ...INITIAL_PROJECT,
    name: 'Anna Kowalska',
    firm: 'Pracownia A',
    phone: '600 100 200',
    town: 'Zakopane',
    link: 'https://example.test/rzuty',
    message: 'Dom z poddaszem.',
    consent: true,
  }

  it('asks for the name, a phone of 9 digits and consent, in that order', () => {
    expect(projectError(INITIAL_PROJECT)).toBe('name')
    expect(projectError({ ...filled, phone: '600 100' })).toBe('phone')
    expect(projectError({ ...filled, consent: false })).toBe('consent')
    expect(projectError(filled)).toBeNull()
  })

  it('sends a project inquiry the server accepts, the choices in the message', () => {
    const body = projectBody(filled, send)
    expect(accepted(body)).toBe(true)
    expect(body).toMatchObject({
      type: 'contact',
      category: ARCH_INQUIRY.project,
      company: 'Pracownia A',
      city: 'Zakopane',
    })
    expect(body.message).toContain('Kim jestem: Architekt')
    expect(body.message).toContain('Etap projektu: Projekt budowlany')
    expect(body.message).toContain('Link do rzutów: https://example.test/rzuty')
    expect(projectSummary(filled)).toBe('Architekt · Projekt budowlany · Dom')
    // Without a phone the server refuses it too (the line's rule).
    expect(accepted(projectBody({ ...filled, phone: '' }, send))).toBe(false)
  })
})

describe('checklist PDF and news by e-mail', () => {
  const filled = { ...INITIAL_EMAIL, name: 'Anna', email: 'anna@pracownia.test', consent: true }

  it('asks for the name, an e-mail and consent; the news also the commercial consent', () => {
    expect(emailError(INITIAL_EMAIL, 'checklist')).toBe('name')
    expect(emailError({ ...filled, email: 'anna@' }, 'checklist')).toBe('email')
    expect(emailError({ ...filled, consent: false }, 'checklist')).toBe('consent')
    expect(emailError(filled, 'checklist')).toBeNull()
    expect(emailError(filled, 'news')).toBe('marketing')
    expect(emailError({ ...filled, marketing: true }, 'news')).toBeNull()
  })

  it('sends inquiries the server accepts without a phone, with the checklist choice', () => {
    const pdf = checklistBody(filled, INITIAL_CHECKLIST, send)
    expect(accepted(pdf)).toBe(true)
    expect(pdf).toMatchObject({ category: ARCH_INQUIRY.checklist, marketingConsent: false })
    expect(pdf.message).toContain('Obiekt: Dom jednorodzinny')
    expect(pdf.message).toContain('Sieć i Wi-Fi')
    const news = newsBody({ ...filled, marketing: true }, send)
    expect(accepted(news)).toBe(true)
    expect(news).toMatchObject({ category: ARCH_INQUIRY.news, marketingConsent: true })
  })
})
