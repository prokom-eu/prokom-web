import { APIError } from 'payload'
import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { adminOnly } from '../lib/auth/access'
import { publishWithMarker } from '../lib/instalacje/archNews'
import { onlyLineTenant } from '../lib/tenant/onlyLine'

const FIELD_NAMES: Record<string, string> = {
  title: 'Tytuł',
  description: 'Opis',
  params: 'Parametry',
  planItems: 'W projekcie zaplanuj',
  examples: 'Przykłady',
  places: 'Gdzie się sprawdza',
}

const noMarkers: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const field = publishWithMarker(data, originalDoc)
  if (field) {
    throw new APIError(
      `Nie można opublikować: pole „${FIELD_NAMES[field]}” ma znacznik [SZEF…] albo [CENA…]. Uzupełnij treść albo zostaw wersję roboczą.`,
      400,
      null,
      true,
    )
  }
  return data
}

/** Categories of the filter (ADR-I005 §2): service keys for the colour, `sz` = for studios. */
export const ARCH_NEWS_CATEGORIES = [
  { label: 'Dźwięk', value: 'snd' },
  { label: 'Obraz', value: 'scr' },
  { label: 'Sterowanie', value: 'smart' },
  { label: 'Sieć', value: 'wifi' },
  { label: 'Bezpieczeństwo', value: 'kam' },
  { label: 'Energia', value: 'ev' },
  { label: 'Szkolenia i oferty', value: 'sz' },
] as const

export const ARCH_NEWS_TYPES = ['Nowość', 'Rozwiązanie', 'Szkolenie', 'Oferta'] as const

/**
 * „Nowe rozwiązania” on `/dla-architektow` (ADR-I005 §2): cards the boss or Krystian adds in the
 * panel. A card with a `[SZEF…]` / `[CENA…]` marker in a visible field stays a draft (hook);
 * the internal note is never shown. The page reads published cards on every request.
 */
export const InstArchNews: CollectionConfig = {
  slug: 'inst-arch-news',
  labels: { singular: 'Nowe rozwiązanie (architekci)', plural: 'Nowe rozwiązania (architekci)' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'type', 'order', 'featured', '_status', 'updatedAt'],
    group: 'Instalacje',
    description:
      'Karty sekcji „Nowe rozwiązania” na stronie /dla-architektow. Widoczne po publikacji.',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  defaultSort: 'order',
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: {
    beforeValidate: [
      onlyLineTenant('instalacje', 'Nowe rozwiązania są tylko na stronach linii Instalacje.'),
    ],
    beforeChange: [noMarkers],
  },
  indexes: [{ fields: ['tenant', 'legacyId'], unique: true }],
  fields: [
    {
      // Position in the design package: `pnpm seed:instalacje` finds the card by it.
      name: 'legacyId',
      label: 'Id z importu',
      type: 'number',
      admin: { position: 'sidebar', readOnly: true },
    },
    { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 90 },
    {
      type: 'row',
      fields: [
        {
          name: 'category',
          label: 'Kategoria (filtr)',
          type: 'select',
          required: true,
          options: [...ARCH_NEWS_CATEGORIES],
        },
        {
          name: 'type',
          label: 'Typ',
          type: 'select',
          required: true,
          options: ARCH_NEWS_TYPES.map((t) => ({ label: t, value: t })),
        },
      ],
    },
    { name: 'description', label: 'Opis', type: 'textarea', required: true, maxLength: 400 },
    {
      name: 'params',
      label: 'Parametry (pierwszy = kluczowy, na liście)',
      type: 'array',
      minRows: 2,
      maxRows: 6,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', label: 'Nazwa', type: 'text', required: true },
            { name: 'value', label: 'Wartość', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      name: 'planItems',
      label: 'W projekcie zaplanuj',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      fields: [{ name: 'text', label: 'Punkt', type: 'text', required: true }],
    },
    {
      name: 'examples',
      label: 'Przykłady (marki tylko z „np.”)',
      type: 'text',
    },
    {
      name: 'places',
      label: 'Gdzie się sprawdza',
      type: 'array',
      maxRows: 6,
      fields: [{ name: 'name', label: 'Miejsce', type: 'text', required: true }],
    },
    {
      type: 'collapsible',
      label: 'Ilustracja (technicznie)',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'illustration',
          label: 'Ścieżka SVG (200×120, obrys)',
          type: 'textarea',
          maxLength: 4000,
          // Only path commands and numbers: it is drawn as the `d` of an SVG path.
          validate: (value: unknown) =>
            value == null || value === '' || /^[MmLlHhVvCcSsQqTtAaZz0-9\s.,-]+$/.test(String(value))
              ? true
              : 'Dozwolone tylko polecenia ścieżki SVG i liczby.',
        },
      ],
    },
    {
      name: 'order',
      label: 'Kolejność',
      type: 'number',
      min: 0,
      admin: { position: 'sidebar', description: 'Mniejsza liczba = wcześniej.' },
    },
    {
      name: 'featured',
      label: 'Wyróżniona (karta „Nowość” na stronie głównej)',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'internalNote',
      label: 'Notatka wewnętrzna (nie na stronie)',
      type: 'textarea',
      admin: { position: 'sidebar', description: 'Np. „[SZEF: dostępność marki u nas]”.' },
    },
    {
      name: 'publishedAt',
      label: 'Data dodania',
      type: 'date',
      admin: { position: 'sidebar', description: 'Tylko w panelu, nie na stronie.' },
    },
  ],
}
