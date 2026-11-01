import { bundleCard, listBundles } from '@/lib/catalog/bundle'
import { cardIcon, productHref } from '@/lib/catalog/card'
import { getBundles, getCatalogIndex, getFloorPlans, getFloorPlanSvg } from '@/lib/catalog/data'
import { buildPlanScenes } from '@/lib/catalog/floorPlan'

import type { FloorPlanData, PlanProduct } from './types'

/**
 * Everything the plan needs, read on the server (K31d′): scenes with points of listed cards only,
 * their products (name, photo, benefit, features, 4 parameters, film), the „Gotowe” bundles of
 * each scene and the drawing of the first scene. `null` when the tenant has no scene.
 */
export async function loadFloorPlan(tenantId: number): Promise<FloorPlanData | null> {
  const [index, plans, allBundles] = await Promise.all([
    getCatalogIndex(tenantId),
    getFloorPlans(tenantId),
    getBundles(tenantId),
  ])
  const listed = new Map(index.products.map((product) => [product.slug, product]))
  const scenes = buildPlanScenes(plans.records, new Set(listed.keys()))
  if (scenes.length === 0) return null

  const brands = new Map(index.brands.map((brand) => [brand.slug, brand.name]))
  const products: Record<string, PlanProduct> = {}
  for (const slug of new Set(scenes.flatMap((scene) => scene.points.map((p) => p.product)))) {
    const product = listed.get(slug)
    if (!product) continue
    products[slug] = {
      slug,
      name: product.name,
      brand: product.brand ? (brands.get(product.brand) ?? null) : null,
      benefit: product.benefit ?? null,
      features: product.features.slice(0, 3),
      image: product.image ?? null,
      icon: cardIcon(product, index),
      href: productHref(slug),
      params: plans.details[slug]?.params ?? [],
      video: plans.details[slug]?.video ?? null,
    }
  }

  const ready = listBundles(allBundles, new Set(listed.keys())).filter((b) => b.indexable)
  const bySlug = new Map(ready.map((bundle) => [bundle.slug, bundle]))
  const bundles = Object.fromEntries(
    scenes.map((scene) => [
      scene.slug,
      scene.bundles.flatMap((slug) => {
        const bundle = bySlug.get(slug)
        return bundle ? [bundleCard(bundle, listed)] : []
      }),
    ]),
  )

  return { scenes, products, bundles, firstSvg: await getFloorPlanSvg(tenantId, scenes[0].slug) }
}
