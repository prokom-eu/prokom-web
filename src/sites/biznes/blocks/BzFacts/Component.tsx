import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { brandLogo } from '@/lib/catalog/catalogIndex'
import { getSiteSettings } from '@/lib/site/data'
import { tenantIdOf } from '@/lib/tenant/id'
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

  return (
    <section id="fakty" aria-labelledby="fakty-h" className="py-16 sm:py-24">
      <Container wide>
        <h2 id="fakty-h" className="sr-only">
          {showOwner ? block.heading : 'PRO-KOM w liczbach'}
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
                      {stat.value}
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
