import type { Block } from 'payload'

import { formPageFields } from '../formPageFields'

/**
 * About the company (`/o-firmie`): since L2-I the shared O firmie template, texts in
 * `SiteSettings` → „Wspólne elementy linii” → O firmie. The block's hero and band fields
 * are no longer read (removing them = a migration, decision D1). One block for the whole page.
 */
export const InstAboutBlock: Block = {
  slug: 'instAbout',
  interfaceName: 'InstAboutBlock',
  labels: { singular: 'Instalacje: o firmie (szablon wspólny)', plural: 'Instalacje: o firmie' },
  fields: formPageFields,
}
