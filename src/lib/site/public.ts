import type { CompanyDatum, SiteSetting } from '@/payload-types'

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
  promo: { text: string; href: string | null } | null
}

/** What the public site shows from one tenant's `SiteSettings`. */
export type PublicSiteSettings = {
  phone: string | null
  email: string | null
  navigation: Link[]
  footer: { text: string | null; links: Link[] }
  seo: { titleTemplate: string | null; description: string | null }
}

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
        ? { text: promo.text, href: promo.href ?? null }
        : null,
  }
}

export function toPublicSiteSettings(doc: SiteSetting): PublicSiteSettings {
  return {
    phone: doc.phone ?? null,
    email: doc.email ?? null,
    navigation: toLinks(doc.navigation),
    footer: { text: doc.footer?.text ?? null, links: toLinks(doc.footer?.links) },
    seo: {
      titleTemplate: doc.seo?.titleTemplate ?? null,
      description: doc.seo?.description ?? null,
    },
  }
}
