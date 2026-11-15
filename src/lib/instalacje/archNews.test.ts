import { describe, expect, it } from 'vitest'

import { markerIn, publishWithMarker } from './archNews'

const card = {
  title: 'Wi-Fi 7 z sufitu i ze ściany',
  description: 'Punkty dostępowe Wi-Fi 7.',
  params: [{ label: 'Pasmo', value: '2,4 / 5 / 6 GHz' }],
  planItems: [{ text: 'Kabel Cat6A do każdego punktu' }],
  examples: 'np. UniFi U7',
  places: [{ name: 'Dom' }],
}

describe('InstArchNews markers (ADR-I005 §2)', () => {
  it('finds [SZEF and [CENA in any visible field', () => {
    expect(markerIn(card)).toBeNull()
    expect(markerIn({ ...card, title: 'Głośniki [SZEF: marka]' })).toBe('title')
    expect(markerIn({ ...card, params: [{ label: 'Cena', value: '[CENA]' }] })).toBe('params')
    expect(markerIn({ ...card, planItems: [{ text: '[SZEF] do potwierdzenia' }] })).toBe(
      'planItems',
    )
    expect(markerIn({ ...card, places: [{ name: '[szef: gdzie]' }] })).toBe('places')
  })

  it('ignores the internal note — it is never rendered', () => {
    expect(markerIn({ ...card, internalNote: '[SZEF: dostępność marki u nas]' })).toBeNull()
  })

  it('blocks publishing with a marker, allows a draft with one', () => {
    const marked = { ...card, examples: 'np. [SZEF: marki Hi-Fi]' }
    expect(publishWithMarker({ ...marked, _status: 'published' })).toBe('examples')
    expect(publishWithMarker({ ...marked, _status: 'draft' })).toBeNull()
    expect(publishWithMarker({ ...card, _status: 'published' })).toBeNull()
  })

  it('merges a partial update with the stored document', () => {
    const stored = { ...card, description: 'Opis [CENA]', _status: 'published' as const }
    // Publishing an old draft that still carries a marker: the stored text counts.
    expect(publishWithMarker({ _status: 'published' }, stored)).toBe('description')
    // The marker removed in this save: fine.
    expect(publishWithMarker({ description: 'Opis' }, stored)).toBeNull()
  })
})
