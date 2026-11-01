import type { ProductVideo } from './product'

/** Address of „Plan Twojej firmy” (ADR-017 D-K4-1); the scene goes in `?scena=`. */
export const PLAN_PATH = '/plan-firmy'
export const planHref = (scene?: string) =>
  scene ? `${PLAN_PATH}?scena=${encodeURIComponent(scene)}` : PLAN_PATH

/** A scene record as `getFloorPlans` reads it: the product of a point is populated with its slug. */
export type FloorPlanRecord = {
  slug: string
  name: string
  title: string
  lead?: string | null
  iconPath?: string | null
  viewBox: string
  bundles?: readonly (number | { slug?: string | null } | null)[] | null
  points?:
    | readonly {
        x: number
        y: number
        product?: number | { slug?: string | null } | null
        label: string
        description?: string | null
      }[]
    | null
}

export type PlanPoint = {
  /** Number on the plan and in the list, from 1, after hidden cards drop out. */
  n: number
  /** Position in percent of the drawing (the record keeps viewBox units). */
  x: number
  y: number
  product: string
  label: string
  description: string | null
}

export type PlanScene = {
  slug: string
  name: string
  title: string
  lead: string | null
  iconPath: string | null
  /** Width / height of the drawing, for the aspect ratio of the stage. */
  width: number
  height: number
  points: PlanPoint[]
  /** Bundle slugs of the scene, in the panel's order — the page shows only listed „Gotowe” ones. */
  bundles: string[]
}

/** Details of a plan product for the popup (K31-ZMIANY §6): 4 parameters and the first film. */
export type PlanProductDetails = {
  params: { label: string; value: string }[]
  video: ProductVideo | null
}

type LabelValue = { label?: string | null; value?: string | null }

/**
 * The 4 parameters of the popup (board `Web-Plan-punkt`: Procesor, Ekran, Pamięć RAM, Dysk): the
 * card's key parameters when set, otherwise the first rows of its specification.
 */
export function planParams(
  keyParams: readonly LabelValue[] | null | undefined,
  specs: readonly LabelValue[] | null | undefined,
): { label: string; value: string }[] {
  const rows = (list: readonly LabelValue[] | null | undefined) =>
    (list ?? []).flatMap(({ label, value }) => {
      const l = label?.trim()
      const v = value?.trim()
      return l && v ? [{ label: l, value: v }] : []
    })
  const key = rows(keyParams)
  return (key.length > 0 ? key : rows(specs)).slice(0, 4)
}

/** `0 0 1600 820` → 1600 × 820; anything else falls back to the default plan size. */
export function parseViewBox(viewBox: string): { width: number; height: number } {
  const match = /^0 0 (\d{1,5}) (\d{1,5})$/.exec(viewBox.trim())
  const width = match ? Number(match[1]) : 0
  const height = match ? Number(match[2]) : 0
  return width > 0 && height > 0 ? { width, height } : { width: 1600, height: 820 }
}

const slugOf = (value: unknown): string | null =>
  value && typeof value === 'object' && typeof (value as { slug?: unknown }).slug === 'string'
    ? (value as { slug: string }).slug
    : null

const percent = (value: number, size: number) =>
  Math.min(100, Math.max(0, Math.round((value / size) * 10000) / 100))

/**
 * Scenes of the plan as the site shows them (spec. §6.12): a point whose card is not listed
 * (hidden, deleted, draft) drops out and the rest is renumbered; a scene without points is not
 * shown. `listed` = published cards of the tenant (the catalog index).
 */
export function buildPlanScenes(
  records: readonly FloorPlanRecord[],
  listed: ReadonlySet<string>,
): PlanScene[] {
  return records.flatMap((record) => {
    const { width, height } = parseViewBox(record.viewBox)
    const points = (record.points ?? []).flatMap((point) => {
      const product = slugOf(point.product)
      return product && listed.has(product) ? [{ point, product }] : []
    })
    if (points.length === 0) return []
    return [
      {
        slug: record.slug,
        name: record.name,
        title: record.title,
        lead: record.lead?.trim() || null,
        iconPath: record.iconPath?.trim() || null,
        width,
        height,
        points: points.map(({ point, product }, i) => ({
          n: i + 1,
          x: percent(point.x, width),
          y: percent(point.y, height),
          product,
          label: point.label,
          description: point.description?.trim() || null,
        })),
        bundles: [...new Set((record.bundles ?? []).flatMap((b) => slugOf(b) ?? []))],
      },
    ]
  })
}

/** „12 rodzajów firm · 186 punktów na planach · 97 produktów z oferty” (board `Web-Plan`). */
export function planStats(scenes: readonly PlanScene[]) {
  const points = scenes.reduce((sum, scene) => sum + scene.points.length, 0)
  const products = new Set(scenes.flatMap((scene) => scene.points.map((p) => p.product))).size
  return { scenes: scenes.length, points, products }
}

/** The scene of `?scena=`, or the first one. */
export function pickScene(scenes: readonly PlanScene[], slug: string | null | undefined) {
  return scenes.find((scene) => scene.slug === slug) ?? scenes[0] ?? null
}

/** Note of an item added from the plan: „Plan: Sklep spożywczy” (spec. §6.12). */
export const planNote = (scene: Pick<PlanScene, 'title'>) => `Plan: ${scene.title}`

/**
 * Cart items of „Dodaj cały plan do zapytania · N poz.”: every product once, in the order of the
 * points, with the plan note.
 */
export function planCartItems(scene: PlanScene): { id: string; q: number; uwaga: string }[] {
  const uwaga = planNote(scene)
  return [...new Set(scene.points.map((point) => point.product))].map((id) => ({
    id,
    q: 1,
    uwaga,
  }))
}
