import type { CollectionSlug, Field, Where } from 'payload'

import { publicPartnerWhere, tenantImageFilter } from '../lib/media/access'
import { tenantIdOf } from '../lib/tenant/id'
import { tenantUniqueSlug } from '../lib/tenant/uniqueSlug'

/** Shared fields of the Biznes catalog collections (ADR-012). */

export function slugField(collection: CollectionSlug, example: string): Field {
  return {
    name: 'slug',
    label: 'Adres',
    type: 'text',
    required: true,
    // No single-column index: every query also filters by tenant, and the unique
    // `['tenant', 'slug']` index of each collection covers it.
    validate: tenantUniqueSlug(collection, {
      invalidMessage: `Tylko małe litery, cyfry i pojedyncze myślniki, np. „${example}”.`,
      takenMessage: (slug) => `Adres „${slug}” jest już zajęty na tej stronie.`,
    }),
    admin: { position: 'sidebar', description: `Część adresu, np. „${example}”.` },
  }
}

/**
 * Fields of a block reused as a group of a collection (B10b: sections of an industry page): the
 * section is optional, so its top-level `required` goes. `minRows` stays — Payload checks it only
 * when the array has rows. Nested field objects stay shared with the block: fine, as sanitizing
 * adds the array row `id` only when it is missing.
 */
export function optionalFields(fields: Field[]): Field[] {
  return fields.map((field) => {
    if (field.type === 'row' || field.type === 'collapsible') {
      return { ...field, fields: optionalFields(field.fields) }
    }
    const { required: _required, ...rest } = field as Field & { required?: boolean }
    return rest as Field
  })
}

/** Eyebrow and H2 of a catalog page section (category, industry). */
export const sectionHeading: Field = {
  type: 'row',
  fields: [
    { name: 'eyebrow', label: 'Nadtytuł', type: 'text', maxLength: 60 },
    { name: 'title', label: 'Nagłówek', type: 'text', maxLength: 90 },
  ],
}

export const orderField: Field = {
  name: 'order',
  label: 'Kolejność',
  type: 'number',
  defaultValue: 0,
  admin: { position: 'sidebar', description: 'Mniejsza liczba = wcześniej.' },
}

/** Same shape as `Pages.seo`; empty = defaults from the site settings. */
export const seoGroup: Field = {
  name: 'seo',
  label: 'SEO',
  type: 'group',
  fields: [
    { name: 'title', label: 'Tytuł w wyszukiwarce', type: 'text', maxLength: 70 },
    { name: 'description', label: 'Opis', type: 'textarea', maxLength: 160 },
  ],
}

export const faqArray: Field = {
  name: 'faq',
  label: 'Pytania i odpowiedzi',
  type: 'array',
  fields: [
    { name: 'question', label: 'Pytanie', type: 'text', required: true },
    { name: 'answer', label: 'Odpowiedź', type: 'textarea', required: true },
  ],
}

/** „W cenie” — what the customer gets with the product or category. */
export function includedField(description?: string): Field {
  return {
    name: 'included',
    label: 'W cenie',
    type: 'text',
    hasMany: true,
    ...(description && { admin: { description } }),
  }
}

/** Images of the edited document's tenant only: the plugin narrows relationships, not uploads. */
export function imageField(
  name: string,
  label: string,
  hasMany = false,
  description?: string,
): Field {
  return hasMany
    ? {
        name,
        label,
        type: 'upload',
        relationTo: 'media',
        hasMany: true,
        filterOptions: tenantImageFilter,
        ...(description && { admin: { description } }),
      }
    : { name, label, type: 'upload', relationTo: 'media', filterOptions: tenantImageFilter }
}

/** Brands are the shared `Partners`; only those shown on the edited document's tenant. */
export function brandFilter({ data }: { data?: { tenant?: unknown } }): Where | false {
  return publicPartnerWhere(tenantIdOf(data?.tenant))
}
