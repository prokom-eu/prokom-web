import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from 'payload'

import { restrictedRichTextEditor } from '../blocks/RichText/config'
import { adminOnly } from '../lib/auth/access'
import { POST_CATEGORIES } from '../lib/catalog/options'
import { revalidatePageTags } from '../lib/pages/revalidate'
import { postsTagsOf } from '../lib/posts/tags'
import { imageField, seoGroup, slugField } from './catalogFields'

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
 * News (Aktualności, ADR-012 §1). Every legal fact needs a source with a verification date
 * (spec. §6.9). The „Ważne” / „Źródło” / CTA boxes inside the content come with B11.
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
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
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
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
    imageField('cover', 'Okładka'),
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
    },
    seoGroup,
  ],
}
