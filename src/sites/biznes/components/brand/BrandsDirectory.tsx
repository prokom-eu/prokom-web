'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useId, useState } from 'react'
import { CATALOG_UI, type CatalogUi } from '@/lib/catalog/texts'

import { Icon } from '@/components/ui/Icon'
import { cx } from '@/components/ui/cx'
import type { BrandTile } from '@/lib/catalog/brandsPage'
import { normalizeText } from '@/lib/catalog/normalize'
import { openCartDrawer } from '@/lib/cart/store'
import { partnerStatusLabel } from '@/lib/partners/badges'
import type { PartnerNetwork } from '@/lib/partners/networks'
import { plural } from '@/lib/plural'
import { BZ_H1, BZ_H2, BZ_LEAD } from '@/sites/biznes/typography'

import { PartnerNetworks } from './PartnerNetworks'

// Logos are made for a light background: a white plate in both themes (as `BrandsHome`).
const PLATE =
  'flex items-center justify-center rounded-2xl bg-white shadow-[inset_0_0_0_1px_var(--border)]'

/** Small caps label of a section (board: „MARKI”, „POZOSTAŁE MARKI”). */
const EYEBROW = 'flex items-center gap-2.5 text-xs font-extrabold tracking-[0.16em] uppercase'

/**
 * `/marki` of Biznes (runda 1411 R7, board `Marki.dc.html`): the dark header with the search,
 * „Producenci, z którymi pracujemy” — the four authorisations with status, scope and a link — and
 * „Pozostałe marki w ofercie”: one even grid (6 columns, 3 on a phone) by the number of items,
 * Optivendi and COMEX in it without a badge (15.11). The search filters both live by name and
 * description without diacritics; everything renders on the server too — the island only filters.
 */
export function BrandsDirectory({
  total,
  authorized,
  others,
  ui = CATALOG_UI.biznes,
  networks = [],
}: {
  total: number
  authorized: BrandTile[]
  others: BrandTile[]
  /** The line's copy (ADR-029); Biznes when left out. */
  ui?: CatalogUi
  /** Partner networks (runda 1811, D4: ALSEN) — their own row, not among the brands. */
  networks?: readonly PartnerNetwork[]
}) {
  const [query, setQuery] = useState('')
  const searchId = useId()
  const words = normalizeText(query).split(' ').filter(Boolean)
  const matches = (tile: BrandTile) => words.every((word) => tile.hay.includes(word))
  const shownAuth = authorized.filter(matches)
  const shownOthers = others.filter(matches)
  const shownNetworks = networks.filter((network) =>
    words.every((word) => normalizeText(network.name).includes(word)),
  )

  return (
    <>
      <section
        aria-labelledby="marki-h1"
        data-surface="dark"
        className="relative mt-5 overflow-hidden rounded-[28px] bg-surface-dark px-5 py-8 text-white ring-1 ring-white/10 ring-inset sm:rounded-[36px] sm:px-12 sm:py-12"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_70%_at_85%_15%,color-mix(in_srgb,var(--accent)_38%,transparent),transparent_70%)]"
        />
        <div className="relative flex max-w-[760px] flex-col gap-5">
          <p className="flex items-center gap-2 text-xs font-black tracking-[0.12em] text-white/80 uppercase">
            <span aria-hidden="true" className="h-px w-4 bg-current" />
            {ui.brandsEyebrow}
          </p>
          <h1 id="marki-h1" className={BZ_H1}>
            {ui.brandsTitle}
          </h1>
          <p className={`${BZ_LEAD} max-w-[56ch] text-white/80`}>
            {total} {plural(total, ['marka', 'marki', 'marek'])}: {ui.brandsLead}
          </p>
          <label htmlFor={searchId} className="sr-only">
            Szukaj marki
          </label>
          <span className="relative flex max-w-[460px] items-center">
            <Icon
              name="search"
              className="pointer-events-none absolute left-4 size-5 text-white/70"
            />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={ui.brandsSearchPlaceholder}
              autoComplete="off"
              className="min-h-14 w-full rounded-2xl bg-white/8 pr-4 pl-12 font-semibold text-white ring-1 ring-white/20 ring-inset placeholder:text-white/60 focus:bg-white/12"
            />
          </span>
        </div>
      </section>

      <div className="flex flex-col gap-12 pt-10 sm:gap-14 sm:pt-12">
        {shownAuth.length > 0 && (
          <section aria-labelledby="marki-producenci" className="flex flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
              <div className="flex flex-col gap-3">
                <p className={cx(EYEBROW, 'text-accent-text')}>
                  <span aria-hidden="true" className="h-0.5 w-5 bg-current" />
                  Marki
                </p>
                <h2 id="marki-producenci" className={cx(BZ_H2, 'text-ink')}>
                  Producenci, z&nbsp;którymi pracujemy
                </h2>
              </div>
              <p className="text-sm text-ink-2">Statusy dokładnie takie, jakie nadał producent</p>
            </div>
            <ul data-auth-cards="" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-3.5">
              {shownAuth.map((tile) => (
                <li key={tile.id} className="flex min-w-0">
                  <AuthCard tile={tile} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {shownNetworks.length > 0 && (
          <section aria-labelledby="marki-sieci" data-marki-networks="">
            <PartnerNetworks networks={shownNetworks} variant="row" headingId="marki-sieci" />
          </section>
        )}

        {shownOthers.length > 0 && (
          <section aria-labelledby="marki-pozostale" className="flex flex-col gap-5">
            <div className="flex items-center gap-3.5">
              <h2 id="marki-pozostale" className={cx(EYEBROW, 'shrink-0 text-ink-2')}>
                Pozostałe marki w&nbsp;ofercie
              </h2>
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
              <span className="shrink-0 text-[13px] font-bold text-ink-2">
                {shownOthers.length} {plural(shownOthers.length, ['marka', 'marki', 'marek'])}
              </span>
            </div>
            <ul data-others-grid="" className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
              {shownOthers.map((tile) => (
                <li key={tile.id} className="flex min-w-0">
                  <BrandTileLink tile={tile} />
                </li>
              ))}
            </ul>
            <p className="text-xs text-ink-2">Logotypy należą do ich właścicieli.</p>
          </section>
        )}

        {shownAuth.length === 0 && shownOthers.length === 0 && shownNetworks.length === 0 && (
          <div
            role="status"
            className="flex flex-col items-start gap-3 rounded-3xl bg-surface-2 p-6 sm:p-8"
          >
            <h2 className={cx(BZ_H2, 'text-ink')}>{ui.brandsMissingTitle}</h2>
            <p className="max-w-[60ch] text-ink-2">{ui.brandsMissing}</p>
            <AskButton />
          </div>
        )}

        <div className="flex flex-col gap-4 rounded-3xl bg-surface-2 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex flex-col gap-1">
            <h2 className={cx(BZ_H2, 'text-ink')}>{ui.brandsOtherTitle}</h2>
            <p className="max-w-[70ch] text-ink-2">{ui.brandsOther}</p>
          </div>
          <AskButton />
        </div>
      </div>
    </>
  )
}

function Logo({
  tile,
  className,
  eager = false,
}: {
  tile: BrandTile
  className: string
  /** The header cards: above the fold. */
  eager?: boolean
}) {
  return tile.logo ? (
    <span data-logo-plate="" className={cx(PLATE, className)}>
      {/* The name is next to it: the logo is decoration here. */}
      <Image
        src={tile.logo.url}
        alt=""
        width={tile.logo.width}
        height={tile.logo.height}
        unoptimized
        loading={eager ? 'eager' : 'lazy'}
        className="max-h-[60%] w-auto max-w-full object-contain"
      />
    </span>
  ) : (
    <span
      aria-hidden="true"
      className={cx(PLATE, className, 'font-display text-lg font-extrabold text-surface-dark')}
    >
      {tile.name}
    </span>
  )
}

/** One authorisation (board): logo, the status the producer gave, the scope and a link. */
function AuthCard({ tile }: { tile: BrandTile }) {
  const status = partnerStatusLabel(tile.status)
  const service = tile.status === 'authorized-service'
  return (
    <Link
      href={tile.href}
      className="flex w-full min-w-0 flex-col gap-3 rounded-[22px] bg-surface-2 p-3 shadow-[inset_0_0_0_1px_var(--border)] transition-shadow hover:shadow-[inset_0_0_0_1.5px_var(--accent-text)] sm:p-5"
    >
      <span className="flex flex-wrap items-center justify-between gap-2">
        <Logo tile={tile} eager className="h-12 w-[96px] px-3 sm:h-14 sm:w-[112px]" />
        {status && (
          <span
            className={cx(
              'inline-flex min-h-[26px] items-center rounded-full bg-card px-2.5 text-[11px] font-extrabold whitespace-nowrap',
              service ? 'text-ok-text' : 'text-accent-text',
            )}
          >
            {status}
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <b className="font-extrabold text-ink">{tile.name}</b>
        {tile.description && (
          <small className="text-sm leading-snug text-ink-2 max-sm:line-clamp-3 max-sm:text-xs">
            {tile.description}
          </small>
        )}
      </span>
      <span className="mt-auto inline-flex items-center gap-1 text-sm font-extrabold text-accent-text">
        {/* On a phone the action stays for screen readers only — said once, not twice. */}
        <span className="max-sm:sr-only">{tile.salon ? 'Wejdź do salonu' : 'Zobacz ofertę'}</span>
        <Icon name="arrow" strokeWidth={2.4} className="size-4" />
      </span>
    </Link>
  )
}

/** A tile of „Pozostałe marki” (board): the logo, the number of items and the badge of a status. */
function BrandTileLink({ tile }: { tile: BrandTile }) {
  const status = partnerStatusLabel(tile.status)
  return (
    <Link
      href={tile.href}
      data-brand-tile={tile.slug}
      className={cx(
        'relative flex w-full min-w-0 flex-col items-center justify-center gap-1.5 rounded-[18px] bg-white px-2 pt-7 pb-2.5 transition-shadow hover:shadow-[inset_0_0_0_1.5px_var(--accent-text)] sm:min-h-[112px] sm:px-3',
        status
          ? 'shadow-[inset_0_0_0_1px_var(--border),0_0_0_3px_color-mix(in_srgb,var(--accent)_10%,transparent)]'
          : 'shadow-[inset_0_0_0_1px_var(--border)]',
      )}
    >
      {status && (
        <span
          data-brand-status=""
          className="absolute top-2 left-2 rounded-full bg-surface-dark px-2 py-0.5 text-[10px] leading-4 font-extrabold text-white"
        >
          {status}
        </span>
      )}
      {tile.logo ? (
        <Image
          src={tile.logo.url}
          alt=""
          width={tile.logo.width}
          height={tile.logo.height}
          unoptimized
          loading="lazy"
          className="h-7 w-auto max-w-[80%] object-contain sm:h-8"
        />
      ) : (
        <span
          aria-hidden="true"
          className="font-display text-base font-extrabold text-surface-dark"
        >
          {tile.name}
        </span>
      )}
      {/* A white plate in both themes: the text keeps the dark of the plate, not `ink`. */}
      <span className="text-center text-[11px] leading-tight font-bold text-surface-dark sm:text-xs">
        <span className="sr-only">{tile.name}, </span>
        {tile.count > 0
          ? `${tile.count} ${plural(tile.count, ['pozycja', 'pozycje', 'pozycji'])}`
          : 'Salon marki'}
      </span>
    </Link>
  )
}

function AskButton() {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={openCartDrawer}
      className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-accent-text px-5 font-extrabold text-accent-ink"
    >
      Zapytaj o markę
      <Icon name="arrow" strokeWidth={2.4} className="size-4" />
    </button>
  )
}
