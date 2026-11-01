import type { Block } from 'payload'

import { formPageFields } from '../formPageFields'

/**
 * The guide (`/poradnik`, I12): posts of the tenant (`Posts`, `/poradnik/<slug>`) and short answers on
 * the service pages, by category. One block for the whole page, as its first block (it carries the h1).
 * The hero and the band before the footer are edited in the panel, the rest lives in code.
 */
export const InstGuideBlock: Block = {
  slug: 'instGuide',
  interfaceName: 'InstGuideBlock',
  labels: { singular: 'Instalacje: poradnik', plural: 'Instalacje: poradniki' },
  fields: formPageFields,
}
