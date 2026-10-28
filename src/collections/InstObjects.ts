import type { CollectionConfig, Field } from 'payload'

import { adminOnly } from '../lib/auth/access'
import { OBJECT_GROUPS, OBJECT_KEYS, SERVICE_KEYS } from '../lib/instalacje/options'
import { onlyLineTenant } from '../lib/tenant/onlyLine'
import { faqArray, seoGroup, slugField } from './catalogFields'
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

const serviceField = (name: string, label: string, hasMany: boolean): Field => ({
  name,
  label,
  type: 'select',
  hasMany,
  options: [...SERVICE_KEYS],
})

/**
 * The 12 „Dla kogo” pages (`/dla-kogo/<slug>`), entirely from the panel (ADR-I002 §2). Scene
 * geometry stays in code: `hotspots` are only the texts, in the order of the numbers on the SVG.
 */
export const InstObjects: CollectionConfig = {
  slug: 'inst-objects',
  labels: { singular: 'Obiekt', plural: 'Obiekty (Dla kogo)' },
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
    beforeValidate: [onlyLineTenant('instalacje', 'Obiekty mają tylko strony linii Instalacje.')],
  },
  indexes: [
    { fields: ['tenant', 'slug'], unique: true },
    { fields: ['tenant', 'key'], unique: true },
  ],
  fields: [
    keyField(OBJECT_KEYS),
    slugField('inst-objects', 'pensjonaty'),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Menu',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', label: 'Nazwa', type: 'text', required: true },
                {
                  name: 'group',
                  label: 'Grupa',
                  type: 'select',
                  required: true,
                  options: [...OBJECT_GROUPS],
                },
              ],
            },
            { type: 'row', fields: [iconField, colorField] },
            {
              type: 'row',
              fields: [
                { name: 'menuCaption', label: 'Podpis w menu', type: 'text' },
                {
                  name: 'forWhom',
                  label: 'Odmiana „dla …”',
                  type: 'text',
                  admin: { description: 'Np. „domu”, „pensjonatu”.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Strona',
          fields: [
            heroGroup,
            { name: 'sceneTitle', label: 'Tytuł sceny', type: 'text' },
            {
              name: 'hotspots',
              label: 'Punkty sceny',
              type: 'array',
              admin: { description: 'Kolejność = numery na rysunku.' },
              fields: [{ name: 'description', label: 'Opis', type: 'textarea', required: true }],
            },
            anchorsArray,
            sectionIntro('problemsIntro', 'Problemy — nagłówek', [
              { name: 'headingAccent', label: 'Nagłówek — wyróżnienie', type: 'text' },
            ]),
            {
              name: 'problems',
              label: 'Problemy',
              type: 'array',
              fields: [
                { name: 'quote', label: 'Cytat', type: 'text', required: true },
                { name: 'description', label: 'Opis', type: 'textarea' },
                { name: 'fix', label: 'Rozwiązanie', type: 'textarea' },
                { type: 'row', fields: [serviceField('service', 'Usługa', false), iconField] },
              ],
            },
            sectionIntro('dayIntro', 'Doba / rok — nagłówek'),
            {
              name: 'day',
              label: 'Doba / rok',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'time', label: 'Pora', type: 'text', required: true },
                    { name: 'name', label: 'Nazwa', type: 'text', required: true },
                  ],
                },
                { name: 'description', label: 'Opis', type: 'textarea' },
                { type: 'row', fields: [serviceField('services', 'Usługi', true), iconField] },
              ],
            },
            sectionIntro('lawIntro', 'Przepisy — nagłówek'),
            {
              name: 'law',
              label: 'Przepisy',
              type: 'array',
              admin: { description: 'Bez źródeł na stronie (spec §2).' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'who', label: 'Kogo dotyczy', type: 'text' },
                    { name: 'article', label: 'Artykuł', type: 'text' },
                  ],
                },
                { name: 'title', label: 'Tytuł', type: 'text', required: true },
                { name: 'description', label: 'Opis', type: 'textarea' },
              ],
            },
            sectionIntro('mountainsIntro', 'Podhale — nagłówek'),
            {
              name: 'mountains',
              label: 'Podhale',
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
            { name: 'realizationsHeading', label: 'Realizacje — nagłówek', type: 'text' },
            {
              name: 'realizations',
              label: 'Realizacje (krótko)',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'title', label: 'Tytuł', type: 'text', required: true },
                    { name: 'place', label: 'Miejsce i obiekt', type: 'text' },
                  ],
                },
                { name: 'description', label: 'Opis', type: 'textarea' },
              ],
            },
            sectionIntro('prepareIntro', 'Przed wizytą — nagłówek'),
            { name: 'prepare', label: 'Przed wizytą — lista', type: 'text', hasMany: true },
            { name: 'packagesHeading', label: 'Zestawy — nagłówek', type: 'text' },
            packagesArray,
            { name: 'faqHeading', label: 'Pytania — nagłówek', type: 'text' },
            faqArray,
            {
              name: 'relatedServices',
              label: 'Powiązane usługi',
              type: 'relationship',
              relationTo: 'inst-services',
              hasMany: true,
            },
            ctaGroup,
            {
              name: 'foldOnPhone',
              label: 'Sekcje zwinięte na telefonie',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'anchorId', label: 'Id sekcji', type: 'text', required: true },
                    {
                      name: 'maxHeight',
                      label: 'Wysokość zwinięcia (px)',
                      type: 'number',
                      min: 0,
                      admin: { description: 'Puste = zwinięta do nagłówka.' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        { label: 'SEO', fields: [seoGroup] },
      ],
    },
  ],
}
