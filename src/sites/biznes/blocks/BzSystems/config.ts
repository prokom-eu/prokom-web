import type { Block } from 'payload'

import { systemsField } from '../BzOffer/config'

/**
 * „Systemy, które u Ciebie wdrożymy” (runda 1411, board `Systemy.dc.html`): the three navy cards
 * GoPOS · InsERT · Stała opieka IT after „Oferta” — the subsection moved out of it. The badge of a
 * partner card is the partner's status from `Partners` ([SZEF]), never free text.
 */
export const BzSystemsBlock: Block = {
  slug: 'bzSystems',
  interfaceName: 'BzSystemsBlock',
  labels: {
    singular: 'Biznes: systemy, które wdrożymy',
    plural: 'Biznes: systemy, które wdrożymy',
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'eyebrow', label: 'Nadtytuł', type: 'text' },
        { name: 'heading', label: 'Nagłówek H2', type: 'text', required: true },
      ],
    },
    { name: 'note', label: 'Dopisek po prawej', type: 'text' },
    systemsField,
  ],
}
