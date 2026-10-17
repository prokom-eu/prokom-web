import { z } from 'zod'

import { isValidNip, normalizeNip } from '../site/company'
import { CONSENT_CLAUSE } from './consent'

// Empty form fields arrive as "" — treat them as missing, like an untouched optional field.
function optionalText(max: number) {
  return z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().max(max).optional(),
  )
}

const requiredText = (max: number) => z.string().trim().min(1).max(max)

/**
 * What a form may send (ADR-003, 1:1 with the future `Inquiry` model in PRO-KOM System).
 * `tenant`, `line`, `status` and dates are set by the server, so unknown keys are dropped.
 */
export const inquiryInputSchema = z
  .object({
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
    message: requiredText(5000),
    consent: z.object({
      accepted: z.literal(true),
      clauseVersion: z.literal(CONSENT_CLAUSE.version),
    }),
    marketingConsent: z.boolean().default(false),
  })
  .refine((data) => data.email !== undefined || data.phone !== undefined, {
    message: 'e-mail or phone required',
    path: ['email'],
  })

export type InquiryInput = z.infer<typeof inquiryInputSchema>

export function parseInquiryInput(input: unknown) {
  return inquiryInputSchema.safeParse(input)
}

/** Paths of the invalid fields (e.g. `consent.clauseVersion`) — never the submitted values. */
export function inquiryFieldErrors(error: z.ZodError): string[] {
  return [...new Set(error.issues.map((issue) => issue.path.join('.')))]
}
