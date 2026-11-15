import type { Metadata } from 'next'

import { AboutPage } from '@/components/shared/AboutPage'
import { ContactPage } from '@/components/shared/ContactPage'
import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'
import { hubOgImage } from '@/lib/prokom/data'
import { hubPageMetadata } from '@/lib/prokom/seo'
import { pageRobots } from '@/lib/seo/robots'
import { getSharedData } from '@/lib/shared/getSharedData'
import type { SiteTenant } from '@/lib/tenant/byHost'

/**
 * Hub pages whose address the line sites use as panel pages (`/kontakt`, `/o-firmie`): a static
 * route would hide those pages on every other domain, so the hub answers them inside `[slug]` —
 * on the shared templates (ADR-022) with the hub's data (spec §6.8, §6.9).
 */
const TITLES: Record<string, (address: { street: string; city: string } | null) => string> = {
  // Spec §4; the address comes from `CompanyData` (contact data never in code).
  kontakt: (address) =>
    address ? `Kontakt PRO-KOM — ${address.city}, ${address.street}` : 'Kontakt PRO-KOM',
  'o-firmie': (address) =>
    address ? `O firmie PRO-KOM — ${address.city}, od 2004 roku` : 'O firmie PRO-KOM',
}

/** Legal pages stay out of search until a lawyer accepts them (spec §6.13). */
const LEGAL = new Set(['polityka-prywatnosci', 'cookies', 'dostepnosc'])

export async function hubSlugMetadata(tenant: SiteTenant, slug: string): Promise<Metadata | null> {
  const title = TITLES[slug]
  if (title) {
    const [shared, ogImage] = await Promise.all([getSharedData(tenant.id), hubOgImage(tenant.id)])
    const path = slug === 'kontakt' ? '/kontakt' : '/o-firmie'
    return hubPageMetadata(path, title(shared?.company.address ?? null), ogImage)
  }
  if (LEGAL.has(slug)) return { robots: pageRobots(getEnv().SITE_ENV, false) }
  return null
}

export async function hubSlugPage(
  tenant: SiteTenant,
  slug: string,
  origin: () => Promise<string>,
): Promise<React.ReactNode | null> {
  if (!(slug in TITLES)) return null
  const shared = await getSharedData(tenant.id)
  if (!shared) return null
  const env = getEnv()
  if (slug === 'kontakt') {
    return (
      <ContactPage
        shared={shared}
        line={tenant.line}
        origin={await origin()}
        now={new Date().toISOString()}
        formToken={issueFormToken(env.PAYLOAD_SECRET)}
        hoursLayout="week"
      />
    )
  }
  return (
    <AboutPage
      shared={shared}
      line={tenant.line}
      origin={await origin()}
      siteEnv={env.SITE_ENV}
      bothPhones
    />
  )
}
