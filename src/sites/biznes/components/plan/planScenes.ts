import type { BundleCardData } from '@/lib/catalog/bundle'

import type { FloorPlanData, PlanProduct } from './types'

/**
 * Plan data split by scene (ADR-023, „Dane planu firmy poza HTML głównej”). The home page sends
 * every scene (tiles, counts, points) but the products and bundles of the first scene only; the
 * others come from `/api/plan-scene/<scena>` when picked. A scene counts as loaded when its key is
 * in `bundles` (an empty list included). `/plan-firmy` keeps the whole plan.
 */
export type PlanScenePayload = {
  products: Record<string, PlanProduct>
  bundles: BundleCardData[]
}

export function isSceneLoaded(data: Pick<FloorPlanData, 'bundles'>, slug: string): boolean {
  return Object.hasOwn(data.bundles, slug)
}

/** Products of the scene's points and its bundles; `null` when the slug is not a scene. */
export function scenePayload(data: FloorPlanData, slug: string): PlanScenePayload | null {
  const scene = data.scenes.find((item) => item.slug === slug)
  if (!scene) return null
  const products: Record<string, PlanProduct> = {}
  for (const point of scene.points) {
    const product = data.products[point.product]
    if (product) products[point.product] = product
  }
  return { products, bundles: data.bundles[slug] ?? [] }
}

/** The plan with every scene, but products and bundles of the given scenes only. */
export function planForScenes(data: FloorPlanData, slugs: string[]): FloorPlanData {
  let part: FloorPlanData = { ...data, products: {}, bundles: {} }
  for (const slug of slugs) {
    const payload = scenePayload(data, slug)
    if (payload) part = mergeScene(part, slug, payload)
  }
  return part
}

/** Adds a scene loaded on the client. */
export function mergeScene<T extends Pick<FloorPlanData, 'products' | 'bundles'>>(
  data: T,
  slug: string,
  payload: PlanScenePayload,
): T {
  return {
    ...data,
    products: { ...data.products, ...payload.products },
    bundles: { ...data.bundles, [slug]: payload.bundles },
  }
}
