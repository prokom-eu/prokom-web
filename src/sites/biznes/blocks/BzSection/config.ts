import type { Block } from 'payload'

import { SECTION_VARIANTS, validateSectionData } from '../../../../lib/biznes/pages/sections'
import { ICON_OPTIONS } from '../../../../lib/catalog/options'

/**
 * Section of the K4 subpages (GoPOS, InsERT, Opieka IT, O firmie, Kontakt, KSeF, ulga,
 * automaty — K4hij). One block = one section; the kind picks the look. Texts, cards and the
 * source are fields; a widget's data (modules, rules, calculator) is JSON checked against the
 * kind (decyzja Krystiana 01.11 — hybryda, like `BiznesSettings.wizard`).
 */
export const BzSectionBlock: Block = {
  slug: 'bzSection',
  interfaceName: 'BzSectionBlock',
  labels: { singular: 'Biznes: sekcja K4', plural: 'Biznes: sekcje K4' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'variant',
          label: 'Rodzaj sekcji',
          type: 'select',
          required: true,
          options: SECTION_VARIANTS.map(({ value, label }) => ({ value, label })),
        },
        {
          name: 'anchor',
          label: 'Kotwica',
          type: 'text',
          maxLength: 40,
          validate: (value: unknown) =>
            !value || (typeof value === 'string' && /^[a-z][a-z0-9-]*$/.test(value))
              ? true
              : 'Małe litery, cyfry i myślniki, np. „pakiet”.',
          admin: { description: 'Adres sekcji po #, np. „pakiet” → /gopos#pakiet.' },
        },
        {
          name: 'surface',
          label: 'Tło',
          type: 'select',
          required: true,
          defaultValue: 'default',
          options: [
            { label: 'Białe', value: 'default' },
            { label: 'Szare', value: 'muted' },
            { label: 'Ciemne', value: 'dark' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'eyebrow', label: 'Etykieta', type: 'text', maxLength: 80 },
        { name: 'heading', label: 'Nagłówek', type: 'text', maxLength: 160 },
        {
          name: 'headingAccent',
          label: 'Druga część nagłówka',
          type: 'text',
          maxLength: 120,
          admin: { description: 'Wyróżniona kolorem, np. „Jeden system.”' },
        },
      ],
    },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 600 },
    {
      name: 'items',
      label: 'Pozycje',
      type: 'array',
      maxRows: 16,
      admin: {
        description: 'Karty, liczby, kroki albo pytania FAQ — zależnie od rodzaju sekcji.',
        initCollapsed: true,
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 160 },
            { name: 'label', label: 'Etykieta', type: 'text', maxLength: 80 },
            { name: 'icon', label: 'Ikona', type: 'select', options: ICON_OPTIONS },
          ],
        },
        { name: 'text', label: 'Opis', type: 'textarea', maxLength: 800 },
        { name: 'href', label: 'Link', type: 'text', maxLength: 300 },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'source', label: 'Źródło (podpis)', type: 'text', maxLength: 240 },
        {
          name: 'sourceUrl',
          label: 'Adres źródła',
          type: 'text',
          maxLength: 300,
          validate: (value: unknown) =>
            !value || (typeof value === 'string' && /^https:\/\//.test(value))
              ? true
              : 'Adres zaczyna się od https://',
        },
      ],
    },
    {
      name: 'data',
      label: 'Dane widżetu (JSON)',
      type: 'json',
      validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
        validateSectionData(value, siblingData?.variant),
      admin: {
        description:
          'Moduły, reguły, kalkulator — zapis sprawdza, czy dane pasują do rodzaju sekcji. Zmieniaj ostrożnie.',
      },
    },
  ],
}
