import { describe, expect, it } from 'vitest'

import { hubLlmsTxt, type HubLlmsInput } from './llms'

const input: HubLlmsInput = {
  origin: 'https://pro-kom.eu',
  company: 'PRO-KOM Tadeusz Wójciak',
  phone: '883 200 151',
  email: 'kontakt@example.test',
  address: 'ul. Przykładowa 1, 00-000 Rabka-Zdrój',
  hours: 'pn–pt 9:00–17:00',
  lines: [
    {
      name: 'PRO-KOM Biznes',
      url: 'https://prokombiznes.pl',
      description: 'Kasy, komputery, opieka IT',
      phone: '889 003 889',
      phone2: '883 200 151',
    },
    { name: 'PRO-KOM Tech', url: 'https://prokomserwis.pl/', description: null, phone: null },
    { name: 'Bez strony', url: null, description: 'nic', phone: null },
  ],
  pages: [
    { href: '/', label: 'Strona główna' },
    { href: '/kontakt', label: 'Kontakt' },
  ],
}

describe('hubLlmsTxt (llms.txt of pro-kom.eu)', () => {
  const text = hubLlmsTxt(input)

  it('starts with the name and a summary for AI assistants', () => {
    expect(text.startsWith('# PRO-KOM\n\n> ')).toBe(true)
    expect(text).toContain('PRO-KOM Tadeusz Wójciak')
    expect(text).toContain('Rabka-Zdrój')
  })

  it('gives the contact data from the panel', () => {
    expect(text).toContain('- Salon: ul. Przykładowa 1, 00-000 Rabka-Zdrój.')
    expect(text).toContain('- Telefon: 883 200 151')
    expect(text).toContain('- E-mail: kontakt@example.test')
    expect(text).toContain('- Godziny: pn–pt 9:00–17:00')
  })

  it('links each line with a site, without the lines that have none', () => {
    expect(text).toContain(
      '- [PRO-KOM Biznes](https://prokombiznes.pl/): Kasy, komputery, opieka IT. Telefon: 889 003 889, 883 200 151.',
    )
    expect(text).toContain('- [PRO-KOM Tech](https://prokomserwis.pl/)\n')
    expect(text).not.toContain('Bez strony')
  })

  it('adds the second number of the hub, never twice the same', () => {
    const both = hubLlmsTxt({ ...input, phone2: '889 003 889' })
    expect(both.split('\n')).toContain('- Telefon: 883 200 151, 889 003 889')
    const same = hubLlmsTxt({ ...input, phone2: '883 200 151' })
    expect(same.split('\n')).toContain('- Telefon: 883 200 151')
  })

  it('lists the hub pages with absolute addresses', () => {
    expect(text).toContain('- [Strona główna](https://pro-kom.eu/)')
    expect(text).toContain('- [Kontakt](https://pro-kom.eu/kontakt)')
  })

  it('skips missing contact rows instead of printing empty ones', () => {
    const bare = hubLlmsTxt({ ...input, phone: null, email: null, address: null, hours: null })
    expect(bare).not.toMatch(/Telefon: \n|E-mail|Salon|Godziny/)
  })
})
