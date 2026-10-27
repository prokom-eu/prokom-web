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
import * as migration_20261023_224942_biznes_home_facts from './20261023_224942_biznes_home_facts'
import * as migration_20261024_102614_inquiries_b8 from './20261024_102614_inquiries_b8'
import * as migration_20261024_125547_biznes_contact from './20261024_125547_biznes_contact'
import * as migration_20261024_141819_biznes_opieka_it from './20261024_141819_biznes_opieka_it'
import * as migration_20261024_152505_biznes_gopos from './20261024_152505_biznes_gopos'
import * as migration_20261024_160632_biznes_insert from './20261024_160632_biznes_insert'
import * as migration_20261024_165155_biznes_category from './20261024_165155_biznes_category'
import * as migration_20261024_180841_biznes_industries from './20261024_180841_biznes_industries'
import * as migration_20261025_082957_biznes_news from './20261025_082957_biznes_news'
import * as migration_20261025_095823_biznes_about from './20261025_095823_biznes_about'
import * as migration_20261025_195545_software_collections from './20261025_195545_software_collections'
import * as migration_20261025_205234_software_settings from './20261025_205234_software_settings'
import * as migration_20261025_220015_software_icons from './20261025_220015_software_icons'
import * as migration_20261026_202214_k3_model from './20261026_202214_k3_model'
import * as migration_20261026_223643_k31_catalog from './20261026_223643_k31_catalog'
import * as migration_20261027_205737_solutions_price_monthly from './20261027_205737_solutions_price_monthly'

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
  {
    up: migration_20261023_224942_biznes_home_facts.up,
    down: migration_20261023_224942_biznes_home_facts.down,
    name: '20261023_224942_biznes_home_facts',
  },
  {
    up: migration_20261024_102614_inquiries_b8.up,
    down: migration_20261024_102614_inquiries_b8.down,
    name: '20261024_102614_inquiries_b8',
  },
  {
    up: migration_20261024_125547_biznes_contact.up,
    down: migration_20261024_125547_biznes_contact.down,
    name: '20261024_125547_biznes_contact',
  },
  {
    up: migration_20261024_141819_biznes_opieka_it.up,
    down: migration_20261024_141819_biznes_opieka_it.down,
    name: '20261024_141819_biznes_opieka_it',
  },
  {
    up: migration_20261024_152505_biznes_gopos.up,
    down: migration_20261024_152505_biznes_gopos.down,
    name: '20261024_152505_biznes_gopos',
  },
  {
    up: migration_20261024_160632_biznes_insert.up,
    down: migration_20261024_160632_biznes_insert.down,
    name: '20261024_160632_biznes_insert',
  },
  {
    up: migration_20261024_165155_biznes_category.up,
    down: migration_20261024_165155_biznes_category.down,
    name: '20261024_165155_biznes_category',
  },
  {
    up: migration_20261024_180841_biznes_industries.up,
    down: migration_20261024_180841_biznes_industries.down,
    name: '20261024_180841_biznes_industries',
  },
  {
    up: migration_20261025_082957_biznes_news.up,
    down: migration_20261025_082957_biznes_news.down,
    name: '20261025_082957_biznes_news',
  },
  {
    up: migration_20261025_095823_biznes_about.up,
    down: migration_20261025_095823_biznes_about.down,
    name: '20261025_095823_biznes_about',
  },
  {
    up: migration_20261025_195545_software_collections.up,
    down: migration_20261025_195545_software_collections.down,
    name: '20261025_195545_software_collections',
  },
  {
    up: migration_20261025_205234_software_settings.up,
    down: migration_20261025_205234_software_settings.down,
    name: '20261025_205234_software_settings',
  },
  {
    up: migration_20261025_220015_software_icons.up,
    down: migration_20261025_220015_software_icons.down,
    name: '20261025_220015_software_icons',
  },
  {
    up: migration_20261026_202214_k3_model.up,
    down: migration_20261026_202214_k3_model.down,
    name: '20261026_202214_k3_model',
  },
  {
    up: migration_20261026_223643_k31_catalog.up,
    down: migration_20261026_223643_k31_catalog.down,
    name: '20261026_223643_k31_catalog',
  },
  {
    up: migration_20261027_205737_solutions_price_monthly.up,
    down: migration_20261027_205737_solutions_price_monthly.down,
    name: '20261027_205737_solutions_price_monthly',
  },
]
