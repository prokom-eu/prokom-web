import type { Block, Field } from 'payload'

import { linkGroup } from '../../../../blocks/fields'
import { ICON_OPTIONS } from '../../../../lib/catalog/options'

const texts = (name: string, label: string, maxRows: number): Field => ({
  name,
  label,
  type: 'array',
  maxRows,
  fields: [{ name: 'text', label: 'Tekst', type: 'text', required: true, maxLength: 60 }],
})

/**
 * „Pięć firm czy jedna” of the Biznes home page (spec. §4 pkt 8, ZMIANY-v20 §2.5, short
 * version): the switch between separate companies and one partner, comparison rows, a phone
 * with contacts and speech bubbles. The line's phone number comes from the site settings.
 */
export const BzOnePartnerBlock: Block = {
  slug: 'bzOnePartner',
  interfaceName: 'BzOnePartnerBlock',
  labels: { singular: 'Biznes: pięć firm czy jedna', plural: 'Biznes: pięć firm czy jedna' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'eyebrowA', label: 'Etykieta — część 1', type: 'text' },
        { name: 'eyebrowB', label: 'Etykieta — część 2', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'heading',
          label: 'Nagłówek',
          type: 'text',
          required: true,
          admin: { description: 'Sekcja ma kotwicę #jeden — ten blok wstaw na stronie tylko raz.' },
        },
        { name: 'headingAccent', label: 'Druga część nagłówka (w akcencie)', type: 'text' },
      ],
    },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
    {
      type: 'row',
      fields: [
        {
          name: 'separateLabel',
          label: 'Przełącznik — osobne firmy',
          type: 'text',
          required: true,
        },
        { name: 'oneLabel', label: 'Przełącznik — jeden partner', type: 'text', required: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'separateTag', label: 'Znacznik „osobno”', type: 'text', maxLength: 20 },
        { name: 'oneTag', label: 'Znacznik „z PRO-KOM”', type: 'text', maxLength: 20 },
      ],
    },
    {
      name: 'rows',
      label: 'Wiersze porównania',
      type: 'array',
      maxRows: 4,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', label: 'Sytuacja', type: 'text', required: true, maxLength: 40 },
            { name: 'icon', label: 'Ikona', type: 'select', required: true, options: ICON_OPTIONS },
          ],
        },
        {
          name: 'separate',
          label: 'Osobne firmy',
          type: 'textarea',
          required: true,
          maxLength: 160,
        },
        { name: 'one', label: 'Z PRO-KOM', type: 'textarea', required: true, maxLength: 160 },
      ],
    },
    linkGroup('cta', 'Przycisk główny', true),
    {
      name: 'phone',
      label: 'Telefon (makieta)',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'groupLabel', label: 'Grupa kontaktów', type: 'text' },
            { name: 'proNote', label: 'Podpis karty PRO-KOM', type: 'text' },
            { name: 'watchLabel', label: 'Nagłówek „pilnujemy”', type: 'text' },
          ],
        },
        {
          name: 'contacts',
          label: 'Kontakty osobnych firm',
          type: 'array',
          maxRows: 6,
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', label: 'Nazwa', type: 'text', required: true, maxLength: 40 },
                { name: 'note', label: 'Dopisek', type: 'text', maxLength: 50 },
              ],
            },
          ],
        },
        texts('chips', 'Zakres PRO-KOM (etykiety)', 8),
        {
          name: 'watch',
          label: 'Pilnujemy za Ciebie',
          type: 'array',
          maxRows: 3,
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'label', label: 'Etykieta', type: 'text', required: true, maxLength: 40 },
                { name: 'value', label: 'Wartość', type: 'text', required: true, maxLength: 24 },
                {
                  name: 'tone',
                  label: 'Kropka',
                  type: 'select',
                  required: true,
                  defaultValue: 'ok',
                  options: [
                    { label: 'Zielona', value: 'ok' },
                    { label: 'Niebieska', value: 'accent' },
                    { label: 'Pomarańczowa', value: 'warn' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    texts('separateBubbles', 'Dymki — osobne firmy', 4),
    texts('oneBubbles', 'Dymki — jeden partner', 3),
  ],
}
