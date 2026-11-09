import type { CollectionConfig } from 'payload'

import { adminOnly } from '../lib/auth/access'
import { catalogRevalidationHooks } from '../lib/catalog/revalidate'
import { WIZARD_BUSINESS_TYPES } from '../lib/catalog/options'
import { copyTenantLine, notOnLine } from '../lib/tenant/copyLine'
import { LINES } from '../lib/tenant/lines'
import { BzOrderFlowBlock } from '../sites/biznes/blocks/BzOrderFlow/config'
import { BzTimelineBlock } from '../sites/biznes/blocks/BzTimeline/config'
import {
  faqArray,
  imageField,
  optionalFields,
  orderField,
  sectionHeading,
  seoGroup,
  slugField,
} from './catalogFields'
import { industrySoftwareGroup } from './industrySoftware'

const biznesOnly = { condition: notOnLine('software') }

/**
 * Industries (Branże, ADR-012 §1). One page template for all (spec. §6.7, B10b): fields, not
 * blocks — the sections are fixed; „Dzień w lokalu” and „Jak to działa” reuse the fields of the
 * `bzTimeline` and `bzOrderFlow` blocks. Inactive = „Wkrótce”: listed, without its own page.
 * Software industries are records of the Software tenant with their own group (ADR-014 §1.6);
 * the Biznes fields are hidden there.
 */
export const Industries: CollectionConfig = {
  slug: 'industries',
  labels: { singular: 'Branża', plural: 'Branże' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'active', 'order'],
    group: 'Katalog',
  },
  defaultSort: 'order',
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  hooks: { ...catalogRevalidationHooks, beforeChange: [copyTenantLine] },
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
    { name: 'name', label: 'Nazwa', type: 'text', required: true },
    slugField('industries', 'gastronomia'),
    {
      name: 'active',
      label: 'Aktywna',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Nieaktywna branża pokazuje się jako „Wkrótce”.',
      },
    },
    {
      name: 'wizardBusinessType',
      label: 'Rodzaj firmy w kreatorze',
      type: 'select',
      options: [...WIZARD_BUSINESS_TYPES],
      admin: {
        ...biznesOnly,
        position: 'sidebar',
        description: 'Przycisk w nagłówku strony branży otwiera kreator z tym rodzajem firmy.',
      },
    },
    {
      name: 'hero',
      label: 'Nagłówek strony branży',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Tytuł (H1)',
          type: 'text',
          admin: { description: 'Puste = nazwa.' },
        },
        { name: 'lead', label: 'Wstęp', type: 'textarea' },
        imageField('image', 'Obraz'),
        {
          name: 'chips',
          label: 'Plakietki pod przyciskami',
          type: 'text',
          hasMany: true,
          maxRows: 4,
          admin: { description: 'Liczby i opinie tylko ze źródłem (plan Biznesu §4).' },
        },
        {
          name: 'ctaLabel',
          label: 'Przycisk do kreatora',
          type: 'text',
          maxLength: 40,
          admin: { description: 'Puste = „Przygotuj zapytanie”.' },
        },
      ],
    },
    {
      name: 'featuredProducts',
      label: 'Polecane produkty',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: { ...biznesOnly, description: 'Siatka „Zestaw dla branży” — w tej kolejności.' },
    },
    faqArray,
    industrySoftwareGroup,
    {
      type: 'collapsible',
      label: 'Strona branży — sekcje',
      admin: {
        ...biznesOnly,
        initCollapsed: true,
        description:
          '„Dzień w lokalu” (min. 2 kroki) i „Jak to działa” pokazują się tylko z nagłówkiem; puste nagłówki pozostałych sekcji = ogólne teksty.',
      },
      fields: [
        {
          name: 'productsSection',
          label: 'Zestaw dla branży (nad polecanymi produktami)',
          type: 'group',
          fields: [
            sectionHeading,
            { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
          ],
        },
        {
          name: 'day',
          label: 'Dzień w lokalu (oś z godzinami)',
          type: 'group',
          fields: optionalFields(BzTimelineBlock.fields),
        },
        {
          name: 'flow',
          label: 'Jak to działa (granatowa karta)',
          type: 'group',
          fields: optionalFields(BzOrderFlowBlock.fields),
        },
        {
          name: 'faqIntro',
          label: 'Nagłówek pytań',
          type: 'group',
          fields: [
            sectionHeading,
            { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 400 },
          ],
        },
        {
          name: 'contact',
          label: 'Kontakt',
          type: 'group',
          fields: [
            { name: 'heading', label: 'Nagłówek', type: 'text', maxLength: 90 },
            { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
          ],
        },
      ],
    },
    orderField,
    seoGroup,
  ],
}
