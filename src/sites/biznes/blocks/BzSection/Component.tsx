import type { ReactNode } from 'react'

import { isAfterSwitch } from '@/lib/biznes/pages/ksef'
import {
  isSectionVariant,
  parseSectionData,
  type SectionVariant,
} from '@/lib/biznes/pages/sections'
import { getCatalogIndex } from '@/lib/catalog/data'
import type { CatalogIndex, IndexImage } from '@/lib/catalog/catalogIndex'
import type { BzSectionBlock as BzSectionData } from '@/payload-types'

import type { Crumb } from '../../components/Breadcrumbs'
import {
  BandSection,
  CardsSection,
  CasesSection,
  ChipsSection,
  StatsSection,
  StepsSection,
  TableSection,
} from './common/Basic'
import { TabsPicker, VideoPicker } from './common/Interactive'
import { ProductGrid, productsBySlug } from './common/Products'
import { Audience, CareHero, StartCalendar } from './firma/Care'
import { CareAreas, Seats, SwitchSteps } from './firma/CareWidgets'
import {
  AboutHero,
  BrandsSection,
  ContactFormSection,
  ContactHero,
  LinesSection,
} from './firma/Company'
import { GoposHero } from './gopos/Hero'
import { KsefChecklist, KsefQuizWidget } from './k4j/Client'
import {
  AppMockup,
  CatalogTabs,
  KsefHero,
  KsefPenalties,
  Notice,
  SourcesSection,
  UlgaHero,
  VendingHero,
  VendingPicker,
  YesNo,
} from './k4j/Sections'
import { GoposAreas, GoposHub, GoposPackage, GoposVenues } from './gopos/Widgets'
import { InsertHero, InsertKsef, InsertRequirements } from './insert/Sections'
import { InsertPicker, InsertPoints } from './insert/Widgets'
import { SectionShell } from './ui'

type Props = {
  block: BzSectionData
  tenantId: number
  /** Breadcrumbs of the page, for the hero kinds (Start / page). */
  crumbs: readonly Crumb[]
}

/** Kinds that read the catalog (product cards, pictures, brand logos). */
const NEEDS_INDEX: ReadonlySet<SectionVariant> = new Set([
  'products',
  'gopos-hero',
  'gopos-venues',
  'insert-hero',
  'insert-picker',
  'insert-requirements',
  'care-areas',
  'audience',
  'about-hero',
  'brands',
  'vending-hero',
  'vending-picker',
  'catalog-tabs',
  'ksef-penalties',
])

const imagesOf = (index: CatalogIndex, slugs: readonly (string | undefined)[]) => {
  const images: Record<string, IndexImage> = {}
  for (const product of productsBySlug(
    index,
    slugs.filter((s): s is string => Boolean(s)),
  )) {
    if (product.image) images[product.slug] = product.image
  }
  return images
}

/**
 * K4 section (`bzSection`): picks the look by the kind. Data that does not fit the kind hides the
 * section instead of breaking the page — the panel refuses such data on save anyway.
 */
export async function BzSectionBlock({ block, tenantId, crumbs }: Props) {
  const variant = block.variant
  if (!isSectionVariant(variant)) return null
  const index = NEEDS_INDEX.has(variant) ? await getCatalogIndex(tenantId) : null
  return render(block, variant, index, crumbs, tenantId)
}

function render(
  block: BzSectionData,
  variant: SectionVariant,
  index: CatalogIndex | null,
  crumbs: readonly Crumb[],
  tenantId: number,
): ReactNode {
  switch (variant) {
    case 'stats':
      return <StatsSection block={block} />
    case 'cards':
      return <CardsSection block={block} />
    case 'steps':
      return <StepsSection block={block} />
    case 'cases':
      return <CasesSection block={block} />
    case 'band': {
      const data = parseSectionData('band', block.data)
      return data && <BandSection block={block} data={data} />
    }
    case 'table': {
      const data = parseSectionData('table', block.data)
      return data && <TableSection block={block} data={data} />
    }
    case 'chips': {
      const data = parseSectionData('chips', block.data)
      return data && <ChipsSection block={block} data={data} />
    }
    case 'videos': {
      const data = parseSectionData('videos', block.data)
      return (
        data && (
          <SectionShell block={block}>
            <VideoPicker data={data} />
          </SectionShell>
        )
      )
    }
    case 'tabs': {
      const data = parseSectionData('tabs', block.data)
      return (
        data && (
          <SectionShell block={block}>
            <TabsPicker data={data} />
          </SectionShell>
        )
      )
    }
    case 'products': {
      const data = parseSectionData('products', block.data)
      const products = data && index ? productsBySlug(index, data.slugs) : []
      return (
        data &&
        index &&
        products.length > 0 && (
          <SectionShell block={block}>
            <ProductGrid index={index} products={products} visible={data.visible} />
          </SectionShell>
        )
      )
    }
    case 'gopos-hero': {
      const data = parseSectionData('gopos-hero', block.data)
      return data && index && <GoposHero block={block} data={data} index={index} crumbs={crumbs} />
    }
    case 'gopos-venues': {
      const data = parseSectionData('gopos-venues', block.data)
      return (
        data &&
        index && (
          <SectionShell block={block}>
            <GoposVenues
              data={data}
              images={imagesOf(
                index,
                data.venues.map((venue) => venue.image),
              )}
            />
          </SectionShell>
        )
      )
    }
    case 'gopos-areas': {
      const data = parseSectionData('gopos-areas', block.data)
      return (
        data && (
          <SectionShell block={block}>
            <GoposAreas data={data} />
          </SectionShell>
        )
      )
    }
    case 'gopos-hub': {
      const data = parseSectionData('gopos-hub', block.data)
      return (
        data && (
          <SectionShell block={block}>
            <GoposHub data={data} />
          </SectionShell>
        )
      )
    }
    case 'gopos-package': {
      const data = parseSectionData('gopos-package', block.data)
      return (
        data && (
          <SectionShell
            block={block}
            aside={
              <span className="rounded-full bg-surface-2 px-3.5 py-2 text-[14px] font-extrabold text-ink-2">
                bez cen · wycena na piśmie
              </span>
            }
          >
            <GoposPackage data={data} />
          </SectionShell>
        )
      )
    }
    case 'insert-hero': {
      const data = parseSectionData('insert-hero', block.data)
      return data && index && <InsertHero block={block} data={data} index={index} crumbs={crumbs} />
    }
    case 'insert-picker': {
      const data = parseSectionData('insert-picker', block.data)
      if (!data || !index) return null
      const programs = Object.fromEntries(
        productsBySlug(
          index,
          data.rules.map((rule) => rule.slug),
        ).map((p) => [
          p.slug,
          { slug: p.slug, name: p.name, benefit: p.benefit, features: p.features, image: p.image },
        ]),
      )
      return (
        <SectionShell block={block}>
          <InsertPicker data={data} programs={programs} />
        </SectionShell>
      )
    }
    case 'insert-ksef': {
      const data = parseSectionData('insert-ksef', block.data)
      return data && <InsertKsef block={block} data={data} />
    }
    case 'insert-points': {
      const data = parseSectionData('insert-points', block.data)
      return (
        data && (
          <SectionShell block={block}>
            <InsertPoints data={data} />
          </SectionShell>
        )
      )
    }
    case 'insert-requirements': {
      const data = parseSectionData('insert-requirements', block.data)
      return data && index && <InsertRequirements block={block} data={data} index={index} />
    }
    case 'care-hero': {
      const data = parseSectionData('care-hero', block.data)
      return data && <CareHero block={block} data={data} crumbs={crumbs} tenantId={tenantId} />
    }
    case 'care-areas': {
      const data = parseSectionData('care-areas', block.data)
      if (!data || !index) return null
      const products = Object.fromEntries(
        productsBySlug(
          index,
          data.areas.flatMap((area) => area.products),
        ).map((p) => [p.slug, { slug: p.slug, name: p.name, image: p.image }]),
      )
      return (
        <SectionShell block={block}>
          <CareAreas data={data} products={products} />
        </SectionShell>
      )
    }
    case 'switch-steps': {
      const data = parseSectionData('switch-steps', block.data)
      return (
        data && (
          <SectionShell block={block}>
            <SwitchSteps data={data} />
          </SectionShell>
        )
      )
    }
    case 'audience': {
      const data = parseSectionData('audience', block.data)
      return data && index && <Audience block={block} data={data} index={index} />
    }
    case 'start-calendar': {
      const data = parseSectionData('start-calendar', block.data)
      return data && <StartCalendar block={block} data={data} />
    }
    case 'seats': {
      const data = parseSectionData('seats', block.data)
      return (
        data && (
          <SectionShell block={block}>
            <Seats data={data} />
          </SectionShell>
        )
      )
    }
    case 'about-hero': {
      const data = parseSectionData('about-hero', block.data)
      return (
        data &&
        index && (
          <AboutHero block={block} data={data} index={index} crumbs={crumbs} tenantId={tenantId} />
        )
      )
    }
    case 'lines': {
      const data = parseSectionData('lines', block.data)
      return data && <LinesSection block={block} data={data} />
    }
    case 'brands': {
      const data = parseSectionData('brands', block.data)
      return data && index && <BrandsSection block={block} data={data} index={index} />
    }
    case 'contact-hero': {
      const data = parseSectionData('contact-hero', block.data)
      return data && <ContactHero block={block} data={data} crumbs={crumbs} tenantId={tenantId} />
    }
    case 'contact-form': {
      const data = parseSectionData('contact-form', block.data)
      return data && <ContactFormSection block={block} data={data} tenantId={tenantId} />
    }
    case 'vending-hero': {
      const data = parseSectionData('vending-hero', block.data)
      return (
        data && index && <VendingHero block={block} data={data} index={index} crumbs={crumbs} />
      )
    }
    case 'vending-picker': {
      const data = parseSectionData('vending-picker', block.data)
      return data && index && <VendingPicker block={block} data={data} index={index} />
    }
    case 'app-mockup': {
      const data = parseSectionData('app-mockup', block.data)
      return data && <AppMockup block={block} data={data} />
    }
    case 'catalog-tabs': {
      const data = parseSectionData('catalog-tabs', block.data)
      return data && index && <CatalogTabs block={block} data={data} index={index} />
    }
    case 'sources': {
      const data = parseSectionData('sources', block.data)
      return data && <SourcesSection block={block} data={data} />
    }
    case 'ksef-hero': {
      const data = parseSectionData('ksef-hero', block.data)
      return data && <KsefHero data={data} crumbs={crumbs} tenantId={tenantId} />
    }
    case 'ksef-quiz': {
      const data = parseSectionData('ksef-quiz', block.data)
      return (
        data && (
          <SectionShell block={block}>
            <KsefQuizWidget
              quiz={data}
              switchDate={data.switchDate}
              serverAfter={isAfterSwitch(data.switchDate, new Date())}
            />
          </SectionShell>
        )
      )
    }
    case 'ksef-steps': {
      const data = parseSectionData('ksef-steps', block.data)
      return (
        data && (
          <SectionShell block={block}>
            <KsefChecklist steps={data.steps} storageKey={data.storageKey} />
          </SectionShell>
        )
      )
    }
    case 'ksef-penalties': {
      const data = parseSectionData('ksef-penalties', block.data)
      return data && index && <KsefPenalties block={block} data={data} index={index} />
    }
    case 'ulga-hero': {
      const data = parseSectionData('ulga-hero', block.data)
      return data && <UlgaHero block={block} data={data} crumbs={crumbs} tenantId={tenantId} />
    }
    case 'yes-no': {
      const data = parseSectionData('yes-no', block.data)
      return data && <YesNo block={block} data={data} />
    }
    case 'notice': {
      const data = parseSectionData('notice', block.data)
      return data && <Notice block={block} data={data} />
    }
  }
}
