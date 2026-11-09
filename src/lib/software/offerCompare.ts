import type { OfferView } from './offer'

/**
 * „Czym różni się od: …” (OKNO-OFERTY-PREMIUM §2.3 P2): the neighbour of an offer in its
 * category — the next one in the window's list (wrapping), else the next of the category among
 * all offers. Both need their „W cenie” points (a priced offer); otherwise nothing to compare.
 */
export function neighbourOf(
  view: OfferView,
  views: Readonly<Record<string, OfferView>>,
  list: readonly string[],
): OfferView | null {
  const priced = (item: OfferView | undefined): item is OfferView =>
    Boolean(item && item.price.kind === 'included' && item.price.items.length > 0)
  if (!priced(view)) return null
  const order = list.includes(view.slug) ? list : Object.keys(views)
  const same = order.filter((slug) => views[slug]?.category === view.category)
  const at = same.indexOf(view.slug)
  for (let step = 1; step < same.length; step++) {
    const next = views[same[(at + step) % same.length] ?? '']
    if (priced(next) && next.slug !== view.slug) return next
  }
  return null
}
