import { postgresAdapter } from '@payloadcms/db-postgres'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Tenants } from './collections/Tenants'
import { Users } from './collections/Users'
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
  collections: [Users, Tenants],
  editor: lexicalEditor(),
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
      // Tenant-scoped collections arrive with S4/S5 (SiteSettings, Pages, Media, …).
      collections: {},
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
