import type { Media } from '@/payload-types'

import { tenantIdOf } from '../tenant/id'
import { imageSources, type ImageSource } from './sizes'

/** What `MediaImage` gets: only serializable fields, nothing about the tenant or the source. */
export type PublicImage = { alt: string; width: number; height: number; sources: ImageSource[] }

type MediaLike = Pick<Media, 'alt' | 'url' | 'width' | 'height' | 'requiresConsent'> & {
  tenant?: unknown
  sizes?: Media['sizes'] | Record<string, unknown>
}

/**
 * An image from a relation as the public site may render it, or `null`. Pages are read with
 * `overrideAccess`, so the rules of `lib/media/access` are repeated here: the image belongs to
 * the tenant of the page and does not need consent. An unpopulated relation (id) → `null`.
 */
export function publicImage(value: unknown, tenantId: number): PublicImage | null {
  if (!value || typeof value !== 'object') return null
  const doc = value as MediaLike
  if (tenantIdOf(doc.tenant) !== tenantId || doc.requiresConsent) return null
  const alt = doc.alt?.trim()
  if (!alt || !doc.width || !doc.height) return null
  const sources = imageSources(doc as Parameters<typeof imageSources>[0])
  if (sources.length === 0) return null
  return { alt, width: doc.width, height: doc.height, sources }
}
