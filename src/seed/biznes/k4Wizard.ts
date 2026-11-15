import { BUNDLE_AREAS } from '../../lib/catalog/options'
import type { Wizard, WizardScale, WizardStage } from '../../lib/catalog/wizard'
import { CATEGORY_SLUGS } from './map'

/**
 * K4g: `seed/prokombiznes/k4/konfigurator-k4.json` → the rules of Konfigurator 3.0 in
 * `BiznesSettings.wizard` (`wizardSchema`, ADR-017 D-K4-4). Pure: product keys of the package go
 * through `slugOf` (catalog keys and K4 slugs → card slugs); a key without a card is reported and
 * left out — the engine needs the products listed on the site anyway.
 */

type Row3 = [string, string, string]
type Row4 = [string, string, string, string]
type SeedLink = [string, { w: string; marka?: string; cat?: string }]
type SeedRec = {
  t: string
  why: string
  p: string[]
  by?: Record<string, string[]>
  l?: SeedLink[]
}
type SeedQuestion = [
  string,
  string,
  string,
  0 | 1,
  { add?: string[]; over?: Record<string, string[]>; tag: string },
]

export type K4WizardFile = {
  kroki_i_rekomendacje: {
    firm: Row4[]
    etap: Row3[]
    skala: Row3[]
    needs: Row3[]
    preset: Record<string, string[]>
    rec: Record<string, SeedRec>
    etapNote: Record<string, { t: string; d: string }>
  }
  pytania: Record<string, SeedQuestion[]>
  grupy_zestawow: Record<string, string>
  sceny_planu: Record<string, string>
}

/**
 * Order of the needs on the result — the board's engine (`ORD` in `k3model`), not the order of
 * the `needs` list of the package (which differs for print and network).
 */
const NEED_ORDER = [
  'kasa',
  'pos',
  'plat',
  'prog',
  'ksef',
  'komp',
  'tel',
  'siec',
  'kopie',
  'ups',
  'ochr',
  'druk',
  'ekr',
  'waga',
  'vend',
  'opieka',
]

/**
 * The package names the backups need `kopie-zapasowe` in the list, presets and questions, but
 * `kopie` in its products and in the engine — one id, `kopie` (on the board the preset entry
 * dropped out silently).
 */
const needId = (id: string) => (id === 'kopie-zapasowe' ? 'kopie' : id)

const AREA_BY_LABEL = new Map<string, string>(
  BUNDLE_AREAS.map(({ label, value }) => [label, value]),
)

export function k4Wizard(
  file: K4WizardFile,
  slugOf: (key: string) => string | undefined,
): { wizard: Wizard; missing: string[] } {
  const k = file.kroki_i_rekomendacje
  const missing = new Set<string>()
  const products = (keys: readonly string[]) => [
    ...new Set(
      keys.flatMap((key) => {
        const slug = slugOf(key)
        if (!slug) missing.add(key)
        return slug ? [slug] : []
      }),
    ),
  ]
  const needsById = new Map(k.needs.map(([id, name, icon]) => [needId(id), { name, icon }]))
  const order = [
    ...NEED_ORDER.filter((id) => needsById.has(id)),
    ...[...needsById.keys()].filter((id) => !NEED_ORDER.includes(id)),
  ]

  const recommendations: Wizard['recommendations'] = {}
  for (const [rawId, rec] of Object.entries(k.rec)) {
    const byFirm: Record<string, string[]> = {}
    const byScale: Partial<Record<WizardScale, string[]>> = {}
    for (const [key, list] of Object.entries(rec.by ?? {})) {
      if (['1', '2', '4', '10'].includes(key)) byScale[key as WizardScale] = products(list)
      else byFirm[key] = products(list)
    }
    recommendations[needId(rawId)] = {
      title: rec.t,
      why: rec.why,
      products: products(rec.p),
      byFirm,
      byScale,
      links: (rec.l ?? []).map(([label, link]) => ({
        label,
        kind: link.w as Wizard['recommendations'][string]['links'][number]['kind'],
        ...(link.marka ? { target: link.marka } : {}),
        ...(link.cat ? { target: CATEGORY_SLUGS[link.cat] ?? link.cat } : {}),
      })),
    }
  }

  const questions: Wizard['questions'] = {}
  for (const [firm, list] of Object.entries(file.pytania)) {
    questions[firm] = list.map(([id, question, caption, usual, effect]) => ({
      id,
      question,
      caption,
      default: usual === 1,
      add: [...new Set((effect.add ?? []).map(needId))],
      overrides: Object.fromEntries(
        Object.entries(effect.over ?? {}).map(([need, keys]) => [needId(need), products(keys)]),
      ),
      tag: effect.tag,
    }))
  }

  const bundleAreas: Record<string, string> = {}
  for (const [firm, label] of Object.entries(file.grupy_zestawow)) {
    const area = AREA_BY_LABEL.get(label)
    if (!area) throw new Error(`Seed (Biznes): bundle group "${label}" is not a bundle area.`)
    bundleAreas[firm] = area
  }

  const wizard: Wizard = {
    version: 3,
    firms: k.firm.map(([id, name, caption, iconPath]) => ({ id, name, caption, iconPath })),
    stages: k.etap.map(([id, name, caption]) => ({ id: id as WizardStage, name, caption })),
    scales: k.skala.map(([id, name, caption]) => ({ id: id as WizardScale, name, caption })),
    needs: order.map((id) => ({
      id,
      name: needsById.get(id)!.name,
      iconPath: needsById.get(id)!.icon,
    })),
    presets: Object.fromEntries(
      Object.entries(k.preset).map(([firm, list]) => [firm, [...new Set(list.map(needId))]]),
    ),
    recommendations,
    questions,
    stageNotes: Object.fromEntries(
      Object.entries(k.etapNote).map(([stage, note]) => [stage, { title: note.t, text: note.d }]),
    ),
    bundleAreas,
    scenes: { ...file.sceny_planu },
  }
  return { wizard, missing: [...missing].sort() }
}
