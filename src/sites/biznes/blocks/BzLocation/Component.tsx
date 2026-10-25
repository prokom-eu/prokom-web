import { Container } from '@/components/ui/Container'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { hoursSummary } from '@/lib/site/hoursSummary'
import { toTelHref } from '@/lib/site/link'
import type { BzLocationBlock as BzLocationBlockData } from '@/payload-types'

import { AreaMap } from '../../components/AreaMap'

type Props = { block: BzLocationBlockData; tenantId: number }

/**
 * „Gdzie nas znaleźć” of `/o-firmie` (plansza OFirmie): the address as the heading, hours,
 * phones, e-mail and the company with its NIP — all from the panel, nothing typed in twice —
 * and the area diagram with the Google Maps links (`AreaMap`).
 */
export async function BzLocationBlock({ block, tenantId }: Props) {
  const [settings, company] = await Promise.all([getSiteSettings(tenantId), getCompanyData()])
  const location = company?.locations[0]
  const street = location ? `${location.street}, ${location.city}` : null
  const fullAddress = location
    ? `${location.street}, ${[location.postalCode, location.city].filter(Boolean).join(' ')}`
    : null
  const heading = block.heading || (location ? `${location.city}, ${location.street}` : null)
  const phone = settings?.phone ?? null
  const tel = phone ? toTelHref(phone) : null
  // Company phones are shared by all lines and may repeat the main number.
  const otherPhones = (company?.phones ?? []).filter(
    (other) => !tel || toTelHref(other.number) !== tel,
  )
  const email = settings?.email ?? null
  const hours = hoursSummary(location?.hours ?? [])
  const headingId = `lokalizacja-${block.id ?? 'sekcja'}-h`

  return (
    <section aria-labelledby={headingId} className="py-14 sm:py-20">
      <Container wide>
        <div className="grid items-center gap-10 min-[1000px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            {block.eyebrow && (
              <p className="mb-3 text-[13px] font-extrabold tracking-[0.08em] text-accent-text uppercase">
                {block.eyebrow}
              </p>
            )}
            <h2
              id={headingId}
              className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.02] font-extrabold tracking-[-0.02em] font-stretch-112%"
            >
              {heading ?? 'Gdzie nas znaleźć'}
            </h2>
            {block.lead && (
              <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-ink-2">{block.lead}</p>
            )}
            <ul className="mt-6 flex flex-col gap-1.5 text-ink-2">
              {hours && <li className="font-bold text-ink">{hours}</li>}
              {phone && tel && (
                <li>
                  <a href={tel} className="font-bold text-ink hover:underline">
                    {phone}
                  </a>
                  {block.phoneNote && <> · {block.phoneNote}</>}
                </li>
              )}
              {otherPhones.map((other) => (
                <li key={other.number}>
                  <a
                    href={toTelHref(other.number) ?? undefined}
                    className="font-bold text-ink hover:underline"
                  >
                    {other.number}
                  </a>
                  {other.label && <> · {other.label}</>}
                </li>
              ))}
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="font-bold text-ink hover:underline">
                    {email}
                  </a>
                </li>
              )}
              {company && (
                <li className="text-sm">
                  {company.name}
                  {company.nip && <> · NIP {company.nip}</>}
                </li>
              )}
            </ul>
          </div>
          <AreaMap
            label={block.areaLabel}
            companyName={company?.name ?? 'PRO-KOM'}
            street={street}
            fullAddress={fullAddress}
          />
        </div>
      </Container>
    </section>
  )
}
