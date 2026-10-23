import type { Block } from 'payload'

/** Logos of partners shown on this site (`Partners.tenants`), in their `order`. */
export const PartnersBlock: Block = {
  slug: 'partners',
  interfaceName: 'PartnersBlock',
  labels: { singular: 'Partnerzy', plural: 'Partnerzy' },
  fields: [
    { name: 'heading', label: 'Nagłówek', type: 'text', defaultValue: 'Nasi partnerzy' },
    {
      name: 'lead',
      label: 'Wstęp',
      type: 'textarea',
      maxLength: 300,
      admin: {
        description:
          'Na Biznesie (pasek marek) to krótka podpowiedź obok nagłówka, np. „Najedź, żeby zatrzymać”.',
      },
    },
  ],
}
