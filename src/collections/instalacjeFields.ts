import type { Field } from 'payload'

import { isHexColor } from '../lib/catalog/options'

/** Shared fields of the Instalacje collections (ADR-I002 §2). */

export const keyField = (options: readonly { label: string; value: string }[]): Field => ({
  // Key from the design prototype: the planner, inquiries and `pnpm seed:instalacje` use it.
  name: 'key',
  label: 'Klucz',
  type: 'select',
  required: true,
  options: [...options],
  // Set once: renaming a key would silently break planner links and inquiries.
  access: { update: () => false },
  admin: { position: 'sidebar', description: 'Stały klucz używany w kreatorze i zapytaniach.' },
})

export const iconField: Field = {
  name: 'icon',
  label: 'Ikona',
  type: 'text',
  maxLength: 30,
  admin: { description: 'Klucz ikony z wzorca, np. „cam”, „home”.' },
}

export const colorField: Field = {
  // Accent of a service or object, as data (like the catalog gradient stops, ADR-013 exception).
  name: 'color',
  label: 'Kolor',
  type: 'text',
  validate: (value: unknown) =>
    !value || isHexColor(value) ? true : 'Kolor w formacie #rrggbb, np. #12B6D8.',
}

export const heroGroup: Field = {
  name: 'hero',
  label: 'Nagłówek strony',
  type: 'group',
  fields: [
    { name: 'crumb', label: 'Okruszek', type: 'text', maxLength: 60 },
    { name: 'eyebrow', label: 'Nadtytuł', type: 'text' },
    {
      type: 'row',
      fields: [
        { name: 'h1a', label: 'H1 — część 1', type: 'text', required: true },
        { name: 'h1b', label: 'H1 — część 2 (wyróżniona)', type: 'text' },
      ],
    },
    { name: 'lead', label: 'Wstęp', type: 'textarea' },
    {
      name: 'facts',
      label: 'Liczby',
      type: 'array',
      maxRows: 4,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'value', label: 'Wartość', type: 'text', required: true },
            { name: 'label', label: 'Opis', type: 'text', required: true },
          ],
        },
      ],
    },
    { name: 'tags', label: 'Etykiety', type: 'text', hasMany: true },
    {
      name: 'cta',
      label: 'Przycisk',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'text', label: 'Tekst', type: 'text' },
            { name: 'href', label: 'Adres', type: 'text' },
          ],
        },
      ],
    },
  ],
}

export const anchorsArray: Field = {
  name: 'anchors',
  label: 'Kotwice',
  type: 'array',
  admin: { description: 'Pasek skrótów do sekcji. Id musi istnieć na stronie.' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'anchorId', label: 'Id sekcji', type: 'text', required: true },
        { name: 'name', label: 'Nazwa', type: 'text', required: true },
      ],
    },
  ],
}

export const packagesArray: Field = {
  name: 'packages',
  label: 'Przykładowe zestawy',
  type: 'array',
  fields: [
    {
      type: 'row',
      fields: [{ name: 'name', label: 'Nazwa', type: 'text', required: true }, iconField],
    },
    { name: 'description', label: 'Opis', type: 'textarea' },
    { name: 'items', label: 'Elementy', type: 'text', hasMany: true },
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          label: 'Cena',
          type: 'text',
          admin: { description: 'Widoczna tylko przy „Pokaż ceny” w Ustawieniach Instalacji.' },
        },
        { name: 'badge', label: 'Plakietka', type: 'text' },
        { name: 'featured', label: 'Wyróżniony', type: 'checkbox', defaultValue: false },
      ],
    },
  ],
}

export const ctaGroup: Field = {
  name: 'cta',
  label: 'Pas przed stopką',
  type: 'group',
  fields: [
    { name: 'eyebrow', label: 'Nadtytuł', type: 'text' },
    { name: 'heading', label: 'Nagłówek', type: 'text' },
    { name: 'text', label: 'Tekst', type: 'textarea' },
  ],
}

/** Eyebrow, heading and lead of a section. */
export const sectionIntro = (name: string, label: string, extra: Field[] = []): Field => ({
  name,
  label,
  type: 'group',
  fields: [
    { name: 'eyebrow', label: 'Nadtytuł', type: 'text' },
    { name: 'heading', label: 'Nagłówek', type: 'text' },
    { name: 'text', label: 'Tekst', type: 'textarea' },
    ...extra,
  ],
})
