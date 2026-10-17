import { postgresAdapter } from '@payloadcms/db-postgres'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Partners } from './collections/Partners'
import { Redirects } from './collections/Redirects'
import { SiteSettings } from './collections/SiteSettings'
import { Tenants } from './collections/Tenants'
import { Users } from './collections/Users'
import { CompanyData } from './globals/CompanyData'
import { adminOnlyField, isAdmin } from './lib/auth/access'
import { getEnv } from './lib/env'
import type { Config } from './payload-types'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const env = getEnv()

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  // New collections go after `Pages`: inserting earlier renumbers Payload's index names (S5).
  collections: [Users, Tenants, SiteSettings, Pages, Media, Partners, Redirects],
  globals: [CompanyData],
  editor: lexicalEditor(),
  jobs: {
    // Runs scheduled publishes (`Pages` → "Zaplanuj publikację") inside the app process, every
    // minute. Fine for our long-running container; not for serverless (Payload docs).
    autoRun: [{ cron: '* * * * *', queue: 'default' }],
  },
  secret: env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    // ADR-009: schema changes only through versioned migrations, never dev `push`.
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
    pool: {
      connectionString: env.DATABASE_URL,
    },
  }),
  sharp,
  plugins: [
    multiTenantPlugin<Config>({
      // `partners` is shared on purpose (its own `tenants` field), so it is not listed here.
      collections: {
        pages: {},
        media: {},
        redirects: {},
        // One settings document per tenant (unique tenant field).
        'site-settings': { isGlobal: true },
      },
      // Deleting a tenant must never silently delete its content.
      cleanupAfterTenantDelete: false,
      userHasAccessToAllTenants: (user) => isAdmin(user),
      tenantsArrayField: {
        includeDefaultField: true,
        // Editors must not assign themselves more tenants.
        arrayFieldAccess: { create: adminOnlyField, update: adminOnlyField },
      },
    }),
  ],
})
