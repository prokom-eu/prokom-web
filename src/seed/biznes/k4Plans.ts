import type { K3Bundle } from './k3Bundles'
import type { K31Scene } from './k31Plans'

/**
 * K4a-2: scenes of `plany-k4.json` and bundles of `zestawy-k4.json` in the shape of the K3.1 /
 * K3c package, so `floorPlanData` and `bundleData` import them unchanged. K4 brings content
 * (texts, points, items); what K4 lacks stays from the earlier package: the floor plan drawing,
 * bundle series, industries, related categories and internal notes.
 */

export type K4Scene = {
  id: string
  name: string
  title: string
  lead?: string
  ic?: string
  /** `x`, `y` in percent of the drawing (K3.1: units of its `viewBox`). */
  pts: { slug: string; x: number; y: number; etykieta: string; opis?: string }[]
  zes?: string[]
}

export type K4Bundle = {
  nazwa: string
  grupa: string
  poziom?: string
  dla: string
  korzysc: string
  opis: string[]
  el: { s: string; rola: string; w?: string; q: number | string; ob: boolean }[]
  zam: { z: string; na: string; kiedy: string }[]
  why: string[]
  usl: string[]
  faq: { q: string; a: string }[]
}

const fail = (message: string): never => {
  throw new Error(`Seed (K4 plany/zestawy): ${message}`)
}

/** A K4 scene on top of its K3.1 scene: K3.1 keeps the drawing, K4 gives the rest. */
export function k4Scene(scene: K4Scene, base: K31Scene): K31Scene {
  if (scene.id !== base.id) fail(`scene "${scene.id}" paired with "${base.id}".`)
  const [, , width, height] = base.viewBox.split(' ').map(Number)
  if (!width || !height) fail(`scene "${scene.id}" has no viewBox size.`)
  return {
    ...base,
    nazwa: scene.name,
    tytul: scene.title,
    lead: scene.lead ?? base.lead,
    ikona_path: scene.ic ?? base.ikona_path,
    // Percent → drawing units; K4 percentages come from whole units, so rounding is exact.
    punkty: scene.pts.map((point) => ({
      slug: point.slug,
      x: Math.round((point.x * width!) / 100),
      y: Math.round((point.y * height!) / 100),
      etykieta: point.etykieta,
      ...(point.opis ? { opis: point.opis } : {}),
    })),
    zestawy: scene.zes ?? base.zestawy,
  }
}

/** Service cards by name: K4 lists a bundle's services by name (`usl`), K3c by `slug_seed`. */
export function k4ServiceSlugs(
  cards: readonly { slug_seed: string; nazwa: string; rodzaj: string }[],
): (name: string) => string | undefined {
  const byName = new Map<string, string[]>()
  for (const card of cards.filter((item) => item.rodzaj === 'Usługi')) {
    byName.set(card.nazwa, [...(byName.get(card.nazwa) ?? []), card.slug_seed])
  }
  return (name) => {
    const slugs = byName.get(name) ?? []
    if (slugs.length > 1) fail(`service "${name}" names ${slugs.length} cards.`)
    return slugs[0]
  }
}

/**
 * A K4 bundle on top of its K3c bundle. An open question of a K3 item (`do_potwierdzenia`)
 * stays with the same card, so a bundle does not turn „Gotowe” just because K4 dropped the note.
 */
export function k4Bundle(
  slug: string,
  bundle: K4Bundle,
  base: K3Bundle,
  serviceSlug: (name: string) => string | undefined,
): K3Bundle {
  if (slug !== base.slug) fail(`bundle "${slug}" paired with "${base.slug}".`)
  const open = new Map(
    base.elementy.flatMap((item) =>
      item.do_potwierdzenia ? [[item.slug, item.do_potwierdzenia] as const] : [],
    ),
  )
  return {
    ...base,
    nazwa: bundle.nazwa,
    poziom: bundle.poziom ?? base.poziom,
    dla_kogo: bundle.dla,
    korzysc: bundle.korzysc,
    opis: bundle.opis,
    elementy: bundle.el.map((item) => ({
      slug: item.s,
      rola: item.rola,
      ilosc: item.q,
      obowiazkowy: item.ob,
      ...(item.w ? { wariant_sugerowany: item.w } : {}),
      ...(open.has(item.s) ? { do_potwierdzenia: open.get(item.s) } : {}),
    })),
    zamienniki: bundle.zam.map((swap) => ({ zamiast: swap.z, mozna: swap.na, kiedy: swap.kiedy })),
    uslugi: bundle.usl.map(
      (name) => serviceSlug(name) ?? fail(`bundle "${slug}": no service card named "${name}".`),
    ),
    dlaczego_tak: bundle.why,
    faq: bundle.faq,
  }
}
