import { LocationAddress, Phone } from '@/components/ContactDetails'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import type { ContactBlock as ContactBlockData } from '@/payload-types'

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
  return (
    <section>
      {block.heading && <h2>{block.heading}</h2>}
      {block.text && <p>{block.text}</p>}
      {settings?.phone && (
        <p>
          Telefon: <Phone number={settings.phone} />
        </p>
      )}
      {settings?.email && (
        <p>
          E-mail: <a href={`mailto:${settings.email}`}>{settings.email}</a>
        </p>
      )}
      {block.showLocations &&
        company?.locations.map((location) => (
          <LocationAddress key={`${location.name}-${location.street}`} location={location} />
        ))}
    </section>
  )
}
