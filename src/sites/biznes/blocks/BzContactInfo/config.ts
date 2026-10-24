import type { Block } from 'payload'

/**
 * Top of the Biznes contact page (spec. §6.9, plansza Kontakt): status of the hours, heading,
 * the area served and one card of contact data. Phone, e-mail, address, hours and the company
 * come from the settings and company data; here only the texts around them.
 */
export const BzContactInfoBlock: Block = {
  slug: 'bzContactInfo',
  interfaceName: 'BzContactInfoBlock',
  labels: { singular: 'Biznes: kontakt i dojazd', plural: 'Biznes: kontakt i dojazd' },
  fields: [
    {
      name: 'heading',
      label: 'Nagłówek',
      type: 'text',
      required: true,
      admin: {
        description: 'Wstaw ten blok na stronie tylko raz, jako pierwszy — jego nagłówek to H1.',
      },
    },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
    {
      name: 'areaLabel',
      label: 'Podpis mapy obszaru',
      type: 'text',
      admin: { description: 'Np. „Dojeżdżamy na całe Podhale i Małopolskę”.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'phoneNote',
          label: 'Dopisek przy telefonie',
          type: 'text',
          admin: { description: 'Po godzinach, np. „kasy, komputery, programy, awarie”.' },
        },
        { name: 'emailNote', label: 'Dopisek przy e-mailu', type: 'text' },
        { name: 'addressNote', label: 'Dopisek przy adresie', type: 'text' },
      ],
    },
  ],
}
