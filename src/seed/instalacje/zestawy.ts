import type { BundleArea } from '../../lib/catalog/options'
import { bundleStatus, type BundleData } from '../biznes/k3Bundles'

/**
 * Ready bundles of Instalacje (INST-K3, `seed/prokominstalacje/katalog/zestawy-inst.json` →
 * `Bundles`). Pure: the import gives the record ids. The package keeps K0's short keys
 * (`el`, `zam`, `why`); a bundle is „Gotowe” only with every item card ready (BIZ-3 §9.1, like
 * Biznes) — the package status `do-potwierdzenia` keeps it back.
 */

export type InstBundleItem = {
  s: string
  rola: string
  w?: string
  q: number | string
  ob: boolean
}

export type InstBundle = {
  nazwa: string
  grupa: string
  poziom?: string
  status: string
  dla: string
  korzysc: string
  opis: string[]
  el: InstBundleItem[]
  zam?: { z: string; na: string; kiedy: string }[]
  why?: string[]
  usl?: string[]
  faq?: { q: string; a: string }[]
}

export type InstBundlesFile = {
  kolejnosc: string[]
  grupy: string[]
  zestawy: Record<string, InstBundle>
}

/** Group of the package → filter area of `/zestawy` (the chips show only the areas in use). */
export const INST_GROUP_AREAS: Record<string, BundleArea> = {
  'Dom i domek letniskowy': 'dom',
  'Apartament na wynajem': 'dom',
  Pensjonat: 'noclegi',
  Hotel: 'noclegi',
  'Restauracja i sala weselna': 'gastronomia',
  'Sklep i salon': 'sklep',
  'Firma, biuro i hala': 'firma',
  'Kościół i parafia': 'kosciol',
  'Szkoła i przedszkole': 'szkola',
  'Gmina i urząd': 'gmina',
  Deweloper: 'budowa',
  Budowa: 'budowa',
}

const fail = (message: string): never => {
  throw new Error(`Seed (Instalacje zestawy): ${message}`)
}

/** `grupa` → `series` (the field the Biznes wizard reads; here only a stable key). */
export const groupSeries = (group: string) =>
  group
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export type InstBundleRefs = {
  product: (slug: string) => number | undefined
  /** Package status of a card (`gotowe`, `do-sprawdzenia`…). */
  cardStatus: (slug: string) => string | undefined
}

export function instBundleData(
  slug: string,
  bundle: InstBundle,
  order: number,
  refs: InstBundleRefs,
): BundleData {
  const where = `bundle "${slug}"`
  const productOf = (card: string) =>
    refs.product(card) ?? fail(`${where}: card "${card}" has no record — import first.`)
  const area = INST_GROUP_AREAS[bundle.grupa] ?? fail(`${where}: unknown group "${bundle.grupa}".`)
  const ready =
    bundle.status === 'gotowe' &&
    bundleStatus(
      {
        slug,
        elementy: bundle.el.map((item) => ({
          slug: item.s,
          rola: item.rola,
          ilosc: item.q,
          obowiazkowy: item.ob,
        })),
      },
      { cardStatus: refs.cardStatus },
    ) === 'ready'
  return {
    slug,
    name: bundle.nazwa,
    order,
    area,
    series: groupSeries(bundle.grupa),
    level: bundle.poziom ?? null,
    contentStatus: ready ? 'ready' : 'needs-review',
    industries: [],
    audience: bundle.dla,
    benefit: bundle.korzysc,
    description: bundle.opis.map((text) => ({ text })),
    items: bundle.el.map((item) => ({
      product: productOf(item.s),
      role: item.rola,
      quantity: String(item.q),
      mandatory: item.ob,
      suggestedVersion: item.w ?? null,
      toConfirm: null,
    })),
    swaps: (bundle.zam ?? []).map((swap) => ({
      from: productOf(swap.z),
      to: productOf(swap.na),
      when: swap.kiedy,
    })),
    // Services of Instalacje are pages of the line, not catalog cards: named in the notes only.
    services: [],
    reasons: bundle.why ?? [],
    faq: (bundle.faq ?? []).map(({ q, a }) => ({ question: q, answer: a })),
    related: [],
    internalNotes: bundle.usl?.length ? `Usługi: ${bundle.usl.join(', ')}.` : null,
    compatChecks: [],
  }
}

/** Bundles in the package order (`kolejnosc`), every key of `zestawy` once. */
export function orderedBundles(file: InstBundlesFile): [string, InstBundle][] {
  const keys = Object.keys(file.zestawy)
  const missing = keys.filter((key) => !file.kolejnosc.includes(key))
  if (missing.length) fail(`not in „kolejnosc”: ${missing.join(', ')}`)
  return file.kolejnosc.map((key) => [key, file.zestawy[key] ?? fail(`unknown bundle "${key}"`)])
}
