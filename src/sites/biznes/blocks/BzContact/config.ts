import type { Block } from 'payload'

/**
 * Contact section of the Biznes home page, `#kontakt` (spec. §4 pkt 13, ZMIANY-v20 §2.9): the
 * navy panel of v20 and the inquiry form. Phone, WhatsApp, e-mail, address and hours come from
 * the settings and company data; the one-screen v20 form (`ContactForm`, B8).
 */
export const BzContactBlock: Block = {
  slug: 'bzContact',
  interfaceName: 'BzContactBlock',
  labels: { singular: 'Biznes: kontakt z formularzem', plural: 'Biznes: kontakt z formularzem' },
  fields: [
    {
      name: 'heading',
      label: 'Nagłówek',
      type: 'text',
      required: true,
      admin: {
        description:
          'Sekcja ma kotwicę #kontakt (link „Zgłoś awarię”) — ten blok wstaw na stronie tylko raz.',
      },
    },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
    {
      type: 'row',
      fields: [
        { name: 'formHeading', label: 'Nagłówek formularza', type: 'text' },
        { name: 'formNote', label: 'Dopisek pod nagłówkiem formularza', type: 'text' },
      ],
    },
    {
      name: 'promises',
      label: 'Potwierdzenia pod formularzem [SZEF]',
      type: 'array',
      maxRows: 3,
      fields: [{ name: 'text', label: 'Tekst', type: 'text', required: true, maxLength: 30 }],
    },
    {
      name: 'successText',
      label: 'Tekst po wysłaniu [SZEF]',
      type: 'textarea',
      maxLength: 300,
      admin: {
        description: 'Pod „Dziękujemy, zapytanie wysłane.” — obietnica czasu odpowiedzi.',
      },
    },
  ],
}
