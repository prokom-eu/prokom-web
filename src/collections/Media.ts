import path from 'path'
import type { CollectionConfig } from 'payload'

import { adminOnly } from '../lib/auth/access'
import { getEnv } from '../lib/env'
import { createPublicReadAccess, publicMediaWhere } from '../lib/media/access'

/** Raster formats only: an SVG served from a site domain could run scripts there. */
export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const webp = { format: 'webp', options: { quality: 80 } } as const

/**
 * Images of one site (tenant-scoped by the multi-tenant plugin). `alt` is required (ADR-006).
 * Sizes are generated on upload as WebP; `MediaImage` picks one per screen width.
 * Images smaller than a size get no file for it (Payload default), never an upscaled one.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Obraz', plural: 'Obrazy' },
  admin: { useAsTitle: 'alt', defaultColumns: ['filename', 'alt', 'requiresConsent'] },
  access: {
    read: createPublicReadAccess(publicMediaWhere),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  upload: {
    staticDir: path.resolve(getEnv().MEDIA_DIR, 'media'),
    mimeTypes: IMAGE_MIME_TYPES,
    // The original is capped so a 6000 px photo from a phone does not stay on disk as is.
    resizeOptions: { width: 2400, withoutEnlargement: true },
    imageSizes: [
      { name: 'small', width: 480, formatOptions: webp },
      { name: 'medium', width: 960, formatOptions: webp },
      { name: 'large', width: 1600, formatOptions: webp },
    ],
  },
  fields: [
    {
      name: 'alt',
      label: 'Tekst alternatywny',
      type: 'text',
      required: true,
      maxLength: 200,
      admin: { description: 'Co jest na obrazie — czytają to niewidomi i wyszukiwarki.' },
    },
    {
      name: 'source',
      label: 'Źródło / autor',
      type: 'text',
      admin: { description: 'Skąd jest obraz (np. „materiały prasowe Posnet”, „własne”).' },
    },
    {
      name: 'requiresConsent',
      label: 'Wymaga zgody — nie pokazuj publicznie',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Np. logo klienta bez pisemnej zgody. Taki obraz nie trafi na stronę.',
      },
    },
  ],
}
