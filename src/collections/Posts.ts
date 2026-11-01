import { APIError } from 'payload'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
  Field,
} from 'payload'

import { linkGroup } from '../blocks/fields'
import { restrictedRichTextEditor } from '../blocks/RichText/config'
import { adminOnly } from '../lib/auth/access'
import { POST_CATEGORIES } from '../lib/catalog/options'
import { revalidatePageTags } from '../lib/pages/revalidate'
import { categoriesOfLine, isCategoryOfLine } from '../lib/posts/list'
import { withPublishedAt } from '../lib/posts/publishedAt'
import { postsTagsOf } from '../lib/posts/tags'
import { copyTenantLine, notOnLine, onLine } from '../lib/tenant/copyLine'
import { tenantIdOf } from '../lib/tenant/id'
import { lineOfTenant } from '../lib/tenant/lineOf'
import { LINES } from '../lib/tenant/lines'
import { imageField, seoGroup, slugField } from './catalogFields'

/**
 * One category list for all lines (ADR-014 rozstrz. SW0 2): a category of another line would
 * put the post under a filter its site never shows, so the save is refused (400).
 */
const categoryOfTenantLine: CollectionBeforeValidateHook = async ({ data, originalDoc, req }) => {
  const category = data?.category ?? originalDoc?.category
  const tenantId = tenantIdOf(data?.tenant ?? originalDoc?.tenant)
  // No tenant: the plugin's required tenant field refuses the save anyway.
  if (category === undefined || category === null || tenantId === null) return data
  const line = await lineOfTenant(tenantId, req)
  if (!isCategoryOfLine(category, line)) {
    const allowed = categoriesOfLine(line).join(', ') || 'brak'
    throw new APIError(`Kategoria spoza tej strony. Dozwolone: ${allowed}.`, 400, null, true)
  }
  return data
}

const fillPublishedAt: CollectionBeforeChangeHook = ({ data }) => withPublishedAt(data, new Date())

// The home page shows the latest posts (B7d): a change is visible at once, not after the TTL.
const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
  revalidatePageTags(postsTagsOf(doc, previousDoc), req.payload)
  return doc
}

const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  revalidatePageTags(postsTagsOf(doc), req.payload)
  return doc
}

/**
 * News (Aktualności, ADR-012 §1), shown at `/aktualnosci` on the lines with news. Every legal
 * fact needs a source with a verification date (spec. §6.9): the sources list is the „Źródło”
 * box under the content, „W skrócie” the box above it, the side column the CTA (B11).
 */
export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Wpis', plural: 'Aktualności' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', '_status', 'publishedAt'],
    group: 'Katalog',
  },
  defaultSort: '-publishedAt',
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  versions: {
    // Publish at a date: the same jobs cron as `Pages` (`jobs.autoRun`).
    drafts: { schedulePublish: true },
    maxPerDoc: 20,
  },
  hooks: {
    beforeValidate: [categoryOfTenantLine],
    beforeChange: [copyTenantLine, fillPublishedAt],
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  fields: [
    {
      name: 'line',
      label: 'Linia',
      type: 'select',
      options: [...LINES],
      // Always overwritten by `copyTenantLine` on save, whatever the request sends.
      admin: { hidden: true },
    },
    { name: 'title', label: 'Tytuł', type: 'text', required: true },
    slugField('posts', 'ksef-2026-co-musisz-wiedziec'),
    {
      name: 'category',
      label: 'Kategoria',
      type: 'select',
      required: true,
      options: POST_CATEGORIES.map(({ label, value }) => ({ label, value })),
      admin: {
        position: 'sidebar',
        description:
          'Biznes: KSeF, Kasy, Terminale, Dofinansowania, Programy. Software: Poradnik, Nowości, Realizacje. Instalacje: Przepisy, Monitoring, Obiekty noclegowe, Energia, Dźwięk i obraz.',
      },
    },
    {
      name: 'publishedAt',
      label: 'Data publikacji',
      type: 'date',
      index: true,
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly' },
        description: 'Puste przy publikacji → dzisiejsza data.',
      },
    },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
    imageField('cover', 'Okładka'),
    {
      name: 'summary',
      label: 'W skrócie',
      type: 'textarea',
      maxLength: 400,
      admin: { description: 'Ramka nad treścią: najważniejsze w 2–3 zdaniach.' },
    },
    {
      name: 'content',
      label: 'Treść',
      type: 'richText',
      required: true,
      editor: restrictedRichTextEditor,
    },
    {
      name: 'sources',
      label: 'Źródła',
      type: 'array',
      admin: { description: 'Każdy fakt prawny: link do aktu, MF, podatki.gov.pl.' },
      fields: [
        { name: 'name', label: 'Nazwa', type: 'text', required: true },
        {
          name: 'url',
          label: 'Adres',
          type: 'text',
          required: true,
          validate: (value: unknown) =>
            typeof value === 'string' && /^https:\/\/[^\s]+$/.test(value)
              ? true
              : 'Adres https://, np. https://www.podatki.gov.pl/ksef/.',
        },
        {
          name: 'verifiedAt',
          label: 'Sprawdzone dnia',
          type: 'date',
          required: true,
          admin: { date: { pickerAppearance: 'dayOnly' } },
        },
      ],
    },
    {
      name: 'relatedProducts',
      label: 'Powiązane produkty',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      maxRows: 6,
      admin: { condition: notOnLine('software') },
    },
    {
      name: 'relatedSolutions',
      label: 'Powiązane rozwiązania',
      type: 'relationship',
      relationTo: 'solutions',
      hasMany: true,
      maxRows: 3,
      admin: { condition: onLine('software'), description: 'Karty pod wpisem (do 3).' },
    },
    {
      // SW11b (decyzja Krystiana 31.10): „autor i data” and the author box of the board `Wpis`.
      name: 'author',
      label: 'Autor',
      type: 'group',
      admin: { condition: onLine('software') },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', label: 'Imię i nazwisko', type: 'text', maxLength: 80 },
            { name: 'role', label: 'Rola', type: 'text', maxLength: 80 },
          ],
        },
        { name: 'bio', label: 'O autorze', type: 'textarea', maxLength: 240 },
        {
          ...imageField('photo', 'Zdjęcie'),
          admin: { description: 'Tylko za zgodą osoby na zdjęciu.' },
        } as Field,
      ],
    },
    {
      name: 'aside',
      label: 'Kolumna boczna',
      type: 'group',
      admin: { description: 'Karta z przyciskiem i licznik dni obok treści (puste = bez nich).' },
      fields: [
        {
          name: 'cta',
          label: 'Karta z przyciskiem',
          type: 'group',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'eyebrow', label: 'Etykieta', type: 'text', maxLength: 40 },
                { name: 'title', label: 'Tytuł', type: 'text', maxLength: 80 },
              ],
            },
            { name: 'text', label: 'Tekst', type: 'textarea', maxLength: 240 },
            linkGroup('link', 'Przycisk'),
          ],
        },
        {
          name: 'countdown',
          label: 'Licznik dni',
          type: 'group',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'label',
                  label: 'Nagłówek',
                  type: 'text',
                  maxLength: 40,
                  admin: { description: 'Np. „Ile dni do 1.01.2027”.' },
                },
                {
                  name: 'date',
                  label: 'Data',
                  type: 'date',
                  admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' } },
                },
                { name: 'caption', label: 'Podpis', type: 'text', maxLength: 40 },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'contact',
      label: 'Formularz pod wpisem',
      type: 'group',
      admin: { description: 'Puste = tekst jak na liście Aktualności.' },
      fields: [
        { name: 'heading', label: 'Nagłówek', type: 'text', maxLength: 80 },
        { name: 'lead', label: 'Tekst', type: 'textarea', maxLength: 240 },
      ],
    },
    seoGroup,
  ],
}
