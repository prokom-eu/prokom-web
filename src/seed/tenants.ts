import type { Tenant } from '../payload-types'

type SeedTenant = Pick<Tenant, 'name' | 'slug' | 'line'> & { localHost: string }

/** Local sites; production and staging domains are added in the panel, not by the seed. */
export const SEED_TENANTS: readonly SeedTenant[] = [
  { name: 'PRO-KOM Biznes', slug: 'biznes', line: 'biznes', localHost: 'biznes.localhost' },
  {
    name: 'PRO-KOM Instalacje',
    slug: 'instalacje',
    line: 'instalacje',
    localHost: 'instalacje.localhost',
  },
  { name: 'PRO-KOM Software', slug: 'software', line: 'software', localHost: 'software.localhost' },
]
