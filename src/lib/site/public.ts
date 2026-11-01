import type { CompanyDatum, SiteSetting } from '@/payload-types'

import { publicImage, type PublicImage } from '../media/public'
import { navigationSchema, type SoftwareNavigation } from '../software/navigation'
import { tenantIdOf } from '../tenant/id'
import type { Department } from './departments'
import type { Line } from '../tenant/lines'
import { toPublicNavigation, type PublicBiznesNavigation } from './navigation'
import { isValidNavHref } from './link'
import { defaultOgImage } from './ogDefault'
import { isPromoActive } from './promo'

type Link = { label: string; href: string }

/** What the public site shows from `CompanyData`; the promo bar only while it is active. */
export type PublicCompanyData = {
  name: string
  nip: string
  email: string
  phones: { label: string | null; number: string }[]
  locations: {
    name: string
    street: string
    postalCode: string
    city: string
    hours: { days: string[]; opens: string; closes: string }[]
  }[]
  /** `lines` empty = every line; the layout checks it (`isPromoForLine`). */
  promo: { text: string; href: string | null; campaignId: string | null; lines: Line[] } | null
}

/** What the public site shows from one tenant's `SiteSettings`. */
export type PublicSiteSettings = {
  phone: string | null
  /** Second number of the line, shown next to the main one (Software v23). */
  phone2: string | null
  email: string | null
  navigation: Link[]
  footer: { text: string | null; links: Link[] }
  seo: { titleTemplate: string | null; description: string | null; ogImage: PublicImage | null }
  /** Data of the Biznes line; `null` on every other line (ADR-012, rozstrzygnięcie 2). */
  biznes: PublicBiznesSettings | null
  /** Data of the Software line; `null` on every other line (like `biznes`). */
  software: PublicSoftwareSettings | null
}

export type PublicSoftwareSettings = {
  /** `null` when empty or saved past the validation — the frame then falls back to the generic one. */
  navigation: SoftwareNavigation | null
}

function toPublicSoftware(group: SiteSetting['software']): PublicSoftwareSettings {
  // Read with `overrideAccess`: checked again, so a JSON saved past `validate` never renders.
  const navigation = navigationSchema.safeParse(group?.navigation)
  return { navigation: navigation.success ? navigation.data : null }
}

export type PublicBiznesSettings = {
  contactChannels: {
    department: Department
    phone: string | null
    email: string | null
    hours: string | null
    showInFooter: boolean
  }[]
  whatsapp: string | null
  trustLine: string | null
  serviceAreas: string[]
  promises: {
    callbackTime: string | null
    itReview: string | null
    includedWithRegister: string | null
    serviceTakeover: string | null
  }
  showReviews: boolean
  showClientLogos: boolean
  navigation: PublicBiznesNavigation
  /** Link columns of the footer (spec. §3.4). */
  footer: { important: Link[]; company: Link[] }
}

function toPublicBiznes(group: SiteSetting['biznes'], tenantId: number): PublicBiznesSettings {
  const promises = group?.promises
  return {
    contactChannels: (group?.contactChannels ?? []).map((row) => ({
      department: row.department,
      phone: row.phone ?? null,
      email: row.email ?? null,
      hours: row.hours ?? null,
      showInFooter: row.showInFooter ?? false,
    })),
    whatsapp: group?.whatsapp ?? null,
    trustLine: group?.trustLine ?? null,
    serviceAreas: group?.serviceAreas ?? [],
    promises: {
      callbackTime: promises?.callbackTime ?? null,
      itReview: promises?.itReview ?? null,
      includedWithRegister: promises?.includedWithRegister ?? null,
      serviceTakeover: promises?.serviceTakeover ?? null,
    },
    showReviews: group?.showReviews ?? false,
    showClientLogos: group?.showClientLogos ?? false,
    navigation: toPublicNavigation(group?.navigation, tenantId),
    footer: {
      important: toValidLinks(group?.footer?.important),
      company: toValidLinks(group?.footer?.company),
    },
  }
}

/** Links read with `overrideAccess`: an `href` saved past the validation is dropped. */
const toValidLinks = (rows: { label: string; href: string }[] | null | undefined): Link[] =>
  toLinks(rows).filter(({ href }) => isValidNavHref(href))

const toLinks = (rows: { label: string; href: string }[] | null | undefined): Link[] =>
  (rows ?? []).map(({ label, href }) => ({ label, href }))

export function toPublicCompanyData(doc: CompanyDatum, now: Date): PublicCompanyData | null {
  // A fresh database has an empty global until someone saves it (or `pnpm seed` runs).
  if (!doc.name) return null
  const promo = doc.promoBar
  return {
    name: doc.name,
    nip: doc.nip,
    email: doc.email,
    phones: doc.phones.map(({ label, number }) => ({ label: label ?? null, number })),
    locations: doc.locations.map(({ name, street, postalCode, city, hours }) => ({
      name,
      street,
      postalCode,
      city,
      hours: (hours ?? []).map(({ days, opens, closes }) => ({ days, opens, closes })),
    })),
    // `promo.text` is checked again only to narrow its type to `string`.
    promo:
      promo?.text && isPromoActive(promo, now)
        ? {
            text: promo.text,
            href: promo.href ?? null,
            campaignId: promo.campaignId ?? null,
            lines: promo.lines ?? [],
          }
        : null,
  }
}

/**
 * `line` is the line of the tenant that owns the document (`getSiteSettings` takes it from
 * the populated tenant) — never `doc.line`, the panel's copy, which may be stale.
 */
export function toPublicSiteSettings(doc: SiteSetting, line: Line | null): PublicSiteSettings {
  const tenantId = tenantIdOf(doc.tenant)
  return {
    phone: doc.phone ?? null,
    phone2: doc.phone2 ?? null,
    email: doc.email ?? null,
    navigation: toLinks(doc.navigation),
    footer: { text: doc.footer?.text ?? null, links: toLinks(doc.footer?.links) },
    seo: {
      titleTemplate: doc.seo?.titleTemplate ?? null,
      description: doc.seo?.description ?? null,
      // Populated when read with depth 1; only a public image of this tenant (`publicImage`).
      // Without one, the line's own file (`defaultOgImage`), so a shared link is never bare.
      ogImage:
        (tenantId === null ? null : publicImage(doc.seo?.ogImage, tenantId)) ??
        defaultOgImage(line),
    },
    biznes: line === 'biznes' && tenantId !== null ? toPublicBiznes(doc.biznes, tenantId) : null,
    software: line === 'software' ? toPublicSoftware(doc.software) : null,
  }
}
