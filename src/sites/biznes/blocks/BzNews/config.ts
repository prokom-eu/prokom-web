import type { Block } from 'payload'

/**
 * „Ostatnio w Aktualnościach” of the Biznes home page (spec. §4 pkt 11): the three latest
 * published posts of this site; no posts → no section.
 */
export const BzNewsBlock: Block = {
  slug: 'bzNews',
  interfaceName: 'BzNewsBlock',
  labels: { singular: 'Biznes: ostatnie aktualności', plural: 'Biznes: ostatnie aktualności' },
  fields: [
    { name: 'heading', label: 'Nagłówek', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'allLabel', label: 'Link do wszystkich', type: 'text' },
        { name: 'readLabel', label: 'Link na karcie', type: 'text', defaultValue: 'Czytaj' },
      ],
    },
  ],
}
