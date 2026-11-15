import { describe, expect, it } from 'vitest'

import { buildLineProvider, GROUP_LIMIT, synonymMap, type LineSearchEntry } from './lineProvider'

const entry = (id: string, title: string, group: string, text = ''): LineSearchEntry => ({
  id,
  title,
  group,
  text,
  href: `/${id}`,
})

const entries = [
  entry('monitoring', 'Monitoring CCTV', 'Usługi', 'kamery dla domu i firmy'),
  entry('alarmy', 'Alarmy', 'Usługi', 'system alarmowy Satel'),
  entry('pensjonaty', 'Pensjonaty', 'Dla kogo', 'monitoring parkingu i recepcji'),
  entry('faq-zasieg', 'Jaki zasięg ma Wi-Fi?', 'Pytania', 'zasięg w całym budynku'),
]

describe('synonymMap', () => {
  it('lets every word of a panel group find the others', () => {
    expect(synonymMap(['kamera, monitoring, CCTV'])).toEqual({
      kamera: ['monitoring', 'cctv'],
      monitoring: ['kamera', 'cctv'],
      cctv: ['kamera', 'monitoring'],
    })
  })
})

describe('buildLineProvider (spec §5.1)', () => {
  const provider = buildLineProvider(entries, {
    synonyms: ['kamera, monitoring'],
    popular: ['monitoring', 'alarm'],
    shortcuts: [{ label: 'Zaplanuj instalację', href: '/zaplanuj' }],
  })

  it('groups the results in index order, best hit first inside a group', () => {
    const groups = provider.query('monitoring')
    expect(groups.map((group) => group.title)).toEqual(['Usługi', 'Dla kogo'])
    expect(groups[0]?.results.map((result) => result.id)).toEqual(['monitoring'])
  })

  it('finds through a synonym from the panel and with a typo', () => {
    expect(provider.query('kamera')[0]?.results[0]?.id).toBe('monitoring')
    expect(provider.query('alrmy')[0]?.results[0]?.id).toBe('alarmy')
  })

  it('nothing found → no groups (the dialog offers „Zapytaj o”)', () => {
    expect(provider.query('zxqvbn')).toEqual([])
  })

  it('empty state: shortcuts from the panel; popular phrases passed on', () => {
    expect(provider.empty()[0]?.results.map((result) => result.href)).toEqual(['/zaplanuj'])
    expect(provider.popular).toEqual(['monitoring', 'alarm'])
    expect(buildLineProvider(entries).empty()).toEqual([])
  })

  it('shows at most GROUP_LIMIT results of one group', () => {
    const many = Array.from({ length: 10 }, (_, i) => entry(`s${i}`, `Strona ${i}`, 'Strony'))
    expect(buildLineProvider(many).query('strona')[0]?.results).toHaveLength(GROUP_LIMIT)
  })
})
