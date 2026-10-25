import type { Block } from 'payload'

/**
 * „Gdzie nas znaleźć” (plansza OFirmie): address, hours, phones, e-mail and the company's NIP
 * from the site settings and company data, beside the area diagram. Here only the texts.
 */
export const BzLocationBlock: Block = {
  slug: 'bzLocation',
  interfaceName: 'BzLocationBlock',
  labels: { singular: 'Biznes: gdzie nas znaleźć', plural: 'Biznes: gdzie nas znaleźć' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'eyebrow', label: 'Etykieta', type: 'text', maxLength: 60 },
        {
          name: 'heading',
          label: 'Nagłówek',
          type: 'text',
          maxLength: 120,
          admin: {
            description: 'Puste = adres z Danych firmy, np. „Rabka-Zdrój, ul. Orkana 16B”.',
          },
        },
      ],
    },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 400 },
    {
      type: 'row',
      fields: [
        {
          name: 'areaLabel',
          label: 'Etykieta nad schematem',
          type: 'text',
          maxLength: 60,
        },
        {
          name: 'phoneNote',
          label: 'Podpis przy numerze głównym',
          type: 'text',
          maxLength: 40,
          admin: { description: 'Np. „oferty i serwis”.' },
        },
      ],
    },
  ],
}
