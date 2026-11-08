import type { Block } from 'payload'

/**
 * `/kontakt` of Biznes (D3-B PR 2, plan 0611 §8.2): the shared Kontakt template. Every text in
 * `SiteSettings` → „Wspólne elementy linii” → Kontakt; the block itself has no fields.
 */
export const BzContactPageBlock: Block = {
  slug: 'bzContactPage',
  interfaceName: 'BzContactPageBlock',
  labels: { singular: 'Biznes: kontakt (szablon wspólny)', plural: 'Biznes: kontakt' },
  fields: [],
}
