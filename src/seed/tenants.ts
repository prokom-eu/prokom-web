import type { Tenant } from '../payload-types'

type SeedTenant = Pick<Tenant, 'name' | 'slug' | 'line'> & { localHost: string }

/**
 * Inquiry notifications of a local site. Fake on purpose: locally every mail lands in Mailpit;
 * the real line inboxes (`biznes@pro-kom.eu`, ADR-003) are set in the panel per environment.
 */
export function seedNotificationEmail(slug: string): string {
  return `${slug}@example.test`
}

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
