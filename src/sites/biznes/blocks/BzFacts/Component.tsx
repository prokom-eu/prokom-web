import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { brandLogo } from '@/lib/catalog/catalogIndex'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { hoursSummary } from '@/lib/site/hoursSummary'
import { toTelHref } from '@/lib/site/link'
import { tenantIdOf } from '@/lib/tenant/id'
import type { BzFactsBlock as BzFactsBlockData, Partner } from '@/payload-types'

import { LiveHours } from '../../components/home/LiveHours'
import { SectionHead } from '../../components/home/SectionHead'

type Props = { block: BzFactsBlockData; tenantId: number }

/** The quote with its highlighted part in the accent colour (when the text matches). */
function Quote({ quote, highlight }: { quote: string; highlight?: string | null }) {
  const at = highlight ? quote.indexOf(highlight) : -1
  if (!highlight || at < 0) return <>„{quote}”</>
  return (
    <>
      „{quote.slice(0, at)}
      <strong className="font-semibold text-accent-text">{highlight}</strong>
      {quote.slice(at + highlight.length)}”
    </>
  )
}

/** `Partners` is shared between lines: only partners shown on this site, with a logo. */
function authorizations(values: BzFactsBlockData['authorizations'], tenantId: number) {
  return (values ?? []).flatMap((value) => {
    if (!value || typeof value !== 'object') return []
    const partner = value as Partner
    const shown = (partner.tenants ?? []).some((tenant) => tenantIdOf(tenant) === tenantId)
    const logo = shown ? brandLogo(partner) : undefined
    return logo ? [{ id: partner.id, name: partner.name, logo }] : []
  })
}

const directions = (address: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`

/**
 * „PRO-KOM w faktach” (spec. §4 pkt 10, ZMIANY-v20 §2.6): the owner's word (photo placeholder
 * only behind its flag, otherwise an icon tile) and one low navy card — numbers, contact from
 * the settings and company data, authorization logos from Partners.
 */
export async function BzFactsBlock({ block, tenantId }: Props) {
  const [settings, company] = await Promise.all([getSiteSettings(tenantId), getCompanyData()])
  const owner = block.owner
  const phone = settings?.phone ?? null
  const tel = phone ? toTelHref(phone) : null
  const email = settings?.email ?? null
  const location = company?.locations[0]
  const address = location ? `${location.street}, ${location.city}` : null
  const hours = location?.hours ?? []
  const logos = authorizations(block.authorizations, tenantId)
  const stats = block.stats ?? []

  return (
    <section id="fakty" aria-labelledby="fakty-h" className="py-16 sm:py-24">
      <Container wide>
        <SectionHead id="fakty-h" eyebrow={block.eyebrow} heading={block.heading} />

        <div className="mt-10 grid items-center gap-8 rounded-[30px] bg-linear-160 from-surface-2 to-accent-soft p-5 shadow-[inset_0_0_0_1px_var(--border)] sm:p-8 min-[900px]:grid-cols-[340px_minmax(0,1fr)] min-[900px]:gap-14">
          <div className="relative flex aspect-[4/5] max-h-[420px] w-full flex-col justify-between overflow-hidden rounded-[24px] bg-linear-160 from-accent-text to-surface-dark p-4 text-white max-[899px]:aspect-[16/10]">
            {owner.photoPlaceholder ? (
              <span className="self-start rounded-full bg-white/15 px-3 py-1.5 text-[13px] font-bold">
                Zdjęcie właściciela — wkrótce
              </span>
            ) : (
              <span aria-hidden="true" className="flex flex-1 items-center justify-center">
                <span className="flex size-24 items-center justify-center rounded-[28px] bg-white/10">
                  <Icon name="users" className="size-11" />
                </span>
              </span>
            )}
            {owner.year && (
              <span className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 text-ink">
                <span className="font-display text-[28px] leading-none font-extrabold text-accent-text">
                  {owner.year}
                </span>
                {owner.yearText && (
                  <span className="text-[13px] leading-snug">{owner.yearText}</span>
                )}
              </span>
            )}
          </div>
          {/* The quote and its author: `figcaption` must be a direct child of `figure`. */}
          <figure>
            {owner.label && (
              <p className="text-[13px] font-extrabold tracking-[0.12em] text-accent-text uppercase">
                {owner.label}
              </p>
            )}
            <blockquote className="mt-4 text-[clamp(1.2rem,2vw,1.7rem)] leading-snug font-medium text-ink">
              <Quote quote={owner.quote} highlight={owner.highlight} />
            </blockquote>
            <figcaption className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
              {/* TODO(krystian): [SZEF] podpis właściciela jako SVG (ADR-013) — do czasu pliku samo imię. */}
              <span className="flex flex-col">
                <b className="font-extrabold text-ink">{owner.name}</b>
                {owner.role && <span className="text-sm text-ink-2">{owner.role}</span>}
              </span>
              {phone && tel && (
                <a
                  href={tel}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-card px-4 font-extrabold text-ink shadow-[inset_0_0_0_1px_var(--border)]"
                >
                  <Icon name="phone" className="size-4" />
                  {phone}
                </a>
              )}
            </figcaption>
          </figure>
        </div>

        <div
          data-surface="dark"
          className="mt-6 grid overflow-hidden rounded-[28px] bg-surface-dark text-white min-[640px]:grid-cols-2 min-[1080px]:grid-cols-[auto_minmax(0,1.3fr)_minmax(0,1fr)]"
        >
          {stats.length > 0 && (
            <dl className="flex gap-10 border-white/10 p-7 max-[1079px]:border-b min-[640px]:max-[1079px]:border-r min-[1080px]:border-r">
              {stats.map((stat, i) => (
                <div key={stat.id ?? i} className="flex flex-col-reverse gap-1">
                  <dt className="max-w-[10ch] text-[13px] leading-snug text-white/80">
                    {stat.label}
                  </dt>
                  <dd className="font-display text-[38px] leading-none font-extrabold">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <ul className="flex flex-col gap-3 border-white/10 p-7 max-[1079px]:border-b min-[1080px]:border-r">
            {phone && tel && (
              <li>
                <a
                  href={tel}
                  className="flex items-center gap-3 text-[17px] font-extrabold hover:underline"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-8 items-center justify-center rounded-lg bg-white/10"
                  >
                    <Icon name="phone" className="size-4" />
                  </span>
                  {phone}
                </a>
              </li>
            )}
            {email && (
              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 font-bold hover:underline"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-8 items-center justify-center rounded-lg bg-white/10"
                  >
                    <Icon name="mail" className="size-4" />
                  </span>
                  {email}
                </a>
              </li>
            )}
            {address && (
              <li>
                <a
                  href={directions(address)}
                  rel="noopener"
                  target="_blank"
                  className="flex items-center gap-3 font-bold hover:underline"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-8 items-center justify-center rounded-lg bg-white/10"
                  >
                    <Icon name="pin" className="size-4" />
                  </span>
                  {address}
                  <span className="sr-only">
                    {' '}
                    (trasa w Mapach Google, otwiera się w nowej karcie)
                  </span>
                </a>
              </li>
            )}
            {hours.length > 0 && (
              <li className="flex flex-wrap items-center gap-x-2 pl-11 text-[14px] text-white/80">
                <span>{hoursSummary(hours)} ·</span>
                <LiveHours hours={hours} className="text-white" />
              </li>
            )}
          </ul>
          <div className="flex flex-col justify-center gap-3 p-7 min-[640px]:max-[1079px]:col-span-2">
            {block.authorizationsLabel && (
              <p className="text-[13px] font-bold text-accent-on-dark">
                {block.authorizationsLabel}
              </p>
            )}
            {logos.length > 0 && (
              <ul className="grid grid-cols-2 gap-2 min-[640px]:grid-cols-4">
                {logos.map((item) => (
                  <li
                    key={item.id}
                    className="flex h-10 items-center justify-center rounded-lg bg-white px-2"
                  >
                    <Image
                      src={item.logo.url}
                      alt={item.name}
                      width={item.logo.width}
                      height={item.logo.height}
                      unoptimized
                      className="h-auto max-h-6 w-auto max-w-full object-contain"
                    />
                  </li>
                ))}
              </ul>
            )}
            {(block.areaText || block.contactLink?.label) && (
              <p className="text-[13.5px] leading-snug text-white/80">
                {block.areaText}{' '}
                {block.contactLink?.label && block.contactLink.href && (
                  <Link
                    href={block.contactLink.href}
                    className="inline-flex items-center gap-1 font-extrabold text-white hover:underline"
                  >
                    {block.contactLink.label}
                    <Icon name="arrow" strokeWidth={2.4} className="size-3.5" />
                  </Link>
                )}
              </p>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}
