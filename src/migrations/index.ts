import * as migration_20261015_203404_initial from './20261015_203404_initial'
import * as migration_20261016_200110_tenants from './20261016_200110_tenants'
import * as migration_20261016_205432_company_data_site_settings from './20261016_205432_company_data_site_settings'
import * as migration_20261016_222257_pages from './20261016_222257_pages'
import * as migration_20261017_115056_media_partners from './20261017_115056_media_partners'
import * as migration_20261017_130141_redirects from './20261017_130141_redirects'
import * as migration_20261017_144826_inquiries from './20261017_144826_inquiries'
import * as migration_20261017_145754_inquiry_retention_job from './20261017_145754_inquiry_retention_job'
import * as migration_20261017_165255_inquiry_form_block from './20261017_165255_inquiry_form_block'
import * as migration_20261018_100954_biznes_catalog from './20261018_100954_biznes_catalog'

export const migrations = [
  {
    up: migration_20261015_203404_initial.up,
    down: migration_20261015_203404_initial.down,
    name: '20261015_203404_initial',
  },
  {
    up: migration_20261016_200110_tenants.up,
    down: migration_20261016_200110_tenants.down,
    name: '20261016_200110_tenants',
  },
  {
    up: migration_20261016_205432_company_data_site_settings.up,
    down: migration_20261016_205432_company_data_site_settings.down,
    name: '20261016_205432_company_data_site_settings',
  },
  {
    up: migration_20261016_222257_pages.up,
    down: migration_20261016_222257_pages.down,
    name: '20261016_222257_pages',
  },
  {
    up: migration_20261017_115056_media_partners.up,
    down: migration_20261017_115056_media_partners.down,
    name: '20261017_115056_media_partners',
  },
  {
    up: migration_20261017_130141_redirects.up,
    down: migration_20261017_130141_redirects.down,
    name: '20261017_130141_redirects',
  },
  {
    up: migration_20261017_144826_inquiries.up,
    down: migration_20261017_144826_inquiries.down,
    name: '20261017_144826_inquiries',
  },
  {
    up: migration_20261017_145754_inquiry_retention_job.up,
    down: migration_20261017_145754_inquiry_retention_job.down,
    name: '20261017_145754_inquiry_retention_job',
  },
  {
    up: migration_20261017_165255_inquiry_form_block.up,
    down: migration_20261017_165255_inquiry_form_block.down,
    name: '20261017_165255_inquiry_form_block',
  },
  {
    up: migration_20261018_100954_biznes_catalog.up,
    down: migration_20261018_100954_biznes_catalog.down,
    name: '20261018_100954_biznes_catalog',
  },
]
