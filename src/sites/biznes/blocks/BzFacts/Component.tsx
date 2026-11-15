import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { CountUp } from '@/components/motion/CountUp'
import { countsUp } from '@/lib/motion/countUp'
import { brandLogo } from '@/lib/catalog/brandLogo'
import { getWheelPhotos } from '@/lib/catalog/data'
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
 * The product photo and the scope of each authorisation (runda 1411, board `Zaufanie.dc.html`):
 * Posnet → Ergo, Elzab → K10, GoPOS → the set, InsERT → nexo; the scope is one line under the
 * status. Facts the site already states (the brands' pages and the statuses of K4-FINAL §1).
 */
const SHOWCASE: Record<string, { product: string; scope: string }> = {
  posnet: { product: 'ergo', scope: 'kasy i drukarki fiskalne' },
  elzab: { product: 'k10', scope: 'kasy i drukarki fiskalne' },
  gopos: { product: 'gopos', scope: 'system dla gastronomii' },
  insert: { product: 'nexo', scope: 'programy dla firm i KSeF' },
}

type Photo = { url: string; alt: string; width: number; height: number }

/**
 * „Od 2004” without the owner's word (runda 1411, board `Zaufanie.dc.html`): on the left the
 * heading, the lead, the navy „10 000+ klientów” and „2004 w Rabce-Zdroju” (`stats`) and the link
 * to the company page; on the right a 2 × 2 grid — a light panel with the product photo and the
 * brand's logo on a white plaque in its corner, under it the status and the scope in one line.
 * No CEIDG, no Optivendi / COMEX row. Phone (§5): the left column above, the tiles 2 × 2.
 */
function FactsCard({
  block,
  stats,
  logos,
  photos,
}: {
  block: BzFactsBlockData
  stats: NonNullable<BzFactsBlockData['stats']>
  logos: Logos
  photos: ReadonlyMap<string, Photo>
}) {
  const [first, second] = stats
  return (
    <div className="relative isolate grid items-center gap-x-14 gap-y-8 overflow-hidden rounded-[30px] bg-surface-2 p-[clamp(24px,4vw,56px)] max-[479px]:p-4 min-[981px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -left-4 -z-[1] font-display text-[clamp(140px,18vw,260px)] leading-none font-extrabold text-transparent font-stretch-120% [-webkit-text-stroke:1.5px_var(--border)]"
      >
        {block.owner?.year || '2004'}
      </span>
      <div>
        <p className="mb-3 flex items-center gap-2.5 text-[12px] font-extrabold tracking-[0.16em] text-accent-text uppercase">
          <span aria-hidden="true" className="h-0.5 w-[22px] bg-current" />O firmie
        </p>
        <h2 id="fakty-h" className={`${BZ_H2} text-ink`}>
          <Heading text={block.heading} accent={block.headingAccent} />
        </h2>
        {block.lead && (
          <p className="mt-4 text-[16.5px] leading-relaxed text-pretty text-ink-2">{block.lead}</p>
        )}
        {(first || second) && (
          <dl className="mt-6 grid grid-cols-2 gap-3">
            {[second, first].map((stat, i) =>
              stat ? (
                <div
                  key={stat.id ?? i}
                  className={
                    i === 0
                      ? 'flex flex-col-reverse gap-1.5 rounded-[20px] bg-surface-dark px-5 py-[18px] text-white max-[479px]:px-4'
                      : 'flex flex-col-reverse gap-1.5 rounded-[20px] bg-card px-5 py-[18px] shadow-[inset_0_0_0_1px_var(--border)] max-[479px]:px-4'
                  }
                  data-surface={i === 0 ? 'dark' : undefined}
                >
                  <dt className={i === 0 ? 'text-[14px] text-white/75' : 'text-[14px] text-ink-2'}>
                    {stat.label}
                  </dt>
                  <dd className="font-display text-[clamp(1.5rem,7vw,2.75rem)] leading-none font-extrabold tracking-[-0.01em] whitespace-nowrap font-stretch-112%">
                    <Figure text={stat.value} />
                  </dd>
                </div>
              ) : null,
            )}
          </dl>
        )}
        {block.contactLink?.label && block.contactLink.href && (
          <Link
            href={block.contactLink.href}
            className="group/more mt-4 inline-flex min-h-11 items-center gap-2 font-extrabold text-ink"
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
      {logos.length > 0 && (
        <div>
          <p className="mb-3 text-[12px] font-extrabold tracking-[0.16em] text-ink-2 uppercase">
            Uprawnienia producentów
          </p>
          <ul
            aria-label="Autoryzacje i partnerstwa"
            data-reveal-cards=""
            className="grid grid-cols-2 gap-3.5 max-[479px]:gap-2"
          >
            {logos.map((item) => {
              const showcase = SHOWCASE[item.name.toLowerCase()]
              const photo = showcase ? photos.get(showcase.product) : undefined
              const service = item.status?.endsWith('serwis') ?? false
              return (
                <li
                  key={item.id}
                  className="bzc group/bzc flex flex-col overflow-hidden rounded-[22px] bg-card shadow-[inset_0_0_0_1px_var(--border)]"
                >
                  {/* The photo in its own light panel: no text ever sits on it. */}
                  <span className="relative flex h-[150px] items-center justify-center bg-accent-soft max-md:h-24">
                    <span className="absolute top-2.5 left-2.5 z-[1] flex h-9 items-center rounded-[10px] bg-white px-2.5 shadow-[0_6px_14px_-10px_var(--glow)] max-md:h-7 max-md:px-2">
                      <Image
                        src={item.logo.url}
                        alt={item.name}
                        width={item.logo.width}
                        height={item.logo.height}
                        unoptimized
                        className="h-auto max-h-[20px] w-auto max-w-[84px] object-contain max-md:max-h-4 max-md:max-w-[64px]"
                      />
                    </span>
                    {photo && (
                      <Image
                        src={photo.url}
                        alt=""
                        width={photo.width}
                        height={photo.height}
                        unoptimized
                        loading="lazy"
                        className="bzc-photo h-[78%] w-auto max-w-[70%] object-contain"
                      />
                    )}
                  </span>
                  {item.status && (
                    <span className="flex items-center gap-2 px-4 py-3 max-md:px-3 max-[479px]:px-2.5">
                      <Icon
                        name={service ? 'shield' : 'check'}
                        strokeWidth={2.4}
                        className="size-4 shrink-0 text-ok-text max-[479px]:hidden"
                      />
                      <span className="flex min-w-0 flex-col">
                        <b className="text-[14px] leading-tight font-extrabold whitespace-nowrap text-ink max-[479px]:text-[12px] max-[479px]:tracking-[-0.01em]">
                          {item.status}
                        </b>
                        {showcase && (
                          <span className="truncate text-[13px] text-ink-2 max-md:text-[12px]">
                            {showcase.scope}
                          </span>
                        )}
                      </span>
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
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
    const wheel = await getWheelPhotos(
      tenantId,
      Object.values(SHOWCASE).map(({ product }) => product),
    )
    const photos = new Map(
      Object.entries(wheel).map(([slug, image]) => [slug, { ...image, alt: '' }] as const),
    )
    return (
      <section id="fakty" aria-labelledby="fakty-h" className="py-12 sm:py-16">
        <Container wide>
          <FactsCard block={block} stats={stats} logos={logos} photos={photos} />
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
