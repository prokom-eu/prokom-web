import Image from 'next/image'
import Link from 'next/link'

import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { brandAsset, HORIZONTAL_LOGO_SIZE } from '@/lib/brand/lines'
import { brandLogo, type ShowcaseStatus } from '@/lib/catalog/catalogIndex'
import { fillCatalogCounts } from '@/lib/catalog/counts'
import { getCatalogIndex } from '@/lib/catalog/data'
import { groupSummaries, type GroupSummary } from '@/lib/catalog/groups'
import { groupHref } from '@/lib/catalog/menu'
import { publicImage } from '@/lib/media/public'
import { partnerStatusLabel } from '@/lib/partners/badges'
import { plural } from '@/lib/plural'
import { tenantIdOf } from '@/lib/tenant/id'
import type { BzOfferBlock as BzOfferBlockData, Partner } from '@/payload-types'

import { SectionHead } from '../../components/home/SectionHead'

type Props = { block: BzOfferBlockData; tenantId: number }

const positions = (count: number) => `${count} ${plural(count, ['pozycja', 'pozycje', 'pozycji'])}`

const categoryHref = (slug: string) => `/oferta/${encodeURIComponent(slug)}`

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

function DepartmentCard({ group }: { group: GroupSummary }) {
  const [big, small] = group.showcase?.images ?? []
  const statuses = group.showcase?.statuses ?? []
  return (
    <article className="group/dept flex flex-col rounded-[26px] bg-card p-2 shadow-[inset_0_0_0_1px_var(--border)] transition-[box-shadow,translate] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-30px_var(--glow),inset_0_0_0_1px_var(--border)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div
        className="relative h-[150px] overflow-hidden rounded-[19px] bg-surface-2"
        style={{
          backgroundImage: `linear-gradient(160deg, color-mix(in srgb, ${group.gradient[1]} 22%, var(--surface-2)), var(--surface-2) 75%)`,
        }}
      >
        {statuses.length > 0 ? (
          <div className="absolute inset-x-3 top-3">
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
                className="absolute top-3 right-3 h-[52%] w-auto max-w-[45%] object-contain drop-shadow-[0_14px_18px_var(--glow)] transition-transform duration-300 group-hover/dept:-translate-y-1 motion-reduce:transition-none"
              />
            )}
            {big && (
              <Image
                src={big.url}
                alt=""
                width={big.width}
                height={big.height}
                unoptimized
                className="absolute bottom-1 left-3 h-[78%] w-auto max-w-[62%] object-contain drop-shadow-[0_18px_22px_var(--glow)] transition-transform duration-300 group-hover/dept:-translate-y-1.5 motion-reduce:transition-none"
              />
            )}
          </>
        )}
      </div>
      <span
        aria-hidden="true"
        className="relative z-[3] -mt-[23px] ml-3.5 flex size-[46px] items-center justify-center rounded-[14px] text-white shadow-[0_0_0_4px_var(--card)]"
        style={iconStyle(group)}
      >
        <Icon name={group.icon} className="size-[22px]" />
      </span>
      <div className="flex flex-1 flex-col px-3.5 pt-3">
        <h3 className="min-h-[2.4em] font-display text-lg leading-[1.2] font-extrabold font-stretch-108%">
          {group.name}
        </h3>
        {group.description && (
          <p className="mt-1 text-[14.5px] leading-normal text-ink-2">{group.description}</p>
        )}
        {group.topCategories.length > 0 && (
          <ul className="mt-3.5 border-t border-border pt-2.5">
            {group.topCategories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={categoryHref(category.slug)}
                  className="flex items-center justify-between gap-2 py-1.5 text-[14.5px] leading-snug font-bold text-ink transition-colors hover:text-accent-text"
                >
                  {category.name}
                  <span className="min-w-[22px] rounded-[7px] bg-surface-2 px-[7px] py-0.5 text-center text-xs font-bold text-ink-2">
                    {category.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Link
        href={groupHref(group.slug)}
        className="group/all mt-3 flex items-center justify-between gap-1.5 rounded-[14px] bg-surface-2 px-3.5 py-3 text-sm font-extrabold text-ink-2 transition-colors hover:bg-accent-text hover:text-accent-ink"
      >
        {/* The visible text stays a part of the link's name (WCAG 2.5.3). */}
        <span>
          <span className="sr-only">{group.name}: </span>
          {positions(group.count)}
        </span>
        <span className="inline-flex items-center gap-1 text-accent-text group-hover/all:text-accent-ink">
          Cały dział
          <Icon name="arrow" strokeWidth={2.4} className="size-4" />
        </span>
      </Link>
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

function partnerOf(system: System, tenantId: number): Partner | null {
  const partner = system.partner
  if (!partner || typeof partner !== 'object') return null
  // `Partners` is shared between lines: only a partner shown on this site.
  const shown = (partner.tenants ?? []).some((tenant) => tenantIdOf(tenant) === tenantId)
  return shown ? partner : null
}

type SystemCardProps = { system: System; tenantId: number; headingLevel: 'h3' | 'h4' }

function SystemCard({ system, tenantId, headingLevel: Title }: SystemCardProps) {
  const statuses = system.mode === 'statuses' ? (system.statuses ?? []) : []
  const image = system.mode === 'statuses' ? null : publicImage(system.image, tenantId)
  const partner = partnerOf(system, tenantId)
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

/**
 * „Oferta” (spec. §4 pkt 4, ZMIANY-v20 §2.2): five department cards from the catalog (on a
 * phone one row each), then the three flagship systems — one card component, navy, white
 * headings in both themes.
 */
export async function BzOfferBlock({ block, tenantId }: Props) {
  const index = await getCatalogIndex(tenantId)
  const groups = groupSummaries(index)
  const counts = { products: index.products.length, brands: index.brands.length }
  const systems = block.systems ?? []

  return (
    <section id="oferta" aria-labelledby="oferta-h" className="bg-card py-16 sm:py-24">
      <Container wide>
        <SectionHead
          id="oferta-h"
          eyebrow={block.eyebrow}
          heading={block.heading}
          lead={block.lead ? fillCatalogCounts(block.lead, counts) : null}
          action={
            block.catalogLabel
              ? { label: `${block.catalogLabel} · ${positions(counts.products)}`, href: '/oferta' }
              : null
          }
        />
        {groups.length > 0 && (
          <>
            <ul className="mt-10 flex flex-col gap-2.5 min-[640px]:hidden">
              {groups.map((group) => (
                <DepartmentRow key={group.slug} group={group} />
              ))}
            </ul>
            <div className="mt-10 hidden gap-4 min-[640px]:grid min-[640px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1080px]:grid-cols-5">
              {groups.map((group) => (
                <DepartmentCard key={group.slug} group={group} />
              ))}
            </div>
          </>
        )}

        {systems.length > 0 && (
          <div className="mt-16">
            {(block.systemsHeading || block.systemsNote) && (
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                {block.systemsHeading && (
                  <h3 className="font-display text-[clamp(1.5rem,2.2vw,1.85rem)] leading-tight font-extrabold font-stretch-108%">
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
