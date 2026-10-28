import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { getCatalogIndex } from '@/lib/catalog/data'
import { publicImage } from '@/lib/media/public'
import type { BzKitsBlock as BzKitsBlockData } from '@/payload-types'

import { SectionHead } from '../../components/home/SectionHead'
import { ProductStage, STAGE_SHADOW } from '../../components/ProductStage'
import { AddKitButton } from './AddKitButton'

type Props = { block: BzKitsBlockData; tenantId: number }

/** Slug of a related product (populated at page depth 1; a bare id has none). */
const slugOf = (value: unknown): string | null =>
  value && typeof value === 'object' && 'slug' in value && typeof value.slug === 'string'
    ? value.slug
    : null

/**
 * Kits (spec. §6.5 pkt 6, plansza Gopos), `#zestawy`: no prices. A kit lists only products of
 * this site's catalog index — published and of this tenant — with their category; the button
 * puts them all on the inquiry list.
 */
export async function BzKitsBlock({ block, tenantId }: Props) {
  const index = await getCatalogIndex(tenantId)
  const products = new Map(index.products.map((product) => [product.slug, product]))
  const categories = new Map(index.categories.map((category) => [category.slug, category.name]))
  const kits = block.kits.map((kit) => ({
    kit,
    items: (kit.products ?? []).flatMap((value) => {
      const product = products.get(slugOf(value) ?? '')
      if (!product) return []
      const category = product.categories[0]
      return [{ ...product, category: category ? categories.get(category) : undefined }]
    }),
  }))

  return (
    <section id="zestawy" aria-labelledby="zestawy-h" className="scroll-mt-24 py-14 sm:py-20">
      <Container wide>
        <SectionHead
          id="zestawy-h"
          eyebrow={block.eyebrow}
          heading={block.heading}
          lead={block.lead}
          eyebrowClassName="text-ok-text"
        />
        <ul className="mt-9 grid gap-4 min-[1000px]:grid-cols-3">
          {kits.map(({ kit, items }, i) => {
            const images = (kit.images ?? []).flatMap((value) => publicImage(value, tenantId) ?? [])
            return (
              <li
                key={kit.id ?? i}
                className={cx(
                  'relative flex flex-col overflow-hidden rounded-[28px] bg-card',
                  kit.tag
                    ? 'shadow-[0_30px_60px_-40px_var(--ok),inset_0_0_0_2px_var(--ok)]'
                    : 'shadow-[inset_0_0_0_1px_var(--border)]',
                )}
              >
                {kit.tag && (
                  <span className="absolute top-4 left-4 z-10 rounded-full bg-ok-text px-3 py-1.5 text-[13px] font-extrabold text-surface">
                    {kit.tag}
                  </span>
                )}
                <ProductStage className="h-52 px-5 pt-12 pb-4">
                  <div className="relative flex h-full w-full items-end justify-center gap-3">
                    {images.map((image, j) => (
                      <MediaImage
                        key={j}
                        image={image}
                        sizes="140px"
                        className={cx(
                          'h-auto max-h-36 w-auto max-w-[33%] object-contain',
                          STAGE_SHADOW,
                        )}
                      />
                    ))}
                  </div>
                </ProductStage>
                <div className="flex flex-1 flex-col gap-4 p-6">
                  <div>
                    <h3 className="font-display text-[1.5rem] leading-tight font-extrabold text-ink">
                      {kit.name}
                    </h3>
                    <p className="mt-1.5 text-ink-2">{kit.description}</p>
                  </div>
                  {items.length > 0 && (
                    <ul className="flex flex-col gap-2">
                      {items.map((item) => (
                        <li key={item.slug} className="flex items-baseline gap-2.5 text-[15px]">
                          <span
                            aria-hidden="true"
                            className="size-1.5 shrink-0 translate-y-[-2px] rounded-full bg-ok"
                          />
                          <span className="font-semibold text-ink">{item.name}</span>
                          {item.category && (
                            <span className="ml-auto text-right text-[13px] text-ink-2">
                              {item.category}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  {items.length > 0 && (
                    <div className="mt-auto pt-2">
                      <AddKitButton name={kit.name} slugs={items.map((item) => item.slug)} />
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
