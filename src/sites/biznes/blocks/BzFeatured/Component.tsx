import { Container } from '@/components/ui/Container'
import { getCatalogIndex } from '@/lib/catalog/data'
import { FEATURED_GROUPS } from '@/lib/catalog/options'
import { plural } from '@/lib/plural'
import type { BzFeaturedBlock as BzFeaturedBlockData } from '@/payload-types'

import { ProductCard } from '../../components/catalog/ProductCard'
import { SectionHead } from '../../components/home/SectionHead'
import { FeaturedPills } from './FeaturedPills'

type Props = { block: BzFeaturedBlockData; tenantId: number }

/** K35 7a: sixteen products, 4 in a row, with the pills of their groups. */
const FEATURED = 16

/**
 * „O to firmy pytają najczęściej” (K35 7a, K36 §13): the featured products as catalog cards with
 * pills by group (`Products.featuredGroup`; on a phone a horizontal strip). v150 has no cards
 * under the list (they repeated „Szybki start”), so the block's card fields are not shown.
 */
export async function BzFeaturedBlock({ block, tenantId }: Props) {
  const index = await getCatalogIndex(tenantId)
  const featured = index.products
    .filter((product) => product.featuredOrder !== undefined)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0))
    .slice(0, FEATURED)
  const pills = FEATURED_GROUPS.map(({ value, label }) => ({
    value,
    label,
    count: featured.filter((product) => product.featuredGroup === value).length,
  })).filter((pill) => pill.count > 0)
  const total = index.products.length

  return (
    <section id="wybierane" aria-labelledby="wybierane-h" className="bg-surface-2 py-16 sm:py-24">
      <Container wide>
        <SectionHead
          id="wybierane-h"
          eyebrow={block.eyebrow}
          heading={block.heading}
          lead={block.lead}
          action={
            block.catalogLabel
              ? {
                  label: `${block.catalogLabel} · ${total} ${plural(total, ['pozycja', 'pozycje', 'pozycji'])}`,
                  href: '/oferta',
                }
              : null
          }
        />
        {featured.length > 0 && (
          <FeaturedPills
            pills={pills}
            cards={featured.map((product, position) => ({
              key: product.slug,
              group: product.featuredGroup ?? null,
              card: (
                <ProductCard product={product} index={index} position={position} variant="home" />
              ),
            }))}
          />
        )}
      </Container>
    </section>
  )
}
