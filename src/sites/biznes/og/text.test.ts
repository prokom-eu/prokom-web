import { describe, expect, it } from 'vitest'

import { firstSentence, ogDomain, titleSize } from './text'

describe('Biznes sharing image texts', () => {
  it('shows the domain without a port', () => {
    expect(ogDomain('biznes.localhost%3A3001')).toBe('biznes.localhost')
    expect(ogDomain('prokombiznes.pl')).toBe('prokombiznes.pl')
  })

  it('takes the first sentence of a panel text, null when there is none', () => {
    expect(firstSentence('Kasy i POS dla firm. PRO-KOM, od 2004.')).toBe('Kasy i POS dla firm.')
    expect(firstSentence('Bez kropki na końcu')).toBe('Bez kropki na końcu')
    expect(firstSentence('KSeF 2.0 w programie. Drugie.')).toBe('KSeF 2.0 w programie.')
    expect(firstSentence('  ')).toBeNull()
    expect(firstSentence(null)).toBeNull()
  })

  it('steps the title size down for long titles', () => {
    expect(titleSize('Krótki tytuł')).toBe(70)
    expect(titleSize('x'.repeat(70))).toBe(60)
    expect(titleSize('x'.repeat(90))).toBe(52)
    expect(titleSize('x'.repeat(130))).toBe(46)
  })
})
