import {
  BlockquoteFeature,
  BoldFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  lexicalEditor,
  OrderedListFeature,
  ParagraphFeature,
  StrikethroughFeature,
  UnderlineFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'
import type { Block, FieldAffectingData, TextFieldSingleValidation } from 'payload'

import { isValidNavHref } from '../../lib/site/link'

/** Same link rules as navigation: paths, https, mailto:, tel: — never `javascript:` etc. */
export function validateRichTextUrl(value: unknown, siblingData: { linkType?: unknown }) {
  if (siblingData.linkType === 'internal') return true
  return typeof value === 'string' && isValidNavHref(value)
    ? true
    : 'Ścieżka (/kontakt), adres https://, mailto: albo tel:.'
}

const validateUrl: TextFieldSingleValidation = (value, { siblingData }) =>
  validateRichTextUrl(value, siblingData as { linkType?: unknown })

const withUrlValidation = (field: FieldAffectingData): FieldAffectingData =>
  field.type === 'text' && field.name === 'url' && !field.hasMany
    ? { ...field, validate: validateUrl }
    : field

/**
 * Only what the site renders. Left out on purpose: uploads and relationships (no `Media`
 * until S7, and they could embed any collection), internal links (they need `internalDocToHref`,
 * otherwise they render as `#`), checklists, code, alignment and indents (look comes from
 * the brand, S6). Headings from h2: the page's h1 is the hero or the page title.
 */
export const RichTextBlock: Block = {
  slug: 'richText',
  interfaceName: 'RichTextBlock',
  labels: { singular: 'Tekst', plural: 'Teksty' },
  fields: [
    {
      name: 'content',
      label: 'Treść',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: [
          ParagraphFeature(),
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          BoldFeature(),
          ItalicFeature(),
          UnderlineFeature(),
          StrikethroughFeature(),
          UnorderedListFeature(),
          OrderedListFeature(),
          BlockquoteFeature(),
          HorizontalRuleFeature(),
          LinkFeature({
            enabledCollections: [],
            fields: ({ defaultFields }) => defaultFields.map(withUrlValidation),
          }),
          InlineToolbarFeature(),
        ],
      }),
    },
  ],
}
