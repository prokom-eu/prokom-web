import { LocationAddress, Phone } from '@/components/ContactDetails'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { TextLink } from '@/components/ui/TextLink'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import type { ContactBlock as ContactBlockData } from '@/payload-types'

const CARD = 'rounded-2xl border border-border bg-card p-6 leading-relaxed'

/** Contact details of the line (its `SiteSettings`) and the company branches (`CompanyData`). */
export async function ContactBlock({
  block,
  tenantId,
}: {
  block: ContactBlockData
  tenantId: number
}) {
  // Both reads are deduplicated per request with the layout (React `cache`).
  const [company, settings] = await Promise.all([getCompanyData(), getSiteSettings(tenantId)])
  const lineContact = settings && (settings.phone || settings.email)
  return (
    <Section surface="muted">
      {block.heading && <Heading level={2}>{block.heading}</Heading>}
      {block.text && (
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-2">{block.text}</p>
      )}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {lineContact && (
          <div className={CARD}>
            {settings.phone && (
              <p>
                Telefon: <Phone number={settings.phone} />
              </p>
            )}
            {settings.email && (
              <p>
                E-mail: <TextLink href={`mailto:${settings.email}`}>{settings.email}</TextLink>
              </p>
            )}
          </div>
        )}
        {block.showLocations &&
          company?.locations.map((location) => (
            <div key={`${location.name}-${location.street}`} className={CARD}>
              <LocationAddress location={location} />
            </div>
          ))}
      </div>
    </Section>
  )
}
