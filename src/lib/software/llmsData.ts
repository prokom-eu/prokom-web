import { getCompanyData, getSiteSettings } from '../site/data'
import { cityHref } from './cities'
import { getCityList, getIndustryPageList, getSolutionsIndex } from './data'
import { industryPageHref } from './industryPage'
import { softwareLlmsTxt } from './llms'

/**
 * `llms.txt` of the Software site (SEO etap 1), built from the panel: solutions with their prices
 * and terms as the site shows them, industries, towns, contact. Called by the shared `/llms.txt`.
 */
export async function softwareLlmsData(
  tenant: { id: number; name: string },
  origin: string,
): Promise<string> {
  const [index, industries, cities, site, company] = await Promise.all([
    getSolutionsIndex(tenant.id),
    getIndustryPageList(tenant.id),
    getCityList(tenant.id),
    getSiteSettings(tenant.id),
    getCompanyData(),
  ])
  // Software works only from Rabka: the first location (as its `ProfessionalService`).
  const office = company?.locations?.[0]
  return softwareLlmsTxt({
    origin,
    name: tenant.name,
    phone: site?.phone ?? company?.phones?.[0]?.number ?? null,
    email: site?.email ?? company?.email ?? null,
    address: office ? `${office.street}, ${office.postalCode} ${office.city}` : null,
    solutions: index.solutions,
    priceDisplay: index.priceDisplay,
    industries: industries.map((i) => ({ name: i.name, href: industryPageHref(i.slug) })),
    cities: cities.map((c) => ({ name: c.name, href: cityHref(c.slug) })),
  })
}
