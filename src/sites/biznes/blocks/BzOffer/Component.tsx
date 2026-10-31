import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties } from 'react'

import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { brandAsset, HORIZONTAL_LOGO_SIZE } from '@/lib/brand/lines'
import { BUNDLES_PAGE, brandLogo, type ShowcaseStatus } from '@/lib/catalog/catalogIndex'
import { fillCatalogCounts } from '@/lib/catalog/counts'
import { getCatalogIndex } from '@/lib/catalog/data'
import { groupSummaries, type GroupSummary } from '@/lib/catalog/groups'
import { BUNDLES_PATH } from '@/lib/catalog/bundle'
import { groupHref } from '@/lib/catalog/menu'
import { publicImage } from '@/lib/media/public'
import { partnerStatusLabel } from '@/lib/partners/badges'
import { shownPartner } from '@/lib/partners/shown'
import { plural } from '@/lib/plural'
import type { BzOfferBlock as BzOfferBlockData } from '@/payload-types'

import { SectionHead } from '../../components/home/SectionHead'
import { DepartmentCategories } from './DepartmentCategories'
import { SearchTile } from './SearchTile'

type Props = { block: BzOfferBlockData; tenantId: number }

const positions = (count: number) => `${count} ${plural(count, ['pozycja', 'pozycje', 'pozycji'])}`

/** Group colours are catalog data (`CatalogGroups`), as on the catalog cards. */
const iconStyle = (group: GroupSummary) => ({
  backgroundImage: `linear-gradient(145deg, ${group.gradient[0]}, ${group.gradient[1]})`,
})

function StatusRows({ rows, dark }: { rows: ShowcaseStatus[]; dark?: boolean }) {
  return (
    <ul className="flex w-full flex-col gap-2">
      {rows.map((row, i) => (
        <li
          key={i}
          className={cx(
            'flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[13px] font-extrabold',
            dark
              ? 'bg-white/5 text-white shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--c-white)_12%,transparent)]'
              : 'bg-card text-ink shadow-[0_10px_24px_-16px_var(--glow)]',
          )}
        >
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={cx(
                'size-2 shrink-0 rounded-full',
                row.tone === 'ok' ? 'bg-ok' : 'bg-promo',
              )}
            />
            {row.label}
          </span>
          <span className={cx('text-xs font-bold', dark ? 'text-white/70' : 'text-ink-3')}>
            {row.value}
          </span>
        </li>
      ))}
    </ul>
  )
}

type Department = GroupSummary & { categories: { slug: string; name: string; count: number }[] }

/** Board `#s4-dz`: six categories at once, the rest after „Wszystkie kategorie · N”. */
const VISIBLE_CATEGORIES = 6

function DepartmentCard({ group }: { group: Department }) {
  const [big, small] = group.showcase?.images ?? []
  const statuses = group.showcase?.statuses ?? []
  return (
    <article className="group/dept flex flex-col overflow-hidden rounded-[26px] bg-card shadow-[inset_0_0_0_1px_var(--border)] transition-[box-shadow,translate] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-30px_var(--glow),inset_0_0_0_1px_var(--border)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="relative h-[170px] overflow-hidden" style={iconStyle(group)}>
        <span
          aria-hidden="true"
          className="absolute top-3.5 left-3.5 z-[2] flex size-10 items-center justify-center rounded-xl bg-white/20 text-white shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--c-white)_25%,transparent)]"
        >
          <Icon name={group.icon} className="size-5" />
        </span>
        <span className="absolute top-3.5 right-3.5 z-[2] rounded-full bg-white px-2.5 py-1 text-xs font-extrabold text-surface-dark">
          {positions(group.count)}
        </span>
        {statuses.length > 0 ? (
          <div className="absolute inset-x-3.5 top-[62px]">
            <StatusRows rows={statuses} />
          </div>
        ) : (
          <>
            {small && (
              <Image
                src={small.url}
                alt=""
                width={small.width}
                height={small.height}
                unoptimized
                className="absolute right-4 bottom-2 h-[62%] w-auto max-w-[40%] object-contain drop-shadow-[0_14px_18px_var(--glow)] transition-transform duration-300 group-hover/dept:-translate-y-1 motion-reduce:transition-none"
              />
            )}
            {big && (
              <Image
                src={big.url}
                alt=""
                width={big.width}
                height={big.height}
                unoptimized
                className="absolute bottom-1 left-[22%] h-[80%] w-auto max-w-[52%] object-contain drop-shadow-[0_18px_22px_var(--glow)] transition-transform duration-300 group-hover/dept:-translate-y-1.5 motion-reduce:transition-none"
              />
            )}
          </>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-[22px] leading-[1.15] font-extrabold text-balance font-stretch-108%">
          {group.name}
        </h3>
        {group.description && (
          <p className="mt-1.5 text-[14px] leading-normal text-ink-2">{group.description}</p>
        )}
        <DepartmentCategories
          groupName={group.name}
          categories={group.categories}
          visible={VISIBLE_CATEGORIES}
          allHref={groupHref(group.slug)}
          style={{ '--dept': group.gradient[0] } as CSSProperties}
        />
      </div>
    </article>
  )
}

function DepartmentRow({ group }: { group: GroupSummary }) {
  return (
    <li>
      <Link
        href={groupHref(group.slug)}
        className="flex items-center gap-4 rounded-[20px] bg-card p-3.5 shadow-[inset_0_0_0_1px_var(--border)]"
      >
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-[14px] text-white"
          style={iconStyle(group)}
        >
          <Icon name={group.icon} className="size-6" />
        </span>
        <span className="flex flex-col">
          <span className="font-display text-[17px] leading-tight font-extrabold">
            {group.name}
          </span>
          <span className="mt-0.5 text-[13px] font-bold text-ink-2">{positions(group.count)}</span>
        </span>
      </Link>
    </li>
  )
}

type System = NonNullable<BzOfferBlockData['systems']>[number]

type SystemCardProps = { system: System; tenantId: number; headingLevel: 'h3' | 'h4' }

function SystemCard({ system, tenantId, headingLevel: Title }: SystemCardProps) {
  const statuses = system.mode === 'statuses' ? (system.statuses ?? []) : []
  const image = system.mode === 'statuses' ? null : publicImage(system.image, tenantId)
  const partner = shownPartner(system.partner, tenantId)
  const logo = partner ? brandLogo(partner) : undefined
  // With a partner the badge is its status confirmed in the panel ([SZEF]), never free text.
  const badge = system.partner ? partnerStatusLabel(partner?.partnerStatus) : system.badge
  return (
    <article
      data-surface="dark"
      className="flex flex-col overflow-hidden rounded-[26px] bg-surface-dark p-6 text-white"
    >
      <div className="flex h-[180px] items-center justify-center">
        {statuses.length > 0 ? (
          <div className="w-full max-w-[290px]">
            <StatusRows rows={statuses} dark />
          </div>
        ) : image ? (
          <MediaImage
            image={image}
            sizes="(min-width: 1080px) 280px, 70vw"
            className="h-full w-auto max-w-full object-contain"
          />
        ) : null}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex h-8 items-center rounded-lg bg-white px-2.5">
          {logo ? (
            <Image
              src={logo.url}
              alt={partner?.name ?? ''}
              width={logo.width}
              height={logo.height}
              unoptimized
              className="h-auto max-h-5 w-auto max-w-[96px] object-contain"
            />
          ) : (
            <Image
              src={brandAsset('biznes', 'poziome_kolor.svg')}
              alt="PRO-KOM Biznes"
              {...HORIZONTAL_LOGO_SIZE}
              className="h-5 w-auto"
            />
          )}
        </span>
        {badge && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[13px] font-bold text-white">
            <Icon name="check" strokeWidth={2.4} className="size-3.5 text-ok" />
            {badge}
          </span>
        )}
      </div>
      <Title className="mt-3 font-display text-[22px] leading-tight font-extrabold text-white">
        {system.title}
      </Title>
      <p className="mt-2.5 text-[15px] leading-relaxed text-white/80">{system.text}</p>
      <Link
        href={system.link.href}
        className="mt-auto inline-flex min-h-11 items-center gap-2 self-start pt-4 font-extrabold text-white hover:underline"
      >
        {system.link.label}
        <Icon name="arrow" strokeWidth={2.4} className="size-[18px]" />
      </Link>
    </article>
  )
}

/** `bundles`: the site shows ready bundles (`/zestawy` exists only then). */
const SHORTCUTS = (products: number, bundles: boolean) => [
  {
    label: 'Plan Twojej firmy',
    note: 'urządzenia na planie lokalu',
    href: '/#plan',
    icon: 'map' as const,
  },
  ...(bundles
    ? [
        {
          label: 'Gotowe zestawy',
          note: 'sklep, lokal, biuro, pensjonat',
          href: BUNDLES_PATH,
          icon: 'box' as const,
        },
      ]
    : []),
  {
    label: `Cała oferta · ${products}`,
    note: 'filtry, marki, branże',
    href: '/oferta',
    icon: 'grid' as const,
  },
]

/**
 * „Działy oferty” and „Systemy” (board v150 `#s4-dz`, `#s4-sys`; K36 §1): five department cards
 * from the catalog with their categories (on a phone one row each), a sixth tile with the site
 * search, then the three flagship systems — one card component, navy in both themes.
 */
export async function BzOfferBlock({ block, tenantId }: Props) {
  const index = await getCatalogIndex(tenantId)
  const departments: Department[] = groupSummaries(index).map((group) => ({
    ...group,
    // The panel's order, as in the catalog menu (`index.categories`).
    categories: index.categories
      .filter((category) => category.group === group.slug)
      .map(({ slug, name, count }) => ({ slug, name, count })),
  }))
  const counts = { products: index.products.length, brands: index.brands.length }
  const systems = block.systems ?? []
  const eyebrow = block.eyebrow
    ? `${block.eyebrow} · ${departments.length} ${plural(departments.length, ['dział', 'działy', 'działów'])} · ${positions(counts.products)}`
    : null

  return (
    <section id="oferta" aria-labelledby="oferta-h" className="bg-card py-16 sm:py-24">
      <Container wide>
        <SectionHead
          id="oferta-h"
          eyebrow={eyebrow}
          heading={block.heading}
          lead={block.lead ? fillCatalogCounts(block.lead, counts) : null}
          action={
            block.catalogLabel
              ? { label: `${block.catalogLabel} · ${positions(counts.products)}`, href: '/oferta' }
              : null
          }
        />
        {departments.length > 0 && (
          <>
            <ul className="mt-10 flex flex-col gap-2.5 min-[640px]:hidden">
              {departments.map((group) => (
                <DepartmentRow key={group.slug} group={group} />
              ))}
            </ul>
            <div className="mt-10 grid gap-4 max-[639px]:mt-4 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-3">
              {departments.map((group) => (
                <div key={group.slug} className="hidden min-[640px]:flex [&>article]:flex-1">
                  <DepartmentCard group={group} />
                </div>
              ))}
              {block.searchHeading && (
                <SearchTile
                  eyebrow={block.searchEyebrow ?? null}
                  heading={block.searchHeading}
                  searchLabel={`Szukaj w ${counts.products} ${plural(counts.products, ['pozycji', 'pozycjach', 'pozycjach'])}`}
                  popular={index.search.popular}
                  shortcuts={SHORTCUTS(
                    counts.products,
                    index.pages.some((page) => page.slug === BUNDLES_PAGE.slug),
                  )}
                />
              )}
            </div>
          </>
        )}

        {systems.length > 0 && (
          // „Systemy i opieka IT” of the side rail (K36 §1).
          <div id="systemy" className="mt-16 scroll-mt-24">
            {(block.systemsHeading || block.systemsNote) && (
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                {block.systemsHeading && (
                  <h3 className="font-display text-[clamp(1.5rem,2.2vw,1.85rem)] leading-tight font-extrabold text-balance font-stretch-108%">
                    {block.systemsHeading}
                  </h3>
                )}
                {block.systemsNote && <p className="text-[15px] text-ink-3">{block.systemsNote}</p>}
              </div>
            )}
            <div className="grid gap-4 min-[1080px]:grid-cols-3">
              {systems.map((system, i) => (
                <SystemCard
                  key={system.id ?? i}
                  system={system}
                  tenantId={tenantId}
                  // No sub-heading above the cards: they sit right under the section's h2.
                  headingLevel={block.systemsHeading ? 'h4' : 'h3'}
                />
              ))}
            </div>
          </div>
        )}
      </Container>
    </section>
  )
}
