import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from 'payload'

import { ALL_BLOCKS, blocksFilterOptions } from '../blocks/registry'
import { adminOnly } from '../lib/auth/access'
import { revalidatePageTags } from '../lib/pages/revalidate'
import { HOME_SLUG, isValidPageSlug } from '../lib/pages/slug'
import { tagsToRevalidate } from '../lib/pages/tags'
import { pagePreviewUrl } from '../lib/preview/url'
import { tenantUniqueSlug } from '../lib/tenant/uniqueSlug'

/** The slug is unique per tenant: database index below + a readable message here. */
const validateSlug = tenantUniqueSlug('pages', {
  isValid: isValidPageSlug,
  invalidMessage: 'Tylko małe litery, cyfry i pojedyncze myślniki, np. „kontakt”.',
  takenMessage: (slug) => `Ta strona ma już podstronę o adresie „${slug}”.`,
})

const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
  revalidatePageTags(tagsToRevalidate(doc, previousDoc), req.payload)
  return doc
}

const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  revalidatePageTags(tagsToRevalidate({ ...doc, _status: 'draft' }, doc), req.payload)
  return doc
}

/** Pages of one site, built from blocks (ADR-006, ADR-010). Tenant scope: multi-tenant plugin. */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Podstrona', plural: 'Podstrony' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    livePreview: {
      url: pagePreviewUrl,
      breakpoints: [
        { name: 'phone', label: 'Telefon (360 px)', width: 360, height: 740 },
        { name: 'desktop', label: 'Komputer', width: 1440, height: 900 },
      ],
    },
  },
  // The plugin limits editors to their own tenants. The public site reads published pages
  // through the Local API (`lib/pages/data`), never through this access. Deleting is an
  // admin decision; an editor takes a page offline with "Cofnij publikację".
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  versions: {
    drafts: {
      autosave: { interval: 800 },
      // Publish at a date: a job run by the Payload jobs cron (`jobs.autoRun` in the config).
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    { name: 'title', label: 'Tytuł', type: 'text', required: true },
    {
      name: 'slug',
      label: 'Adres',
      type: 'text',
      required: true,
      index: true,
      validate: validateSlug,
      admin: {
        position: 'sidebar',
        description: `Część adresu po domenie, np. „kontakt” → /kontakt. Strona główna: „${HOME_SLUG}”.`,
      },
    },
    {
      name: 'layout',
      label: 'Bloki',
      type: 'blocks',
      blocks: ALL_BLOCKS,
      filterOptions: blocksFilterOptions,
    },
    {
      name: 'seo',
      label: 'SEO',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Tytuł w wyszukiwarce',
          type: 'text',
          maxLength: 70,
          admin: {
            description: 'Puste = tytuł podstrony. Szablon z ustawień strony dopisze nazwę.',
          },
        },
        {
          name: 'description',
          label: 'Opis',
          type: 'textarea',
          maxLength: 160,
          admin: { description: 'Puste = domyślny opis z ustawień strony.' },
        },
      ],
    },
  ],
}
