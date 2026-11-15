import type { Block, UploadField } from 'payload'

import { linkGroup } from '../../../../blocks/fields'
import { tenantImageFilter } from '../../../../lib/media/access'

const image = (name: string, label: string): UploadField => ({
  name,
  label,
  type: 'upload',
  relationTo: 'media',
  filterOptions: tenantImageFilter,
})

/**
 * „Jak to działa” of /gopos (spec. §6.5 pkt 5, plansza Gopos): a navy card with the system on its
 * hardware and one order in four steps, from the table to the owner's report. Anchor
 * `#jak-to-dziala` — once per page.
 */
export const BzOrderFlowBlock: Block = {
  slug: 'bzOrderFlow',
  interfaceName: 'BzOrderFlowBlock',
  labels: { singular: 'Biznes: jedno zamówienie', plural: 'Biznes: jedno zamówienie' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'eyebrow', label: 'Etykieta', type: 'text', maxLength: 60 },
        {
          name: 'heading',
          label: 'Nagłówek',
          type: 'text',
          required: true,
          maxLength: 120,
          admin: { description: 'Sekcja ma kotwicę #jak-to-dziala — blok tylko raz na stronie.' },
        },
      ],
    },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 400 },
    {
      name: 'badges',
      label: 'Plakietki',
      type: 'array',
      maxRows: 4,
      admin: { description: 'Liczby partnera tylko ze źródłem w treści (plan Biznesu §4).' },
      fields: [{ name: 'text', label: 'Tekst', type: 'text', required: true, maxLength: 40 }],
    },
    {
      type: 'row',
      fields: [
        image('image', 'Obraz'),
        { name: 'ticket', label: 'Bilecik nad 1. krokiem', type: 'text', maxLength: 30 },
      ],
    },
    {
      name: 'steps',
      label: 'Kroki',
      type: 'array',
      maxRows: 4,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', label: 'Etykieta (np. „1 · Sala”)', type: 'text', maxLength: 20 },
            { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 40 },
          ],
        },
        { name: 'text', label: 'Opis', type: 'text', maxLength: 100 },
        image('image', 'Obraz'),
      ],
    },
    { name: 'note', label: 'Zdanie pod krokami', type: 'text', maxLength: 120 },
    linkGroup('primary', 'Przycisk główny'),
    linkGroup('secondary', 'Przycisk drugi'),
  ],
}
