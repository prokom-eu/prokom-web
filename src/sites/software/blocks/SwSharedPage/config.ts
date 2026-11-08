import type { Block } from 'payload'

/** Pages of the shared templates on Software (SWA5b, ZMIANY-v24 §9.2–9.3). */
export const SW_SHARED_TEMPLATES = [
  { label: 'Kontakt (/kontakt)', value: 'contact' },
  { label: 'O firmie (/o-firmie)', value: 'about' },
] as const

/**
 * `/kontakt` and `/o-firmie` of Software = the shared templates (D2-4) with the line's sections in
 * their slots. Texts in `SiteSettings` → „Wspólne elementy linii” (Kontakt, O firmie); the block
 * only picks the template. One block for the whole page.
 */
export const SwSharedPageBlock: Block = {
  slug: 'swSharedPage',
  interfaceName: 'SwSharedPageBlock',
  labels: { singular: 'Software: szablon wspólny', plural: 'Software: szablony wspólne' },
  fields: [
    {
      name: 'template',
      type: 'select',
      required: true,
      options: [...SW_SHARED_TEMPLATES],
      admin: {
        description: 'Treści: Ustawienia strony → Wspólne elementy linii (Kontakt albo O firmie).',
      },
    },
  ],
}
