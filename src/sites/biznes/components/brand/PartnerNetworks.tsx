import Image from 'next/image'

import { Icon } from '@/components/ui/Icon'
import { cx } from '@/components/ui/cx'
import type { PartnerNetwork } from '@/lib/partners/networks'

const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text'

/** Host of the network's site for the link text („alsen.pl”); the address itself if unparsable. */
const hostOf = (website: string) => {
  try {
    return new URL(website).hostname.replace(/^www\./, '')
  } catch {
    return website
  }
}

/**
 * A partner network (runda 1811, D4: ALSEN) next to the authorisations of Biznes: the logo on a
 * white plate (as the brands, both themes), the status confirmed in the panel and a link to the
 * network's own site in a new tab. Never counted with the producers' authorisations.
 * - `tile` — one tile in the hero's authorisation bar, set apart from the producers' tiles;
 * - `inline` — one card under the authorisation cards of the company facts (narrow column);
 * - `row` — the „Sieci partnerskie” row of O firmie and /marki.
 */
export function PartnerNetworks({
  networks,
  variant,
  className,
  headingId,
}: {
  networks: readonly PartnerNetwork[]
  variant: 'tile' | 'inline' | 'row'
  className?: string
  /** `row`: the label is a heading (`h2`) with this id, for the section's `aria-labelledby`. */
  headingId?: string
}) {
  if (networks.length === 0) return null
  if (variant === 'tile') {
    return (
      <ul
        aria-label="Sieci partnerskie"
        className={cx(
          'flex gap-2.5 min-[1080px]:border-l min-[1080px]:border-border min-[1080px]:pl-3',
          className,
        )}
        data-networks
      >
        {networks.map((network) => (
          <li
            key={network.slug}
            data-light
            className="bz-auth relative grid min-w-0 grid-rows-[28px_auto] content-center gap-2 rounded-[18px] border border-border bg-white px-4 py-3 text-[var(--c-biznes-text)] max-[1079px]:w-[190px] max-[1079px]:shrink-0 max-[1079px]:snap-start min-[1080px]:w-[176px]"
          >
            <span className="flex min-w-0 items-center justify-between gap-2">
              <Image
                src={network.logo.url}
                alt={network.name}
                width={network.logo.width}
                height={network.logo.height}
                unoptimized
                className="max-h-[22px] w-auto max-w-[calc(100%-36px)] object-contain object-left"
              />
              <span
                aria-hidden="true"
                className="bz-stat grid size-7 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,currentColor_12%,transparent)]"
              >
                <Icon name="check" className="size-3.5" strokeWidth={2.6} />
              </span>
            </span>
            <span className="flex flex-col text-[12.5px] leading-tight font-extrabold text-balance">
              {network.website ? (
                // The whole tile answers the click; the name of the link says where it goes.
                <a
                  href={network.website}
                  target="_blank"
                  rel="noopener"
                  className={cx('after:absolute after:inset-0 after:rounded-[18px]', FOCUS)}
                  aria-label={`${network.status} sieci ${network.name} — ${hostOf(network.website)} (nowa karta)`}
                >
                  {network.status}
                </a>
              ) : (
                network.status
              )}
              <span className="text-[11px] font-semibold">sieć partnerska</span>
            </span>
          </li>
        ))}
      </ul>
    )
  }
  if (variant === 'inline') {
    return (
      <ul aria-label="Sieci partnerskie" className={cx('flex flex-col', className)} data-networks>
        {networks.map((network) => (
          <li
            key={network.slug}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[22px] bg-card px-4 py-3 shadow-[inset_0_0_0_1px_var(--border)]"
          >
            <span className="flex h-11 w-[104px] shrink-0 items-center justify-center rounded-xl bg-white px-3 shadow-[inset_0_0_0_1px_var(--border)]">
              <Image
                src={network.logo.url}
                alt={network.name}
                width={network.logo.width}
                height={network.logo.height}
                unoptimized
                className="max-h-6 w-auto max-w-full object-contain"
              />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <b className="flex items-center gap-1.5 text-[14px] leading-tight font-extrabold text-ok-text max-[479px]:text-[12px]">
                <Icon name="check" className="size-4 shrink-0" strokeWidth={2.4} />
                {network.status}
              </b>
              <span className="text-[13px] text-ink-2 max-md:text-[12px]">sieć partnerska</span>
            </span>
            {network.website && (
              <a
                href={network.website}
                target="_blank"
                rel="noopener"
                className={cx(
                  'inline-flex min-h-11 items-center gap-1.5 text-sm font-extrabold text-accent-text hover:underline',
                  FOCUS,
                )}
              >
                {hostOf(network.website)}
                <Icon name="arrow" className="size-4 -rotate-45" strokeWidth={2.4} />
                <span className="sr-only">(nowa karta)</span>
              </a>
            )}
          </li>
        ))}
      </ul>
    )
  }
  return (
    <div
      className={cx(
        'grid gap-4 rounded-[26px] bg-surface-2 p-6 max-[479px]:p-4 min-[1080px]:grid-cols-[150px_minmax(0,1fr)] min-[1080px]:items-center',
        className,
      )}
      data-networks
    >
      {headingId ? (
        <h2
          id={headingId}
          className="text-[12px] font-extrabold tracking-[0.16em] text-ink-2 uppercase"
        >
          Sieci partnerskie
        </h2>
      ) : (
        <p className="text-[12px] font-extrabold tracking-[0.16em] text-ink-2 uppercase">
          Sieci partnerskie
        </p>
      )}
      <ul className="flex flex-wrap gap-3" aria-label={headingId ? undefined : 'Sieci partnerskie'}>
        {networks.map((network) => (
          <li
            key={network.slug}
            className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-card px-4 py-3 shadow-[inset_0_0_0_1px_var(--border)]"
          >
            <span className="flex h-12 w-[120px] shrink-0 items-center justify-center rounded-xl bg-white px-3 shadow-[inset_0_0_0_1px_var(--border)]">
              <Image
                src={network.logo.url}
                alt={network.name}
                width={network.logo.width}
                height={network.logo.height}
                unoptimized
                className="max-h-6 w-auto max-w-full object-contain"
              />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="flex items-center gap-1.5 text-[14px] font-extrabold text-ok-text">
                <Icon name="check" className="size-4 shrink-0" strokeWidth={2.4} />
                {network.status}
              </span>
              <span className="text-[14px] leading-snug text-ink-2">
                PRO-KOM jest autoryzowanym partnerem sieci {network.name}.
              </span>
            </span>
            {network.website && (
              <a
                href={network.website}
                target="_blank"
                rel="noopener"
                className={cx(
                  'inline-flex min-h-11 items-center gap-1.5 text-sm font-extrabold text-accent-text hover:underline',
                  FOCUS,
                )}
              >
                {hostOf(network.website)}
                <Icon name="arrow" className="size-4 -rotate-45" strokeWidth={2.4} />
                <span className="sr-only">(nowa karta)</span>
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
