import type { Block } from 'payload'

import { formPageFields } from '../formPageFields'

/**
 * The realizations (`/realizacje`, I12): published realizations with the client's consent, filters
 * by installation and object. One block for the whole page, as its first block (it carries the h1).
 * The hero and the band before the footer are edited in the panel, the rest lives in code.
 */
export const InstRealizationsBlock: Block = {
  slug: 'instRealizations',
  interfaceName: 'InstRealizationsBlock',
  labels: { singular: 'Instalacje: realizacje', plural: 'Instalacje: realizacje' },
  fields: formPageFields,
}
