import { getPostList } from '../posts/data'
import { getCompanyData, getSiteSettings } from '../site/data'
import type { SiteTenant } from '../tenant/byHost'
import { getInstalacjeObjectList, getInstalacjeOffer } from './data'
import { llmsTxt } from './llms'
import { objectHref } from './menu'

/**
 * `llms.txt` body of the Instalacje site (SEO §2.4): services, objects and guide posts from the
 * panel. The route `[domain]/llms.txt` is shared with Biznes (two routes of one address in two
 * groups would clash); the Instalacje content stays here, in the line's own folder.
 */
export async function instalacjeLlmsBody(tenant: SiteTenant, origin: string): Promise<string> {
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
