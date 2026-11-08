import { BlocksFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { Block, Field } from 'payload'

import { RESTRICTED_RICH_TEXT_FEATURES } from '../../../../blocks/RichText/config'

const cell = (name: string, label: string, required = false): Field => ({
  name,
  label,
  type: 'textarea',
  required,
  admin: { rows: 2 },
})

/**
 * A table inside the text (ZMIANY-v24 §9.6: purposes and legal bases, retention, browser storage).
 * Fixed columns instead of nested arrays: two to four, so the panel stays a plain form. Lives in
 * the JSON of the text — no tables in the database.
 */
export const LegalTableBlock: Block = {
  slug: 'legalTable',
  interfaceName: 'LegalTableBlock',
  labels: { singular: 'Tabela', plural: 'Tabele' },
  fields: [
    {
      name: 'caption',
      label: 'Opis tabeli (dla czytników ekranu)',
      type: 'text',
      admin: { description: 'Np. „Cele i podstawy przetwarzania danych”. Niewidoczny na stronie.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'head1', label: 'Kolumna 1', type: 'text', required: true },
        { name: 'head2', label: 'Kolumna 2', type: 'text', required: true },
        { name: 'head3', label: 'Kolumna 3', type: 'text' },
        { name: 'head4', label: 'Kolumna 4', type: 'text' },
      ],
    },
    {
      name: 'rows',
      label: 'Wiersze',
      type: 'array',
      minRows: 1,
      maxRows: 20,
      labels: { singular: 'Wiersz', plural: 'Wiersze' },
      admin: { description: 'Komórki kolumn bez nagłówka są pomijane.' },
      fields: [
        {
          type: 'row',
          fields: [
            cell('c1', 'Kolumna 1', true),
            cell('c2', 'Kolumna 2'),
            cell('c3', 'Kolumna 3'),
            cell('c4', 'Kolumna 4'),
          ],
        },
      ],
    },
  ],
}

/** A short note with the „!” mark inside the text (board `AU-polityka`: „Nie prosimy o dane…”). */
export const LegalNoteBlock: Block = {
  slug: 'legalNote',
  interfaceName: 'LegalNoteBlock',
  labels: { singular: 'Notka', plural: 'Notki' },
  fields: [{ name: 'text', label: 'Treść', type: 'textarea', required: true, maxLength: 400 }],
}

/**
 * A Software legal page in one block (ZMIANY-v24 §9.6, decyzja Krystiana 08.11): the hero with its
 * badges (version, update, reading time counted from the text) and the text with tables and
 * notes. Every top-level h2 of the text is a numbered section and an entry of the table of
 * contents. Contact of the „Masz pytanie o dane?” card comes from the site settings.
 */
export const SwLegalBlock: Block = {
  slug: 'swLegal',
  interfaceName: 'SwLegalBlock',
  labels: { singular: 'Software: strona prawna', plural: 'Software: strony prawne' },
  fields: [
    {
      name: 'eyebrow',
      label: 'Nadtytuł',
      type: 'text',
      defaultValue: 'Informacje prawne',
    },
    {
      name: 'heading',
      label: 'Nagłówek',
      type: 'text',
      required: true,
      admin: { description: 'Wyróżniona część w **gwiazdkach**, np. „Polityka **prywatności.**”.' },
    },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
    {
      type: 'row',
      fields: [
        {
          name: 'version',
          label: 'Wersja',
          type: 'text',
          admin: { description: 'Np. „1.0”. Puste — bez plakietki.' },
        },
        {
          name: 'updated',
          label: 'Aktualizacja',
          type: 'text',
          admin: { description: 'Np. „listopad 2026”. Puste — bez plakietki.' },
        },
      ],
    },
    {
      name: 'draft',
      label: 'Wersja robocza',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description:
          'Baner „Wersja robocza…” nad nagłówkiem — tylko poza produkcją. Odznacz po akceptacji tekstu.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'askTitle',
          label: 'Karta pytań — tytuł',
          type: 'text',
          defaultValue: 'Masz pytanie o dane?',
        },
        {
          name: 'askText',
          label: 'Karta pytań — tekst',
          type: 'text',
          defaultValue: 'Napisz albo zadzwoń — odpowiemy w 1 dzień roboczy.',
        },
      ],
    },
    {
      name: 'body',
      label: 'Treść',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: [
          ...RESTRICTED_RICH_TEXT_FEATURES,
          BlocksFeature({ blocks: [LegalTableBlock, LegalNoteBlock] }),
        ],
      }),
      admin: { description: 'Każdy nagłówek H2 = numerowana sekcja i pozycja spisu treści.' },
    },
  ],
}
