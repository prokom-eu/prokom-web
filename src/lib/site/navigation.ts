import type { Partner, SiteSetting } from '@/payload-types'

import { publicImage, type PublicImage } from '../media/public'
import { imageSources } from '../media/sizes'
import { tenantIdOf } from '../tenant/id'
import { isValidNavHref } from './link'

/**
 * Header navigation of the Biznes line (`nawigacja`, ADR-012; spec. §3.2): the order of the
 * menu and the content of the Oferta mega menu. Kept in `SiteSettings.biznes`. Branże ▾ is gone
 * since v20 (B3c): the industry pages are reached from the mega menu, the home page and footer.
 */

export const MENU_ITEM_TYPES = [
  { label: 'Link', value: 'link' },
  { label: 'Oferta ▾ (mega menu)', value: 'offer' },
] as const

export type MenuItemType = (typeof MENU_ITEM_TYPES)[number]['value']

export const DEFAULT_COLUMN_LIMIT = 6

/** A plain link needs a valid `href`; Oferta ▾ may have one (its page) but need not. */
export function menuItemHrefError(type: MenuItemType, href: string | null | undefined) {
  if (!href) return type === 'link' ? 'Link jest wymagany dla zwykłej pozycji.' : null
  return isValidNavHref(href) ? null : 'Ścieżka (/kontakt), adres https://, mailto: albo tel:.'
}

/** Oferta ▾ at most once: two would render two panels with one `id`. */
export function duplicateDropdownError(types: MenuItemType[]): string | null {
  return types.filter((type) => type === 'offer').length > 1
    ? 'Oferta ▾ może być w menu najwyżej raz.'
    : null
}

type Link = { label: string; href: string }

export type PublicBiznesNavigation = {
  menu: { type: MenuItemType; label: string; href: string | null; partner: boolean }[]
  /** "Na skróty" row at the top of the mega menu. */
  shortcuts: Link[]
  /** Categories shown per column; the rest behind "Wszystkie w grupie →". */
  columnLimit: number
  /** Links pinned at the top of a group's column (e.g. GoPOS "partner"). */
  highlights: { group: string; label: string; href: string; badge: string | null }[]
  cards: {
    title: string
    text: string | null
    href: string
    badge: string | null
    dark: boolean
    logo: PublicImage | null
    image: PublicImage | null
  }[]
}

type Navigation = NonNullable<NonNullable<SiteSetting['biznes']>['navigation']>

const doc = <T extends object>(value: number | T | null | undefined): T | null =>
  typeof value === 'object' && value !== null ? value : null

const text = (value: string | null | undefined) => (value?.trim() ? value.trim() : null)

/** A partner's own file is its logo; only a partner shown on this tenant. */
function partnerLogo(value: number | Partner | null | undefined, tenantId: number) {
  const partner = doc(value)
  if (!partner?.width || !partner.height) return null
  if (!partner.tenants?.some((t) => tenantIdOf(t) === tenantId)) return null
  const sources = imageSources(partner)
  if (sources.length === 0) return null
  return { alt: `Logo ${partner.name}`, width: partner.width, height: partner.height, sources }
}

/**
 * The public shape of the navigation. Read with `overrideAccess`, so every relation is
 * re-checked against the tenant here (as `buildCatalogIndex` does): a group, a partner or an
 * image of another site never reaches the header, whatever the panel allowed.
 */
export function toPublicNavigation(
  navigation: Navigation | null | undefined,
  tenantId: number,
): PublicBiznesNavigation {
  const own = (record: { tenant?: unknown } | null): boolean =>
    record !== null && tenantIdOf(record.tenant) === tenantId
  return {
    menu: (navigation?.menu ?? []).flatMap(({ type, label, href, partner }, i, all) => {
      // Only the first Oferta ▾, whatever was saved past the panel's validation.
      const repeated = type !== 'link' && all.findIndex((item) => item.type === type) !== i
      return !repeated && menuItemHrefError(type, href) === null
        ? [{ type, label, href: href || null, partner: partner ?? false }]
        : []
    }),
    shortcuts: (navigation?.shortcuts ?? []).map(({ label, href }) => ({ label, href })),
    columnLimit: navigation?.columnLimit ?? DEFAULT_COLUMN_LIMIT,
    highlights: (navigation?.highlights ?? []).flatMap(({ group, label, href, badge }) => {
      const record = doc(group)
      return own(record) && record?.slug
        ? [{ group: record.slug, label, href, badge: text(badge) }]
        : []
    }),
    cards: (navigation?.cards ?? []).map(
      ({ title, text: body, href, badge, dark, partner, image }) => ({
        title,
        text: text(body),
        href,
        badge: text(badge),
        dark: dark ?? false,
        logo: partnerLogo(partner, tenantId),
        image: publicImage(image, tenantId),
      }),
    ),
  }
}

/**
 * The menu as the header can show it: until the catalog has content (e.g. staging before the
 * import), Oferta ▾ becomes a plain link to the catalog — never an empty panel.
 */
export function withoutEmptyDropdowns(
  menu: PublicBiznesNavigation['menu'],
  content: { offer: boolean },
): PublicBiznesNavigation['menu'] {
  return menu.map((item) =>
    item.type === 'offer' && !content.offer
      ? { ...item, type: 'link' as const, href: item.href ?? '/oferta' }
      : item,
  )
}
