/**
 * „Gotowy zestaw dla tej branży” of the home plan (B3-1, D8): the first of the home bundles
 * (`BiznesSettings.bundles.home`, in the panel's order) that the scene lists among its ready
 * bundles (`FloorPlans.bundles`, „Gotowe” only — `loadFloorPlan`). No match = no card.
 */
export function pickHomeBundle<T extends { slug: string }>(
  homeSlugs: readonly string[],
  sceneBundles: readonly T[],
): T | null {
  for (const slug of homeSlugs) {
    const bundle = sceneBundles.find((item) => item.slug === slug)
    if (bundle) return bundle
  }
  return null
}

/** The home bundle of each scene that has one, by the scene's slug. */
export function homeBundlesByScene<T extends { slug: string }>(
  homeSlugs: readonly string[],
  bundlesByScene: Readonly<Record<string, readonly T[]>>,
): Record<string, T> {
  const out: Record<string, T> = {}
  for (const [scene, bundles] of Object.entries(bundlesByScene)) {
    const bundle = pickHomeBundle(homeSlugs, bundles)
    if (bundle) out[scene] = bundle
  }
  return out
}
