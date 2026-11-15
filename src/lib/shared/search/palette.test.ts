import { describe, expect, it } from 'vitest'

import { matchActions, paletteActions } from './palette'

// Spec §5.1 dodatek 5: actions from the panel data, key words bring them to the top.
const full = paletteActions({
  phone: '889 003 889',
  phone2: '883 200 151',
  email: 'kontakt@prokombiznes.test',
  mapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Orkana',
  primary: { label: 'Zapytanie', href: '/zapytanie', icon: 'doc' },
  themes: true,
})
const kinds = (list: { kind: string }[]) => list.map((action) => action.kind)

describe('paletteActions', () => {
  it('lists the line actions in a fixed order, with links from the data', () => {
    expect(kinds(full)).toEqual([
      'call',
      'call2',
      'copy',
      'mail',
      'route',
      'primary',
      'contact',
      'theme',
    ])
    expect(full[0]).toMatchObject({ href: 'tel:+48889003889', short: 'Zadzwoń' })
    expect(full.find((a) => a.kind === 'mail')?.href).toBe('mailto:kontakt@prokombiznes.test')
    expect(full.find((a) => a.kind === 'copy')?.value).toBe('889 003 889')
  })

  it('leaves out what the panel has no data for (no literal fallback)', () => {
    const bare = paletteActions({ phone: null, email: null, mapsUrl: null })
    expect(kinds(bare)).toEqual(['contact'])
  })
})

describe('matchActions', () => {
  it('finds actions by their key words, without Polish letters', () => {
    expect(kinds(matchActions(full, 'telefon'))).toEqual(['call', 'call2', 'copy'])
    expect(kinds(matchActions(full, 'dzwoń'))).toEqual(['call', 'call2'])
    expect(kinds(matchActions(full, 'jak dojechać do was'))).toEqual(['route'])
    expect(kinds(matchActions(full, 'ciemny'))).toEqual(['theme'])
    expect(kinds(matchActions(full, 'zapyt'))).toEqual(['primary'])
  })

  it('stays out of the way of ordinary queries and of an empty field', () => {
    expect(matchActions(full, 'kasa fiskalna')).toEqual([])
    // Whole words only (D2-2b review): no phone for TV, no route for „do”, no mail for „na”.
    expect(matchActions(full, 'telewizja')).toEqual([])
    expect(matchActions(full, 'telewizor')).toEqual([])
    expect(matchActions(full, 'alarm do domu')).toEqual([])
    expect(matchActions(full, 'kamera na parking')).toEqual([])
    expect(matchActions(full, 'po')).toEqual([])
    expect(matchActions(full, '')).toEqual([])
    expect(matchActions(full, 'a')).toEqual([])
  })
})
