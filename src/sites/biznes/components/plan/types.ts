import type { BundleCardData } from '@/lib/catalog/bundle'
import type { IndexImage } from '@/lib/catalog/catalogIndex'
import type { PlanProductDetails, PlanScene } from '@/lib/catalog/floorPlan'
import type { IconName } from '@/lib/catalog/options'

/** A product on the plan as the client gets it: what the list and the popup show. */
export type PlanProduct = PlanProductDetails & {
  slug: string
  name: string
  brand: string | null
  benefit: string | null
  features: string[]
  image: IndexImage | null
  icon: IconName
  href: string
}

export type FloorPlanData = {
  scenes: PlanScene[]
  products: Record<string, PlanProduct>
  /** „Gotowe” bundles of each scene, listed on the site. */
  bundles: Record<string, BundleCardData[]>
  /** Drawing of the first scene, rendered with the page; the others load when picked. */
  firstSvg: string | null
}

/** Texts of the plan that the home block can change (`bzPlan`); the page uses the defaults. */
export type FloorPlanLabels = {
  listNote: string
  inquiryLabel: string
  bundlesLabel: string
}

export const DEFAULT_PLAN_LABELS: FloorPlanLabels = {
  listNote: 'Kliknij urządzenie — otworzy się film i szczegóły',
  inquiryLabel: 'Dodaj cały plan do zapytania',
  bundlesLabel: 'Gotowe zestawy',
}
