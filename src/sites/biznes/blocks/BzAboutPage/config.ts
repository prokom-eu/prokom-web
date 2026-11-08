import type { Block } from 'payload'

/**
 * `/o-firmie` of Biznes (D3-B PR 2, plan 0611 §8.2): the shared O firmie template. Every text in
 * `SiteSettings` → „Wspólne elementy linii” → O firmie; the block itself has no fields.
 */
export const BzAboutPageBlock: Block = {
  slug: 'bzAboutPage',
  interfaceName: 'BzAboutPageBlock',
  labels: { singular: 'Biznes: o firmie (szablon wspólny)', plural: 'Biznes: o firmie' },
  fields: [],
}
