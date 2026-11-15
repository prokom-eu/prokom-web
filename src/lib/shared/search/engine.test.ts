import { describe, expect, it } from 'vitest'

import { prepareItems, searchItems } from './engine'
import { normalizeText } from './normalize'

// The shared engine on a plain line index (spec §5.1: Instalacje / Software search dialog) —
// the Biznes catalog keeps its own tests in `lib/search.test.ts`.
const entries = [
  { title: 'Monitoring CCTV', text: 'Kamery dla domu i firmy' },
  { title: 'Alarmy', text: 'System alarmowy Satel' },
  { title: 'Sieci Wi-Fi', text: 'Zasięg w całym pensjonacie' },
].map((item) => ({
  item,
  name: item.title,
  hay: normalizeText(`${item.title} ${item.text}`),
}))

const prepared = prepareItems(entries, {
  synonyms: { kamera: ['monitoring'] },
  stopWords: ['dla'],
})
const titles = (query: string) => searchItems(prepared, query)?.map((item) => item.title)

describe('shared search engine', () => {
  it('finds by name first, without Polish letters and with a typo', () => {
    expect(titles('monitoring')).toEqual(['Monitoring CCTV'])
    expect(titles('zasieg')).toEqual(['Sieci Wi-Fi'])
    expect(titles('monitorng')).toEqual(['Monitoring CCTV'])
  })

  it('every token must match; stop words and synonyms from the line settings', () => {
    expect(titles('alarm satel')).toEqual(['Alarmy'])
    expect(titles('alarm wifi')).toEqual([])
    expect(searchItems(prepared, 'dla')).toBeNull()
    expect(titles('kamera')).toEqual(['Monitoring CCTV'])
  })
})
