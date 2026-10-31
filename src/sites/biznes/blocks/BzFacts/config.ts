import type { Block } from 'payload'

import { linkGroup } from '../../../../blocks/fields'
import { tenantIdOf } from '../../../../lib/tenant/id'

/**
 * „Słowo od właściciela” of the Biznes home page (board v150 `#s4-fakty`): the owner's word,
 * numbers, the authorization logos from Partners and a link (to the company page).
 */
export const BzFactsBlock: Block = {
  slug: 'bzFacts',
  interfaceName: 'BzFactsBlock',
  labels: { singular: 'Biznes: fakty i słowo właściciela', plural: 'Biznes: fakty' },
  fields: [
    {
      name: 'heading',
      label: 'Nagłówek (dla czytników ekranu)',
      type: 'text',
      required: true,
      admin: { description: 'Sekcja ma kotwicę #fakty — ten blok wstaw na stronie tylko raz.' },
    },
    {
      name: 'owner',
      label: 'Słowo od właściciela [SZEF]',
      type: 'group',
      fields: [
        { name: 'label', label: 'Etykieta', type: 'text' },
        { name: 'quote', label: 'Cytat', type: 'textarea', required: true, maxLength: 400 },
        {
          name: 'highlight',
          label: 'Wyróżniony fragment cytatu',
          type: 'text',
          admin: { description: 'Dokładnie ten tekst z cytatu dostaje kolor akcentu.' },
        },
        {
          type: 'row',
          fields: [
            { name: 'name', label: 'Imię i nazwisko', type: 'text', required: true },
            { name: 'role', label: 'Rola', type: 'text' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'year', label: 'Rok na plakietce', type: 'text', maxLength: 4 },
            { name: 'yearText', label: 'Tekst plakietki', type: 'text', maxLength: 60 },
          ],
        },
        {
          name: 'photoPlaceholder',
          label: 'Pokaż miejsce na zdjęcie',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description:
              'ZMIANY-v20 §2.6: zastępstwo zdjęcia tylko za flagą; wyłączone = kafel z ikoną.',
          },
        },
      ],
    },
    {
      name: 'stats',
      label: 'Liczby',
      type: 'array',
      maxRows: 4,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'value', label: 'Liczba', type: 'text', required: true, maxLength: 8 },
            { name: 'label', label: 'Podpis', type: 'text', required: true, maxLength: 40 },
          ],
        },
      ],
    },
    {
      name: 'authorizations',
      label: 'Logo autoryzacji',
      type: 'relationship',
      relationTo: 'partners',
      hasMany: true,
      maxRows: 4,
      filterOptions: ({ data }) => {
        const tenant = tenantIdOf(data?.tenant)
        return tenant === null ? false : { tenants: { in: [tenant] } }
      },
    },
    linkGroup('contactLink', 'Link pod liczbami'),
  ],
}
