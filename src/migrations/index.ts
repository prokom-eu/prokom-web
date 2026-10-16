import * as migration_20261015_203404_initial from './20261015_203404_initial'
import * as migration_20261016_200110_tenants from './20261016_200110_tenants'
import * as migration_20261016_205432_company_data_site_settings from './20261016_205432_company_data_site_settings'

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
]
