import { Container } from '@/components/ui/Container'
import { DEPARTMENTS } from '@/lib/site/departments'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { hoursSummary, hoursTable } from '@/lib/site/hoursSummary'
import { toTelHref } from '@/lib/site/link'
import type { BzContactInfoBlock as BzContactInfoBlockData } from '@/payload-types'

import { AreaMap } from '../../components/AreaMap'
import { Breadcrumbs } from '../../components/Breadcrumbs'
import { LiveHours } from '../../components/home/LiveHours'

type Props = {
  block: BzContactInfoBlockData
  tenantId: number
  /** First block: it carries the page's H1 and the breadcrumbs (as `bzHero`). */
  isFirst?: boolean
}

const LABEL = 'text-xs font-black tracking-[0.06em] text-accent-text uppercase'
const ROW = 'flex flex-col gap-1 border-b border-border py-4 first:pt-0'

const departmentLabel = (value: string) =>
  DEPARTMENTS.find((department) => department.value === value)?.label ?? value

/**
 * „Kontakt i dojazd” (spec. §6.9, plansza Kontakt): hours status, the area served — a static
 * diagram with links to Google Maps, no embedded map before cookie consent — and the card of
 * contact data from the settings and company data, with the departments' channels when set.
 */
export async function BzContactInfoBlock({ block, tenantId, isFirst = false }: Props) {
  const Title = isFirst ? 'h1' : 'h2'
  const [settings, company] = await Promise.all([getSiteSettings(tenantId), getCompanyData()])
  const phone = settings?.phone ?? null
  const tel = phone ? toTelHref(phone) : null
  const email = settings?.email ?? null
  const location = company?.locations[0]
  const hours = location?.hours ?? []
  const short = hoursSummary(hours)
  const table = hoursTable(hours)
  const street = location ? `${location.street}, ${location.city}` : null
  const fullAddress = location
    ? `${location.street}, ${[location.postalCode, location.city].filter(Boolean).join(' ')}`
    : null
  // `CompanyData` phones are shared by all lines and may repeat the main number above.
  const otherPhones = (company?.phones ?? []).filter(
    (other) => !tel || toTelHref(other.number) !== tel,
  )
  const channels = settings?.biznes?.contactChannels ?? []
  const areas = settings?.biznes?.serviceAreas ?? []

  return (
    <section aria-labelledby="kontakt-dojazd-h" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_85%_0%,var(--glow),transparent_60%)]"
      />
      <Container wide className="relative pt-6 pb-12 sm:pt-8 sm:pb-16">
        {isFirst && (
          <div className="mb-5">
            <Breadcrumbs
              items={[
                { name: 'Strona główna', href: '/' },
                { name: 'Kontakt', href: '/kontakt' },
              ]}
            />
          </div>
        )}
        <LiveHours hours={hours} className="text-sm text-ink" />
        <Title
          id="kontakt-dojazd-h"
          className="mt-3 font-display text-[clamp(2.6rem,5vw,4.5rem)] leading-[0.98] font-extrabold tracking-[-0.02em] text-ink"
        >
          {block.heading}
        </Title>
        {block.lead && (
          <p className="mt-4 max-w-[46ch] text-lg leading-relaxed text-ink-2 sm:text-xl">
            {block.lead}
          </p>
        )}

        <div className="mt-10 grid gap-5 min-[1000px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <AreaMap
            label={block.areaLabel}
            companyName={company?.name ?? 'PRO-KOM'}
            street={street}
            fullAddress={fullAddress}
          />

          <div className="flex flex-col rounded-[28px] bg-card p-6 shadow-[inset_0_0_0_1px_var(--border)] sm:p-7">
            <dl className="flex flex-col">
              {phone && tel && (
                <div className={ROW}>
                  <dt className={LABEL}>Oferty i serwis</dt>
                  <dd>
                    <a
                      href={tel}
                      className="font-display text-[clamp(1.9rem,3vw,2.4rem)] leading-none font-extrabold text-accent-text"
                    >
                      {phone}
                    </a>
                    {(short || block.phoneNote) && (
                      <span className="mt-1.5 block text-sm text-ink-2">
                        {[short, block.phoneNote].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </dd>
                </div>
              )}
              {otherPhones.map((other, i) => {
                const href = toTelHref(other.number)
                return (
                  <div key={`${other.number}-${i}`} className={ROW}>
                    <dt className={LABEL}>{other.label || 'Telefon'}</dt>
                    <dd className="text-lg font-bold text-ink">
                      {href ? <a href={href}>{other.number}</a> : other.number}
                    </dd>
                  </div>
                )
              })}
              {email && (
                <div className={ROW}>
                  <dt className={LABEL}>E-mail</dt>
                  <dd>
                    <a href={`mailto:${email}`} className="text-lg font-bold text-ink">
                      {email}
                    </a>
                    {block.emailNote && (
                      <span className="block text-sm text-ink-2">{block.emailNote}</span>
                    )}
                  </dd>
                </div>
              )}
              {fullAddress && (
                <div className={ROW}>
                  <dt className={LABEL}>Adres</dt>
                  <dd>
                    <span className="text-lg font-bold text-ink">{fullAddress}</span>
                    {block.addressNote && (
                      <span className="block text-sm text-ink-2">{block.addressNote}</span>
                    )}
                  </dd>
                </div>
              )}
              {table.length > 0 && (
                <div className={ROW}>
                  <dt className={LABEL}>Godziny</dt>
                  <dd>
                    <table className="w-full text-ink-2">
                      <tbody>
                        {table.map((row) => (
                          <tr key={row.days}>
                            <th scope="row" className="py-0.5 text-left font-normal">
                              {row.days}
                            </th>
                            <td className="py-0.5 text-right text-lg font-bold text-ink">
                              {row.time}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </dd>
                </div>
              )}
              {channels.length > 0 && (
                <div className={ROW}>
                  <dt className={LABEL}>Działy</dt>
                  <dd>
                    <ul className="flex flex-col gap-2">
                      {channels.map((channel, i) => {
                        const href = channel.phone ? toTelHref(channel.phone) : null
                        return (
                          <li key={`${channel.department}-${i}`} className="text-sm text-ink-2">
                            <b className="block text-ink">{departmentLabel(channel.department)}</b>
                            {[
                              channel.phone &&
                                (href ? (
                                  <a key="tel" href={href} className="font-bold text-ink">
                                    {channel.phone}
                                  </a>
                                ) : (
                                  channel.phone
                                )),
                              channel.email && (
                                <a key="mail" href={`mailto:${channel.email}`} className="text-ink">
                                  {channel.email}
                                </a>
                              ),
                              channel.hours,
                            ]
                              .filter(Boolean)
                              .map((part, i) => (
                                <span key={i}>
                                  {i > 0 && ' · '}
                                  {part}
                                </span>
                              ))}
                          </li>
                        )
                      })}
                    </ul>
                  </dd>
                </div>
              )}
              {areas.length > 0 && (
                <div className={ROW}>
                  <dt className={LABEL}>Miejscowości obsługi</dt>
                  <dd>
                    <ul className="flex flex-wrap gap-x-1 text-ink-2">
                      {areas.map((area, i) => (
                        <li key={`${area}-${i}`}>
                          {area}
                          {i < areas.length - 1 && ','}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
              {company?.name && (
                <div className={ROW}>
                  <dt className={LABEL}>Dane firmy</dt>
                  <dd>
                    <span className="text-lg font-bold text-ink">{company.name}</span>
                    {company.nip && (
                      <span className="block text-sm text-ink-2">NIP {company.nip}</span>
                    )}
                  </dd>
                </div>
              )}
            </dl>
            <div className="mt-auto grid gap-3 pt-5 sm:grid-cols-2">
              {tel && (
                <a
                  href={tel}
                  className="inline-flex min-h-[54px] items-center justify-center rounded-xl bg-accent-text px-5 font-bold text-accent-ink hover:bg-ink hover:text-surface"
                >
                  Zadzwoń
                </a>
              )}
              <a
                href="#kontakt"
                className="inline-flex min-h-[54px] items-center justify-center rounded-xl bg-card px-5 font-bold text-ink shadow-[inset_0_0_0_1.5px_var(--border)] hover:shadow-[inset_0_0_0_1.5px_var(--ink)]"
              >
                Napisz do nas
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
