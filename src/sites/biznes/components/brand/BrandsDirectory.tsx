'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useId, useState } from 'react'

import { Icon } from '@/components/ui/Icon'
import { cx } from '@/components/ui/cx'
import type { BrandsGroup, BrandTile } from '@/lib/catalog/brandsPage'
import { normalizeText } from '@/lib/catalog/normalize'
import { openCartDrawer } from '@/lib/cart/store'
import { partnerStatusLabel } from '@/lib/partners/badges'
import { plural } from '@/lib/plural'

import { PathIcon } from '../product/PathIcon'
import { ProductStage, STAGE_SHADOW } from '../ProductStage'

const ALL = 'all'

// Logos are made for a light background: a white plate in both themes (as `BrandsHome`).
const PLATE =
  'flex items-center justify-center rounded-2xl bg-white shadow-[inset_0_0_0_1px_var(--border)]'

/**
 * Header, search, group tabs and tiles of `/marki` (board `Web-Marki`). The search filters live
 * by name and description without diacritics; a tab shows one group (it filters, no scroll).
 * Everything renders on the server too — the island only filters.
 */
export function BrandsDirectory({
  total,
  groups,
  authorized,
}: {
  total: number
  groups: BrandsGroup[]
  authorized: BrandTile[]
}) {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState(ALL)
  const searchId = useId()
  const words = normalizeText(query).split(' ').filter(Boolean)
  const matches = (tile: BrandTile) => words.every((word) => tile.hay.includes(word))
  const shown = groups
    .map((group, i) => ({ group, key: String(i), tiles: group.tiles.filter(matches) }))
    .filter(({ key, tiles }) => tiles.length > 0 && (tab === ALL || tab === key))
  const allCount = new Set(groups.flatMap((group) => group.tiles.map((tile) => tile.id))).size

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
        <div className="relative grid items-center gap-8 min-[1080px]:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-5">
            <p className="flex items-center gap-2 text-xs font-black tracking-[0.12em] text-white/80 uppercase">
              <span aria-hidden="true" className="h-px w-4 bg-current" />
              Salony marek
            </p>
            <h1
              id="marki-h1"
              className="font-display text-[clamp(2.1rem,4vw,3.6rem)] leading-[1.02] font-extrabold tracking-[-0.025em] text-balance"
            >
              Marki, które znamy od&nbsp;środka.
            </h1>
            <p className="max-w-[56ch] text-[clamp(1rem,1.3vw,1.15rem)] leading-relaxed text-white/80">
              {total} {plural(total, ['marka', 'marki', 'marek'])}: od kas fiskalnych po serwery.
              Przy każdej pomożemy wybrać model, wdrożymy i&nbsp;zajmiemy się serwisem —
              a&nbsp;salony producentów pokazują serie, porównania i&nbsp;gotowe konfiguracje.
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
                placeholder="Szukaj marki, np. Posnet, Apple, UniFi"
                autoComplete="off"
                className="min-h-14 w-full rounded-2xl bg-white/8 pr-4 pl-12 font-semibold text-white ring-1 ring-white/20 ring-inset placeholder:text-white/60 focus:bg-white/12"
              />
            </span>
          </div>
          {authorized.length > 0 && (
            <ul className="grid gap-3 min-[560px]:grid-cols-2">
              {authorized.map((tile) => (
                <li key={tile.id} className="flex">
                  <Link
                    href={tile.href}
                    className="flex w-full items-center gap-4 rounded-2xl bg-white/6 p-3 ring-1 ring-white/15 ring-inset transition-colors hover:bg-white/10"
                  >
                    <Logo tile={tile} eager className="h-14 w-[86px] shrink-0 px-2" />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-[11px] leading-tight font-black tracking-[0.08em] text-accent-on-dark uppercase">
                        {partnerStatusLabel(tile.status)}
                      </span>
                      <b className="font-extrabold">{tile.name}</b>
                      {tile.description && (
                        <small className="text-sm leading-snug text-white/70">
                          {tile.description}
                        </small>
                      )}
                    </span>
                    <Icon
                      name="arrow"
                      strokeWidth={2.4}
                      className="size-4 shrink-0 text-white/80"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="sticky top-[74px] z-20 sm:top-[84px] mt-6 rounded-2xl bg-card/95 p-1.5 shadow-[inset_0_0_0_1px_var(--border)] backdrop-blur">
        <div role="group" aria-label="Grupy marek" className="flex gap-1 overflow-x-auto">
          <Tab
            active={tab === ALL}
            onClick={() => setTab(ALL)}
            label="Wszystkie"
            count={allCount}
          />
          {groups.map((group, i) => (
            <Tab
              key={i}
              active={tab === String(i)}
              onClick={() => setTab(String(i))}
              label={group.short}
              count={group.tiles.length}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-12 pt-10">
        {shown.map(({ group, key, tiles }) => (
          <section key={key} aria-labelledby={`marki-g${key}`} className="flex flex-col gap-5">
            <div className="flex items-start gap-4">
              {group.iconPath && (
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-accent-text">
                  <PathIcon d={group.iconPath} className="size-5" />
                </span>
              )}
              <div className="flex flex-col gap-1">
                <h2
                  id={`marki-g${key}`}
                  className="font-display text-2xl font-extrabold text-balance text-ink"
                >
                  {group.title}
                </h2>
                {group.description && <p className="text-ink-2">{group.description}</p>}
              </div>
            </div>
            <ul className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,285px),1fr))]">
              {tiles.map((tile) => (
                <li key={tile.id} className="flex">
                  <BrandCard tile={tile} />
                </li>
              ))}
            </ul>
          </section>
        ))}

        {shown.length === 0 && (
          <div
            role="status"
            className="flex flex-col items-start gap-3 rounded-3xl bg-surface-2 p-6 sm:p-8"
          >
            <h2 className="font-display text-2xl font-extrabold text-ink">
              Nie mamy jeszcze salonu tej marki
            </h2>
            <p className="max-w-[60ch] text-ink-2">
              Dostarczamy więcej marek, niż pokazujemy. Napisz, czego szukasz — sprawdzimy
              u&nbsp;dystrybutorów.
            </p>
            <AskButton />
          </div>
        )}

        <div className="flex flex-col gap-4 rounded-3xl bg-surface-2 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-xl font-extrabold text-ink">Szukasz innej marki?</h2>
            <p className="max-w-[70ch] text-ink-2">
              Współpracujemy z&nbsp;dystrybutorami sprzętu i&nbsp;oprogramowania w&nbsp;całej Polsce
              — sprawdzimy dostępność i&nbsp;przygotujemy ofertę.
            </p>
          </div>
          <AskButton />
        </div>
      </div>
    </>
  )
}

function Tab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cx(
        'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-extrabold whitespace-nowrap transition-colors',
        active ? 'bg-ink text-surface' : 'text-ink hover:bg-surface-2',
      )}
    >
      {label}
      <span className={cx('text-xs', active ? 'opacity-80' : 'text-ink-2')}>{count}</span>
    </button>
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
    <span className={cx(PLATE, className)}>
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

function BrandCard({ tile }: { tile: BrandTile }) {
  const role = partnerStatusLabel(tile.status)
  return (
    <Link
      href={tile.href}
      aria-label={`${tile.name} — ${tile.salon ? 'wejdź do salonu' : 'zobacz ofertę'}`}
      className="relative flex w-full flex-col gap-3 rounded-3xl bg-card p-4 shadow-[0_20px_50px_-34px_var(--glow),inset_0_0_0_1px_var(--border)] transition-shadow hover:shadow-[0_20px_50px_-34px_var(--glow),inset_0_0_0_1.5px_var(--accent-text)]"
    >
      {tile.salon && (
        <span className="absolute top-5 right-5 z-10 rounded-full bg-ink px-2.5 py-1 text-[11px] font-black tracking-[0.06em] text-surface uppercase">
          Salon
        </span>
      )}
      <Logo tile={tile} className="h-[76px] px-4" />
      <span className="flex flex-col gap-0.5">
        <b className="font-extrabold text-ink">{tile.name}</b>
        {tile.description && (
          <small className="text-sm leading-snug text-ink-2">{tile.description}</small>
        )}
      </span>
      {tile.photos.length > 0 && (
        <span aria-hidden="true" className="grid grid-cols-3 gap-1.5">
          {tile.photos.map((photo) => (
            <ProductStage key={photo.url} as="span" className="aspect-square rounded-xl">
              <Image
                src={photo.url}
                alt=""
                width={photo.width}
                height={photo.height}
                unoptimized
                className={cx(
                  'relative max-h-[78%] w-auto max-w-[80%] object-contain',
                  STAGE_SHADOW,
                )}
              />
            </ProductStage>
          ))}
        </span>
      )}
      <span className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-extrabold">
        {role && (
          <em className="rounded-lg bg-surface-2 px-2 py-1 text-ok-text not-italic">{role}</em>
        )}
        {tile.count > 0 && (
          <span className="text-ink-2">
            {tile.count} {plural(tile.count, ['pozycja', 'pozycje', 'pozycji'])}
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-1 text-sm text-accent-text">
          {tile.salon ? 'Wejdź do salonu' : 'Zobacz ofertę'}
          <Icon name="arrow" strokeWidth={2.4} className="size-4" />
        </span>
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
