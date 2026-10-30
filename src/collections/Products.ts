import type { CollectionConfig, Field } from 'payload'

import { restrictedRichTextEditor } from '../blocks/RichText/config'
import { adminOnly } from '../lib/auth/access'
import { catalogRevalidationHooks } from '../lib/catalog/revalidate'
import {
  CONTENT_BATCHES,
  CONTENT_STATUSES,
  FEATURED_GROUPS,
  isHexColor,
  PRODUCT_KINDS,
  REGISTER_TYPES,
} from '../lib/catalog/options'
import { validateHttpUrls } from '../lib/catalog/sources'
import { VIDEO_MATCHES, validateYoutubeId } from '../lib/catalog/videos'
import {
  brandFilter,
  faqArray,
  imageField,
  includedField,
  seoGroup,
  slugField,
} from './catalogFields'

const labelValue: Field[] = [
  {
    type: 'row',
    fields: [
      { name: 'label', label: 'Etykieta', type: 'text', required: true },
      { name: 'value', label: 'Wartość', type: 'text', required: true },
    ],
  },
]

/** Seed keys of `parametry_kasy` (labels: `porownanie_kas_etykiety`). Comparison is stage 2. */
const comparisonText = (name: string, label: string): Field => ({ name, label, type: 'text' })

/**
 * Products of the catalog (ADR-012 §1.1) — no prices, ever. Drafts: a product goes public
 * only once published. The public site reads published ones through the Local API.
 */
export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Produkt', plural: 'Produkty' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'brand', 'categories', 'contentStatus', '_status', 'updatedAt'],
    group: 'Katalog',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: catalogRevalidationHooks,
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  fields: [
    slugField('products', 'posnet-ergo-online'),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Karta',
          fields: [
            { name: 'name', label: 'Nazwa', type: 'text', required: true },
            {
              name: 'shortName',
              label: 'Nazwa krótka',
              type: 'text',
              admin: {
                description:
                  'Nagłówek karty z wieloma modelami, gdy pełna nazwa jest dłuższa niż 62 znaki (K31-ZMIANY §13.5).',
              },
            },
            {
              name: 'subtitle',
              label: 'Podtytuł',
              type: 'text',
              admin: { description: 'Krótko pod nazwą, np. „Kasa średnia online do sklepu”.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'kind',
                  label: 'Rodzaj',
                  type: 'select',
                  required: true,
                  defaultValue: 'device',
                  options: [...PRODUCT_KINDS],
                },
                {
                  name: 'brand',
                  label: 'Marka',
                  type: 'relationship',
                  relationTo: 'partners',
                  filterOptions: brandFilter,
                  admin: { description: 'Partnerzy widoczni na tej stronie.' },
                },
              ],
            },
            {
              name: 'categories',
              label: 'Kategorie',
              type: 'relationship',
              relationTo: 'catalog-categories',
              hasMany: true,
              required: true,
              minRows: 1,
              admin: { description: 'Pierwsza jest główna (okruszki, „Z tej samej rodziny”).' },
            },
            {
              name: 'subcategory',
              label: 'Podkategoria',
              type: 'text',
              admin: {
                description:
                  'Filtr wewnątrz kategorii (np. „Szuflady kasowe”). Ta sama pisownia w całej kategorii.',
              },
            },
            {
              name: 'series',
              label: 'Seria',
              type: 'text',
              admin: {
                description:
                  'Seria w salonie marki (Lenovo, Dell), np. „ThinkPad T”. Ta sama pisownia co w serii salonu.',
              },
            },
            {
              name: 'industries',
              label: 'Branże',
              type: 'relationship',
              relationTo: 'industries',
              hasMany: true,
              admin: { description: 'Produkt pokazuje się tylko w tych branżach.' },
            },
            {
              name: 'benefit',
              label: 'Korzyść',
              type: 'text',
              // 170: the longest K4 benefits have 168 characters (Logitech, K4a-1b-2).
              maxLength: 170,
              admin: { description: 'Jedno zdanie na karcie produktu.' },
            },
            { name: 'features', label: 'Cechy', type: 'text', hasMany: true, maxRows: 3 },
            {
              name: 'badge',
              label: 'Odznaka',
              type: 'text',
              maxLength: 40,
              admin: { description: 'Krótki tekst na karcie, np. „Nowość 2026”. Bez cen.' },
            },
            {
              name: 'keywords',
              label: 'Słowa kluczowe',
              type: 'textarea',
              admin: { description: 'Dla wyszukiwarki, niewidoczne na stronie.' },
            },
            imageField(
              'images',
              'Zdjęcia',
              true,
              'Galeria w tej kolejności; pierwsze jest główne (karta).',
            ),
            {
              name: 'variants',
              label: 'Wersje',
              type: 'array',
              admin: {
                description: 'Wersje jednej karty, np. „Jota ONLINE BT/WiFi”, i czym się różnią.',
              },
              fields: [
                { name: 'name', label: 'Model', type: 'text', required: true },
                { name: 'difference', label: 'Czym się różni', type: 'textarea' },
              ],
            },
            {
              name: 'colors',
              label: 'Kolory',
              type: 'array',
              admin: {
                description:
                  'Wersje kolorystyczne (K4): galeria pokazuje zdjęcie koloru, wybór trafia do notatki w zapytaniu.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', label: 'Nazwa', type: 'text', required: true },
                    {
                      name: 'hex',
                      label: 'Kolor próbki',
                      type: 'text',
                      required: true,
                      // Swatch of a product color: data, like a group gradient (ADR-012 B0).
                      validate: (value: unknown) =>
                        isHexColor(value) ? true : 'Kolor w formacie #RRGGBB, np. #2E3641.',
                    },
                  ],
                },
                imageField('image', 'Zdjęcie'),
              ],
            },
          ],
        },
        {
          label: 'Strona produktu',
          fields: [
            {
              name: 'keyParams',
              label: 'Kluczowe parametry',
              type: 'array',
              maxRows: 4,
              fields: labelValue,
            },
            {
              name: 'specs',
              label: 'Specyfikacja',
              type: 'array',
              fields: [{ name: 'group', label: 'Grupa', type: 'text' }, ...labelValue],
            },
            {
              name: 'videos',
              label: 'Filmy',
              type: 'array',
              admin: {
                description:
                  'Tylko z oficjalnych kanałów producentów (ADR-016). Film „nieaktywny” znika ze strony — ustawia go też cotygodniowe sprawdzenie YouTube.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'youtubeId',
                      label: 'Identyfikator YouTube',
                      type: 'text',
                      required: true,
                      validate: validateYoutubeId,
                    },
                    {
                      name: 'match',
                      label: 'Pokazuje',
                      type: 'select',
                      required: true,
                      defaultValue: 'model',
                      options: [...VIDEO_MATCHES],
                    },
                    { name: 'active', label: 'Aktywny', type: 'checkbox', defaultValue: true },
                  ],
                },
                { name: 'title', label: 'Tytuł', type: 'text', required: true },
                {
                  type: 'row',
                  fields: [
                    { name: 'channel', label: 'Kanał', type: 'text' },
                    { name: 'lang', label: 'Język', type: 'text', admin: { width: '20%' } },
                  ],
                },
              ],
            },
            {
              name: 'description',
              label: 'Opis',
              type: 'richText',
              editor: restrictedRichTextEditor,
            },
            includedField('Puste = „W cenie” z kategorii głównej.'),
            {
              name: 'configurator',
              label: 'Wybór wersji',
              type: 'group',
              admin: {
                description:
                  'Opcje producenta do wyboru przed zapytaniem (K3) — to nie koszyk i nie liczy ceny.',
              },
              fields: [
                { name: 'description', label: 'Opis (jedno zdanie)', type: 'textarea' },
                {
                  name: 'options',
                  label: 'Opcje',
                  type: 'array',
                  fields: [
                    { name: 'name', label: 'Nazwa', type: 'text', required: true },
                    { name: 'values', label: 'Wartości', type: 'text', hasMany: true },
                    { name: 'note', label: 'Uwaga producenta', type: 'textarea' },
                    {
                      name: 'help',
                      label: 'Wyjaśnienie',
                      type: 'textarea',
                      admin: { description: 'Co daje ta opcja, zwykłym językiem.' },
                    },
                    {
                      name: 'longValues',
                      label: 'Długie wartości',
                      type: 'checkbox',
                      defaultValue: false,
                      admin: { description: 'Wartości jedna pod drugą zamiast obok siebie.' },
                    },
                  ],
                },
                {
                  name: 'fixed',
                  label: 'Stałe w każdej wersji',
                  type: 'array',
                  admin: { description: 'Pokazywane jako parametry, nie do wyboru.' },
                  fields: labelValue,
                },
                {
                  name: 'popular',
                  label: 'Najczęściej wybierane',
                  type: 'array',
                  fields: [
                    { name: 'name', label: 'Nazwa', type: 'text', required: true },
                    {
                      name: 'configuration',
                      label: 'Konfiguracja',
                      type: 'textarea',
                      required: true,
                    },
                  ],
                },
              ],
            },
            faqArray,
            {
              name: 'suggestions',
              label: 'Do tego zwykle dobierają',
              type: 'text',
              hasMany: true,
              admin: {
                description:
                  'Nazwy rzeczy, np. „szuflada kasowa” — strona dopasuje do nich karty katalogu. Od K4 zastępuje je lista „Polecane do tego produktu”.',
              },
            },
            {
              name: 'recommended',
              label: 'Polecane do tego produktu',
              type: 'array',
              admin: {
                description:
                  '„Do tego zwykle dobierają” (K4): karta i krótka etykieta, np. „Szuflada”.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'product',
                      label: 'Produkt',
                      type: 'relationship',
                      relationTo: 'products',
                      required: true,
                    },
                    { name: 'label', label: 'Etykieta', type: 'text', required: true },
                  ],
                },
              ],
            },
            {
              name: 'packages',
              label: 'Pakiety abonamentu',
              type: 'array',
              admin: {
                description: 'Tylko karta opieki IT — na stronie dopiero po akceptacji szefa.',
              },
              fields: [
                { name: 'name', label: 'Nazwa', type: 'text', required: true },
                { name: 'audience', label: 'Dla kogo', type: 'textarea' },
                { name: 'inSubscription', label: 'W abonamencie', type: 'text', hasMany: true },
                {
                  name: 'outsideSubscription',
                  label: 'Poza abonamentem',
                  type: 'text',
                  hasMany: true,
                },
                { name: 'rules', label: 'Zasady', type: 'text', hasMany: true },
              ],
            },
            {
              name: 'fitsWith',
              label: 'Skompletuj stanowisko',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
            },
            {
              name: 'alternatives',
              label: 'Podobne / z tej samej rodziny',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
            },
            {
              name: 'sources',
              label: 'Źródła',
              type: 'group',
              admin: { description: 'Parametry tylko ze strony producenta (spec. §5).' },
              fields: [
                {
                  name: 'productPages',
                  label: 'Strony producenta',
                  type: 'text',
                  hasMany: true,
                  validate: validateHttpUrls,
                },
                {
                  name: 'datasheets',
                  label: 'Karty katalogowe (PDF)',
                  type: 'text',
                  hasMany: true,
                  validate: validateHttpUrls,
                  admin: { description: 'Linki do producenta — zakładka „Dokumenty”.' },
                },
                {
                  name: 'distributorPages',
                  label: 'Strony dystrybutorów',
                  type: 'text',
                  hasMany: true,
                  validate: validateHttpUrls,
                  admin: {
                    description:
                      'Tylko do sprawdzania w panelu — sklepów i dystrybutorów nie pokazujemy na stronie.',
                  },
                },
                {
                  name: 'links',
                  label: 'Źródła z etykietą',
                  type: 'array',
                  admin: {
                    description:
                      'Lista „Źródła: … · …” (K4). Na stronie tylko domeny producentów — sklepy i dystrybutorzy zostają w panelu.',
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'label', label: 'Etykieta', type: 'text', required: true },
                        {
                          name: 'url',
                          label: 'Link',
                          type: 'text',
                          required: true,
                          validate: (value: unknown) =>
                            validateHttpUrls(typeof value === 'string' ? [value] : []),
                        },
                      ],
                    },
                  ],
                },
                {
                  name: 'checkedAt',
                  label: 'Parametry sprawdzone',
                  type: 'date',
                  admin: { description: 'Wypełnia człowiek po sprawdzeniu u producenta.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Kasy fiskalne',
          description: 'Tylko dla kas: dobór na stronie kategorii i porównywarka (etap 2).',
          fields: [
            {
              name: 'registerTypes',
              label: 'Typ kasy',
              type: 'select',
              hasMany: true,
              options: [...REGISTER_TYPES],
            },
            {
              name: 'comparison',
              label: 'Porównanie',
              type: 'group',
              fields: [
                comparisonText('type', 'Typ'),
                comparisonText('display', 'Wyświetlacz'),
                comparisonText('keyboard', 'Klawiatura'),
                comparisonText('plu', 'Baza towarów (PLU)'),
                comparisonText('printer', 'Drukarka'),
                comparisonText('connectivity', 'Łączność'),
                comparisonText('weight', 'Waga'),
                comparisonText('audience', 'Dla kogo'),
              ],
            },
          ],
        },
        { label: 'SEO', fields: [seoGroup] },
      ],
    },
    {
      name: 'isNew',
      label: 'Nowość',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'authorized',
      label: 'Autoryzacja',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Etykieta zależy od statusu marki (serwis / partner) i rodzaju.',
      },
    },
    {
      name: 'popularity',
      label: 'Popularność',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 50,
      admin: { position: 'sidebar', description: '0–100: kolejność „Popularne” i wyszukiwarka.' },
    },
    {
      name: 'featured',
      label: 'Wyróżniony na stronie głównej',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'featuredOrder',
      label: 'Kolejność wyróżnienia',
      type: 'number',
      admin: { position: 'sidebar', condition: (data) => Boolean(data?.featured) },
    },
    {
      // Filter pills of „O to firmy pytają najczęściej” (K35 §7a): not the departments — UPS
      // has its own pill.
      name: 'featuredGroup',
      label: 'Grupa wyróżnienia',
      type: 'select',
      options: [...FEATURED_GROUPS],
      admin: { position: 'sidebar', condition: (data) => Boolean(data?.featured) },
    },
    {
      // `pop9` of the K4 package (K36 §10): order of the card inside its category under
      // „Polecane” in the offer. Empty = after the numbered ones.
      name: 'categoryOrder',
      label: 'Kolejność w kategorii',
      type: 'number',
      min: 0,
      admin: { position: 'sidebar', description: 'Mniejsza liczba = wcześniej w „Polecane”.' },
    },
    {
      name: 'contentStatus',
      label: 'Treść',
      type: 'select',
      required: true,
      defaultValue: 'ready',
      options: [...CONTENT_STATUSES],
      admin: {
        position: 'sidebar',
        description:
          '„Do sprawdzenia” = widoczna, ale bez indeksowania w Google i poza mapą strony.',
      },
    },
    {
      name: 'internalNotes',
      label: 'Notatki wewnętrzne',
      type: 'textarea',
      admin: {
        position: 'sidebar',
        description: 'Z importu i dla zespołu — nigdy na stronie.',
      },
    },
    {
      name: 'batch',
      label: 'Partia treści',
      type: 'select',
      options: [...CONTENT_BATCHES],
      admin: { position: 'sidebar', description: 'Tylko do planowania — widoczne są wszystkie.' },
    },
    {
      // Seed short id (`ergo`) first, then the ids of the source sheet: the import finds the
      // product by any of them, so `pnpm seed:biznes` stays idempotent.
      name: 'legacyIds',
      label: 'Id z importu',
      type: 'text',
      hasMany: true,
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}
