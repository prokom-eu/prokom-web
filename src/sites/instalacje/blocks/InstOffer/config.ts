import type { Block } from 'payload'

import { formPageFields } from '../formPageFields'

/**
 * The full offer (`/uslugi`, I12): the 76 solutions of `InstSolutions` by area, the object filter
 * and the search. One block for the whole page, as its first block (it carries the h1).
 * The hero and the band before the footer are edited in the panel, the rest lives in code.
 */
export const InstOfferBlock: Block = {
  slug: 'instOffer',
  interfaceName: 'InstOfferBlock',
  labels: { singular: 'Instalacje: pełna oferta', plural: 'Instalacje: pełne oferty' },
  fields: formPageFields,
}
