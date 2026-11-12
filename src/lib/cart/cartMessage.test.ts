import { describe, expect, it } from 'vitest'

import { cartMessage } from './cartMessage'

describe('cartMessage (the inquiry list under the contact message, plan 0611 §8.2)', () => {
  const names = new Map([
    ['posnet-ergo-online', 'Posnet Ergo Online'],
    ['polcard-terminal', 'Terminal płatniczy PolCard'],
  ])

  it('lists the products with their quantity and note, by name', () => {
    expect(
      cartMessage(
        [
          { id: 'posnet-ergo-online', q: 2, uwaga: 'z szufladą' },
          { id: 'polcard-terminal', q: 1 },
        ],
        names,
      ),
    ).toBe(
      'Lista „Do zapytania” (2 pozycje):\n' +
        '- Posnet Ergo Online × 2 (uwaga: z szufladą)\n' +
        '- Terminal płatniczy PolCard × 1',
    )
  })

  it('a product the catalog does not know keeps its address; an empty list gives nothing', () => {
    expect(cartMessage([{ id: 'stary-model', q: 1 }], names)).toBe(
      'Lista „Do zapytania” (1 pozycja):\n- stary-model × 1',
    )
    expect(cartMessage([], names)).toBeNull()
  })
})
