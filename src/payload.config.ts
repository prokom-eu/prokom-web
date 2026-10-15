import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users'
import { getEnv } from './lib/env'

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
  collections: [Users],
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
  plugins: [],
})
