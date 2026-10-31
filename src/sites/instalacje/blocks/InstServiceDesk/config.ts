import type { Block } from 'payload'

import { formPageFields } from '../formPageFields'

/**
 * The service desk page (`/serwis`): the fault form (`#zglos`, urgency → `deadline`), care plans
 * (ADR-I002 §0). One block for the whole page, as its first block (it carries the h1).
 */
export const InstServiceDeskBlock: Block = {
  slug: 'instServiceDesk',
  interfaceName: 'InstServiceDeskBlock',
  labels: { singular: 'Instalacje: serwis', plural: 'Instalacje: serwisy' },
  fields: formPageFields,
}
