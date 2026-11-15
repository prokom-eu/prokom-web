import { getCatalogIndex } from '../catalog/data'
import { getPartnerStatuses } from '../partners/data'
import { brandLinks } from '../seo/siteLinks'
import { getCompanyData, getSiteSettings } from '../site/data'
import { hoursSummary } from '../site/hoursSummary'
import type { SiteTenant } from '../tenant/byHost'
import { biznesLlmsTxt } from './llms'

/**
 * `llms.txt` body of the Biznes site (SEO lokalne 13.11). Statuses come from the partners of the
 * panel (as the footer: a brand without a published product keeps its status), brand links as
 * on the site map (one per salon 2.0, then brand pages), departments and pages from the catalog.
 */
export async function biznesLlmsBody(tenant: SiteTenant, origin: string): Promise<string> {
  const [index, statuses, site, company] = await Promise.all([
    getCatalogIndex(tenant.id),
    getPartnerStatuses(tenant.id),
    getSiteSettings(tenant.id),
    getCompanyData(),
  ])
  const salon = company?.locations?.[0]
  return biznesLlmsTxt({
    origin,
    name: tenant.name,
    company: company?.name ?? tenant.name,
    phones: [site?.phone, site?.phone2].filter((phone): phone is string => Boolean(phone)),
    email: site?.email ?? null,
    address: salon ? `${salon.street}, ${salon.postalCode} ${salon.city}` : null,
    hours: salon?.hours.length ? [hoursSummary(salon.hours)] : [],
    areas: site?.biznes?.serviceAreas ?? [],
    statuses,
    brands: brandLinks(index.brands),
    groups: index.groups.map((group) => ({
      name: group.name,
      categories: index.categories.filter((category) => category.group === group.slug),
    })),
    industries: index.industries.filter((industry) => industry.active),
    pages: index.pages,
  })
}
