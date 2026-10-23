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
import * as migration_20261018_111136_biznes_settings_inquiries from './20261018_111136_biznes_settings_inquiries'
import * as migration_20261018_155714_biznes_navigation from './20261018_155714_biznes_navigation'
import * as migration_20261018_171850_biznes_footer from './20261018_171850_biznes_footer'
import * as migration_20261021_185642_biznes_navigation_without_industries from './20261021_185642_biznes_navigation_without_industries'
import * as migration_20261022_183911_katalog_v2 from './20261022_183911_katalog_v2'
import * as migration_20261022_183948_katalog_v2_legacy_ids from './20261022_183948_katalog_v2_legacy_ids'
import * as migration_20261023_185812_biznes_home_hero from './20261023_185812_biznes_home_hero'
import * as migration_20261023_210238_biznes_home_offer from './20261023_210238_biznes_home_offer'
import * as migration_20261023_213656_biznes_home_plan from './20261023_213656_biznes_home_plan'

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
  {
    up: migration_20261018_111136_biznes_settings_inquiries.up,
    down: migration_20261018_111136_biznes_settings_inquiries.down,
    name: '20261018_111136_biznes_settings_inquiries',
  },
  {
    up: migration_20261018_155714_biznes_navigation.up,
    down: migration_20261018_155714_biznes_navigation.down,
    name: '20261018_155714_biznes_navigation',
  },
  {
    up: migration_20261018_171850_biznes_footer.up,
    down: migration_20261018_171850_biznes_footer.down,
    name: '20261018_171850_biznes_footer',
  },
  {
    up: migration_20261021_185642_biznes_navigation_without_industries.up,
    down: migration_20261021_185642_biznes_navigation_without_industries.down,
    name: '20261021_185642_biznes_navigation_without_industries',
  },
  {
    up: migration_20261022_183911_katalog_v2.up,
    down: migration_20261022_183911_katalog_v2.down,
    name: '20261022_183911_katalog_v2',
  },
  {
    up: migration_20261022_183948_katalog_v2_legacy_ids.up,
    down: migration_20261022_183948_katalog_v2_legacy_ids.down,
    name: '20261022_183948_katalog_v2_legacy_ids',
  },
  {
    up: migration_20261023_185812_biznes_home_hero.up,
    down: migration_20261023_185812_biznes_home_hero.down,
    name: '20261023_185812_biznes_home_hero',
  },
  {
    up: migration_20261023_210238_biznes_home_offer.up,
    down: migration_20261023_210238_biznes_home_offer.down,
    name: '20261023_210238_biznes_home_offer',
  },
  {
    up: migration_20261023_213656_biznes_home_plan.up,
    down: migration_20261023_213656_biznes_home_plan.down,
    name: '20261023_213656_biznes_home_plan',
  },
]
