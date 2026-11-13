import { describe, expect, it } from 'vitest'

import { biznesLlmsTxt, type BiznesLlmsInput } from './llms'

const input: BiznesLlmsInput = {
  origin: 'https://prokombiznes.pl',
  name: 'PRO-KOM Biznes',
  company: 'PRO-KOM Tadeusz Wójciak',
  phones: ['889 003 889', '883 200 151'],
  email: 'kontakt@prokombiznes.pl',
  address: 'ul. Orkana 16B, 34-700 Rabka-Zdrój',
  hours: ['pn–pt 9:00–17:00'],
  areas: ['Rabka-Zdrój', 'Nowy Targ', 'Zakopane'],
  // The panel's partners with a status — InsERT has none of its products published here.
  statuses: [
    { name: 'Elzab', status: 'authorized-service' },
    { name: 'Posnet', status: 'authorized-service' },
    { name: 'InsERT', status: 'authorized-partner' },
    { name: 'GoPOS', status: 'authorized-partner' },
    { name: 'Optivendi', status: 'partner' },
    { name: 'COMEX', status: 'cooperation' },
  ],
  // As `brandLinks` gives them: a salon 2.0 under its brands' names, then brand pages.
  brands: [
    { name: 'Konica Minolta i Kyocera', slug: 'druk' },
    { name: 'Lenovo', slug: 'lenovo' },
  ],
  groups: [
    {
      name: 'Kasy i POS',
      categories: [
        { name: 'Kasy fiskalne', slug: 'kasy-fiskalne' },
        { name: 'Terminale płatnicze', slug: 'terminale-platnicze' },
      ],
    },
  ],
  industries: [{ name: 'Gastronomia', slug: 'gastronomia' }],
  pages: [
    { title: 'Opieka IT', slug: 'opieka-it' },
    { title: 'GoPOS', slug: 'gopos' },
  ],
}

describe('biznesLlmsTxt (llmstxt.org; SEO lokalne 13.11 — a summary for AI assistants)', () => {
  const text = biznesLlmsTxt(input)

  it('starts with the name and a one-paragraph summary that says what and where', () => {
    const [title, , summary] = text.split('\n')
    expect(title).toBe('# PRO-KOM Biznes')
    expect(summary).toMatch(/^> /)
    expect(summary).toMatch(/kasy fiskalne/i)
    expect(summary).toMatch(/Rabk/)
    expect(summary).toMatch(/Podhal/)
  })

  it('lists the area, contact and salon from the panel', () => {
    expect(text).toContain('Rabka-Zdrój, Nowy Targ, Zakopane')
    expect(text).toContain('ul. Orkana 16B, 34-700 Rabka-Zdrój')
    expect(text).toContain('889 003 889')
    expect(text).toContain('883 200 151')
    expect(text).toContain('kontakt@prokombiznes.pl')
    expect(text).toContain('pn–pt 9:00–17:00')
  })

  it('names partner statuses exactly as K4-FINAL §1 and none for other brands', () => {
    expect(text).toContain('Autoryzowany serwis Posnet i Elzab')
    expect(text).toContain('Autoryzowany partner GoPOS')
    expect(text).toContain('Autoryzowany partner InsERT')
    expect(text).toContain('Partner Optivendi')
    expect(text).toContain('We współpracy z COMEX')
    expect(text).not.toMatch(/(partner|serwis|współpracy)[^\n]*Lenovo/i)
  })

  it('links categories, brand pages, industries and pages with full addresses', () => {
    expect(text).toContain('[Kasy fiskalne](https://prokombiznes.pl/oferta/kasy-fiskalne)')
    expect(text).toContain('[Lenovo](https://prokombiznes.pl/marki/lenovo)')
    expect(text).toContain('[Konica Minolta i Kyocera](https://prokombiznes.pl/marki/druk)')
    expect(text).not.toContain('/marki/kyocera')
    expect(text).toContain('[Gastronomia](https://prokombiznes.pl/branze/gastronomia)')
    expect(text).toContain('[Opieka IT](https://prokombiznes.pl/opieka-it)')
  })

  it('has no prices and no contact the panel did not give', () => {
    expect(text).not.toMatch(/\bzł\b|PLN|cen[aęy] od/i)
    const bare = biznesLlmsTxt({ ...input, phones: [], email: null, address: null, hours: [] })
    expect(bare).not.toMatch(/Telefon|E-mail|Salon:|Godziny/)
  })
})
