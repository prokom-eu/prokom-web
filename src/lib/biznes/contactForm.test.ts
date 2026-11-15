import { describe, expect, it } from 'vitest'

import { contactBody, prefillFromSearch } from './contactForm'

const TOPICS = ['Kasa, POS albo terminal', 'Awaria albo serwis', 'Inna sprawa']

const VALUES = {
  name: 'Anna',
  company: '',
  nip: '',
  email: '',
  phone: '600100200',
  message: 'Otwieramy kawiarnię.',
  city: 'Nowy Targ',
  topics: ['Awaria albo serwis'],
  consent: true,
  marketingConsent: false,
  website: '',
}

describe('prefillFromSearch (Kontakt routes, „Zapytaj o …” of the search)', () => {
  it('picks the topic of `?temat=` when the form has it', () => {
    expect(prefillFromSearch('?temat=awaria%20albo%20serwis', TOPICS)).toEqual({
      topic: 'Awaria albo serwis',
      phrase: null,
    })
  })

  it('a topic the form does not have is ignored; `?fraza=` starts the message', () => {
    expect(prefillFromSearch('?temat=Gaming&fraza=%20Posnet%20Ergo%20', TOPICS)).toEqual({
      topic: null,
      phrase: 'Posnet Ergo',
    })
  })
})

describe('contactBody (plan 0611 §8.2: the list „Do zapytania” goes with the message)', () => {
  const context = { href: 'https://prokombiznes.pl/kontakt', formToken: 't' }

  it('puts the attached list under the visitor’s message', () => {
    const body = contactBody(VALUES, ['Lista „Do zapytania”:\n- Posnet Ergo × 2'], context)
    expect(body.message).toBe('Otwieramy kawiarnię.\n\nLista „Do zapytania”:\n- Posnet Ergo × 2')
    expect(body.type).toBe('contact')
    expect(body.topics).toEqual(['Awaria albo serwis'])
  })

  it('an empty message carries only the list; no list — the message as typed', () => {
    expect(contactBody({ ...VALUES, message: '' }, ['Lista'], context).message).toBe('Lista')
    expect(contactBody(VALUES, [], context).message).toBe('Otwieramy kawiarnię.')
  })
})
