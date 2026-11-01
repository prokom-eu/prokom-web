import type { Block } from 'payload'

import { formPageFields } from '../formPageFields'

/**
 * About the company (`/o-firmie`, I12): lines of PRO-KOM, history, principles, company data. One
 * block for the whole page, as its first block (it carries the h1).
 * The hero and the band before the footer are edited in the panel, the rest lives in code.
 */
export const InstAboutBlock: Block = {
  slug: 'instAbout',
  interfaceName: 'InstAboutBlock',
  labels: { singular: 'Instalacje: o firmie', plural: 'Instalacje: o firmie' },
  fields: formPageFields,
}
