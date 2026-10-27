import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
} from 'payload'

import { adminOnly } from '../lib/auth/access'
import { inquiryNumber } from '../lib/inquiry/number'
import { INQUIRY_STATUSES, nextStatusChangedAt } from '../lib/inquiry/status'
import { INQUIRY_TYPE_LABELS, PREFERRED_CONTACT_LABELS, selectOptions } from '../lib/inquiry/types'
import { isLine, LINES } from '../lib/tenant/lines'

// Everything but `status` is what the customer sent: nobody edits it, not even an admin.
// Field access strips such values from API updates; `readOnly` only greys out the panel.
const locked = { update: () => false }

const trackStatusChange: CollectionBeforeChangeHook = ({ data, operation, originalDoc }) => {
  if (operation !== 'create' && operation !== 'update') return data
  return {
    ...data,
    statusChangedAt: nextStatusChangedAt({
      operation,
      status: data.status,
      previousStatus: originalDoc?.status,
      previousChangedAt: originalDoc?.statusChangedAt,
      now: new Date(),
    }),
  }
}

/**
 * Number from the id (`lib/inquiry/number`), so it is set right after the insert, in the same
 * transaction (`req`). Any way of creating an inquiry gets one, not only the form.
 */
const assignNumber: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create' || doc.number || !isLine(doc.line)) return doc
  const number = inquiryNumber({ id: doc.id, line: doc.line, createdAt: doc.createdAt })
  return req.payload.update({
    collection: 'inquiries',
    id: doc.id,
    data: { number },
    depth: 0,
    // The field is locked for everyone; the server sets it once.
    overrideAccess: true,
    req,
  })
}

/** Right-to-erasure trail (ADR-003): who deleted which record and when, never its content. */
const recordDeletion: CollectionAfterDeleteHook = async ({ id, req }) => {
  const user = req.user?.collection === 'users' ? req.user : null
  await req.payload.create({
    collection: 'inquiry-deletions',
    data: {
      inquiryId: Number(id),
      // No user = the daily retention job (`lib/inquiry/retention`).
      reason: user ? 'request' : 'retention',
      deletedBy: user?.id ?? null,
      deletedByEmail: user?.email ?? null,
    },
    overrideAccess: true,
    req,
  })
}

/**
 * Inquiries from the site forms (ADR-003). Written only by `submitInquiry()` (`lib/inquiry`),
 * never through the API; in the panel only the status changes. To be removed after the move
 * to PRO-KOM System (2027).
 */
export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  labels: { singular: 'Zapytanie', plural: 'Zapytania' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['number', 'createdAt', 'name', 'line', 'type', 'status'],
    group: 'Zapytania',
    description: 'Zapytania z formularzy stron. Zmieniasz tylko status.',
  },
  defaultSort: '-createdAt',
  // Editors see their tenants' inquiries (plugin constraint). Nothing is public.
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => false,
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  hooks: {
    beforeChange: [trackStatusChange],
    afterChange: [assignNumber],
    afterDelete: [recordDeletion],
  },
  fields: [
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      index: true,
      options: [...INQUIRY_STATUSES],
      admin: { position: 'sidebar' },
    },
    {
      name: 'number',
      label: 'Numer',
      type: 'text',
      unique: true,
      access: locked,
      admin: { readOnly: true, position: 'sidebar', description: 'Np. PKB-2026-0042.' },
    },
    {
      name: 'statusChangedAt',
      label: 'Status zmieniony',
      type: 'date',
      index: true,
      access: locked,
      admin: {
        readOnly: true,
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Od tej daty liczy się okres przechowywania zamkniętych zapytań.',
      },
    },
    {
      name: 'line',
      label: 'Linia',
      type: 'select',
      required: true,
      index: true,
      options: [...LINES],
      access: locked,
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'type',
      label: 'Rodzaj',
      type: 'select',
      required: true,
      defaultValue: 'contact',
      index: true,
      options: selectOptions(INQUIRY_TYPE_LABELS),
      access: locked,
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'category',
      label: 'Kategoria',
      type: 'text',
      access: locked,
      admin: { readOnly: true },
    },
    {
      name: 'name',
      label: 'Imię i nazwisko',
      type: 'text',
      required: true,
      access: locked,
      admin: { readOnly: true },
    },
    { name: 'company', label: 'Firma', type: 'text', access: locked, admin: { readOnly: true } },
    { name: 'nip', label: 'NIP', type: 'text', access: locked, admin: { readOnly: true } },
    { name: 'email', label: 'E-mail', type: 'email', access: locked, admin: { readOnly: true } },
    { name: 'phone', label: 'Telefon', type: 'text', access: locked, admin: { readOnly: true } },
    {
      name: 'city',
      label: 'Miejscowość',
      type: 'text',
      access: locked,
      admin: { readOnly: true },
    },
    {
      // Required by the contact and „Zapytaj o X” forms (`lib/inquiry/schema`); optional
      // notes on the inquiry list.
      name: 'message',
      label: 'Wiadomość',
      type: 'textarea',
      access: locked,
      admin: { readOnly: true },
    },
    {
      name: 'auditUrl',
      label: 'Adres strony',
      type: 'text',
      access: locked,
      admin: { readOnly: true, description: 'Strona do audytu albo obecna strona z kreatora.' },
    },
    {
      name: 'preferredContact',
      label: 'Preferowany kontakt',
      type: 'select',
      options: selectOptions(PREFERRED_CONTACT_LABELS),
      access: locked,
      admin: { readOnly: true },
    },
    {
      name: 'topics',
      label: 'Tematy',
      type: 'text',
      hasMany: true,
      access: locked,
      admin: { readOnly: true },
    },
    {
      name: 'deadline',
      label: 'Termin',
      type: 'text',
      access: locked,
      admin: { readOnly: true, description: 'Np. „Przed sezonem”.' },
    },
    {
      // Snapshot of the inquiry list (spec. §8.1) or „Twój projekt” (Software): the name stays
      // even if the product or solution changes.
      name: 'items',
      label: 'Pozycje',
      type: 'array',
      access: locked,
      admin: { readOnly: true },
      fields: [
        { name: 'product', label: 'Produkt', type: 'relationship', relationTo: 'products' },
        {
          name: 'solution',
          label: 'Rozwiązanie',
          type: 'relationship',
          relationTo: 'solutions',
        },
        { name: 'nameSnapshot', label: 'Nazwa', type: 'text', required: true },
        { name: 'quantity', label: 'Ilość', type: 'number', required: true, min: 1 },
        { name: 'note', label: 'Uwaga', type: 'textarea' },
      ],
    },
    {
      name: 'wizard',
      label: 'Odpowiedzi z kreatora',
      type: 'json',
      access: locked,
      admin: { readOnly: true },
    },
    {
      name: 'source',
      label: 'Źródło',
      type: 'group',
      access: locked,
      admin: { readOnly: true },
      fields: [
        { name: 'url', label: 'Adres strony', type: 'text', required: true },
        { name: 'utmSource', label: 'utm_source', type: 'text' },
        { name: 'utmMedium', label: 'utm_medium', type: 'text' },
        { name: 'utmCampaign', label: 'utm_campaign', type: 'text' },
      ],
    },
    {
      name: 'consent',
      label: 'Zgoda RODO',
      type: 'group',
      access: locked,
      admin: { readOnly: true },
      fields: [
        { name: 'accepted', label: 'Zaakceptowana', type: 'checkbox', required: true },
        { name: 'clauseVersion', label: 'Wersja klauzuli', type: 'text', required: true },
        {
          name: 'acceptedAt',
          label: 'Data zgody',
          type: 'date',
          required: true,
          admin: { date: { pickerAppearance: 'dayAndTime' } },
        },
      ],
    },
    {
      name: 'marketingConsent',
      label: 'Zgoda marketingowa',
      type: 'checkbox',
      defaultValue: false,
      access: locked,
      admin: { readOnly: true },
    },
  ],
}
