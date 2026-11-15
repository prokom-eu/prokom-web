import { cardIcon, productHref } from './card'
import type { CatalogIndex, GroupShowcase, IndexImage } from './catalogIndex'
import { groupHref } from './menu'
import type { IconName } from './options'

export type GroupSummary = {
  slug: string
  name: string
  icon: IconName
  gradient: [string, string]
  description?: string
  showcase?: GroupShowcase
  /** Products whose main category is in the group. */
  count: number
  topCategories: { slug: string; name: string; count: number }[]
  /** Products with a public image: featured first (their order), then the most popular. */
  thumbs: { slug: string; name: string; image: IndexImage }[]
}

type Options = { topCategories?: number; thumbs?: number }

/**
 * The five departments of the home page (hero wheel, offer cards): counts and pictures from
 * the catalog index, so nothing is typed in twice.
 */
export function groupSummaries(
  index: Pick<CatalogIndex, 'groups' | 'categories' | 'products'>,
  { topCategories = 3, thumbs = 3 }: Options = {},
): GroupSummary[] {
  return index.groups.map((group) => {
    const products = index.products.filter((product) => product.group === group.slug)
    const wheel = new Map((group.wheel ?? []).map((slug, i) => [slug, i]))
    const pictured = products
      .filter((product) => product.image)
      .sort(
        (a, b) =>
          // The wheel products of the department first, in the panel's order (K36 §12).
          (wheel.get(a.slug) ?? Infinity) - (wheel.get(b.slug) ?? Infinity) ||
          (a.featuredOrder ?? Infinity) - (b.featuredOrder ?? Infinity) ||
          b.popularity - a.popularity ||
          a.name.localeCompare(b.name, 'pl'),
      )
    return {
      slug: group.slug,
      name: group.name,
      icon: group.icon,
      gradient: group.gradient,
      ...(group.description ? { description: group.description } : {}),
      ...(group.showcase ? { showcase: group.showcase } : {}),
      count: products.length,
      topCategories: index.categories
        .filter((category) => category.group === group.slug)
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'pl'))
        .slice(0, topCategories)
        .map(({ slug, name, count }) => ({ slug, name, count })),
      thumbs: pictured.slice(0, thumbs).map(({ slug, name, image }) => ({
        slug,
        name,
        image: image as IndexImage,
      })),
    }
  })
}

/** A bubble of the hero wheel: a product card (photo or its icon) or a page (icon). */
export type WheelItem = {
  key: string
  name: string
  href: string
  image?: IndexImage
  icon?: IconName
}

export type WheelGroup = {
  slug: string
  name: string
  /** Label next to the icon on the wheel: the short name when the department has one. */
  label: string
  icon: IconName
  count: number
  gradient: [string, string]
  href: string
  items: WheelItem[]
}

/**
 * Bubbles of one department on the wheel (runda 1411, PRZEKAZANIE §1 „Hero — koło”: exactly
 * three a department, all photos). Replaces the cap of 8 on the whole ring (audit 14.11).
 */
export const WHEEL_PER_GROUP = 3

/**
 * The departments of the hero wheel (runda 1411): each with its first wheel cards in the panel's
 * order and the extra page bubble last, `WHEEL_PER_GROUP` bubbles a department (the page bubble
 * always among them). Only what the client island draws — no index entries.
 */
export function wheelGroups(
  index: Pick<CatalogIndex, 'groups' | 'categories' | 'products'>,
): WheelGroup[] {
  const bySlug = new Map(index.products.map((product) => [product.slug, product]))
  const groups = index.groups.map((group) => {
    const cards: WheelItem[] = (group.wheelCards ?? []).flatMap((card) => {
      // Each bubble stands in its own department (KOLO-HERO §Pozycje): a card of another one
      // picked in the panel would sit under the wrong department, or twice on the ring.
      const product = bySlug.get(card.slug)
      if (!product || product.group !== group.slug) return []
      const query = card.color ? `?kolor=${encodeURIComponent(card.color)}` : ''
      return [
        {
          key: card.slug,
          name: card.color ? `${card.name} · ${card.color}` : card.name,
          href: `${productHref(card.slug)}${query}`,
          ...(card.image ? { image: card.image } : { icon: cardIcon(product, index) }),
        },
      ]
    })
    const link = group.wheelLink
    return {
      slug: group.slug,
      name: group.name,
      label: group.shortName ?? group.name,
      icon: group.icon,
      count: index.products.filter((product) => product.group === group.slug).length,
      gradient: group.gradient,
      href: groupHref(group.slug),
      // The page bubble is the department's own pick in the panel: always kept, always last.
      items: link
        ? [
            ...cards.slice(0, WHEEL_PER_GROUP - 1),
            {
              key: `link:${link.href}`,
              name: link.label,
              href: link.href,
              ...(link.image ? { image: link.image } : { icon: link.icon }),
            },
          ]
        : cards.slice(0, WHEEL_PER_GROUP),
    }
  })
  return groups
}
