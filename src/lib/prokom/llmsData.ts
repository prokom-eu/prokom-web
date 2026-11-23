import { getSharedData } from '../shared/getSharedData'
import { hoursSummary } from '../site/hoursSummary'
import { getHubSettings } from './data'
import { getHubLineContacts, hubPhone } from './lineContacts'
import { hubLlmsTxt } from './llms'
import { hubMapPages } from './pages'

/**
 * `llms.txt` of the hub (SEO czaty AI 23.11), built from the panel: the company and its salon,
 * the lines with their sites and phones (as `/kontakt`), the built pages. Called by `/llms.txt`.
 */
export async function hubLlmsData(tenant: { id: number }, origin: string): Promise<string> {
  const [shared, contacts, settings] = await Promise.all([
    getSharedData(tenant.id),
    getHubLineContacts(tenant.id),
    getHubSettings(tenant.id),
  ])
  const company = shared?.company
  const address = company?.address
  return hubLlmsTxt({
    origin,
    company: company?.name ?? 'PRO-KOM',
    phone: hubPhone(shared?.line.phone ?? null),
    // The hub line's e-mail, as the footer (`getSharedData` falls back to the company one).
    email: shared?.line.email ?? null,
    address: address ? `${address.street}, ${address.postalCode} ${address.city}` : null,
    hours: company?.hours.length ? hoursSummary(company.hours) : null,
    lines: contacts.map((contact) => ({
      name: contact.name,
      url: contact.url,
      description: shared?.lines.find((line) => line.key === contact.key)?.description ?? null,
      phone: contact.phone,
    })),
    pages: hubMapPages(settings.pages),
  })
}
