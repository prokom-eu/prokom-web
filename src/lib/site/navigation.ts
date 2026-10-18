import type { Partner, SiteSetting } from '@/payload-types'

import { publicImage, type PublicImage } from '../media/public'
import { imageSources } from '../media/sizes'
import { tenantIdOf } from '../tenant/id'
import { isValidNavHref } from './link'

/**
 * Header navigation of the Biznes line (`nawigacja`, ADR-012; spec. §3.2): the order of the
 * menu, the content of the Oferta mega menu and of Branże ▾. Kept in `SiteSettings.biznes`.
 */

export const MENU_ITEM_TYPES = [
  { label: 'Link', value: 'link' },
  { label: 'Oferta ▾ (mega menu)', value: 'offer' },
  { label: 'Branże ▾', value: 'industries' },
] as const

export type MenuItemType = (typeof MENU_ITEM_TYPES)[number]['value']

export const DEFAULT_COLUMN_LIMIT = 6

/** A plain link needs a valid `href`; the dropdowns may have one (their page) but need not. */
export function menuItemHrefError(type: MenuItemType, href: string | null | undefined) {
  if (!href) return type === 'link' ? 'Link jest wymagany dla zwykłej pozycji.' : null
  return isValidNavHref(href) ? null : 'Ścieżka (/kontakt), adres https://, mailto: albo tel:.'
}

/** Oferta ▾ and Branże ▾ at most once each: two would render two panels with one `id`. */
export function duplicateDropdownError(types: MenuItemType[]): string | null {
  const dropdowns = types.filter((type) => type !== 'link')
  return new Set(dropdowns).size === dropdowns.length
    ? null
    : 'Oferta ▾ i Branże ▾ mogą być w menu najwyżej raz.'
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
  industries: {
    slug: string
    name: string
    description: string | null
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
 * re-checked against the tenant here (as `buildCatalogIndex` does): a group, an industry or an
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
      // Only the first dropdown of a kind, whatever was saved past the panel's validation.
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
    industries: (navigation?.industries ?? []).flatMap(({ industry, description, image }) => {
      const record = doc(industry)
      return own(record) && record?.slug && record.active
        ? [
            {
              slug: record.slug,
              name: record.name,
              description: text(description),
              image: publicImage(image, tenantId),
            },
          ]
        : []
    }),
  }
}

/**
 * The menu as the header can show it: until the catalog or the industries have content (e.g.
 * staging before the import), Oferta ▾ becomes a plain link to the catalog and an empty
 * Branże ▾ disappears — never an empty panel.
 */
export function withoutEmptyDropdowns(
  menu: PublicBiznesNavigation['menu'],
  content: { offer: boolean; industries: boolean },
): PublicBiznesNavigation['menu'] {
  return menu.flatMap((item) => {
    if (item.type === 'offer' && !content.offer) {
      return [{ ...item, type: 'link' as const, href: item.href ?? '/oferta' }]
    }
    return item.type === 'industries' && !content.industries ? [] : [item]
  })
}
