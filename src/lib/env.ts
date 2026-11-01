import { z } from 'zod'

import { normalizeHost } from './tenant/host'
import { isLine, type Line } from './tenant/lines'

/**
 * `UMAMI_WEBSITES` (ADR-020): `<line>=<website id>,…` — which Umami website counts the pages of
 * a line. Empty or unset = no line is counted.
 */
const umamiWebsites = z
  .string()
  .default('')
  .transform((value, ctx) => {
    const websites: Partial<Record<Line, string>> = {}
    for (const entry of value.split(',').map((part) => part.trim())) {
      if (!entry) continue
      const [line, id, ...rest] = entry.split('=').map((part) => part.trim())
      if (!line || !isLine(line) || !id || rest.length > 0 || !z.uuid().safeParse(id).success) {
        ctx.addIssue({ code: 'custom', message: 'expected <line>=<uuid>, e.g. software=<uuid>' })
        return z.NEVER
      }
      if (websites[line]) {
        ctx.addIssue({ code: 'custom', message: `line ${line} is listed twice` })
        return z.NEVER
      }
      websites[line] = id
    }
    return websites
  })

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
    PAYLOAD_SECRET: z.string().min(32),
    // Domain of the admin panel; `/admin` and the Payload API answer only there (ADR-006).
    PANEL_HOST: z.string().transform((value, ctx) => {
      const host = normalizeHost(value)
      if (!host) {
        ctx.addIssue({ code: 'custom', message: 'expected a bare hostname, e.g. panel.localhost' })
        return z.NEVER
      }
      return host
    }),
    // Directory for uploaded files (relative to the app's working directory or absolute);
    // a Docker volume on the server (S9). Each upload collection has a subfolder.
    MEDIA_DIR: z.string().min(1).default('media'),
    // Which deployment this is: staging is never indexed (noindex, robots `Disallow: /`);
    // `local` serves http:// addresses, the others https:// (canonical, sitemap).
    SITE_ENV: z.enum(['production', 'staging', 'local']).default('local'),
    // Outgoing mail (inquiry notifications, ADR-003). Locally Mailpit from docker/compose.dev.yml.
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number().int().min(1).max(65535),
    // `true` = TLS from the first byte (port 465); `false` = STARTTLS when the server offers it.
    SMTP_SECURE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
    SMTP_USER: z.string().min(1).optional(),
    SMTP_PASS: z.string().min(1).optional(),
    // Sender of every mail: an address in a domain with SPF/DKIM/DMARC (docs/dns.md). Never
    // hard-coded, so moving the mail provider changes no code.
    MAIL_FROM_ADDRESS: z.email(),
    MAIL_FROM_NAME: z.string().min(1).default('PRO-KOM'),
    // Closed inquiries are deleted this many months after their last status change (ADR-003).
    INQUIRY_RETENTION_MONTHS: z.coerce.number().int().min(1).default(24),
    // Cookieless statistics (ADR-020): the Umami container's address as the app reaches it
    // (e.g. http://umami:3000) — `proxy.ts` forwards `/_s/*` there. Origin only, no path.
    // Unset = no analytics script and `/_s/*` answers 404.
    UMAMI_URL: z
      .url({ protocol: /^https?$/ })
      .transform((value) => value.replace(/\/+$/, ''))
      .refine((value) => new URL(value).pathname === '/', 'expected an origin without a path')
      .optional(),
    UMAMI_WEBSITES: umamiWebsites,
    // Server error reports (ADR-021): Sentry project DSN, EU region. Unset = no reporting.
    SENTRY_DSN: z
      .url({ protocol: /^https$/ })
      .optional()
      .or(z.literal('').transform(() => undefined)),
  })
  // SMTP login is both or neither: a half-set pair would fail only at the first e-mail.
  .refine((env) => Boolean(env.SMTP_USER) === Boolean(env.SMTP_PASS), {
    message: 'set both SMTP_USER and SMTP_PASS, or neither',
    path: ['SMTP_PASS'],
  })

export type Env = z.infer<typeof envSchema>

/**
 * Validates environment variables. The error lists variable names and reasons only,
 * never values, so secrets do not leak into logs.
 */
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source)
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n')
    throw new Error(`Invalid environment variables (see .env.example):\n${problems}`)
  }
  return result.data
}

let cached: Env | undefined

/** Validated `process.env`; throws on first use when something is missing or invalid. */
export function getEnv(): Env {
  cached ??= parseEnv(process.env)
  return cached
}
