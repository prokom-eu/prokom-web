import type { Metadata } from 'next'

import { AboutPage } from '@/components/shared/AboutPage'
import { ContactPage } from '@/components/shared/ContactPage'
import { PAGE_CONTAINER } from '@/components/shared/pageContainer'
import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'
import { HUB_ABOUT } from '@/lib/prokom/about'
import { visibleNetwork } from '@/lib/prokom/brands'
import { getHubSettings, hubOgImage } from '@/lib/prokom/data'
import { getHubLineContacts } from '@/lib/prokom/lineContacts'
import { hubPageMetadata, type HubDescribedPath } from '@/lib/prokom/seo'
import { pageRobots } from '@/lib/seo/robots'
import { getSharedData } from '@/lib/shared/getSharedData'
import type { SiteTenant } from '@/lib/tenant/byHost'

import { AboutNetwork, AboutStory, AboutValues } from './AboutStory'
import { BranchNote, ExtraPhones, PartnerPointNote } from './ExtraContacts'
import { SaturdayNote } from './SaturdayNote'

/**
 * Hub pages whose address the line sites use as panel pages (`/kontakt`, `/o-firmie`): a static
 * route would hide those pages on every other domain, so the hub answers them inside `[slug]` —
 * on the shared templates (ADR-022) with the hub's data (spec §6.8, §6.9).
 */
type Address = { street: string; city: string } | null

const TITLES: Record<string, { path: HubDescribedPath; title: (address: Address) => string }> = {
  // Spec §4; the address comes from `CompanyData` (contact data never in code).
  kontakt: {
    path: '/kontakt',
    title: (address) =>
      address ? `Kontakt PRO-KOM — ${address.city}, ${address.street}` : 'Kontakt PRO-KOM',
  },
  'o-firmie': {
    path: '/o-firmie',
    title: (address) =>
      address ? `O firmie PRO-KOM — ${address.city}, od 2004 roku` : 'O firmie PRO-KOM',
  },
}

/** Legal pages stay out of search until a lawyer accepts them (spec §6.13). */
const LEGAL = new Set(['polityka-prywatnosci', 'cookies', 'dostepnosc'])

export async function hubSlugMetadata(tenant: SiteTenant, slug: string): Promise<Metadata | null> {
  const page = TITLES[slug]
  if (page) {
    const [shared, ogImage] = await Promise.all([getSharedData(tenant.id), hubOgImage(tenant.id)])
    return hubPageMetadata(page.path, page.title(shared?.company.address ?? null), ogImage)
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
  const settings = await getHubSettings(tenant.id)
  const network = visibleNetwork(settings.brands, settings.trust)
  if (slug === 'kontakt') {
    return (
      <ContactPage
        shared={shared}
        line={tenant.line}
        origin={await origin()}
        now={new Date().toISOString()}
        formToken={issueFormToken(env.PAYLOAD_SECRET)}
        hoursLayout="week"
        slots={{
          // Notes split between the hero columns so both are about as tall (16.11).
          heroBelow: (
            <>
              <SaturdayNote lines={await getHubLineContacts(tenant.id)} />
              <ExtraPhones phones={settings.extraPhones} />
              {network && (
                <PartnerPointNote text={network.salonNote} href={`/o-firmie#${network.slug}`} />
              )}
            </>
          ),
          heroAside: <BranchNote branch={settings.branch} />,
        }}
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
      slots={{
        // „Nasza historia” and „Co nas wyróżnia” (16.11): code defaults, the panel adds the rest.
        afterStats: <AboutStory about={HUB_ABOUT} />,
        afterRules: (
          <>
            <AboutValues about={HUB_ABOUT} brands={settings.brands} network={network} />
            <AboutNetwork network={network} />
          </>
        ),
        ...(settings.branch && {
          beforeVisit: (
            <section aria-label={settings.branch.name} className={`${PAGE_CONTAINER} py-6`}>
              <BranchNote branch={settings.branch} />
            </section>
          ),
        }),
      }}
    />
  )
}
