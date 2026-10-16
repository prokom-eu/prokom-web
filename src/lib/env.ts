import { z } from 'zod'

import { normalizeHost } from './tenant/host'

const envSchema = z.object({
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
