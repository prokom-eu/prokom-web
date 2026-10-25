import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { BiznesSettings } from './collections/BiznesSettings'
import { CatalogCategories } from './collections/CatalogCategories'
import { CatalogGroups } from './collections/CatalogGroups'
import { Cities } from './collections/Cities'
import { Industries } from './collections/Industries'
import { Inquiries } from './collections/Inquiries'
import { InquiryDeletions } from './collections/InquiryDeletions'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Partners } from './collections/Partners'
import { Posts } from './collections/Posts'
import { Products } from './collections/Products'
import { Redirects } from './collections/Redirects'
import { SiteSettings } from './collections/SiteSettings'
import { SoftwareSettings } from './collections/SoftwareSettings'
import { SolutionAreas } from './collections/SolutionAreas'
import { Solutions } from './collections/Solutions'
import { Tenants } from './collections/Tenants'
import { Users } from './collections/Users'
import { CompanyData } from './globals/CompanyData'
import { adminOnlyField, isAdmin } from './lib/auth/access'
import { getEnv } from './lib/env'
import { inquiryRetentionTask } from './lib/inquiry/retention'
import { migrations } from './migrations'
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
  // New collections go at the end: Payload names compound indexes after their columns only
  // (`tenant_slug_idx`, then `tenant_slug_1_idx`, …), so inserting earlier renumbers them (S5).
  collections: [
    Users,
    Tenants,
    SiteSettings,
    Pages,
    Media,
    Partners,
    Redirects,
    Inquiries,
    InquiryDeletions,
    // Biznes catalog (ADR-012).
    CatalogGroups,
    CatalogCategories,
    Industries,
    Products,
    Posts,
    BiznesSettings,
    // Software (ADR-014).
    Solutions,
    SolutionAreas,
    Cities,
    SoftwareSettings,
  ],
  globals: [CompanyData],
  editor: lexicalEditor(),
  // SMTP from env (ADR-003); locally Mailpit. Transport options are always given, so the adapter
  // never falls back to its ethereal.email test account. No verify at start: `build` must not
  // need a mail server; a broken SMTP shows up in the logs of the first send.
  email: nodemailerAdapter({
    defaultFromAddress: env.MAIL_FROM_ADDRESS,
    defaultFromName: env.MAIL_FROM_NAME,
    skipVerify: true,
    transportOptions: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      // The form waits for the e-mails; a hung SMTP server must not hold it until the proxy
      // times out (the customer would resend, the record is already saved). Defaults: up to 10 min.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
      ...(env.SMTP_USER ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASS } } : {}),
    },
  }),
  jobs: {
    // Runs scheduled publishes (`Pages` → "Zaplanuj publikację") inside the app process, every
    // minute. Fine for our long-running container; not for serverless (Payload docs).
    // The same runner schedules tasks with a `schedule` in this queue (inquiry retention, daily).
    autoRun: [{ cron: '* * * * *', queue: 'default' }],
    tasks: [inquiryRetentionTask],
  },
  secret: env.PAYLOAD_SECRET,
  // Production: Payload's own lines (migrations, jobs, errors) in the same JSON shape as
  // `lib/log` (`level` as text, ISO `time`, `msg`); locally the readable default stays.
  ...(env.NODE_ENV === 'production' && {
    logger: {
      options: {
        level: 'info',
        base: null,
        messageKey: 'msg',
        timestamp: () => `,"time":"${new Date().toISOString()}"`,
        formatters: { level: (label: string) => ({ level: label }) },
      },
    },
  }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    // ADR-009: schema changes only through versioned migrations, never dev `push`.
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
    // Production runs pending migrations itself when Payload starts (ADR-004, S9): the standalone
    // image has no Payload CLI. Locally and in CI: `pnpm payload migrate`.
    prodMigrations: migrations,
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
        // ADR-003: only `status` changes in the panel; moving an inquiry to another site would
        // also leave its `line` behind.
        inquiries: { tenantFieldOverrides: { access: { update: () => false } } },
        // One settings document per tenant (unique tenant field).
        'site-settings': { isGlobal: true },
        'catalog-groups': {},
        'catalog-categories': {},
        industries: {},
        products: {},
        posts: {},
        // One document per tenant, Biznes only (`BiznesSettings` hook).
        'biznes-settings': { isGlobal: true },
        solutions: {},
        'solution-areas': {},
        cities: {},
        // One document per tenant, Software only (`SoftwareSettings` hook).
        'software-settings': { isGlobal: true },
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
