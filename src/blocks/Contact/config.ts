import type { Block } from 'payload'

/** Shows the line's phone/e-mail (`SiteSettings`) and branches (`CompanyData`) — no retyping. */
export const ContactBlock: Block = {
  slug: 'contact',
  interfaceName: 'ContactBlock',
  labels: { singular: 'Kontakt', plural: 'Kontakt' },
  fields: [
    { name: 'heading', label: 'Nagłówek', type: 'text', defaultValue: 'Kontakt' },
    { name: 'text', label: 'Tekst', type: 'textarea', maxLength: 300 },
    {
      name: 'showLocations',
      label: 'Pokaż oddziały z godzinami otwarcia',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
