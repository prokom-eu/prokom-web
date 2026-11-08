import type { Block } from 'payload'

import { formPageFields } from '../formPageFields'

/**
 * The contact page (`/kontakt`): since L2-I the shared Kontakt template, texts in `SiteSettings`
 * → „Wspólne elementy linii” → Kontakt. The block's hero and band fields
 * are no longer read (removing them = a migration, decision D1). One block for the whole page.
 */
export const InstContactBlock: Block = {
  slug: 'instContact',
  interfaceName: 'InstContactBlock',
  labels: { singular: 'Instalacje: kontakt (szablon wspólny)', plural: 'Instalacje: kontakty' },
  fields: formPageFields,
}
