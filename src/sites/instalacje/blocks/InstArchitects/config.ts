import type { Block } from 'payload'

import { heroGroup } from '../../../../collections/instalacjeFields'

/**
 * The page for architects and developers (`/dla-architektow`, ADR-I005 §1): one block for the
 * whole page, as its first block (it carries the h1). The hero is edited in the panel; sections,
 * the house cross-section and their texts live in code (`dane/architekci.ts`, `dane/przekroj.ts`).
 * No CTA band: the form is the last section (prototype meta `cta: false`).
 */
export const InstArchitectsBlock: Block = {
  slug: 'instArchitects',
  interfaceName: 'InstArchitectsBlock',
  labels: { singular: 'Instalacje: dla architektów', plural: 'Instalacje: dla architektów' },
  fields: [heroGroup],
}
