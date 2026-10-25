import { z } from 'zod'

import { PASSWORD_MIN_LENGTH } from '../lib/auth/password'

/** Hard stop: the seed creates a known admin account and must never touch production data. */
export function assertSeedAllowed(nodeEnv: string | undefined): void {
  if (nodeEnv === 'production') {
    throw new Error('Seed is disabled in production (NODE_ENV=production).')
  }
}

/**
 * The seed writes outside a Next.js request, where no cache can be revalidated; hooks see this
 * flag and skip it (the caches expire on their own, `lib/catalog/data`). Every line's import.
 */
export const SEED_CONTEXT = { seed: true } as const

const seedEnvSchema = z.object({
  SEED_ADMIN_EMAIL: z.email(),
  SEED_ADMIN_PASSWORD: z.string().min(PASSWORD_MIN_LENGTH),
})

export type SeedConfig = { adminEmail: string; adminPassword: string }

/** Local admin credentials for the seed. Errors list variable names only, never values. */
export function parseSeedEnv(source: Record<string, string | undefined>): SeedConfig {
  const result = seedEnvSchema.safeParse(source)
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.code}`)
      .join('\n')
    throw new Error(`Invalid seed variables (see .env.example):\n${problems}`)
  }
  return {
    adminEmail: result.data.SEED_ADMIN_EMAIL,
    adminPassword: result.data.SEED_ADMIN_PASSWORD,
  }
}

/**
 * `SEED_GALLERY_LIMIT`: at most this many katalog v2 gallery photos per product (CI sets 2 —
 * every photo is resized three times, which is most of the seed's time). Unset = whole gallery.
 */
export function parseGalleryLimit(value: string | undefined): number | null {
  if (value === undefined || value === '') return null
  if (!/^[1-9]\d*$/.test(value)) {
    throw new Error(
      'Invalid seed variable SEED_GALLERY_LIMIT: a whole number from 1 (see .env.example).',
    )
  }
  return Number(value)
}
