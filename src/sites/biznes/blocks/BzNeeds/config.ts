import type { Block } from 'payload'

export const NEED_TONES = [
  { label: 'Zielony', value: 'green' },
  { label: 'Czerwony', value: 'red' },
  { label: 'Niebieski', value: 'blue' },
  { label: 'Fioletowy', value: 'violet' },
] as const

/**
 * Place of „Szybki start” on the Biznes home page (K36 §11): the five tiles come from the
 * catalog and the site settings (`QuickStart`), the block only marks where they go.
 */
export const BzNeedsBlock: Block = {
  slug: 'bzNeeds',
  interfaceName: 'BzNeedsBlock',
  labels: { singular: 'Biznes: szybki start', plural: 'Biznes: szybki start' },
  fields: [],
}
