'use client'

import { CONFIGURATOR_PATH } from '@/lib/catalog/wizardEngine'
import { PLAN_PATH } from '@/lib/catalog/floorPlan'
import Image from 'next/image'
import Link from 'next/link'
import { type KeyboardEvent, useId, useRef, useState } from 'react'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { BUNDLES_PATH } from '@/lib/catalog/bundle'
import { BRANDS_PATH } from '@/lib/catalog/filters'
import type { OfferMenu } from '@/lib/catalog/menu'
import type { IconName } from '@/lib/catalog/options'
import { plural } from '@/lib/plural'

type Props = {
  offer: OfferMenu
  /** Main phone of the line; `null` hides „Wolisz zapytać?”. */
  phone: { label: string; href: string } | null
  /** Opening hours in short, e.g. „pn–pt 9–17”. */
  hours: string | null
}

const items = (n: number) => `${n} ${plural(n, ['pozycja', 'pozycje', 'pozycji'])}`

const CONFIGURATOR_HREF = CONFIGURATOR_PATH
const PLAN_HREF = PLAN_PATH
const ALL_BRANDS_HREF = BRANDS_PATH

/**
 * Oferta ▾ of K4 (K35 7a, mega menu v147c): departments on the left (hover or focus switches the
 * middle), categories of the department with a product picture and „Marki w dziale”, and four
 * shortcut cards with the phone on the right. 1080–1279 px: the cards go in one row below.
 */
export function MegaMenuPanel({ offer, phone, hours }: Props) {
  const [active, setActive] = useState(0)
  const id = useId()
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  // Tabs pattern (WAI-ARIA APG): only the active department is in the Tab order, arrows move
  // between departments and show them, so Tab goes on into the categories of the shown one.
  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = offer.departments.length - 1
    const next =
      event.key === 'ArrowDown' || event.key === 'ArrowRight'
        ? i === last
          ? 0
          : i + 1
        : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
          ? i === 0
            ? last
            : i - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null
    if (next === null) return
    event.preventDefault()
    setActive(next)
    tabs.current[next]?.focus()
  }
  const department = offer.departments[active] ?? offer.departments[0]
  if (!department) return null
  const { totals } = offer
  const shortcuts: {
    label: string
    text: string
    href: string
    icon: IconName
    tile: string
    featured?: true
  }[] = [
    {
      label: 'Konfigurator',
      text: 'Dobierzemy rozwiązanie w około minutę',
      href: CONFIGURATOR_HREF,
      icon: 'star',
      tile: 'bg-white/15 text-white',
      featured: true,
    },
    {
      label: 'Gotowe zestawy',
      text:
        totals.bundles > 0
          ? `${totals.bundles} ${plural(totals.bundles, ['zestaw', 'zestawy', 'zestawów'])}: sklep, gastronomia, biuro, hotel`
          : 'Sklep, gastronomia, biuro, hotel',
      href: BUNDLES_PATH,
      icon: 'box',
      tile: 'bg-ok text-white',
    },
    {
      label: 'Plan Twojej firmy',
      text: 'Kliknij urządzenie na planie lokalu',
      href: PLAN_HREF,
      icon: 'map',
      tile: 'bg-[var(--c-instalacje)] text-white',
    },
    {
      label: 'Cała oferta',
      text: `${items(totals.products)} · filtry po marce i branży`,
      href: '/oferta',
      icon: 'grid',
      tile: 'bg-accent text-white',
    },
  ]

  return (
    <div className="max-h-[calc(100vh-7.5rem)] overflow-auto border-t border-border bg-card shadow-2xl">
      <Container
        wide
        className="grid grid-cols-[16.5rem_minmax(0,1fr)] gap-x-8 py-6 min-[1280px]:grid-cols-[16.5rem_minmax(0,1fr)_18rem]"
      >
        {/* Departments */}
        <div className="border-r border-border pr-6">
          <p
            id={`${id}-departments`}
            className="mb-3 px-3 text-xs font-extrabold tracking-[0.14em] text-ink-2 uppercase"
          >
            Działy
          </p>
          <ul
            role="tablist"
            aria-orientation="vertical"
            aria-labelledby={`${id}-departments`}
            className="space-y-1"
          >
            {offer.departments.map((item, i) => {
              const current = i === active
              return (
                <li key={item.slug} role="presentation">
                  <button
                    ref={(element) => {
                      tabs.current[i] = element
                    }}
                    type="button"
                    role="tab"
                    id={`${id}-tab-${i}`}
                    aria-selected={current}
                    aria-controls={`${id}-panel`}
                    tabIndex={current ? 0 : -1}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => setActive(i)}
                    onKeyDown={(event) => onTabKey(event, i)}
                    className={cx(
                      'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left',
                      current
                        ? 'border-border bg-surface-2'
                        : 'border-transparent hover:bg-surface-2',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-white"
                      // Department colours are data of the record (ADR-012, 18.10).
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})`,
                      }}
                    >
                      <Icon name={item.icon} className="size-[18px]" strokeWidth={2} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display leading-tight font-extrabold text-ink">
                        {item.name}
                      </span>
                      <span className="block text-sm text-ink-2">{items(item.count)}</span>
                    </span>
                    {current && <Icon name="arrow" className="size-4 shrink-0 text-accent-text" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Categories of the department */}
        <section
          id={`${id}-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${active}`}
          className="min-w-0"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-xl">
              <p className="text-xs font-extrabold tracking-[0.14em] text-ink-2 uppercase">
                Dział {active + 1} z {offer.departments.length}
              </p>
              <h2 className="font-display text-2xl leading-tight font-extrabold text-ink">
                {department.name}
              </h2>
              {department.description && (
                <p className="mt-1 text-ink-2">{department.description}</p>
              )}
            </div>
            <Link
              href={department.href}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-4 py-2 font-bold text-accent-text hover:bg-surface"
            >
              Cały dział · {items(department.count)}
              <Icon name="arrow" className="size-4" />
            </Link>
          </div>

          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {department.categories.map((category) => (
              <li key={category.href}>
                <Link
                  href={category.href}
                  className="group flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 hover:border-accent"
                >
                  <span className="inline-flex size-[50px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-2">
                    {category.image ? (
                      <Image
                        src={category.image.url}
                        alt=""
                        width={category.image.width}
                        height={category.image.height}
                        unoptimized
                        className="max-h-11 w-auto object-contain"
                      />
                    ) : (
                      <Icon name={department.icon} className="size-5 text-ink-2" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] leading-tight font-bold text-ink">
                      {category.label}
                    </span>
                    <span className="block text-sm text-ink-2">{items(category.count)}</span>
                  </span>
                  <Icon
                    name="arrow"
                    className="size-4 shrink-0 text-accent-text opacity-0 group-hover:opacity-100"
                  />
                </Link>
              </li>
            ))}
          </ul>

          {department.brands.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <p className="mr-2 text-xs font-extrabold tracking-[0.14em] text-ink-2 uppercase">
                Marki w dziale
              </p>
              {department.brands.map((brand) => (
                <span
                  key={brand.slug}
                  // Brand logos stay on light tiles in both themes (K35 §6).
                  className="inline-flex h-8 w-[76px] items-center justify-center rounded-lg border border-border bg-white px-2"
                >
                  <Image
                    src={brand.logo.url}
                    alt={brand.name}
                    width={brand.logo.width}
                    height={brand.logo.height}
                    unoptimized
                    className="max-h-5 w-auto object-contain"
                  />
                </span>
              ))}
              <Link
                href={ALL_BRANDS_HREF}
                className="ml-1 inline-flex items-center gap-1 text-sm font-bold text-ink hover:underline"
              >
                Wszystkie · {totals.brands}
                <Icon name="arrow" className="size-3.5" />
              </Link>
            </div>
          )}
        </section>

        {/* Shortcuts: a column from 1280 px, a row of four below */}
        <div className="col-span-full mt-6 border-t border-border pt-6 min-[1280px]:col-span-1 min-[1280px]:mt-0 min-[1280px]:border-t-0 min-[1280px]:border-l min-[1280px]:pt-0 min-[1280px]:pl-6">
          <p className="mb-3 text-xs font-extrabold tracking-[0.14em] text-ink-2 uppercase">
            Na skróty
          </p>
          <ul className="grid grid-cols-4 gap-2.5 min-[1280px]:grid-cols-1">
            {shortcuts.map((card) => (
              <li key={card.label}>
                <Link
                  href={card.href}
                  className={cx(
                    'flex h-full items-center gap-3 rounded-2xl px-3.5 py-3',
                    card.featured
                      ? 'bg-linear-to-br from-[var(--c-software-text)] to-[var(--c-biznes)] text-white'
                      : 'bg-surface-2 text-ink hover:bg-surface',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cx(
                      'inline-flex size-10 shrink-0 items-center justify-center rounded-xl',
                      card.tile,
                    )}
                  >
                    <Icon name={card.icon} className="size-5" strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display leading-tight font-extrabold">
                      {card.label}
                    </span>
                    <span
                      className={cx(
                        'block text-sm leading-snug',
                        card.featured ? 'text-white' : 'text-ink-2',
                      )}
                    >
                      {card.text}
                    </span>
                  </span>
                  <Icon name="arrow" className="size-4 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
          {phone && (
            <p className="mt-5 hidden items-start gap-3 border-t border-border pt-4 min-[1280px]:flex">
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-surface-2 text-accent-text">
                <Icon name="phone" className="size-4" />
              </span>
              <span className="flex-1 text-sm text-ink-2">
                Wolisz zapytać?
                <a href={phone.href} className="block font-extrabold text-ink hover:underline">
                  {phone.label}
                </a>
                {hours && <span className="block">{hours}</span>}
              </span>
            </p>
          )}
        </div>
      </Container>
    </div>
  )
}
