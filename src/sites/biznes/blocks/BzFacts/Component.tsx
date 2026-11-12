import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { CountUp } from '@/components/motion/CountUp'
import { countsUp } from '@/lib/motion/countUp'
import { brandLogo } from '@/lib/catalog/brandLogo'
import { partnerStatusLabel } from '@/lib/partners/badges'
import { getSiteSettings } from '@/lib/site/data'
import { tenantIdOf } from '@/lib/tenant/id'
import { BZ_H2 } from '@/sites/biznes/typography'
import type { BzFactsBlock as BzFactsBlockData, Partner } from '@/payload-types'

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

/**
 * A figure of „O firmie” (audit 0611 P3): counts of 10 and more count up once on the way down
 * (`CountUp`: not on the first screen, not with reduced motion); a year or a small number stays.
 */
function Figure({ text }: { text: string }) {
  return countsUp(text) ? <CountUp text={text} /> : <>{text}</>
}

/** `Partners` is shared between lines: only partners shown on this site, with a logo. */
function authorizations(values: BzFactsBlockData['authorizations'], tenantId: number) {
  return (values ?? []).flatMap((value) => {
    if (!value || typeof value !== 'object') return []
    const partner = value as Partner
    const shown = (partner.tenants ?? []).some((tenant) => tenantIdOf(tenant) === tenantId)
    const logo = shown ? brandLogo(partner) : undefined
    const status = partnerStatusLabel(partner.partnerStatus)
    return logo ? [{ id: partner.id, name: partner.name, logo, status }] : []
  })
}

/** The heading with its accented part (POPRAWKI-0311 §C), like the quote's highlight. */
function Heading({ text, accent }: { text: string; accent?: string | null }) {
  const at = accent ? text.indexOf(accent) : -1
  if (!accent || at < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <em className="text-accent-text not-italic">{accent}</em>
      {text.slice(at + accent.length)}
    </>
  )
}

type Logos = ReturnType<typeof authorizations>

/**
 * „O firmie” without the owner's word (POPRAWKI-0311 §C, prototype `sekcje.html` §3): one card
 * — the visible H2 with its accent, the lead and the link on the left; two numbers and the four
 * authorizations with their status from Partners on the right.
 */
function FactsCard({
  block,
  stats,
  logos,
}: {
  block: BzFactsBlockData
  stats: NonNullable<BzFactsBlockData['stats']>
  logos: Logos
}) {
  return (
    <div className="grid items-center gap-x-12 gap-y-6 rounded-[28px] bg-surface-2 p-[clamp(24px,4vw,48px)] min-[981px]:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <div>
        <h2 id="fakty-h" className={`${BZ_H2} text-ink`}>
          <Heading text={block.heading} accent={block.headingAccent} />
        </h2>
        {block.lead && (
          <p className="mt-4 text-[16.5px] leading-relaxed text-pretty text-ink-2">{block.lead}</p>
        )}
        {block.contactLink?.label && block.contactLink.href && (
          <Link
            href={block.contactLink.href}
            className="group/more mt-3 inline-flex min-h-11 items-center gap-2 font-extrabold text-ink"
          >
            {block.contactLink.label}
            <span
              aria-hidden="true"
              className="flex size-[30px] items-center justify-center rounded-full bg-surface-dark text-white transition-[translate] duration-200 group-hover/more:translate-x-1 motion-reduce:transition-none"
            >
              <Icon name="arrow" strokeWidth={2.4} className="size-4" />
            </span>
          </Link>
        )}
      </div>
      <div>
        {stats.length > 0 && (
          <dl className="mb-3 grid grid-cols-2 gap-3">
            {stats.slice(0, 2).map((stat, i) => (
              <div
                key={stat.id ?? i}
                className="flex flex-col-reverse gap-2 rounded-[20px] bg-card px-5 py-[18px] shadow-[inset_0_0_0_1px_var(--border)]"
              >
                <dt className="text-[14.5px] font-semibold text-ink-2">{stat.label}</dt>
                <dd className="font-display text-[clamp(2.125rem,3.4vw,2.875rem)] leading-none font-extrabold tracking-[-0.01em] text-ink font-stretch-112%">
                  <Figure text={stat.value} />
                </dd>
              </div>
            ))}
          </dl>
        )}
        {logos.length > 0 && (
          <ul
            aria-label="Autoryzacje i partnerstwa"
            data-reveal-cards=""
            data-logo-cascade=""
            className="grid grid-cols-2 gap-3 min-[561px]:grid-cols-4"
          >
            {logos.map((item) => (
              <li
                key={item.id}
                data-logo-shine=""
                className="grid justify-items-center gap-2.5 rounded-[18px] bg-card px-3 pt-4 pb-3.5 shadow-[inset_0_0_0_1px_var(--border)] transition-[translate,box-shadow] duration-300 hover:-translate-y-[3px] hover:shadow-[0_18px_30px_-22px_var(--glow),inset_0_0_0_1px_var(--border)] motion-reduce:transition-none"
              >
                <span
                  data-logo-plate=""
                  className="flex h-10 w-full items-center justify-center rounded-[10px] bg-white px-2.5 py-1.5"
                >
                  <Image
                    src={item.logo.url}
                    alt={item.name}
                    width={item.logo.width}
                    height={item.logo.height}
                    unoptimized
                    className="h-auto max-h-[26px] w-auto max-w-full object-contain"
                  />
                </span>
                {item.status && (
                  <small className="inline-flex items-center gap-1.5 text-center text-[12px] leading-tight font-extrabold text-ok-text">
                    <span
                      aria-hidden="true"
                      className="flex size-3.5 shrink-0 items-center justify-center rounded-full bg-ok text-white"
                    >
                      <Icon name="check" strokeWidth={3.4} className="size-2.5" />
                    </span>
                    {item.status}
                  </small>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/**
 * „Słowo od właściciela” (board v150 `#s4-fakty`, K36 §1 „O firmie”): the owner's word (photo
 * placeholder only behind its flag, otherwise an icon tile) with the year badge, four numbers,
 * authorization logos from Partners and the link to the company page. The section's name stays
 * for screen readers only — the board shows the label above the quote.
 */
export async function BzFactsBlock({ block, tenantId }: Props) {
  const owner = block.owner
  const logos = authorizations(block.authorizations, tenantId)
  const stats = block.stats ?? []
  // The quote was written by us (audit 01.11.2026): hidden until the owner approves it, like
  // the reviews (D-K4-6). Without it the section keeps the numbers, logos and the link.
  const settings = await getSiteSettings(tenantId)
  const showOwner = Boolean(settings?.biznes?.showOwnerQuote)

  if (!showOwner) {
    return (
      <section id="fakty" aria-labelledby="fakty-h" className="py-12 sm:py-16">
        <Container wide>
          <FactsCard block={block} stats={stats} logos={logos} />
        </Container>
      </section>
    )
  }

  return (
    <section id="fakty" aria-labelledby="fakty-h" className="py-16 sm:py-24">
      <Container wide>
        <h2 id="fakty-h" className="sr-only">
          {owner.label || 'Słowo od właściciela'}
        </h2>
        <div
          className={
            showOwner
              ? 'grid items-center gap-8 min-[900px]:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] min-[900px]:gap-14'
              : undefined
          }
        >
          {showOwner && (
            <div className="relative flex aspect-[4/5] max-h-[440px] w-full flex-col overflow-hidden rounded-[26px] bg-surface-2 bg-[repeating-linear-gradient(135deg,transparent_0_14px,var(--surface-3)_14px_28px)] p-4 max-[899px]:aspect-[16/10]">
              {owner.photoPlaceholder ? (
                <span className="m-auto rounded-full bg-card px-3.5 py-1.5 text-[13px] font-bold text-ink-2 shadow-[0_8px_20px_-14px_var(--glow)]">
                  Miejsce na zdjęcie właściciela
                </span>
              ) : (
                <span
                  aria-hidden="true"
                  className="m-auto flex items-center justify-center max-[899px]:hidden"
                >
                  <span className="flex size-24 items-center justify-center rounded-[28px] bg-card text-accent-text shadow-[0_18px_36px_-24px_var(--glow)]">
                    <Icon name="users" className="size-11" />
                  </span>
                </span>
              )}
              {owner.year && (
                <span
                  data-surface="dark"
                  className="absolute bottom-4 left-4 flex max-w-[13rem] flex-col gap-1 rounded-2xl bg-surface-dark px-4 py-3 text-white"
                >
                  <span className="font-display text-[30px] leading-none font-extrabold">
                    {owner.year}
                  </span>
                  {owner.yearText && (
                    <span className="text-[12.5px] leading-snug text-white/80">
                      {owner.yearText}
                    </span>
                  )}
                </span>
              )}
            </div>
          )}
          <div>
            {/* The quote and its author: `figcaption` must be a direct child of `figure`. */}
            {showOwner && (
              <figure>
                {owner.label && (
                  <p className="text-[13px] font-extrabold tracking-[0.12em] text-accent-text uppercase">
                    {owner.label}
                  </p>
                )}
                <blockquote className="mt-4 font-display text-[clamp(1.25rem,2vw,1.75rem)] leading-snug font-bold text-ink">
                  <Quote quote={owner.quote} highlight={owner.highlight} />
                </blockquote>
                <figcaption className="mt-5">
                  {/* TODO(krystian): [SZEF] podpis właściciela jako SVG (ADR-013) — do czasu pliku samo imię. */}
                  <b className="block font-extrabold text-ink">{owner.name}</b>
                  {owner.role && <span className="text-sm text-ink-2">{owner.role}</span>}
                </figcaption>
              </figure>
            )}
            {stats.length > 0 && (
              <dl
                className={`grid grid-cols-2 gap-2.5 min-[1080px]:grid-cols-4 ${showOwner ? 'mt-6' : ''}`}
              >
                {stats.map((stat, i) => (
                  <div
                    key={stat.id ?? i}
                    className="flex flex-col-reverse gap-1 rounded-2xl bg-surface-2 px-4 py-3.5"
                  >
                    <dt className="text-[12.5px] leading-snug text-ink-2">{stat.label}</dt>
                    <dd className="font-display text-[26px] leading-none font-extrabold text-ink">
                      <Figure text={stat.value} />
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            {logos.length > 0 && (
              <ul aria-label="Autoryzacje i partnerstwa" className="mt-4 flex flex-wrap gap-2">
                {logos.map((item) => (
                  <li
                    key={item.id}
                    className="flex h-11 w-[110px] items-center justify-center rounded-xl bg-white px-3 shadow-[inset_0_0_0_1px_var(--border)]"
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
            {block.contactLink?.label && block.contactLink.href && (
              <Link
                href={block.contactLink.href}
                className="mt-5 inline-flex min-h-11 items-center gap-1.5 font-extrabold text-ink hover:text-accent-text"
              >
                {block.contactLink.label}
                <Icon name="arrow" strokeWidth={2.4} className="size-4" />
              </Link>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}
