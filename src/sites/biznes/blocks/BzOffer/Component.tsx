import Image from 'next/image'
import type { CSSProperties } from 'react'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { fillCatalogCounts } from '@/lib/catalog/counts'
import { getCatalogIndex } from '@/lib/catalog/data'
import { brandCount } from '@/lib/catalog/filters'
import { groupSummaries, type GroupSummary } from '@/lib/catalog/groups'
import { groupHref } from '@/lib/catalog/menu'
import { plural } from '@/lib/plural'
import type { BzOfferBlock as BzOfferBlockData } from '@/payload-types'

import { SectionHead } from '../../components/home/SectionHead'
import { StatusRows } from '../../components/home/StatusRows'
import { DepartmentCategories } from './DepartmentCategoriesLazy'
import { SearchTile } from './SearchTileLazy'

type Props = { block: BzOfferBlockData; tenantId: number }

const positions = (count: number) => `${count} ${plural(count, ['pozycja', 'pozycje', 'pozycji'])}`

/** Group colours are catalog data (`CatalogGroups`), as on the catalog cards. */
const iconStyle = (group: GroupSummary) => ({
  backgroundImage: `linear-gradient(145deg, ${group.gradient[0]}, ${group.gradient[1]})`,
})

type Department = GroupSummary & { categories: { slug: string; name: string; count: number }[] }

/** Board `#s4-dz`: six categories at once, the rest after „Wszystkie kategorie · N”. */
const VISIBLE_CATEGORIES = 6
/** Phone card (board App-Start `.m5d`): four. */
const VISIBLE_CATEGORIES_PHONE = 4

function DepartmentCard({ group, phone = false }: { group: Department; phone?: boolean }) {
  // Product pictures of the department (audit 0611 P0.5): their `alt` from the panel's image,
  // which the seed fills with the product name (`seed/biznes/map.ts`, not always with the brand).
  const [big, small] = group.showcase?.images ?? []
  const statuses = group.showcase?.statuses ?? []
  return (
    <article className="group/dept flex flex-col overflow-hidden rounded-[26px] bg-card shadow-[inset_0_0_0_1px_var(--border)] transition-[box-shadow,translate] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-30px_var(--glow),inset_0_0_0_1px_var(--border)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div
        className={cx('relative overflow-hidden', phone ? 'h-[140px]' : 'h-[170px]')}
        style={iconStyle(group)}
      >
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
                alt={small.alt}
                width={small.width}
                height={small.height}
                unoptimized
                className="absolute right-4 bottom-2 h-[62%] w-auto max-w-[40%] object-contain drop-shadow-[0_14px_18px_var(--glow)] transition-transform duration-300 group-hover/dept:-translate-y-1 motion-reduce:transition-none"
              />
            )}
            {big && (
              <Image
                src={big.url}
                alt={big.alt}
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
          visible={phone ? VISIBLE_CATEGORIES_PHONE : VISIBLE_CATEGORIES}
          allHref={groupHref(group.slug)}
          style={{ '--dept': group.gradient[0] } as CSSProperties}
        />
      </div>
    </article>
  )
}

/**
 * „Działy oferty” and „Systemy” (board v150 `#s4-dz`, `#s4-sys`; K36 §1): five department cards
 * from the catalog with their categories, a sixth tile with the site search, then the three
 * flagship systems — one card component, navy in both themes. Below 768 px (board App-Start):
 * the department cards in a row to swipe; the search is in the hero, the systems have their pages.
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
  const counts = { products: index.products.length, brands: brandCount(index) }
  const eyebrow = block.eyebrow
    ? `${block.eyebrow} · ${departments.length} ${plural(departments.length, ['dział', 'działy', 'działów'])} · ${positions(counts.products)}`
    : null

  return (
    <section
      id="oferta"
      aria-labelledby="oferta-h"
      className="bg-card py-6 max-md:bg-transparent md:py-24"
    >
      <Container wide>
        <SectionHead
          id="oferta-h"
          eyebrow={eyebrow}
          heading={block.heading}
          appOnPhone
          phoneAction="Cała oferta"
          lead={block.lead ? fillCatalogCounts(block.lead, counts) : null}
          action={
            block.catalogLabel
              ? { label: `${block.catalogLabel} · ${positions(counts.products)}`, href: '/oferta' }
              : null
          }
        />
        {departments.length > 0 && (
          <>
            <ul className="-mx-4 mt-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:hidden">
              {departments.map((group) => (
                <li
                  key={group.slug}
                  // `relative`: the cards' `sr-only` texts stay inside the row, not past the page.
                  className="relative flex w-[284px] shrink-0 snap-start [&>article]:flex-1"
                >
                  <DepartmentCard group={group} phone />
                </li>
              ))}
            </ul>
            {/* P3: the cards rise in one by one (`data-reveal-cards`, motion.css §3); the search
                island sits in its own box, so the observer never marks a lazy root. */}
            <div
              data-reveal-cards=""
              className="mt-10 grid gap-4 max-md:hidden min-[640px]:grid-cols-2 min-[1080px]:grid-cols-3"
            >
              {departments.map((group) => (
                <div key={group.slug} className="flex [&>article]:flex-1">
                  <DepartmentCard group={group} />
                </div>
              ))}
              {block.searchHeading && (
                <div className="flex [&>article]:flex-1">
                  <SearchTile
                    eyebrow={block.searchEyebrow ?? null}
                    heading={block.searchHeading}
                    searchLabel={`Szukaj w ${counts.products} ${plural(counts.products, ['pozycji', 'pozycjach', 'pozycjach'])}`}
                    popular={index.search.popular}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </Container>
    </section>
  )
}
