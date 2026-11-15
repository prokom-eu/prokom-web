import type { CollectionConfig } from 'payload'

import { adminOnly } from '../lib/auth/access'

/**
 * Trail of deleted inquiries (ADR-003): ID, who and when — no content, so the erased personal
 * data does not survive here. Written by the `Inquiries` delete hook only.
 */
export const InquiryDeletions: CollectionConfig = {
  slug: 'inquiry-deletions',
  labels: { singular: 'Usunięte zapytanie', plural: 'Usunięte zapytania' },
  admin: {
    useAsTitle: 'inquiryId',
    defaultColumns: ['createdAt', 'inquiryId', 'reason', 'deletedByEmail'],
    group: 'Zapytania',
  },
  defaultSort: '-createdAt',
  access: {
    read: adminOnly,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'inquiryId', label: 'ID zapytania', type: 'number', required: true },
    {
      name: 'reason',
      label: 'Powód',
      type: 'select',
      required: true,
      options: [
        { label: 'Na żądanie (panel)', value: 'request' },
        { label: 'Koniec okresu przechowywania', value: 'retention' },
      ],
    },
    { name: 'deletedBy', label: 'Usunął', type: 'relationship', relationTo: 'users' },
    // Kept when the user account is removed later.
    { name: 'deletedByEmail', label: 'E-mail usuwającego', type: 'email' },
  ],
}
