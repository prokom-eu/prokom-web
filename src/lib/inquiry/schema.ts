import { z } from 'zod'

import { MAX_ITEMS, MAX_NOTE, MAX_QTY } from '../cart/cart'
import { isValidNip, normalizeNip } from '../site/company'
import type { Line } from '../tenant/lines'
import { CONSENT_CLAUSE } from './consent'
import { INQUIRY_TYPES, PREFERRED_CONTACTS } from './types'

// Characters of the serialized answers (UTF-16), well under the route's body limit.
const MAX_WIZARD_CHARS = 8 * 1024

// Empty form fields arrive as "" — treat them as missing, like an untouched optional field.
function optionalText(max: number) {
  return z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().max(max).optional(),
  )
}

const requiredText = (max: number) => z.string().trim().min(1).max(max)

/** One position of the inquiry list (`pk-cart`); the name comes from the database, not here. */
const itemSchema = z.object({
  slug: z
    .string()
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  quantity: z.number().int().min(1).max(MAX_QTY),
  note: optionalText(MAX_NOTE),
})

/**
 * What a form may send (ADR-003, 1:1 with the future `Inquiry` model in PRO-KOM System).
 * `tenant`, `line`, `status` and dates are set by the server, so unknown keys are dropped.
 */
const baseSchema = z.object({
  type: z.enum(INQUIRY_TYPES).default('contact'),
  category: optionalText(100),
  source: z.object({
    url: z.url({ protocol: /^https?$/ }).max(2000),
    utmSource: optionalText(200),
    utmMedium: optionalText(200),
    utmCampaign: optionalText(200),
  }),
  company: optionalText(200),
  nip: optionalText(20)
    .refine((value) => value === undefined || isValidNip(value), 'invalid NIP')
    .transform((value) => (value === undefined ? undefined : normalizeNip(value))),
  name: requiredText(120),
  email: optionalText(254).pipe(z.email().optional()),
  phone: optionalText(30).refine(
    (value) => value === undefined || /^\+?[\d\s()-]{6,}$/.test(value),
    'invalid phone',
  ),
  city: optionalText(100),
  message: optionalText(5000),
  preferredContact: z.enum(PREFERRED_CONTACTS).optional(),
  deadline: optionalText(100),
  topics: z.array(requiredText(100)).max(10).default([]),
  items: z
    .array(itemSchema)
    .max(MAX_ITEMS)
    .default([])
    .refine((items) => new Set(items.map((item) => item.slug)).size === items.length, {
      message: 'duplicate items',
    }),
  wizard: z
    .record(z.string(), z.unknown())
    .refine((answers) => JSON.stringify(answers).length <= MAX_WIZARD_CHARS, 'wizard too large')
    .optional(),
  consent: z.object({
    accepted: z.literal(true),
    clauseVersion: z.literal(CONSENT_CLAUSE.version),
  }),
  marketingConsent: z.boolean().default(false),
})

/** Rules that depend on the type, and on the line for the Biznes forms (v20). */
function inquirySchemaFor(line: Line | undefined) {
  return baseSchema.superRefine((data, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message })

    // The phrase of „Zapytaj o X” and the list items say what is needed; a contact must.
    if (data.type === 'contact' && data.message === undefined) issue('message', 'message required')
    if (data.type === 'list' && data.items.length === 0) issue('items', 'items required')
    // Items belong to the list only; elsewhere they would be saved without anyone asking.
    if (data.type !== 'list' && data.items.length > 0) issue('items', 'items only on a list')
    if (data.type === 'search' && data.topics.length === 0) issue('topics', 'phrase required')
    if (data.type === 'wizard' && data.wizard === undefined) issue('wizard', 'answers required')
    // Wizard answers belong to the wizard only, like items to the list (B10c).
    if (data.type !== 'wizard' && data.wizard !== undefined)
      issue('wizard', 'answers only in the wizard')

    // „Jak się skontaktować? E-mail” needs an address to write to.
    if (data.preferredContact === 'email' && data.email === undefined) {
      issue('email', 'e-mail required for e-mail contact')
    }

    // Biznes calls back (ZMIANY-v20 §2.9, plansze Zapytanie i Kreator): every form requires
    // a phone, the wizard too (B10c).
    const phoneRequired = line === 'biznes'
    if (phoneRequired) {
      if (data.phone === undefined) issue('phone', 'phone required')
    } else if (data.email === undefined && data.phone === undefined) {
      issue('email', 'e-mail or phone required')
    }
  })
}

export type InquiryInput = z.infer<typeof baseSchema>

/** Validates a form body; `line` (from the tenant, never the body) selects the line's rules. */
export function parseInquiryInput(input: unknown, line?: Line) {
  return inquirySchemaFor(line).safeParse(input)
}

/** Paths of the invalid fields (e.g. `consent.clauseVersion`) — never the submitted values. */
export function inquiryFieldErrors(error: z.ZodError): string[] {
  return [...new Set(error.issues.map((issue) => issue.path.join('.')))]
}
