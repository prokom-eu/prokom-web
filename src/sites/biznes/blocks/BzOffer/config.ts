import type { Block } from 'payload'

import { linkGroup } from '../../../../blocks/fields'
import { tenantImageFilter } from '../../../../lib/media/access'
import { tenantIdOf } from '../../../../lib/tenant/id'

/**
 * „Oferta” of the Biznes home page (spec. §4 pkt 4, ZMIANY-v20 §2.2): the five department
 * cards come from the catalog (groups, counts, `CatalogGroups.showcase`); the block holds the
 * texts and the three flagship cards.
 */
export const BzOfferBlock: Block = {
  slug: 'bzOffer',
  interfaceName: 'BzOfferBlock',
  labels: {
    singular: 'Biznes: oferta (działy i systemy)',
    plural: 'Biznes: oferta (działy i systemy)',
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'eyebrow', label: 'Etykieta', type: 'text' },
        {
          name: 'heading',
          label: 'Nagłówek',
          type: 'text',
          required: true,
          admin: {
            description: 'Sekcja ma kotwicę #oferta — ten blok wstaw na stronie tylko raz.',
          },
        },
      ],
    },
    {
      name: 'lead',
      label: 'Wstęp',
      type: 'textarea',
      maxLength: 300,
      admin: { description: '{produkty} i {marki} zamieniają się na liczby z katalogu.' },
    },
    {
      name: 'catalogLabel',
      label: 'Przycisk do katalogu',
      type: 'text',
      admin: {
        description: 'Np. „Cały katalog” — liczba pozycji dochodzi sama. Pusty = bez przycisku.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'searchEyebrow',
          label: 'Kafel wyszukiwania — etykieta',
          type: 'text',
          admin: { description: 'Np. „Nie wiesz, w którym dziale szukać?”.' },
        },
        {
          name: 'searchHeading',
          label: 'Kafel wyszukiwania — nagłówek',
          type: 'text',
          admin: { description: 'Pusty = bez kafla wyszukiwania.' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'systemsHeading', label: 'Podtytuł nad kartami systemów', type: 'text' },
        { name: 'systemsNote', label: 'Dopisek po prawej', type: 'text' },
      ],
    },
    {
      name: 'systems',
      label: 'Karty systemów',
      type: 'array',
      maxRows: 3,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'partner',
              label: 'Partner (logo i status)',
              type: 'relationship',
              relationTo: 'partners',
              // Only partners shown on this site; the page is checked again when rendered.
              filterOptions: ({ data }) => {
                const tenant = tenantIdOf(data?.tenant)
                return tenant === null ? false : { tenants: { in: [tenant] } }
              },
              admin: {
                description:
                  'Plakietka to status partnera z kolekcji Partnerzy ([SZEF]); bez statusu — bez plakietki. Puste = znak PRO-KOM Biznes.',
              },
            },
            {
              name: 'badge',
              label: 'Plakietka (karta bez partnera)',
              type: 'text',
              maxLength: 30,
              admin: {
                condition: (_, sibling) => !sibling?.partner,
                description: 'Np. „Usługa PRO-KOM”.',
              },
            },
          ],
        },
        { name: 'title', label: 'Tytuł', type: 'text', required: true },
        { name: 'text', label: 'Opis', type: 'textarea', required: true, maxLength: 220 },
        linkGroup('link', 'Link', true),
        {
          name: 'mode',
          label: 'Górna część karty',
          type: 'radio',
          defaultValue: 'image',
          options: [
            { label: 'Obraz', value: 'image' },
            { label: 'Paski statusu (np. Opieka IT)', value: 'statuses' },
          ],
        },
        {
          name: 'image',
          label: 'Obraz',
          type: 'upload',
          relationTo: 'media',
          filterOptions: tenantImageFilter,
          admin: { condition: (_, sibling) => sibling?.mode !== 'statuses' },
        },
        {
          name: 'statuses',
          label: 'Paski statusu',
          type: 'array',
          maxRows: 3,
          admin: { condition: (_, sibling) => sibling?.mode === 'statuses' },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'label', label: 'Etykieta', type: 'text', required: true, maxLength: 48 },
                { name: 'value', label: 'Wartość', type: 'text', required: true, maxLength: 24 },
                {
                  name: 'tone',
                  label: 'Kropka',
                  type: 'select',
                  required: true,
                  defaultValue: 'ok',
                  options: [
                    { label: 'Zielona', value: 'ok' },
                    { label: 'Pomarańczowa', value: 'warn' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
