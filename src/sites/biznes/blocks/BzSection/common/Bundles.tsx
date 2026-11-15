import { bundleCard, listBundles, readyBundlesInOrder } from '@/lib/catalog/bundle'
import type { CatalogIndex } from '@/lib/catalog/catalogIndex'
import { getBundles } from '@/lib/catalog/data'
import type { SectionData } from '@/lib/biznes/pages/sections'
import type { BzSectionBlock as BzSectionData } from '@/payload-types'

import { BundleTile } from '../../../components/bundle/BundleTile'
import { SectionShell } from '../ui'

/**
 * `bundles`: ready bundles the page names, as the tiles of `/zestawy` (GoPOS „Gotowe zestawy dla
 * gastronomii”, PREMIUM-1011) — photos on the white plate, who it is for, 3–4 items, „Dodaj
 * zestaw do zapytania”, the name leads to the bundle. Only „Gotowe”; none — no section.
 */
export async function BundlesSection({
  block,
  data,
  index,
  tenantId,
}: {
  block: BzSectionData
  data: SectionData<'bundles'>
  index: CatalogIndex
  tenantId: number
}) {
  const bySlug = new Map(index.products.map((product) => [product.slug, product]))
  const listed = listBundles(await getBundles(tenantId), new Set(bySlug.keys()))
  const cards = readyBundlesInOrder(data.slugs, listed).map((bundle) => bundleCard(bundle, bySlug))
  if (cards.length === 0) return null
  return (
    <SectionShell block={block}>
      <ul
        className="grid gap-4 max-md:-mx-4 max-md:flex max-md:snap-x max-md:snap-mandatory max-md:scroll-px-4 max-md:overflow-x-auto max-md:px-4 max-md:pb-2 max-md:[scrollbar-width:none] min-[768px]:grid-cols-2 min-[1080px]:grid-cols-3"
        data-reveal-cards=""
        data-bundles-section
      >
        {cards.map((bundle) => (
          <li key={bundle.slug} className="max-md:w-[82%] max-md:shrink-0 max-md:snap-start">
            <BundleTile bundle={bundle} headingLevel={3} />
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}
