import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
} from 'payload'

import { linkGroup } from '../blocks/fields'
import { restrictedRichTextEditor } from '../blocks/RichText/config'
import { adminOnly } from '../lib/auth/access'
import { POST_CATEGORIES } from '../lib/catalog/options'
import { revalidatePageTags } from '../lib/pages/revalidate'
import { withPublishedAt } from '../lib/posts/publishedAt'
import { postsTagsOf } from '../lib/posts/tags'
import { imageField, seoGroup, slugField } from './catalogFields'

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
    beforeChange: [fillPublishedAt],
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  fields: [
    { name: 'title', label: 'Tytuł', type: 'text', required: true },
    slugField('posts', 'ksef-2026-co-musisz-wiedziec'),
    {
      name: 'category',
      label: 'Kategoria',
      type: 'select',
      required: true,
      options: [...POST_CATEGORIES],
      admin: { position: 'sidebar' },
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
