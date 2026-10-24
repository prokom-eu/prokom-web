import { Container } from '@/components/ui/Container'
import { DEPARTMENTS } from '@/lib/site/departments'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { hoursSummary, hoursTable } from '@/lib/site/hoursSummary'
import { toDirectionsHref, toMapsHref, toTelHref } from '@/lib/site/link'
import type { BzContactInfoBlock as BzContactInfoBlockData } from '@/payload-types'

import { Breadcrumbs } from '../../components/Breadcrumbs'
import { LiveHours } from '../../components/home/LiveHours'

type Props = {
  block: BzContactInfoBlockData
  tenantId: number
  /** First block: it carries the page's H1 and the breadcrumbs (as `bzHero`). */
  isFirst?: boolean
}

/**
 * Towns of the area diagram, placed as on the board (percent of the box, Rabka in the middle).
 * A picture of the geography, hidden from screen readers; the towns served are content —
 * `SiteSettings.biznes.serviceAreas`, listed in the card (and in the footer).
 */
const TOWNS = [
  { name: 'Kraków', x: 48, y: 10 },
  { name: 'Myślenice', x: 54, y: 25 },
  { name: 'Jordanów', x: 24, y: 44 },
  { name: 'Mszana Dolna', x: 72, y: 40 },
  { name: 'Limanowa', x: 86, y: 30 },
  { name: 'Nowy Sącz', x: 88, y: 60 },
  { name: 'Nowy Targ', x: 62, y: 78 },
  { name: 'Zakopane', x: 50, y: 91 },
  { name: 'Szczawnica', x: 84, y: 84 },
] as const
const CENTER = { x: 50, y: 54 }

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
          <div className="relative flex min-h-[520px] flex-col overflow-hidden rounded-[28px] bg-surface-2 p-5 shadow-[inset_0_0_0_1px_var(--border)] sm:min-h-[560px]">
            {block.areaLabel && <p className={LABEL}>{block.areaLabel}</p>}
            <div className="relative mt-2 min-h-[340px] flex-1">
              <svg
                aria-hidden="true"
                className="absolute inset-0 size-full text-accent-text/50"
                preserveAspectRatio="none"
              >
                {TOWNS.map((town) => (
                  <line
                    key={town.name}
                    x1={`${CENTER.x}%`}
                    y1={`${CENTER.y}%`}
                    x2={`${town.x}%`}
                    y2={`${town.y}%`}
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                ))}
              </svg>
              <div aria-hidden="true">
                {TOWNS.map((town) => (
                  <span
                    key={town.name}
                    style={{ left: `${town.x}%`, top: `${town.y}%` }}
                    // Towns at the right edge hang to the left, so a phone does not cut them.
                    className={`absolute ${town.x > 80 ? '-translate-x-[85%]' : '-translate-x-1/2'} -translate-y-1/2 rounded-full bg-card px-2 py-0.5 text-xs font-bold sm:px-2.5 sm:py-1 sm:text-[13px] whitespace-nowrap text-ink shadow-[0_6px_14px_-8px_var(--glow),inset_0_0_0_1px_var(--border)]`}
                  >
                    {town.name}
                  </span>
                ))}
              </div>
              <div
                style={{ left: `${CENTER.x}%`, top: `${CENTER.y}%` }}
                className="absolute flex -translate-x-1/2 -translate-y-[14px] flex-col items-center gap-3"
              >
                <span
                  aria-hidden="true"
                  className="size-7 rounded-full border-[6px] border-accent-text/25 bg-accent-text"
                />
                {street && (
                  // Too wide for the diagram on a phone; the address is in the card beside it.
                  <span
                    data-surface="dark"
                    className="hidden rounded-xl bg-surface-dark px-4 py-2 text-center text-sm text-white sm:block"
                  >
                    <b className="block">{company?.name ?? 'PRO-KOM'}</b>
                    <span className="text-[13px] text-white/80">{street}</span>
                  </span>
                )}
              </div>
            </div>
            {fullAddress && (
              <div className="relative mt-4 flex flex-wrap justify-center gap-3">
                <a
                  href={toMapsHref(fullAddress)}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex min-h-11 items-center rounded-xl bg-accent-text px-4 font-bold text-accent-ink hover:bg-ink hover:text-surface"
                >
                  Otwórz w Mapach Google
                  <span className="sr-only"> (otwiera się w nowej karcie)</span>
                </a>
                <a
                  href={toDirectionsHref(fullAddress)}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex min-h-11 items-center rounded-xl bg-card px-4 font-bold text-ink shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1.5px_var(--ink)]"
                >
                  Wyznacz trasę →<span className="sr-only"> (otwiera się w nowej karcie)</span>
                </a>
              </div>
            )}
          </div>

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
