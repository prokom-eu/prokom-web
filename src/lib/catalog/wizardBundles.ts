import type { BundleView } from './bundle'
import type { BusinessTypeId } from './wizard'

/**
 * Ready bundles on the wizard result (K3-KATALOG §9, spec. §6.8, K3c): business type → series of
 * bundles (`seria` of the package) or named bundles. The wizard still sends its own inquiry.
 */
type Match = { series?: readonly string[]; slugs?: readonly string[] }

const WIZARD_BUNDLES: Record<BusinessTypeId, Match> = {
  sklep: { series: ['sklep', 'sklep-spozywczy', 'sklep-magazyn'] },
  gastro: { series: ['gastronomia-lada', 'restauracja', 'bar-szybkiej-obslugi'] },
  hotel: { series: ['noclegi'] },
  biuro: { series: ['biuro', 'biuro-rachunkowe'] },
  gabinet: { slugs: ['zestaw-gabinet'] },
  szkola: { series: ['szkola'] },
  truck: { slugs: ['zestaw-gastro-foodtruck'] },
  warsztat: { slugs: ['zestaw-biuro-3-5', 'zestaw-kopie-zapasowe'] },
  produkcja: { slugs: ['zestaw-biuro-3-5', 'zestaw-kopie-zapasowe'] },
  inna: {},
}

/** Bundles matching a business type, in the order of the bundles, up to `limit`. */
export function wizardBundles<T extends Pick<BundleView, 'slug' | 'series'>>(
  type: BusinessTypeId,
  bundles: readonly T[],
  limit = 3,
): T[] {
  const { series = [], slugs = [] } = WIZARD_BUNDLES[type]
  return bundles
    .filter((bundle) => series.includes(bundle.series) || slugs.includes(bundle.slug))
    .slice(0, limit)
}
