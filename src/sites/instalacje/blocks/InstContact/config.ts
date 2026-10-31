import type { Block } from 'payload'

import { formPageFields } from '../formPageFields'

/**
 * The contact page (`/kontakt`): form, salons from `CompanyData.locations`, hours and the travel
 * zones (ADR-I002 §0). One block for the whole page, as its first block (it carries the h1).
 */
export const InstContactBlock: Block = {
  slug: 'instContact',
  interfaceName: 'InstContactBlock',
  labels: { singular: 'Instalacje: kontakt', plural: 'Instalacje: kontakty' },
  fields: formPageFields,
}
