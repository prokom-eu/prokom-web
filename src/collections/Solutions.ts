import type { CollectionBeforeChangeHook, CollectionConfig, Field } from 'payload'
import {
  text as textValidation,
  type TextFieldManyValidation,
  type TextFieldSingleValidation,
} from 'payload/shared'

import { adminOnly } from '../lib/auth/access'
import {
  CARD_GRADIENTS,
  INDUSTRY_GROUPS,
  SITUATIONS,
  SOLUTION_CATEGORIES,
} from '../lib/software/options'
import { solutionsRevalidationHooks } from '../lib/software/revalidate'
import {
  includedError,
  levelCellsError,
  lowestLevelPrice,
  relatedFilter,
  thumbnailError,
} from '../lib/software/solutionRules'
import { onlyLineTenant } from '../lib/tenant/onlyLine'
import { slugField } from './catalogFields'

const features = (description?: string): Field => ({
  name: 'features',
  label: 'Cechy',
  type: 'text',
  hasMany: true,
  maxRows: 3,
  ...(description && { admin: { description } }),
})

const levelsOf = (data: unknown): unknown[] => {
  const levels = (data as { levels?: unknown } | undefined)?.levels
  return Array.isArray(levels) ? levels : []
}

// Payload's built-in `text` check (length, rows) runs after ours. It handles `hasMany` lists at
// runtime, but is typed for a single string only.
const textMany = textValidation as unknown as TextFieldManyValidation

const validateThumbnail: TextFieldSingleValidation = (value, options) =>
  thumbnailError(value) ?? textValidation(value, options)

const validateCells: TextFieldManyValidation = (value, options) =>
  levelCellsError(value, levelsOf(options.data).length) ?? textMany(value, options)

const validateIncluded: TextFieldManyValidation = (value, options) => {
  const data = (options.data ?? {}) as { priceFrom?: number | null }
  return (
    includedError(value, { priceFrom: data.priceFrom, levels: levelsOf(data) }) ??
    textMany(value, options)
  )
}

/** Care and audit: the „od” price is the lowest level, so it is never typed twice (pkt 2). */
const priceFromLevels: CollectionBeforeChangeHook = ({ data }) => {
  const lowest = lowestLevelPrice(data.levels)
  return lowest === null ? data : { ...data, priceFrom: lowest }
}

/**
 * Solutions of the Software catalog (ADR-014 §1.1, „Rozstrzygnięcia v21/v22”): one „od” price
 * and one „od” term, levels only for care and audit, texts of the offer window. Drafts: a
 * solution goes public only once published (the texts are checked then, not on a draft). The
 * full solution page (`page`) comes with SW10.
 */
export const Solutions: CollectionConfig = {
  slug: 'solutions',
  labels: { singular: 'Rozwiązanie', plural: 'Rozwiązania' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', '_status', 'updatedAt'],
    group: 'Software',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: {
    beforeValidate: [onlyLineTenant('software', 'Rozwiązania mają tylko strony linii Software.')],
    beforeChange: [priceFromLevels],
    // The public solutions index (`/api/solutions-index`) follows a published change at once.
    ...solutionsRevalidationHooks,
  },
  indexes: [
    { fields: ['tenant', 'slug'], unique: true },
    // Postgres lets many rows have no id, so solutions added in the panel do not collide.
    { fields: ['tenant', 'legacyId'], unique: true },
  ],
  fields: [
    slugField('solutions', 'strona-firmowa-z-panelem'),
    {
      // Id from the design package: `pnpm seed:software` finds the solution by it (SW3).
      name: 'legacyId',
      label: 'Id z importu',
      type: 'number',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Karta',
          fields: [
            { name: 'name', label: 'Nazwa', type: 'text', required: true },
            {
              type: 'row',
              fields: [
                {
                  name: 'category',
                  label: 'Kategoria',
                  type: 'select',
                  required: true,
                  options: [...SOLUTION_CATEGORIES],
                  admin: { description: 'Filtr katalogu i zakładka cennika.' },
                },
                {
                  name: 'label',
                  label: 'Rodzaj',
                  type: 'text',
                  maxLength: 30,
                  admin: { description: 'Np. „Strona”, „System”.' },
                },
                {
                  name: 'tag',
                  label: 'Plakietka',
                  type: 'text',
                  maxLength: 30,
                  admin: { description: 'Np. „PANEL TREŚCI”.' },
                },
              ],
            },
            { name: 'lead', label: 'Opis na karcie', type: 'textarea', maxLength: 240 },
            features('Trzy krótkie cechy na karcie. {termin} = termin tego rozwiązania.'),
            { name: 'forWhom', label: 'Dla kogo', type: 'text', maxLength: 160 },
            {
              type: 'row',
              fields: [
                {
                  name: 'situations',
                  label: 'Sytuacje klienta',
                  type: 'select',
                  hasMany: true,
                  options: [...SITUATIONS],
                },
                {
                  name: 'industryGroups',
                  label: 'Grupy branż',
                  type: 'select',
                  hasMany: true,
                  options: [...INDUSTRY_GROUPS],
                },
              ],
            },
            {
              name: 'keywords',
              label: 'Słowa dla wyszukiwarki',
              type: 'text',
              admin: { description: 'Po spacji; polskie znaki niepotrzebne.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'hasLivePreview',
                  label: 'Ma podgląd na żywo',
                  type: 'checkbox',
                  defaultValue: false,
                },
                {
                  name: 'toast',
                  label: 'Powiadomienie w podglądzie',
                  type: 'text',
                  maxLength: 80,
                  admin: { description: 'Np. „Nowe zapytanie z formularza”.' },
                },
                {
                  name: 'cardGradient',
                  label: 'Tło miniatury karty',
                  type: 'select',
                  options: [...CARD_GRADIENTS],
                  admin: { description: 'Puste = karta bez miniatury.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Ceny i terminy',
          description:
            'Jedna cena „od” i jeden termin „od”. Pusta cena = „Zapytaj o wycenę”, pusty termin = „po krótkiej rozmowie”. 0 to cena (np. bezpłatny audyt). Poziomy tylko dla opieki i audytu — wtedy cena „od” = najniższy poziom.',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'priceFrom',
                  label: 'Cena od (zł netto)',
                  type: 'number',
                  min: 0,
                  admin: {
                    width: '33%',
                    // With levels the hook sets it on every save — a typed value would vanish.
                    condition: (data) => levelsOf(data).length === 0,
                  },
                },
                {
                  name: 'leadTime',
                  label: 'Termin od',
                  type: 'text',
                  maxLength: 40,
                  admin: { width: '33%', description: 'Np. „od 2 tygodni”, „2 dni robocze”.' },
                },
                {
                  name: 'priceMonthly',
                  label: 'Cena miesięczna',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    width: '33%',
                    description:
                      'Np. opieka: kwoty za miesiąc — „od 149 zł / mies.” (wzór z Ustawień Software → Kreator).',
                  },
                },
              ],
            },
            {
              name: 'priceNote',
              label: 'Zakres przy cenie',
              type: 'textarea',
              maxLength: 240,
              admin: {
                description: 'Linia pod ceną, np. „W cenie „od”: nowa strona do 3 podstron.”',
              },
            },
            {
              name: 'levels',
              label: 'Poziomy (opieka, audyt)',
              labels: { singular: 'Poziom', plural: 'Poziomy' },
              type: 'array',
              maxRows: 3,
              admin: {
                description:
                  'Tylko usługi z poziomami (opieka: Podstawowa / Rozszerzona / Systemy; audyt: 3 rodzaje). Cena „od” = najniższy poziom (ustawia się sama). Inne rozwiązania mają jedną cenę.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'name',
                      label: 'Nazwa',
                      type: 'text',
                      required: true,
                      maxLength: 60,
                      admin: { width: '50%' },
                    },
                    {
                      name: 'shortName',
                      label: 'Nazwa w tabeli',
                      type: 'text',
                      maxLength: 40,
                      admin: { width: '50%', description: 'Puste = nazwa.' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'price',
                      label: 'Cena (zł netto)',
                      type: 'number',
                      required: true,
                      min: 0,
                      admin: { width: '33%' },
                    },
                    {
                      name: 'term',
                      label: 'Czas reakcji / termin',
                      type: 'text',
                      maxLength: 60,
                      admin: { width: '33%', description: 'Np. „8 h roboczych”, „1 tydzień”.' },
                    },
                    {
                      name: 'recommended',
                      label: 'Polecamy',
                      type: 'checkbox',
                      defaultValue: false,
                      admin: { width: '33%' },
                    },
                  ],
                },
                { name: 'description', label: 'Opis', type: 'textarea', maxLength: 200 },
              ],
            },
            {
              name: 'levelRows',
              label: 'Porównanie poziomów',
              labels: { singular: 'Wiersz', plural: 'Wiersze' },
              type: 'array',
              admin: {
                description:
                  'Tabela w oknie oferty. Komórki po kolei dla każdego poziomu: „tak”, „nie”, „dochodzi” albo krótki tekst.',
              },
              fields: [
                { name: 'label', label: 'Wiersz', type: 'text', required: true, maxLength: 80 },
                {
                  name: 'cells',
                  label: 'Komórki',
                  type: 'text',
                  hasMany: true,
                  maxLength: 60,
                  validate: validateCells,
                },
              ],
            },
          ],
        },
        {
          label: 'Okno oferty',
          description:
            'Okno szczegółów w katalogu, „12 rzeczy” i na branży. Puste pole = ta część okna się nie pokazuje. Wspólne teksty kategorii (kroki, płatność, pytania) są w Ustawieniach Software.',
          fields: [
            {
              name: 'thumbnail',
              label: 'Miniatura',
              type: 'text',
              admin: {
                description:
                  'Plik z repozytorium: /software/rozwiazania/<adres>.svg (ilustracje zmienia projektant).',
              },
              validate: validateThumbnail,
            },
            {
              name: 'included',
              label: 'W cenie',
              type: 'text',
              hasMany: true,
              maxRows: 5,
              maxLength: 80,
              admin: { description: 'Co jest w cenie „od” (3–5 punktów).' },
              validate: validateIncluded,
            },
            {
              name: 'moreExamples',
              label: 'Potrzebujesz więcej? — przykłady',
              type: 'text',
              hasMany: true,
              maxRows: 6,
              maxLength: 80,
              admin: {
                description: 'Np. „więcej niż 5 podstron”. Bez cen — wyceniamy na piśmie.',
              },
            },
            { name: 'example', label: 'Przykład z życia', type: 'textarea', maxLength: 400 },
            {
              name: 'related',
              label: 'Dobrze łączy się z',
              type: 'relationship',
              relationTo: 'solutions',
              hasMany: true,
              maxRows: 3,
              filterOptions: relatedFilter,
            },
            {
              name: 'benefits',
              label: 'Co dostajesz (zamiast punktów kategorii)',
              type: 'text',
              hasMany: true,
              maxRows: 6,
              maxLength: 120,
              admin: { description: 'Puste = punkty wspólne dla kategorii.' },
            },
            {
              name: 'needs',
              label: 'Co od Ciebie (zamiast listy kategorii)',
              type: 'text',
              hasMany: true,
              maxRows: 5,
              maxLength: 80,
              admin: { description: 'Puste = lista wspólna dla kategorii.' },
            },
            {
              name: 'faq',
              label: 'Pytania (zamiast pytań kategorii)',
              labels: { singular: 'Pytanie', plural: 'Pytania' },
              type: 'array',
              maxRows: 3,
              fields: [
                { name: 'q', label: 'Pytanie', type: 'text', required: true, maxLength: 120 },
                {
                  name: 'a',
                  label: 'Odpowiedź',
                  type: 'textarea',
                  required: true,
                  maxLength: 500,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
