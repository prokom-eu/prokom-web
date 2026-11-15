import { Container } from '@/components/ui/Container'
import { getCatalogIndex } from '@/lib/catalog/data'
import { FEATURED_GROUPS } from '@/lib/catalog/options'
import { plural } from '@/lib/plural'
import type { BzFeaturedBlock as BzFeaturedBlockData } from '@/payload-types'

import { ProductCard } from '../../components/catalog/ProductCard'
import { SectionHead } from '../../components/home/SectionHead'
import { FeaturedRows } from './FeaturedRowsLazy'

type Props = { block: BzFeaturedBlockData; tenantId: number }

/** Runda 1411 R5: three rows of eight. */
const PER_ROW = 8

/** The rows: the first three groups; „Zasilanie awaryjne” (older data) joins the third. */
const ROWS = FEATURED_GROUPS.slice(0, 3)
const rowOf = (group: string | undefined) => (group === 'zasilanie' ? 'programy-ochrona' : group)

/**
 * „Najczęściej wybierane” (runda 1411 R5, board `Wybierane.dc.html`; K35 7a before): three rows —
 * Kasy i sprzedaż, Komputery i telefony, Programy, ochrona i zasilanie — of up to eight catalog
 * cards in the panel's order (`Products.featuredGroup`, `featuredOrder`), no pills. The rows move
 * by one card (`FeaturedRows`, a small client island; the cards are rendered here).
 */
export async function BzFeaturedBlock({ block, tenantId }: Props) {
  const index = await getCatalogIndex(tenantId)
  const featured = index.products
    .filter((product) => product.featuredOrder !== undefined)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0))
  const rows = ROWS.map(({ value, label }) => ({
    id: value,
    title: label,
    products: featured
      .filter((product) => rowOf(product.featuredGroup) === value)
      .slice(0, PER_ROW),
  })).filter((row) => row.products.length > 0)
  const total = index.products.length

  return (
    <section id="wybierane" aria-labelledby="wybierane-h" className="bg-surface-2 py-6 md:py-24">
      <Container wide>
        <SectionHead
          id="wybierane-h"
          eyebrow={block.eyebrow}
          heading={block.heading}
          lead={block.lead}
          appOnPhone
          phoneAction="Więcej"
          action={
            block.catalogLabel
              ? {
                  label: `${block.catalogLabel} · ${total} ${plural(total, ['pozycja', 'pozycje', 'pozycji'])}`,
                  href: '/oferta',
                }
              : null
          }
        />
        {rows.length > 0 && (
          <FeaturedRows
            rows={rows.map((row, r) => ({
              id: row.id,
              title: row.title,
              cards: row.products.map((product, position) => ({
                key: product.slug,
                node: (
                  <ProductCard
                    product={product}
                    index={index}
                    position={r * PER_ROW + position}
                    variant="home"
                  />
                ),
              })),
            }))}
          />
        )}
      </Container>
    </section>
  )
}
