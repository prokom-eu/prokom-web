import type { Block } from 'payload'

import { validateProcurementPage } from '../../../../lib/biznes/procurement/schema'

/**
 * „Zaopatrzenie firm” page (BIZ-2, ZAOPATRZENIE §2): `/agd-rtv-dla-firm` and
 * `/dostawy-it-dla-firm` on one template. Texts and the configurator are JSON from the package;
 * what needs the boss's yes (§0) are plain fields — empty or off = the text does not show.
 */
export const BzProcurementPageBlock: Block = {
  slug: 'bzProcurementPage',
  interfaceName: 'BzProcurementPageBlock',
  labels: { singular: 'Biznes: Zaopatrzenie firm (strona)', plural: 'Biznes: Zaopatrzenie firm' },
  fields: [
    {
      name: 'variant',
      label: 'Strona',
      type: 'select',
      required: true,
      options: [
        { label: 'AGD i RTV dla firm', value: 'agd' },
        { label: 'Dostawy IT dla firm', value: 'it' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Do potwierdzenia przez szefa [SZEF]',
      admin: {
        initCollapsed: false,
        description:
          'ZAOPATRZENIE §0: bez zaznaczenia albo wpisu teksty zależne od tych punktów się nie pokazują.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'oldEquipmentPickup',
              label: 'Odbieramy stary sprzęt 1 za 1',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'onsiteWarranty',
              label: 'Zgłoszenie gwarancyjne przyjmujemy na miejscu',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'showLG',
              label: 'Hurtownik dostarcza LG (logo w markach)',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
        {
          name: 'services',
          label: 'Usługi przed dostawą (IT)',
          type: 'array',
          maxRows: 6,
          labels: { singular: 'Usługa', plural: 'Usługi' },
          admin: {
            description:
              'Przełączniki w konfiguratorze IT i wiersze „Usługa” w podglądzie oferty. Propozycja z paczki: instalacja systemu i programów; przeniesienie danych; numery inwentarzowe i lista seryjnych; montaż na stanowiskach i test sieci; odbiór starego sprzętu z usunięciem danych.',
          },
          fields: [
            { name: 'label', label: 'Nazwa', type: 'text', required: true, maxLength: 80 },
            {
              name: 'kind',
              label: 'Rodzaj (harmonogram)',
              type: 'select',
              required: true,
              defaultValue: 'mount',
              options: [
                { label: 'System i programy', value: 'system' },
                { label: 'Przeniesienie danych', value: 'data' },
                { label: 'Numery inwentarzowe', value: 'inventory' },
                { label: 'Montaż i test', value: 'mount' },
                { label: 'Odbiór starego sprzętu', value: 'pickup' },
              ],
            },
          ],
        },
        {
          name: 'classHints',
          label: 'Przykładowe marki w klasach (AGD)',
          type: 'array',
          maxRows: 3,
          labels: { singular: 'Klasa', plural: 'Klasy' },
          admin: {
            description:
              'W kolejności klas: Ekonomiczny, Standard, Premium. Propozycja z paczki: „Amica, Beko”; „Samsung, Bosch, Beko”; „Bosch, Siemens, Samsung”.',
          },
          fields: [{ name: 'brands', label: 'Marki', type: 'text', required: true, maxLength: 80 }],
        },
      ],
    },
    {
      name: 'data',
      label: 'Treść strony (JSON z paczki)',
      type: 'json',
      required: true,
      validate: (value: unknown) => validateProcurementPage(value),
      admin: {
        description:
          'Teksty, konfigurator, FAQ i formularz (ZAOPATRZENIE §2). Zdjęcia to numery z Media. Po imporcie z paczki (`pnpm seed:biznes`) wygrywa paczka.',
      },
    },
  ],
}
