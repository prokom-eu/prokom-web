import { brandAsset } from '../brand/lines'
import type { PublicCompanyData } from '../site/public'
import type { Line } from '../tenant/lines'

const DAYS: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
}

type OrganizationInput = {
  company: PublicCompanyData
  tenant: { name: string; line: Line }
  /** Phone and e-mail of the line (`SiteSettings`); company ones are the fallback. */
  contact: { phone: string | null; email: string | null }
  origin: string
}

/**
 * `Organization` (the line as the public face of the company) plus one `LocalBusiness` per
 * branch with its opening hours — all from `CompanyData`, so a change in the panel updates it.
 */
export function organizationJsonLd({ company, tenant, contact, origin }: OrganizationInput) {
  const orgId = `${origin}/#organization`
  const telephone = contact.phone ?? company.phones[0]?.number
  const organization = {
    '@type': 'Organization',
    '@id': orgId,
    name: tenant.name,
    legalName: company.name,
    url: `${origin}/`,
    logo: origin + brandAsset(tenant.line, 'poziome_kolor.svg'),
    telephone,
    email: contact.email ?? company.email,
    taxID: company.nip,
  }
  const branches = company.locations.map((location, index) => ({
    '@type': 'LocalBusiness',
    // By position, not city: two branches in one city must stay two nodes.
    '@id': `${origin}/#oddzial-${index + 1}`,
    name: `${company.name} — ${location.name}`,
    parentOrganization: { '@id': orgId },
    url: `${origin}/`,
    telephone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: location.street,
      postalCode: location.postalCode,
      addressLocality: location.city,
      addressCountry: 'PL',
    },
    openingHoursSpecification: location.hours.map(({ days, opens, closes }) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: days.flatMap((day) => (DAYS[day] ? [`https://schema.org/${DAYS[day]}`] : [])),
      opens,
      closes,
    })),
  }))
  return { '@context': 'https://schema.org', '@graph': [organization, ...branches] }
}

/** `FAQPage` for the FAQ block (the answers are plain text in the panel). */
export function faqJsonLd(items: readonly { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }
}

/** JSON for `<script type="application/ld+json">`; `<` escaped so text cannot end the tag (Next docs). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
