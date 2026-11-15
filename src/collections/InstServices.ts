import { APIError, type CollectionConfig } from 'payload'

import { adminOnly } from '../lib/auth/access'
import { anchorsError } from '../lib/instalacje/anchors'
import { OFFER_FAMILIES, SERVICE_GROUPS, SERVICE_KEYS } from '../lib/instalacje/options'
import { onlyLineTenant } from '../lib/tenant/onlyLine'
import { faqArray, slugField } from './catalogFields'
import {
  anchorsArray,
  colorField,
  ctaGroup,
  heroGroup,
  iconField,
  keyField,
  packagesArray,
  sectionIntro,
} from './instalacjeFields'

/**
 * The 10 services of the Instalacje site (ADR-I002 §2): menu entry, home page tile, offer area
 * and the editable sections of the service page (`Pages` with the `InstService` block).
 * Widgets and their texts stay in code (`src/sites/instalacje/dane/`).
 */
export const InstServices: CollectionConfig = {
  slug: 'inst-services',
  labels: { singular: 'Usługa', plural: 'Usługi' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'key', 'group', '_status', 'updatedAt'],
    group: 'Instalacje',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: {
    beforeValidate: [
      onlyLineTenant('instalacje', 'Usługi mają tylko strony linii Instalacje.'),
      ({ data, originalDoc }) => {
        const error = anchorsError(data, originalDoc)
        if (error) throw new APIError(error, 400, null, true)
        return data
      },
    ],
  },
  indexes: [
    { fields: ['tenant', 'slug'], unique: true },
    { fields: ['tenant', 'key'], unique: true },
  ],
  fields: [
    keyField(SERVICE_KEYS),
    slugField('inst-services', 'monitoring'),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Menu i kafel',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', label: 'Nazwa', type: 'text', required: true },
                {
                  name: 'group',
                  label: 'Kolumna menu',
                  type: 'select',
                  required: true,
                  options: [...SERVICE_GROUPS],
                },
              ],
            },
            { type: 'row', fields: [iconField, colorField] },
            { name: 'menuCaption', label: 'Podpis w menu', type: 'text' },
            {
              name: 'tile',
              label: 'Kafel na stronie głównej',
              type: 'group',
              fields: [
                { name: 'description', label: 'Opis', type: 'textarea' },
                { name: 'parts', label: 'Z czego się składa', type: 'text' },
                { name: 'highlights', label: 'Wyróżnienia', type: 'text', hasMany: true },
                { name: 'items', label: 'Elementy', type: 'text', hasMany: true },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'priceFrom',
                      label: 'Cena „od”',
                      type: 'text',
                      admin: { description: 'Widoczna tylko przy „Pokaż ceny”.' },
                    },
                    {
                      name: 'wide',
                      label: 'Szeroki kafel',
                      type: 'checkbox',
                      defaultValue: false,
                    },
                  ],
                },
              ],
            },
            {
              name: 'offer',
              label: 'Obszar w pełnej ofercie',
              type: 'group',
              fields: [
                {
                  name: 'family',
                  label: 'Rodzina',
                  type: 'select',
                  options: [...OFFER_FAMILIES],
                },
                { name: 'description', label: 'Opis obszaru', type: 'textarea' },
                { name: 'brands', label: 'Marki', type: 'text', hasMany: true },
              ],
            },
          ],
        },
        {
          label: 'Strona',
          fields: [
            heroGroup,
            anchorsArray,
            sectionIntro('packagesIntro', 'Zestawy — nagłówek', [
              { name: 'note', label: 'Uwaga pod zestawami', type: 'textarea' },
            ]),
            packagesArray,
            sectionIntro('priceIntro', 'Od czego zależy cena — nagłówek', [
              { name: 'button', label: 'Przycisk', type: 'text' },
            ]),
            {
              name: 'priceFactors',
              label: 'Od czego zależy cena',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'title', label: 'Tytuł', type: 'text', required: true },
                    iconField,
                  ],
                },
                { name: 'description', label: 'Opis', type: 'textarea' },
              ],
            },
            { name: 'faqHeading', label: 'Pytania — nagłówek', type: 'text' },
            faqArray,
            {
              name: 'faqAside',
              label: 'Pytania — ramka „Masz inne pytanie?”',
              type: 'group',
              fields: [
                { name: 'title', label: 'Tytuł', type: 'text' },
                { name: 'text', label: 'Tekst', type: 'textarea' },
                {
                  type: 'row',
                  fields: [
                    { name: 'button', label: 'Przycisk', type: 'text' },
                    { name: 'href', label: 'Adres', type: 'text' },
                  ],
                },
              ],
            },
            { name: 'relatedHeading', label: 'Powiązane — nagłówek', type: 'text' },
            {
              name: 'relatedServices',
              label: 'Powiązane usługi',
              type: 'relationship',
              relationTo: 'inst-services',
              hasMany: true,
            },
            {
              name: 'similarObjects',
              label: 'Podobne obiekty',
              type: 'relationship',
              relationTo: 'inst-objects',
              hasMany: true,
            },
            ctaGroup,
          ],
        },
      ],
    },
    // SEO of a service page lives in `Pages.seo` (ADR-I002 „Import (I2)”); the columns (same as
    // `seoGroup`) stay for now and are hidden, so nobody edits them in the wrong place.
    {
      name: 'seo',
      type: 'group',
      admin: { hidden: true },
      fields: [
        { name: 'title', type: 'text', maxLength: 70 },
        { name: 'description', type: 'textarea', maxLength: 160 },
      ],
    },
  ],
}
