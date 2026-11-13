import { getPostList } from '../posts/data'
import { getCompanyData, getSiteSettings } from '../site/data'
import { getInstalacjeObjectList, getInstalacjeOffer } from './data'
import { llmsTxt } from './llms'
import { objectHref } from './menu'

/**
 * `llms.txt` of the Instalacje site (SEO §2.4), built from the panel (services, objects, guide
 * posts, contact). Called by the shared `/llms.txt` route for an Instalacje tenant.
 */
export async function instalacjeLlmsTxt(
  tenant: { id: number; name: string },
  origin: string,
): Promise<string> {
  const [offer, objects, site, company, posts] = await Promise.all([
    getInstalacjeOffer(tenant.id),
    getInstalacjeObjectList(tenant.id),
    getSiteSettings(tenant.id),
    getCompanyData(),
    getPostList(tenant.id, 'instalacje'),
  ])
  const office = company?.locations?.[0]
  return llmsTxt({
    origin,
    name: tenant.name,
    phone: site?.phone ?? null,
    email: site?.email ?? null,
    address: office ? `${office.street}, ${office.postalCode} ${office.city}` : null,
    services: offer.map((s) => ({ name: s.name, href: s.href, description: s.description })),
    objects: objects.map((o) => ({ name: o.name, href: objectHref(o.slug) })),
    posts: posts.map((p) => ({ title: p.title, href: p.href })),
  })
}
